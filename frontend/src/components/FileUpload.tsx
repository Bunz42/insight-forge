"use client";

import { useState, useRef, useCallback } from "react";
import { getUploadUrl } from "../lib/api";

export default function FileUpload() {
    const [isDragging, setIsDragging] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
    const [statusMessage, setStatusMessage] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const dropped = e.dataTransfer.files?.[0];
        if (dropped?.name.endsWith(".csv")) {
            setFile(dropped);
            setStatus("idle");
        } else {
            setStatus("error");
            setStatusMessage("Only CSV files are accepted.");
        }
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if (selected) {
            setFile(selected);
            setStatus("idle");
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        setUploading(true);
        setStatus("idle");

        try {
            const { uploadUrl } = await getUploadUrl(file.name);

            if (!uploadUrl) {
                await new Promise((r) => setTimeout(r, 1500));
                setStatus("success");
                setStatusMessage(
                    "Upload simulated (no API configured). Set NEXT_PUBLIC_API_URL in .env.local for real uploads."
                );
                return;
            }

            await fetch(uploadUrl, {
                method: "PUT",
                body: file,
                headers: { "Content-Type": "text/csv" },
            });

            setStatus("success");
            setStatusMessage("File uploaded! Processing will begin shortly.");
        } catch {
            setStatus("error");
            setStatusMessage("Upload failed. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="card p-5">
            <h3
                className="mb-1 text-sm font-medium"
                style={{ color: "var(--color-text-primary)" }}
            >
                Upload CSV
            </h3>
            <p className="mb-4 text-[12px]" style={{ color: "var(--color-text-tertiary)" }}>
                Columns:{" "}
                <code
                    className="rounded px-1 py-0.5 text-[11px]"
                    style={{
                        backgroundColor: "var(--color-surface-2)",
                        color: "var(--color-text-secondary)",
                    }}
                >
                    review_id, customer_name, review_text, date
                </code>
            </p>

            {/* Drop zone */}
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-5 py-8 transition-colors"
                style={{
                    borderColor: isDragging ? "var(--color-text-primary)" : "var(--color-border)",
                    backgroundColor: isDragging ? "var(--color-surface-2)" : "transparent",
                }}
            >
                <svg
                    className="mb-2 h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    style={{ color: "var(--color-text-tertiary)" }}
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                    />
                </svg>
                <p className="text-[13px]" style={{ color: "var(--color-text-secondary)" }}>
                    {file ? (
                        <span style={{ color: "var(--color-text-primary)" }}>{file.name}</span>
                    ) : (
                        <>
                            Drop CSV here, or{" "}
                            <span
                                className="underline"
                                style={{ color: "var(--color-text-primary)" }}
                            >
                                browse
                            </span>
                        </>
                    )}
                </p>
                {file && (
                    <p className="mt-0.5 text-[11px]" style={{ color: "var(--color-text-tertiary)" }}>
                        {(file.size / 1024).toFixed(1)} KB
                    </p>
                )}
                <input
                    ref={inputRef}
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={handleFileChange}
                />
            </div>

            {/* Upload button */}
            {file && (
                <button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="mt-3 w-full rounded-lg py-2 text-[13px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                    style={{
                        backgroundColor: "var(--color-text-primary)",
                        color: "var(--color-surface)",
                    }}
                >
                    {uploading ? (
                        <span className="flex items-center justify-center gap-2">
                            <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                                <circle
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                    className="opacity-25"
                                />
                                <path
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                    className="opacity-75"
                                />
                            </svg>
                            Uploading...
                        </span>
                    ) : (
                        "Upload & Process"
                    )}
                </button>
            )}

            {/* Status */}
            {status !== "idle" && (
                <div
                    className={`mt-3 rounded-lg px-3 py-2.5 text-[12px] ${status === "success" ? "badge-positive" : "badge-negative"
                        }`}
                    style={{ borderRadius: "8px", display: "block" }}
                >
                    {statusMessage}
                </div>
            )}
        </div>
    );
}
