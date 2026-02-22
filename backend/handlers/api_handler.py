"""
API Gateway Lambda handlers — serve aggregated sentiment metrics
and paginated/filtered review lists from DynamoDB.
"""

import json
import os
from decimal import Decimal

import boto3
from boto3.dynamodb.conditions import Key

dynamodb = boto3.resource("dynamodb")
s3 = boto3.client("s3")

TABLE_NAME = os.environ.get("DYNAMODB_TABLE", "SentimentResults-dev")
S3_BUCKET = os.environ.get("S3_BUCKET", "insight-forge-uploads-dev")


class DecimalEncoder(json.JSONEncoder):
    """Handle Decimal serialisation for DynamoDB numbers."""

    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)
        return super().default(obj)


def _response(status_code, body):
    """Return a properly formatted API Gateway response."""
    return {
        "statusCode": status_code,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
        },
        "body": json.dumps(body, cls=DecimalEncoder),
    }


# ------------------------------------------------------------------ #
#  GET /api/metrics
# ------------------------------------------------------------------ #

def get_metrics(event, context):
    """Return aggregated sentiment distribution and averages."""
    table = dynamodb.Table(TABLE_NAME)

    try:
        result = table.scan()
        items = result.get("Items", [])

        # Handle pagination for large tables
        while "LastEvaluatedKey" in result:
            result = table.scan(ExclusiveStartKey=result["LastEvaluatedKey"])
            items.extend(result.get("Items", []))

        total = len(items)

        if total == 0:
            return _response(200, {
                "totalReviews": 0,
                "sentimentDistribution": {
                    "POSITIVE": 0, "NEGATIVE": 0, "NEUTRAL": 0, "MIXED": 0,
                },
                "averageScores": {
                    "Positive": 0, "Negative": 0, "Neutral": 0, "Mixed": 0,
                },
                "churnRiskDistribution": {
                    "HIGH": 0, "MEDIUM": 0, "LOW": 0,
                },
            })

        # Sentiment counts
        sentiment_dist = {"POSITIVE": 0, "NEGATIVE": 0, "NEUTRAL": 0, "MIXED": 0}
        churn_dist = {"HIGH": 0, "MEDIUM": 0, "LOW": 0}
        score_totals = {"Positive": 0, "Negative": 0, "Neutral": 0, "Mixed": 0}

        for item in items:
            label = item.get("sentiment", "NEUTRAL")
            sentiment_dist[label] = sentiment_dist.get(label, 0) + 1

            risk = item.get("churnRisk", "LOW")
            churn_dist[risk] = churn_dist.get(risk, 0) + 1

            scores = item.get("sentimentScores", {})
            for key in score_totals:
                score_totals[key] += float(scores.get(key, 0))

        avg_scores = {k: round(v / total, 4) for k, v in score_totals.items()}

        return _response(200, {
            "totalReviews": total,
            "sentimentDistribution": sentiment_dist,
            "averageScores": avg_scores,
            "churnRiskDistribution": churn_dist,
        })

    except Exception as e:
        print(f"Error in get_metrics: {e}")
        return _response(500, {"error": str(e)})


# ------------------------------------------------------------------ #
#  GET /api/reviews
# ------------------------------------------------------------------ #

def get_reviews(event, context):
    """Return a list of reviews, optionally filtered by sentiment."""
    table = dynamodb.Table(TABLE_NAME)
    params = event.get("queryStringParameters") or {}

    sentiment_filter = params.get("sentiment")
    limit = int(params.get("limit", 50))

    try:
        if sentiment_filter and sentiment_filter.upper() in (
            "POSITIVE", "NEGATIVE", "NEUTRAL", "MIXED",
        ):
            # Use the GSI for filtered queries
            result = table.query(
                IndexName="SentimentIndex",
                KeyConditionExpression=Key("sentiment").eq(sentiment_filter.upper()),
                Limit=limit,
            )
            items = result.get("Items", [])
        else:
            result = table.scan(Limit=limit)
            items = result.get("Items", [])

        # Sort by negative score descending (highest risk first)
        items.sort(key=lambda x: float(x.get("negativeScore", 0)), reverse=True)

        # Trim to limit
        items = items[:limit]

        return _response(200, {
            "reviews": items,
            "count": len(items),
        })

    except Exception as e:
        print(f"Error in get_reviews: {e}")
        return _response(500, {"error": str(e)})


# ------------------------------------------------------------------ #
#  GET /api/upload-url
# ------------------------------------------------------------------ #

def get_upload_url(event, context):
    """Generate a presigned S3 URL for CSV upload from the frontend."""
    params = event.get("queryStringParameters") or {}
    filename = params.get("filename", "upload.csv")

    if not filename.endswith(".csv"):
        return _response(400, {"error": "Only CSV files are accepted"})

    key = f"uploads/{filename}"

    try:
        url = s3.generate_presigned_url(
            "put_object",
            Params={
                "Bucket": S3_BUCKET,
                "Key": key,
                "ContentType": "text/csv",
            },
            ExpiresIn=300,
        )

        return _response(200, {
            "uploadUrl": url,
            "key": key,
        })

    except Exception as e:
        print(f"Error generating presigned URL: {e}")
        return _response(500, {"error": str(e)})
