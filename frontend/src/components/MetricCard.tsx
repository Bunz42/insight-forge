"use client";

interface MetricCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ReactNode;
    accentColor?: string;
}

export default function MetricCard({
    title,
    value,
    subtitle,
    icon,
    accentColor,
}: MetricCardProps) {
    return (
        <div className="card p-5">
            <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                    <p
                        className="text-[13px] font-medium"
                        style={{ color: "var(--color-text-tertiary)" }}
                    >
                        {title}
                    </p>
                    <p
                        className="mt-2 text-2xl font-semibold tracking-tight"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        {value}
                    </p>
                    {subtitle && (
                        <p className="mt-1 text-[12px]" style={{ color: accentColor || "var(--color-text-secondary)" }}>
                            {subtitle}
                        </p>
                    )}
                </div>
                <div
                    className="flex-shrink-0 rounded-lg p-2"
                    style={{
                        backgroundColor: "var(--color-surface-2)",
                        color: accentColor || "var(--color-text-tertiary)",
                    }}
                >
                    {icon}
                </div>
            </div>
        </div>
    );
}
