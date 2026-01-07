"use client";

import { Timeframe } from "@/services/binanceApi";

interface TimeframeSelectorProps {
    selectedTimeframe: Timeframe;
    onSelectTimeframe: (timeframe: Timeframe) => void;
}

const timeframes: Timeframe[] = ["1D", "1W", "1M", "1Y", "5Y"];

export default function TimeframeSelector({
    selectedTimeframe,
    onSelectTimeframe,
}: TimeframeSelectorProps) {
    return (
        <div className="flex items-center gap-1 p-1 bg-slate-800/50 rounded-lg border border-slate-700/50">
            {timeframes.map((tf) => (
                <button
                    key={tf}
                    onClick={() => onSelectTimeframe(tf)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${selectedTimeframe === tf
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 border border-transparent"
                        }`}
                >
                    {tf}
                </button>
            ))}
        </div>
    );
}
