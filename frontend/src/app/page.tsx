"use client";

import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import MetricCard from "../components/MetricCard";
import SentimentPieChart from "../components/SentimentPieChart";
import SentimentBarChart from "../components/SentimentBarChart";
import ChurnRiskChart from "../components/ChurnRiskChart";
import ReviewTable from "../components/ReviewTable";
import FileUpload from "../components/FileUpload";
import { fetchMetrics, fetchReviews } from "../lib/api";
import type { MetricsResponse, Review } from "../lib/types";

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<MetricsResponse | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [m, r] = await Promise.all([fetchMetrics(), fetchReviews()]);
        setMetrics(m);
        setReviews(r.reviews);
      } catch (err) {
        console.error("Failed to load data:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ backgroundColor: "var(--color-surface)" }}
      >
        <div className="flex flex-col items-center gap-3">
          <div
            className="h-8 w-8 animate-spin rounded-full border-2"
            style={{
              borderColor: "var(--color-border)",
              borderTopColor: "var(--color-text-primary)",
            }}
          />
          <p className="text-[13px]" style={{ color: "var(--color-text-tertiary)" }}>
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  const negativePercent = metrics
    ? ((metrics.sentimentDistribution.NEGATIVE / metrics.totalReviews) * 100).toFixed(1)
    : "0";

  const highChurnCount = metrics?.churnRiskDistribution.HIGH ?? 0;

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: "var(--color-surface)" }}>
      <Sidebar />

      {/* Main content — offset by sidebar width */}
      <main className="min-w-0 flex-1" style={{ marginLeft: 200 }}>
        {/* Top bar */}
        <header
          className="sticky top-0 z-30 border-b backdrop-blur-md"
          style={{
            backgroundColor: "rgba(10, 10, 10, 0.8)",
            borderColor: "var(--color-border)",
          }}
        >
          <div className="flex h-14 items-center justify-between px-6">
            <h1
              className="text-sm font-semibold"
              style={{ color: "var(--color-text-primary)" }}
            >
              Dashboard
            </h1>
            <div className="flex items-center gap-3">
              <span
                className="rounded-full px-2.5 py-0.5 text-[11px]"
                style={{
                  backgroundColor: "var(--color-surface-2)",
                  color: "var(--color-text-tertiary)",
                  border: "1px solid var(--color-border)",
                }}
              >
                v1.0.0
              </span>
              <div
                className="h-7 w-7 rounded-full"
                style={{
                  background: "linear-gradient(135deg, #ff4c4c, #ff8c00)",
                }}
              />
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="bg-grid">
          <div className="mx-auto max-w-6xl space-y-6 px-6 py-6">
            {/* Metric cards */}
            <div className="animate-fade-in grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                title="Total Reviews"
                value={metrics?.totalReviews.toLocaleString() ?? "0"}
                subtitle="All time"
                icon={
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                }
              />
              <MetricCard
                title="Negative Sentiment"
                value={`${negativePercent}%`}
                subtitle={`${metrics?.sentimentDistribution.NEGATIVE ?? 0} reviews`}
                accentColor="var(--color-accent-red)"
                icon={
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 16.318A4.486 4.486 0 0012.016 15a4.486 4.486 0 00-3.198 1.318M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
                  </svg>
                }
              />
              <MetricCard
                title="Positive Score"
                value={`${((metrics?.averageScores.Positive ?? 0) * 100).toFixed(0)}%`}
                subtitle="Avg. confidence"
                accentColor="var(--color-accent-green)"
                icon={
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
                  </svg>
                }
              />
              <MetricCard
                title="High Churn Risk"
                value={highChurnCount}
                subtitle="Customers at risk"
                accentColor="var(--color-accent-red)"
                icon={
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                }
              />
            </div>

            {/* Charts — row 1 */}
            <div className="animate-fade-in-delay-1 grid grid-cols-1 gap-4 lg:grid-cols-2">
              <SentimentPieChart data={metrics?.sentimentDistribution ?? {}} />
              <SentimentBarChart data={metrics?.averageScores ?? {}} />
            </div>

            {/* Charts — row 2 */}
            <div className="animate-fade-in-delay-2 grid grid-cols-1 gap-4 lg:grid-cols-2">
              <ChurnRiskChart data={metrics?.churnRiskDistribution ?? {}} />
              <FileUpload />
            </div>

            {/* Reviews table */}
            <div className="animate-fade-in-delay-3">
              <ReviewTable reviews={reviews} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
