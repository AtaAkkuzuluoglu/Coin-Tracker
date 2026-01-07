"use client";

import { ActiveIndicators, IndicatorType, indicatorColors } from "@/lib/indicators";
import { ChevronDown, Activity } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface IndicatorSelectorProps {
    activeIndicators: ActiveIndicators;
    onToggleIndicator: (indicator: IndicatorType) => void;
}

const indicatorGroups = [
    {
        name: "Moving Averages",
        indicators: [
            { key: "MA20" as IndicatorType, label: "MA 20", description: "20-period Simple Moving Average" },
            { key: "MA50" as IndicatorType, label: "MA 50", description: "50-period Simple Moving Average" },
            { key: "MA200" as IndicatorType, label: "MA 200", description: "200-period Simple Moving Average" },
            { key: "EMA20" as IndicatorType, label: "EMA 20", description: "20-period Exponential Moving Average" },
        ],
    },
    {
        name: "Oscillators",
        indicators: [
            { key: "RSI" as IndicatorType, label: "RSI", description: "Relative Strength Index (14)" },
            { key: "MACD" as IndicatorType, label: "MACD", description: "Moving Average Convergence Divergence" },
        ],
    },
    {
        name: "Volatility",
        indicators: [
            { key: "BB" as IndicatorType, label: "Bollinger Bands", description: "20-period with 2 std dev" },
        ],
    },
];

export default function IndicatorSelector({
    activeIndicators,
    onToggleIndicator,
}: IndicatorSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const activeCount = Object.values(activeIndicators).filter(Boolean).length;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all border ${activeCount > 0
                        ? "bg-purple-500/20 text-purple-400 border-purple-500/30"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 border-slate-700/50"
                    }`}
            >
                <Activity className="w-4 h-4" />
                <span>Indicators</span>
                {activeCount > 0 && (
                    <span className="px-1.5 py-0.5 text-xs rounded-full bg-purple-500/30 text-purple-300">
                        {activeCount}
                    </span>
                )}
                <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 glass glass-border rounded-xl shadow-xl z-50 overflow-hidden">
                    <div className="p-3 border-b border-slate-700/50">
                        <h3 className="text-sm font-semibold text-slate-200">Technical Indicators</h3>
                        <p className="text-xs text-slate-400 mt-1">Toggle indicators on/off</p>
                    </div>

                    <div className="max-h-80 overflow-y-auto p-2">
                        {indicatorGroups.map((group) => (
                            <div key={group.name} className="mb-3 last:mb-0">
                                <div className="text-xs font-medium text-slate-500 uppercase tracking-wide px-2 py-1">
                                    {group.name}
                                </div>
                                <div className="space-y-1">
                                    {group.indicators.map((indicator) => {
                                        const isActive = activeIndicators[indicator.key];
                                        return (
                                            <button
                                                key={indicator.key}
                                                onClick={() => onToggleIndicator(indicator.key)}
                                                className={`w-full flex items-center gap-3 p-2 rounded-lg transition-all ${isActive
                                                        ? "bg-slate-700/70"
                                                        : "hover:bg-slate-700/30"
                                                    }`}
                                            >
                                                <div
                                                    className={`w-3 h-3 rounded-full transition-all ${isActive ? "" : "opacity-30"
                                                        }`}
                                                    style={{ backgroundColor: indicatorColors[indicator.key] }}
                                                />
                                                <div className="flex-1 text-left">
                                                    <div className="text-sm font-medium text-slate-200">
                                                        {indicator.label}
                                                    </div>
                                                    <div className="text-xs text-slate-400">
                                                        {indicator.description}
                                                    </div>
                                                </div>
                                                <div
                                                    className={`w-10 h-5 rounded-full transition-all ${isActive ? "bg-emerald-500" : "bg-slate-600"
                                                        }`}
                                                >
                                                    <div
                                                        className={`w-4 h-4 rounded-full bg-white mt-0.5 transition-transform ${isActive ? "translate-x-5 ml-0.5" : "translate-x-0.5"
                                                            }`}
                                                    />
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>

                    {activeCount > 0 && (
                        <div className="p-2 border-t border-slate-700/50">
                            <button
                                onClick={() => {
                                    Object.keys(activeIndicators).forEach((key) => {
                                        if (activeIndicators[key as IndicatorType]) {
                                            onToggleIndicator(key as IndicatorType);
                                        }
                                    });
                                }}
                                className="w-full py-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
                            >
                                Clear All
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
