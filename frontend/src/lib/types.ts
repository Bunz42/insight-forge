export interface SentimentScores {
  [key: string]: number;
  Positive: number;
  Negative: number;
  Neutral: number;
  Mixed: number;
}

export type SentimentLabel = "POSITIVE" | "NEGATIVE" | "NEUTRAL" | "MIXED";
export type ChurnRisk = "HIGH" | "MEDIUM" | "LOW";

export interface Review {
  reviewId: string;
  customerName: string;
  reviewText: string;
  date: string;
  sentiment: SentimentLabel;
  sentimentScores: SentimentScores;
  keyPhrases: string[];
  churnRisk: ChurnRisk;
  negativeScore: number;
  sourceFile: string;
  processedAt: string;
}

export interface MetricsResponse {
  totalReviews: number;
  sentimentDistribution: Record<SentimentLabel, number>;
  averageScores: SentimentScores;
  churnRiskDistribution: Record<ChurnRisk, number>;
}

export interface ReviewsResponse {
  reviews: Review[];
  count: number;
}
