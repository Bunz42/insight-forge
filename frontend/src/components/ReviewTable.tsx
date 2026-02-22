"use client";

import { Fragment, useState } from "react";
import { Review, SentimentLabel } from "../lib/types";

const SENTIMENT_MAP: Record<SentimentLabel, string> = {
    POSITIVE: "badge-positive",
    NEGATIVE: "badge-negative",
    NEUTRAL: "badge-neutral",
    MIXED: "badge-mixed",
};

const CHURN_MAP: Record<string, string> = {
    HIGH: "badge-negative",
    MEDIUM: "badge-mixed",
    LOW: "badge-positive",
};

interface ReviewTableProps {
    reviews: Review[];
}

export default function ReviewTable({ reviews }: ReviewTableProps) {
    const [filter, setFilter] = useState<SentimentLabel | "ALL">("ALL");
    const [expandedRow, setExpandedRow] = useState<string | null>(null);

    const filtered =
        filter === "ALL" ? reviews : reviews.filter((r) => r.sentiment === filter);

    const filters = ["ALL", "POSITIVE", "NEGATIVE", "NEUTRAL", "MIXED"] as const;

    return (
        <div className="card overflow-hidden">
            {/* Header */}
            <div
                className="flex flex-col gap-3 border-b px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                style={{ borderColor: "var(--color-border)" }}
            >
                <div>
                    <h3
                        className="text-sm font-medium"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        Customer Reviews
                    </h3>
                    <p className="mt-0.5 text-[12px]" style={{ color: "var(--color-text-tertiary)" }}>
                        {filtered.length} of {reviews.length} reviews
                    </p>
                </div>

                {/* Filters */}
                <div className="flex gap-1.5">
                    {filters.map((s) => (
                        <button
                            key={s}
                            onClick={() => setFilter(s)}
                            className="rounded-md px-2.5 py-1 text-[12px] font-medium transition-colors"
                            style={{
                                backgroundColor:
                                    filter === s ? "var(--color-text-primary)" : "var(--color-surface-2)",
                                color:
                                    filter === s ? "var(--color-surface)" : "var(--color-text-tertiary)",
                            }}
                        >
                            {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
                            {["Customer", "Date", "Sentiment", "Churn Risk", "Neg. Score", "Key Phrases"].map(
                                (h) => (
                                    <th
                                        key={h}
                                        className="px-5 py-2.5 text-left text-[11px] font-medium uppercase tracking-wider"
                                        style={{ color: "var(--color-text-tertiary)" }}
                                    >
                                        {h}
                                    </th>
                                )
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((review) => (
                            <Fragment key={review.reviewId}>
                                <tr
                                    onClick={() =>
                                        setExpandedRow(
                                            expandedRow === review.reviewId ? null : review.reviewId
                                        )
                                    }
                                    className="cursor-pointer transition-colors"
                                    style={{
                                        borderBottom: "1px solid var(--color-border)",
                                    }}
                                    onMouseEnter={(e) =>
                                        (e.currentTarget.style.backgroundColor = "var(--color-surface-2)")
                                    }
                                    onMouseLeave={(e) =>
                                        (e.currentTarget.style.backgroundColor = "transparent")
                                    }
                                >
                                    <td
                                        className="whitespace-nowrap px-5 py-3 text-[13px] font-medium"
                                        style={{ color: "var(--color-text-primary)" }}
                                    >
                                        {review.customerName}
                                    </td>
                                    <td
                                        className="whitespace-nowrap px-5 py-3 text-[13px]"
                                        style={{ color: "var(--color-text-secondary)" }}
                                    >
                                        {new Date(review.date).toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                            year: "numeric",
                                        })}
                                    </td>
                                    <td className="whitespace-nowrap px-5 py-3">
                                        <span className={`badge ${SENTIMENT_MAP[review.sentiment]}`}>
                                            {review.sentiment}
                                        </span>
                                    </td>
                                    <td className="whitespace-nowrap px-5 py-3">
                                        <span className={`badge ${CHURN_MAP[review.churnRisk]}`}>
                                            {review.churnRisk === "HIGH" && (
                                                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.168 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 9a1 1 0 100-2 1 1 0 000 2z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            )}
                                            {review.churnRisk}
                                        </span>
                                    </td>
                                    <td className="whitespace-nowrap px-5 py-3">
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="h-1 w-14 overflow-hidden rounded-full"
                                                style={{ backgroundColor: "var(--color-surface-3)" }}
                                            >
                                                <div
                                                    className="h-full rounded-full transition-all"
                                                    style={{
                                                        width: `${Math.round(review.negativeScore * 100)}%`,
                                                        backgroundColor: "var(--color-accent-red)",
                                                    }}
                                                />
                                            </div>
                                            <span className="text-[11px]" style={{ color: "var(--color-text-tertiary)" }}>
                                                {(review.negativeScore * 100).toFixed(0)}%
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3">
                                        <div className="flex flex-wrap gap-1">
                                            {review.keyPhrases.slice(0, 3).map((phrase, i) => (
                                                <span
                                                    key={i}
                                                    className="rounded px-1.5 py-0.5 text-[11px]"
                                                    style={{
                                                        backgroundColor: "var(--color-surface-2)",
                                                        color: "var(--color-text-secondary)",
                                                    }}
                                                >
                                                    {phrase}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                </tr>

                                {/* Expanded row */}
                                {expandedRow === review.reviewId && (
                                    <tr key={`${review.reviewId}-expanded`}>
                                        <td
                                            colSpan={6}
                                            className="px-5 py-4"
                                            style={{
                                                backgroundColor: "var(--color-surface-2)",
                                                borderBottom: "1px solid var(--color-border)",
                                            }}
                                        >
                                            <p
                                                className="text-[13px] leading-relaxed"
                                                style={{ color: "var(--color-text-secondary)" }}
                                            >
                                                &ldquo;{review.reviewText}&rdquo;
                                            </p>
                                            <div className="mt-3 flex flex-wrap gap-5 text-[12px]">
                                                <span style={{ color: "var(--color-text-tertiary)" }}>
                                                    Positive:{" "}
                                                    <span style={{ color: "var(--color-accent-green)" }}>
                                                        {(review.sentimentScores.Positive * 100).toFixed(0)}%
                                                    </span>
                                                </span>
                                                <span style={{ color: "var(--color-text-tertiary)" }}>
                                                    Negative:{" "}
                                                    <span style={{ color: "var(--color-accent-red)" }}>
                                                        {(review.sentimentScores.Negative * 100).toFixed(0)}%
                                                    </span>
                                                </span>
                                                <span style={{ color: "var(--color-text-tertiary)" }}>
                                                    Neutral:{" "}
                                                    <span style={{ color: "var(--color-text-secondary)" }}>
                                                        {(review.sentimentScores.Neutral * 100).toFixed(0)}%
                                                    </span>
                                                </span>
                                                <span style={{ color: "var(--color-text-tertiary)" }}>
                                                    Mixed:{" "}
                                                    <span style={{ color: "var(--color-accent-amber)" }}>
                                                        {(review.sentimentScores.Mixed * 100).toFixed(0)}%
                                                    </span>
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </Fragment>
                        ))}
                    </tbody>
                </table>
            </div>

            {filtered.length === 0 && (
                <div
                    className="py-10 text-center text-[13px]"
                    style={{ color: "var(--color-text-tertiary)" }}
                >
                    No reviews match the selected filter.
                </div>
            )}
        </div>
    );
}
