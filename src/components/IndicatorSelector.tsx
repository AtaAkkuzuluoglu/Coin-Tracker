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
        <>
            <div className="relative" ref={dropdownRef}>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all border shrink-0 ${activeCount > 0
                        ? "bg-purple-500/20 text-purple-400 border-purple-500/30"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 border-slate-700/50"
                        }`}
                >
                    <Activity className="w-4 h-4" />
                    <span className="hidden sm:inline">Indicators</span>
                    <span className="sm:hidden">Ind</span>
                    {activeCount > 0 && (
                        <span className="px-1.5 py-0.5 text-xs rounded-full bg-purple-500/30 text-purple-300">
                            {activeCount}
                        </span>
                    )}
                    <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button>

                {/* Desktop Dropdown (hidden on mobile) */}
                {isOpen && (
                    <div className="hidden lg:block absolute right-0 top-full mt-2 w-72 glass glass-border rounded-xl shadow-xl z-50 overflow-hidden">
                        <IndicatorList
                            activeIndicators={activeIndicators}
                            onToggleIndicator={onToggleIndicator}
                        />
                    </div>
                )}
            </div>

            {/* Mobile/Tablet Modal (Overlay) */}
            {isOpen && (
                <div className="fixed inset-0 z-[60] lg:hidden flex items-end sm:items-center justify-center sm:p-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Modal Content */}
                    <div className="relative w-full sm:w-80 bg-slate-900 border-t sm:border border-slate-700/50 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 fade-in-0 duration-200">
                        <div className="flex items-center justify-between p-4 border-b border-slate-700/50 bg-slate-800/50">
                            <div>
                                <h3 className="text-lg font-bold text-slate-100">Indicators</h3>
                                <p className="text-xs text-slate-400">Tap to toggle</p>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 -mr-2 text-slate-400 hover:text-slate-200"
                            >
                                <ChevronDown className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="max-h-[60dvh] overflow-y-auto p-4">
                            <IndicatorList
                                activeIndicators={activeIndicators}
                                onToggleIndicator={onToggleIndicator}
                            />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

function IndicatorList({
    activeIndicators,
    onToggleIndicator,
}: {
    activeIndicators: ActiveIndicators;
    onToggleIndicator: (indicator: IndicatorType) => void;
}) {
    const activeCount = Object.values(activeIndicators).filter(Boolean).length;

    return (
        <div>
            {indicatorGroups.map((group) => (
                <div key={group.name} className="mb-4 last:mb-0">
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1 py-1 mb-1">
                        {group.name}
                    </div>
                    <div className="space-y-1">
                        {group.indicators.map((indicator) => {
                            const isActive = activeIndicators[indicator.key];
                            return (
                                <button
                                    key={indicator.key}
                                    onClick={() => onToggleIndicator(indicator.key)}
                                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all border ${isActive
                                        ? "bg-purple-500/10 border-purple-500/30"
                                        : "hover:bg-slate-800 border-transparent"
                                        }`}
                                >
                                    <div
                                        className={`w-3 h-3 rounded-full shrink-0 transition-opacity ${isActive ? "" : "opacity-30"
                                            }`}
                                        style={{ backgroundColor: indicatorColors[indicator.key] }}
                                    />
                                    <div className="flex-1 text-left min-w-0">
                                        <div className={`text-sm font-medium ${isActive ? "text-purple-300" : "text-slate-300"}`}>
                                            {indicator.label}
                                        </div>
                                        <div className="text-xs text-slate-500 truncate">
                                            {indicator.description}
                                        </div>
                                    </div>
                                    <div
                                        className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${isActive ? "bg-purple-500" : "bg-slate-700"
                                            }`}
                                    >
                                        <div
                                            className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${isActive ? "translate-x-5" : "translate-x-0"
                                                }`}
                                        />
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            ))}

            {activeCount > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-700/50">
                    <button
                        onClick={() => {
                            Object.keys(activeIndicators).forEach((key) => {
                                if (activeIndicators[key as IndicatorType]) {
                                    onToggleIndicator(key as IndicatorType);
                                }
                            });
                        }}
                        className="w-full py-3 text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors dashed border border-slate-700 hover:border-slate-500"
                    >
                        Reset All Indicators
                    </button>
                </div>
            )}
        </div>
    );
}
