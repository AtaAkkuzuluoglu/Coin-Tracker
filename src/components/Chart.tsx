"use client";

import { useEffect, useRef, useCallback, useState, useMemo } from "react";
import { createChart, IChartApi, ColorType, CandlestickSeries, LineSeries, CrosshairMode, Time } from "lightweight-charts";
import { CandlestickData, formatPrice, formatChange } from "@/services/binanceApi";
import { Asset } from "@/lib/assets";
import { TrendingUp, TrendingDown } from "lucide-react";
import {
    ActiveIndicators,
    calculateSMA,
    calculateEMA,
    calculateRSI,
    calculateBollingerBands,
    indicatorColors,
} from "@/lib/indicators";
import { useTheme } from "@/context/ThemeContext";

interface ChartProps {
    data: CandlestickData[];
    asset: Asset;
    activeIndicators: ActiveIndicators;
}

interface CrosshairInfo {
    price: number;
    time: number;
    priceChange: number;
    priceChangePercent: number;
}

export default function Chart({ data, asset, activeIndicators }: ChartProps) {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const rsiContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const rsiChartRef = useRef<IChartApi | null>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const seriesRef = useRef<any>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const indicatorSeriesRef = useRef<Map<string, any>>(new Map());
    const [crosshairInfo, setCrosshairInfo] = useState<CrosshairInfo | null>(null);
    const { theme } = useTheme();

    // Get current price (last candle close)
    const currentPrice = data.length > 0 ? data[data.length - 1].close : 0;

    // Calculate indicators
    const indicators = useMemo(() => {
        if (data.length === 0) return null;

        return {
            ma20: activeIndicators.MA20 ? calculateSMA(data, 20) : [],
            ma50: activeIndicators.MA50 ? calculateSMA(data, 50) : [],
            ma200: activeIndicators.MA200 ? calculateSMA(data, 200) : [],
            ema20: activeIndicators.EMA20 ? calculateEMA(data, 20) : [],
            rsi: activeIndicators.RSI ? calculateRSI(data, 14) : [],
            bb: activeIndicators.BB ? calculateBollingerBands(data, 20, 2) : null,
        };
    }, [data, activeIndicators]);

    const isDark = theme === "dark";
    const textColor = isDark ? "#94a3b8" : "#64748b";
    const gridColor = isDark ? "rgba(71, 85, 105, 0.3)" : "rgba(148, 163, 184, 0.3)";
    const crosshairColor = isDark ? "#64748b" : "#94a3b8";
    const labelBgColor = isDark ? "#1e293b" : "#f1f5f9";

    const initChart = useCallback(() => {
        if (!chartContainerRef.current) return;

        // Clear existing chart
        if (chartRef.current) {
            chartRef.current.remove();
            chartRef.current = null;
            seriesRef.current = null;
            indicatorSeriesRef.current.clear();
        }

        const container = chartContainerRef.current;

        // Create chart
        const chart = createChart(container, {
            layout: {
                background: { type: ColorType.Solid, color: "transparent" },
                textColor,
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            },
            grid: {
                vertLines: { color: gridColor },
                horzLines: { color: gridColor },
            },
            crosshair: {
                mode: CrosshairMode.Normal,
                vertLine: {
                    color: crosshairColor,
                    width: 1,
                    style: 2,
                    labelBackgroundColor: labelBgColor,
                },
                horzLine: {
                    color: crosshairColor,
                    width: 1,
                    style: 2,
                    labelBackgroundColor: labelBgColor,
                },
            },
            rightPriceScale: {
                borderColor: gridColor,
                scaleMargins: {
                    top: 0.1,
                    bottom: 0.1,
                },
            },
            timeScale: {
                borderColor: gridColor,
                timeVisible: true,
                secondsVisible: false,
            },
            handleScale: {
                axisPressedMouseMove: true,
            },
            handleScroll: {
                mouseWheel: true,
                pressedMouseMove: true,
                horzTouchDrag: true,
                vertTouchDrag: true,
            },
        });

        // Add candlestick series
        const candlestickSeries = chart.addSeries(CandlestickSeries, {
            upColor: "#34d399",
            downColor: "#f43f5e",
            borderUpColor: "#34d399",
            borderDownColor: "#f43f5e",
            wickUpColor: "#34d399",
            wickDownColor: "#f43f5e",
        });

        chartRef.current = chart;
        seriesRef.current = candlestickSeries;

        // Set candlestick data
        const formattedData = data.map((d) => ({
            time: d.time as Time,
            open: d.open,
            high: d.high,
            low: d.low,
            close: d.close,
        }));

        candlestickSeries.setData(formattedData);

        // Add indicator series
        if (indicators) {
            // MA20
            if (indicators.ma20.length > 0) {
                const ma20Series = chart.addSeries(LineSeries, {
                    color: indicatorColors.MA20,
                    lineWidth: 1,
                    priceLineVisible: false,
                    lastValueVisible: false,
                });
                ma20Series.setData(indicators.ma20.map((d) => ({ time: d.time as Time, value: d.value })));
                indicatorSeriesRef.current.set("MA20", ma20Series);
            }

            // MA50
            if (indicators.ma50.length > 0) {
                const ma50Series = chart.addSeries(LineSeries, {
                    color: indicatorColors.MA50,
                    lineWidth: 1,
                    priceLineVisible: false,
                    lastValueVisible: false,
                });
                ma50Series.setData(indicators.ma50.map((d) => ({ time: d.time as Time, value: d.value })));
                indicatorSeriesRef.current.set("MA50", ma50Series);
            }

            // MA200
            if (indicators.ma200.length > 0) {
                const ma200Series = chart.addSeries(LineSeries, {
                    color: indicatorColors.MA200,
                    lineWidth: 1,
                    priceLineVisible: false,
                    lastValueVisible: false,
                });
                ma200Series.setData(indicators.ma200.map((d) => ({ time: d.time as Time, value: d.value })));
                indicatorSeriesRef.current.set("MA200", ma200Series);
            }

            // EMA20
            if (indicators.ema20.length > 0) {
                const ema20Series = chart.addSeries(LineSeries, {
                    color: indicatorColors.EMA20,
                    lineWidth: 1,
                    priceLineVisible: false,
                    lastValueVisible: false,
                });
                ema20Series.setData(indicators.ema20.map((d) => ({ time: d.time as Time, value: d.value })));
                indicatorSeriesRef.current.set("EMA20", ema20Series);
            }

            // Bollinger Bands
            if (indicators.bb) {
                const bbUpperSeries = chart.addSeries(LineSeries, {
                    color: indicatorColors.BB,
                    lineWidth: 1,
                    lineStyle: 2,
                    priceLineVisible: false,
                    lastValueVisible: false,
                });
                bbUpperSeries.setData(indicators.bb.upper.map((d) => ({ time: d.time as Time, value: d.value })));

                const bbMiddleSeries = chart.addSeries(LineSeries, {
                    color: indicatorColors.BB,
                    lineWidth: 1,
                    priceLineVisible: false,
                    lastValueVisible: false,
                });
                bbMiddleSeries.setData(indicators.bb.middle.map((d) => ({ time: d.time as Time, value: d.value })));

                const bbLowerSeries = chart.addSeries(LineSeries, {
                    color: indicatorColors.BB,
                    lineWidth: 1,
                    lineStyle: 2,
                    priceLineVisible: false,
                    lastValueVisible: false,
                });
                bbLowerSeries.setData(indicators.bb.lower.map((d) => ({ time: d.time as Time, value: d.value })));

                indicatorSeriesRef.current.set("BB_upper", bbUpperSeries);
                indicatorSeriesRef.current.set("BB_middle", bbMiddleSeries);
                indicatorSeriesRef.current.set("BB_lower", bbLowerSeries);
            }
        }

        chart.timeScale().fitContent();

        // Subscribe to crosshair move
        chart.subscribeCrosshairMove((param) => {
            if (!param.time || !param.point) {
                setCrosshairInfo(null);
                return;
            }

            const candleData = param.seriesData.get(candlestickSeries);
            if (candleData && "close" in candleData) {
                const hoverPrice = candleData.close as number;
                const latestPrice = currentPrice;
                const priceChange = latestPrice - hoverPrice;
                const priceChangePercent = ((latestPrice - hoverPrice) / hoverPrice) * 100;

                setCrosshairInfo({
                    price: hoverPrice,
                    time: param.time as number,
                    priceChange,
                    priceChangePercent,
                });
            }
        });

        // Handle resize
        const handleResize = () => {
            if (chartRef.current && chartContainerRef.current) {
                chartRef.current.applyOptions({
                    width: chartContainerRef.current.clientWidth,
                    height: chartContainerRef.current.clientHeight,
                });
            }
        };

        const resizeObserver = new ResizeObserver(handleResize);
        resizeObserver.observe(container);
        handleResize();

        return () => {
            resizeObserver.disconnect();
        };
    }, [data, currentPrice, indicators, textColor, gridColor, crosshairColor, labelBgColor]);

    // Initialize RSI chart if needed
    useEffect(() => {
        if (!rsiContainerRef.current || !activeIndicators.RSI || !indicators?.rsi.length) {
            if (rsiChartRef.current) {
                rsiChartRef.current.remove();
                rsiChartRef.current = null;
            }
            return;
        }

        const container = rsiContainerRef.current;

        const rsiChart = createChart(container, {
            layout: {
                background: { type: ColorType.Solid, color: "transparent" },
                textColor,
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            },
            grid: {
                vertLines: { color: gridColor },
                horzLines: { color: gridColor },
            },
            rightPriceScale: {
                borderColor: gridColor,
                scaleMargins: { top: 0.1, bottom: 0.1 },
            },
            timeScale: {
                borderColor: gridColor,
                visible: false,
            },
            crosshair: {
                mode: CrosshairMode.Normal,
            },
            height: 100,
        });

        const rsiSeries = rsiChart.addSeries(LineSeries, {
            color: indicatorColors.RSI,
            lineWidth: 2,
            priceLineVisible: false,
        });

        rsiSeries.setData(indicators.rsi.map((d) => ({ time: d.time as Time, value: d.value })));

        // Add overbought/oversold lines
        rsiSeries.createPriceLine({
            price: 70,
            color: "#ef4444",
            lineWidth: 1,
            lineStyle: 2,
            axisLabelVisible: true,
            title: "Overbought",
        });

        rsiSeries.createPriceLine({
            price: 30,
            color: "#22c55e",
            lineWidth: 1,
            lineStyle: 2,
            axisLabelVisible: true,
            title: "Oversold",
        });

        rsiChartRef.current = rsiChart;

        const handleResize = () => {
            if (rsiChartRef.current && rsiContainerRef.current) {
                rsiChartRef.current.applyOptions({
                    width: rsiContainerRef.current.clientWidth,
                });
            }
        };

        const resizeObserver = new ResizeObserver(handleResize);
        resizeObserver.observe(container);
        handleResize();

        return () => {
            resizeObserver.disconnect();
            if (rsiChartRef.current) {
                rsiChartRef.current.remove();
                rsiChartRef.current = null;
            }
        };
    }, [activeIndicators.RSI, indicators?.rsi, textColor, gridColor]);

    useEffect(() => {
        const cleanup = initChart();
        return () => {
            cleanup?.();
            if (chartRef.current) {
                chartRef.current.remove();
                chartRef.current = null;
                seriesRef.current = null;
                indicatorSeriesRef.current.clear();
            }
        };
    }, [initChart]);

    const isPositiveChange = crosshairInfo ? crosshairInfo.priceChangePercent >= 0 : true;

    // Get active indicator labels for legend
    const activeIndicatorLabels = Object.entries(activeIndicators)
        .filter(([_, isActive]) => isActive)
        .map(([key]) => key);

    return (
        <div className="relative w-full h-full flex flex-col">
            {/* Main Chart */}
            <div className={`relative flex-1 min-h-[300px] ${activeIndicators.RSI ? "" : ""}`}>
                <div ref={chartContainerRef} className="absolute inset-0" />

                {/* Watermark */}
                <div className="absolute top-4 left-4 pointer-events-none">
                    <div className="flex items-center gap-2 opacity-20">
                        <span className="text-2xl font-bold text-slate-400 dark:text-slate-400">
                            {asset.ticker}
                        </span>
                    </div>
                </div>

                {/* Indicator Legend */}
                {activeIndicatorLabels.length > 0 && (
                    <div className="absolute top-4 left-20 flex flex-wrap gap-2 pointer-events-none">
                        {activeIndicatorLabels.map((key) => (
                            <span
                                key={key}
                                className="px-2 py-0.5 text-xs rounded-full border"
                                style={{
                                    backgroundColor: `${indicatorColors[key as keyof typeof indicatorColors]}20`,
                                    borderColor: `${indicatorColors[key as keyof typeof indicatorColors]}50`,
                                    color: indicatorColors[key as keyof typeof indicatorColors],
                                }}
                            >
                                {key}
                            </span>
                        ))}
                    </div>
                )}

                {/* Crosshair Price Change Info */}
                {crosshairInfo && (
                    <div className="absolute top-4 right-4 glass glass-border rounded-lg p-3 pointer-events-none">
                        <div className="text-xs text-slate-400 mb-1">From Hover to Now</div>
                        <div className="flex items-center gap-2">
                            {isPositiveChange ? (
                                <TrendingUp className="w-4 h-4 text-emerald-400" />
                            ) : (
                                <TrendingDown className="w-4 h-4 text-rose-500" />
                            )}
                            <span
                                className={`font-mono-numbers text-lg font-bold ${isPositiveChange ? "text-emerald-400" : "text-rose-500"
                                    }`}
                            >
                                {formatChange(crosshairInfo.priceChangePercent)}
                            </span>
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                            <span className="text-slate-400">${formatPrice(crosshairInfo.price)}</span>
                            <span className="mx-1">→</span>
                            <span className="text-slate-300">${formatPrice(currentPrice)}</span>
                        </div>
                    </div>
                )}

                {/* Current Price Indicator */}
                <div className="absolute bottom-4 right-4 glass glass-border rounded-lg px-3 py-2">
                    <div className="text-xs text-slate-400">Current Price</div>
                    <div className="font-mono-numbers text-lg font-bold text-slate-100 dark:text-slate-100">
                        ${formatPrice(currentPrice)}
                    </div>
                </div>
            </div>

            {/* RSI Chart (if enabled) */}
            {activeIndicators.RSI && (
                <div className="relative h-[100px] border-t border-slate-700/50 dark:border-slate-700/50">
                    <div className="absolute left-4 top-2 text-xs font-medium text-cyan-400 z-10">
                        RSI (14)
                    </div>
                    <div ref={rsiContainerRef} className="absolute inset-0" />
                </div>
            )}
        </div>
    );
}
