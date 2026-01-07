"use client";

import { Asset } from "@/lib/assets";
import { TickerData, formatChange, formatPrice, formatVolume } from "@/lib/binanceApi";
import { Menu, TrendingDown, TrendingUp } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface HeaderProps {
    asset: Asset;
    ticker?: TickerData;
    onMenuClick: () => void;
}

export default function Header({ asset, ticker, onMenuClick }: HeaderProps) {
    const isPositive = ticker ? ticker.priceChangePercent >= 0 : true;
    const [imgError, setImgError] = useState(false);

    return (
        <header className="glass glass-border rounded-xl p-4 mb-4">
            <div className="flex items-center gap-4">
                {/* Mobile Menu Button */}
                <button
                    onClick={onMenuClick}
                    className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-slate-700/50 transition-colors"
                >
                    <Menu className="w-5 h-5 text-slate-300" />
                </button>

                {/* Asset Logo */}
                <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold shrink-0 overflow-hidden"
                    style={{ backgroundColor: `${asset.color}20` }}
                >
                    {!imgError ? (
                        <Image
                            src={asset.logo}
                            alt={asset.ticker}
                            width={48}
                            height={48}
                            className="w-full h-full object-cover"
                            onError={() => setImgError(true)}
                            unoptimized
                        />
                    ) : (
                        <span style={{ color: asset.color }}>{asset.ticker[0]}</span>
                    )}
                </div>

                {/* Asset Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <h2 className="text-xl font-bold text-slate-100">{asset.name}</h2>
                        <span className="text-sm text-slate-400 font-medium">
                            {asset.ticker}
                        </span>
                        {asset.source === "hyperliquid" && (
                            <span className="text-xs px-1.5 py-0.5 bg-purple-500/20 text-purple-400 rounded border border-purple-500/30">
                                Hyperliquid
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                        {isPositive ? (
                            <TrendingUp className="w-4 h-4 text-emerald-400" />
                        ) : (
                            <TrendingDown className="w-4 h-4 text-rose-500" />
                        )}
                        <span
                            className={`text-sm font-medium ${isPositive ? "text-emerald-400" : "text-rose-500"
                                }`}
                        >
                            {isPositive ? "Bullish" : "Bearish"}
                        </span>
                    </div>
                </div>

                {/* Stats */}
                <div className="hidden sm:flex items-center gap-6">
                    {/* Price */}
                    <div className="text-right">
                        <div className="text-xs text-slate-400 uppercase tracking-wide">
                            Price
                        </div>
                        <div className="text-xl font-bold font-mono-numbers text-slate-100">
                            {ticker ? `$${formatPrice(ticker.price)}` : "—"}
                        </div>
                    </div>

                    {/* 24h Change */}
                    <div className="text-right">
                        <div className="text-xs text-slate-400 uppercase tracking-wide">
                            24h Change
                        </div>
                        <div
                            className={`text-xl font-bold font-mono-numbers ${isPositive ? "text-emerald-400" : "text-rose-500"
                                }`}
                        >
                            {ticker ? formatChange(ticker.priceChangePercent) : "—"}
                        </div>
                    </div>

                    {/* Volume */}
                    <div className="text-right">
                        <div className="text-xs text-slate-400 uppercase tracking-wide">
                            24h Volume
                        </div>
                        <div className="text-xl font-bold font-mono-numbers text-slate-100">
                            {ticker ? formatVolume(ticker.volume) : "—"}
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Stats Row */}
            <div className="sm:hidden flex items-center justify-between mt-4 pt-4 border-t border-slate-700/50">
                <div className="text-center">
                    <div className="text-xs text-slate-400">Price</div>
                    <div className="text-sm font-bold font-mono-numbers text-slate-100">
                        {ticker ? `$${formatPrice(ticker.price)}` : "—"}
                    </div>
                </div>
                <div className="text-center">
                    <div className="text-xs text-slate-400">24h</div>
                    <div
                        className={`text-sm font-bold font-mono-numbers ${isPositive ? "text-emerald-400" : "text-rose-500"
                            }`}
                    >
                        {ticker ? formatChange(ticker.priceChangePercent) : "—"}
                    </div>
                </div>
                <div className="text-center">
                    <div className="text-xs text-slate-400">Volume</div>
                    <div className="text-sm font-bold font-mono-numbers text-slate-100">
                        {ticker ? formatVolume(ticker.volume) : "—"}
                    </div>
                </div>
            </div>
        </header>
    );
}
