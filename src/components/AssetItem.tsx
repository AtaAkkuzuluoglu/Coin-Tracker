"use client";

import { Asset } from "@/lib/assets";
import { TickerData, formatChange, formatPrice } from "@/lib/binanceApi";
import Image from "next/image";
import { useState } from "react";

interface AssetItemProps {
    asset: Asset;
    ticker?: TickerData;
    isSelected: boolean;
    onClick: () => void;
}

export default function AssetItem({
    asset,
    ticker,
    isSelected,
    onClick,
}: AssetItemProps) {
    const isPositive = ticker ? ticker.priceChangePercent >= 0 : true;
    const [imgError, setImgError] = useState(false);

    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 hover:bg-slate-700/50 ${isSelected
                    ? "bg-slate-700/70 border border-slate-600/50"
                    : "bg-transparent border border-transparent"
                }`}
        >
            {/* Logo */}
            <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold shrink-0 overflow-hidden"
                style={{ backgroundColor: `${asset.color}20` }}
            >
                {!imgError ? (
                    <Image
                        src={asset.logo}
                        alt={asset.ticker}
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                        onError={() => setImgError(true)}
                        unoptimized
                    />
                ) : (
                    <span style={{ color: asset.color }}>{asset.ticker[0]}</span>
                )}
            </div>

            {/* Info */}
            <div className="flex-1 text-left min-w-0">
                <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-100 truncate">
                        {asset.ticker}
                    </span>
                    <span className="font-mono-numbers text-slate-200 text-sm">
                        {ticker ? `$${formatPrice(ticker.price)}` : "—"}
                    </span>
                </div>
                <div className="flex items-center justify-between mt-0.5">
                    <span className="text-xs text-slate-400 truncate">{asset.name}</span>
                    <span
                        className={`font-mono-numbers text-xs font-medium ${isPositive ? "text-emerald-400" : "text-rose-500"
                            }`}
                    >
                        {ticker ? formatChange(ticker.priceChangePercent) : "—"}
                    </span>
                </div>
            </div>
        </button>
    );
}
