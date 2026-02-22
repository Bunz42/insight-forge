import { MetricsResponse, ReviewsResponse } from "./types";
import { mockMetrics, mockReviews } from "./mockData";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

const USE_MOCK = !API_BASE_URL;

async function apiFetch<T>(path: string, fallback: T): Promise<T> {
    if (USE_MOCK) return fallback;

    try {
        const res = await fetch(`${API_BASE_URL}${path}`, {
            cache: "no-store",
        });
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        return (await res.json()) as T;
    } catch (err) {
        console.error(`Failed to fetch ${path}:`, err);
        return fallback;
    }
}

export async function fetchMetrics(): Promise<MetricsResponse> {
    return apiFetch("/api/metrics", mockMetrics);
}

export async function fetchReviews(
    sentiment?: string,
    limit = 50
): Promise<ReviewsResponse> {
    const params = new URLSearchParams();
    if (sentiment) params.set("sentiment", sentiment);
    params.set("limit", String(limit));

    return apiFetch(`/api/reviews?${params}`, {
        reviews: mockReviews,
        count: mockReviews.length,
    });
}

export async function getUploadUrl(
    filename: string
): Promise<{ uploadUrl: string; key: string }> {
    if (USE_MOCK) {
        return { uploadUrl: "", key: `uploads/${filename}` };
    }

    const res = await fetch(
        `${API_BASE_URL}/api/upload-url?filename=${encodeURIComponent(filename)}`
    );
    if (!res.ok) throw new Error("Failed to get upload URL");
    return res.json();
}
