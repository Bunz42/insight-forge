"use client";

import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    Legend,
} from "recharts";

const COLORS: Record<string, string> = {
    POSITIVE: "#27c93f",
    NEGATIVE: "#ff4c4c",
    NEUTRAL: "#666666",
    MIXED: "#ffbd2e",
};

const LABELS: Record<string, string> = {
    POSITIVE: "Positive",
    NEGATIVE: "Negative",
    NEUTRAL: "Neutral",
    MIXED: "Mixed",
};

interface SentimentPieChartProps {
    data: Record<string, number>;
}

export default function SentimentPieChart({ data }: SentimentPieChartProps) {
    const chartData = Object.entries(data).map(([key, value]) => ({
        name: LABELS[key] || key,
        value,
        color: COLORS[key] || "#666666",
    }));

    return (
        <div className="card p-5">
            <h3
                className="mb-1 text-sm font-medium"
                style={{ color: "var(--color-text-primary)" }}
            >
                Sentiment Distribution
            </h3>
            <p className="mb-4 text-[12px]" style={{ color: "var(--color-text-tertiary)" }}>
                Breakdown by category
            </p>
            <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={80}
                            paddingAngle={3}
                            dataKey="value"
                            stroke="none"
                            animationBegin={0}
                            animationDuration={600}
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "#111111",
                                border: "1px solid #2e2e2e",
                                borderRadius: "8px",
                                color: "#ededed",
                                fontSize: "12px",
                                padding: "8px 12px",
                            }}
                            itemStyle={{ color: "#888888" }}
                        />
                        <Legend
                            iconType="circle"
                            iconSize={8}
                            wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }}
                            formatter={(value) => (
                                <span style={{ color: "#888888", marginLeft: "4px" }}>{value}</span>
                            )}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
