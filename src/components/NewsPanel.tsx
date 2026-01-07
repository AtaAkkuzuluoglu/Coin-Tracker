"use client";

import { useEffect, useState, useCallback } from "react";
import { Asset } from "@/lib/assets";
import {
    Newspaper,
    ExternalLink,
    TrendingUp,
    TrendingDown,
    Minus,
    RefreshCw,
    X,
    ChevronDown,
    ChevronUp,
    Clock,
    ArrowLeft
} from "lucide-react";
import Image from "next/image";

interface NewsItem {
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

interface NewsPanelProps {
    asset: Asset;
    isOpen: boolean;
    onClose: () => void;
}

export default function NewsPanel({ asset, isOpen, onClose }: NewsPanelProps) {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState<"all" | "asset">("all");
    const [selectedArticle, setSelectedArticle] = useState<NewsItem | null>(null);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const fetchNews = useCallback(async () => {
        setLoading(true);
        try {
            const filterParam = filter === "asset" ? asset.ticker : "";
            const response = await fetch(`/api/news?filter=${filterParam}`);
            const data = await response.json();
            setNews(data.news || []);
        } catch (error) {
            console.error("Failed to fetch news:", error);
            setNews([]);
        }
        setLoading(false);
    }, [asset.ticker, filter]);

    useEffect(() => {
        if (isOpen) {
            fetchNews();
            setSelectedArticle(null);
            setExpandedId(null);
        }
    }, [isOpen, fetchNews]);

    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        return `${diffDays}d ago`;
    };

    const getSentimentIcon = (sentiment?: string) => {
        switch (sentiment) {
            case "positive":
                return <TrendingUp className="w-4 h-4 text-emerald-400" />;
            case "negative":
                return <TrendingDown className="w-4 h-4 text-rose-500" />;
            default:
                return <Minus className="w-4 h-4 text-slate-400" />;
        }
    };

    const getSentimentBg = (sentiment?: string) => {
        switch (sentiment) {
            case "positive":
                return "bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20";
            case "negative":
                return "bg-rose-500/10 border-rose-500/20 hover:bg-rose-500/20";
            default:
                return "bg-slate-500/10 border-slate-500/20 hover:bg-slate-500/20";
        }
    };

    const getSentimentLabel = (sentiment?: string) => {
        switch (sentiment) {
            case "positive":
                return <span className="text-emerald-400">Bullish</span>;
            case "negative":
                return <span className="text-rose-500">Bearish</span>;
            default:
                return <span className="text-slate-400">Neutral</span>;
        }
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                onClick={onClose}
            />

            {/* Panel */}
            <div className="fixed right-0 top-0 bottom-0 w-full max-w-lg z-50 glass glass-border flex flex-col transform transition-transform duration-300">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
                    <div className="flex items-center gap-2">
                        {selectedArticle ? (
                            <button
                                onClick={() => setSelectedArticle(null)}
                                className="p-1 rounded-lg hover:bg-slate-700/50 transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5 text-slate-400" />
                            </button>
                        ) : (
                            <Newspaper className="w-5 h-5 text-emerald-400" />
                        )}
                        <h2 className="text-lg font-bold text-slate-100">
                            {selectedArticle ? "Article" : "Crypto News"}
                        </h2>
                    </div>
                    <div className="flex items-center gap-2">
                        {!selectedArticle && (
                            <button
                                onClick={fetchNews}
                                className="p-2 rounded-lg hover:bg-slate-700/50 transition-colors"
                                disabled={loading}
                            >
                                <RefreshCw className={`w-4 h-4 text-slate-400 ${loading ? "animate-spin" : ""}`} />
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg hover:bg-slate-700/50 transition-colors"
                        >
                            <X className="w-5 h-5 text-slate-400" />
                        </button>
                    </div>
                </div>

                {/* Selected Article View */}
                {selectedArticle ? (
                    <div className="flex-1 overflow-y-auto">
                        {/* Article Image */}
                        {selectedArticle.imageUrl && (
                            <div className="relative w-full h-48 bg-slate-800">
                                <Image
                                    src={selectedArticle.imageUrl}
                                    alt={selectedArticle.title}
                                    fill
                                    className="object-cover"
                                    unoptimized
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = "none";
                                    }}
                                />
                            </div>
                        )}

                        {/* Article Content */}
                        <div className="p-4">
                            {/* Meta */}
                            <div className="flex items-center gap-3 mb-3">
                                <span className="px-2 py-1 text-xs rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                    {selectedArticle.source}
                                </span>
                                <div className="flex items-center gap-1 text-xs text-slate-400">
                                    <Clock className="w-3 h-3" />
                                    {formatTimeAgo(selectedArticle.publishedAt)}
                                </div>
                                <div className="flex items-center gap-1">
                                    {getSentimentIcon(selectedArticle.sentiment)}
                                    <span className="text-xs">{getSentimentLabel(selectedArticle.sentiment)}</span>
                                </div>
                            </div>

                            {/* Title */}
                            <h1 className="text-xl font-bold text-slate-100 mb-4 leading-tight">
                                {selectedArticle.title}
                            </h1>

                            {/* Currencies */}
                            {selectedArticle.currencies && selectedArticle.currencies.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-4">
                                    {selectedArticle.currencies.map((currency) => (
                                        <span
                                            key={currency.code}
                                            className="px-2 py-1 text-xs rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30"
                                        >
                                            {currency.code}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Content */}
                            <div className="text-slate-300 leading-relaxed whitespace-pre-wrap text-sm">
                                {selectedArticle.content || selectedArticle.description}
                            </div>

                            {/* Read More Link */}
                            <a
                                href={selectedArticle.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-6 flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 transition-colors"
                            >
                                <span className="font-medium">Read Full Article</span>
                                <ExternalLink className="w-4 h-4" />
                            </a>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Filter Tabs */}
                        <div className="flex gap-2 p-4 border-b border-slate-700/50">
                            <button
                                onClick={() => setFilter("all")}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === "all"
                                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 border border-transparent"
                                    }`}
                            >
                                All News
                            </button>
                            <button
                                onClick={() => setFilter("asset")}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === "asset"
                                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 border border-transparent"
                                    }`}
                            >
                                {asset.ticker} Only
                            </button>
                        </div>

                        {/* News List */}
                        <div className="flex-1 overflow-y-auto p-4">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center h-full gap-3">
                                    <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
                                    <span className="text-slate-400">Loading news...</span>
                                </div>
                            ) : news.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full gap-3">
                                    <Newspaper className="w-8 h-8 text-slate-500" />
                                    <span className="text-slate-400">No news found</span>
                                    <span className="text-xs text-slate-500">Try selecting &quot;All News&quot;</span>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {news.map((item) => (
                                        <div
                                            key={item.id}
                                            className={`rounded-xl border transition-all ${getSentimentBg(item.sentiment)}`}
                                        >
                                            {/* Article Header - Always Visible */}
                                            <button
                                                onClick={() => setSelectedArticle(item)}
                                                className="w-full p-4 text-left"
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className="mt-1 shrink-0">{getSentimentIcon(item.sentiment)}</div>
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="text-sm font-medium text-slate-100 line-clamp-2 mb-2">
                                                            {item.title}
                                                        </h3>
                                                        <div className="flex items-center gap-2 text-xs text-slate-400">
                                                            <span className="font-medium text-emerald-400/80">{item.source}</span>
                                                            <span>•</span>
                                                            <span>{formatTimeAgo(item.publishedAt)}</span>
                                                        </div>
                                                        {item.currencies && item.currencies.length > 0 && (
                                                            <div className="flex flex-wrap gap-1 mt-2">
                                                                {item.currencies.slice(0, 3).map((currency) => (
                                                                    <span
                                                                        key={currency.code}
                                                                        className="px-2 py-0.5 text-xs rounded-full bg-slate-700/50 text-slate-300"
                                                                    >
                                                                        {currency.code}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </button>

                                            {/* Expandable Preview */}
                                            <div className="px-4 pb-2">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setExpandedId(expandedId === item.id ? null : item.id);
                                                    }}
                                                    className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 transition-colors"
                                                >
                                                    {expandedId === item.id ? (
                                                        <>
                                                            <ChevronUp className="w-3 h-3" />
                                                            Hide preview
                                                        </>
                                                    ) : (
                                                        <>
                                                            <ChevronDown className="w-3 h-3" />
                                                            Show preview
                                                        </>
                                                    )}
                                                </button>

                                                {expandedId === item.id && (
                                                    <div className="mt-2 pt-2 border-t border-slate-700/30">
                                                        <p className="text-xs text-slate-300 leading-relaxed">
                                                            {item.description || item.content?.substring(0, 200)}...
                                                        </p>
                                                        <a
                                                            href={item.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="inline-flex items-center gap-1 mt-2 text-xs text-emerald-400 hover:text-emerald-300"
                                                        >
                                                            Open in new tab
                                                            <ExternalLink className="w-3 h-3" />
                                                        </a>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}

                {/* Footer */}
                <div className="p-3 border-t border-slate-700/50">
                    <div className="text-xs text-slate-500 text-center">
                        Real-time news from Cointelegraph & Decrypt
                    </div>
                </div>
            </div>
        </>
    );
}
