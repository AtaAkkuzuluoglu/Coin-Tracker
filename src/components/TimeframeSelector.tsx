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
        <div className="flex items-center justify-between sm:justify-start gap-1 p-1 bg-slate-800/50 rounded-lg border border-slate-700/50 w-full sm:w-auto">
            {timeframes.map((tf) => (
                <button
                    key={tf}
                    onClick={() => onSelectTimeframe(tf)}
                    className={`flex-1 sm:flex-none px-2 sm:px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${selectedTimeframe === tf
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
