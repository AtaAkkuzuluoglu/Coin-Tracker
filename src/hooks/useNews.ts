"use client";

import { useState, useEffect, useCallback } from "react";

export interface NewsItem {
    id: string;
    title: string;
    url: string;
    source: string;
    publishedAt: string;
    content: string;
    description: string;
    imageUrl?: string;
    currencies?: { code: string; title: string }[];
    sentiment?: "positive" | "negative" | "neutral";
}

interface UseNewsReturn {
    news: NewsItem[];
    loading: boolean;
    refetch: () => void;
}

/**
 * Custom hook for fetching crypto news
 * @param filter - Optional filter for asset-specific news (e.g., "BTC")
 * @param enabled - Whether to enable fetching (default: true)
 */
export function useNews(filter: string = "", enabled: boolean = true): UseNewsReturn {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchNews = useCallback(async () => {
        if (!enabled) return;

        setLoading(true);
        try {
            const response = await fetch(`/api/news?filter=${filter}`);
            const data = await response.json();
            setNews(data.news || []);
        } catch (error) {
            console.error("Failed to fetch news:", error);
            setNews([]);
        }
        setLoading(false);
    }, [filter, enabled]);

    useEffect(() => {
        if (enabled) {
            fetchNews();
        }
    }, [fetchNews, enabled]);

    return { news, loading, refetch: fetchNews };
}
