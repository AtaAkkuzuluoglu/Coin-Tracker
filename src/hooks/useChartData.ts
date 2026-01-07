"use client";

import { useState, useEffect, useCallback } from "react";
import { Asset } from "@/lib/assets";
import {
    CandlestickData,
    TickerData,
    Timeframe,
    fetchCandlestickData,
    fetchAllTickers,
} from "@/services/binanceApi";

interface UseChartDataReturn {
    chartData: CandlestickData[];
    isLoading: boolean;
    lastUpdated: Date | null;
    refetch: () => void;
}

/**
 * Custom hook for fetching and managing chart data
 * Handles race conditions and provides clean state management
 */
export function useChartData(
    asset: Asset,
    timeframe: Timeframe
): UseChartDataReturn {
    const [chartData, setChartData] = useState<CandlestickData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    const fetchChart = useCallback(async (targetAsset: Asset, targetTimeframe: Timeframe) => {
        setIsLoading(true);
        setChartData([]); // Clear previous data to avoid stale display
        const data = await fetchCandlestickData(targetAsset, targetTimeframe);
        setChartData(data);
        setIsLoading(false);
        setLastUpdated(new Date());
    }, []);

    // Fetch chart when asset or timeframe changes
    useEffect(() => {
        let isCancelled = false;

        const loadChart = async () => {
            setIsLoading(true);
            setChartData([]); // Clear previous data immediately
            const data = await fetchCandlestickData(asset, timeframe);

            // Only update state if this effect hasn't been cancelled
            if (!isCancelled) {
                setChartData(data);
                setIsLoading(false);
                setLastUpdated(new Date());
            }
        };

        loadChart();

        return () => {
            isCancelled = true; // Cancel if asset/timeframe changes before fetch completes
        };
    }, [asset, timeframe]);

    // Auto-refresh interval
    useEffect(() => {
        const interval = setInterval(() => {
            fetchChart(asset, timeframe);
        }, 30000);

        return () => clearInterval(interval);
    }, [fetchChart, asset, timeframe]);

    const refetch = useCallback(() => {
        fetchChart(asset, timeframe);
    }, [fetchChart, asset, timeframe]);

    return { chartData, isLoading, lastUpdated, refetch };
}

interface UseTickersReturn {
    tickerData: Map<string, TickerData>;
    refetch: () => void;
}

/**
 * Custom hook for fetching ticker data for all assets
 */
export function useTickers(assets: Asset[]): UseTickersReturn {
    const [tickerData, setTickerData] = useState<Map<string, TickerData>>(new Map());

    const fetchTickers = useCallback(async () => {
        const tickers = await fetchAllTickers(assets);
        setTickerData(tickers);
    }, [assets]);

    useEffect(() => {
        fetchTickers();

        // Refresh tickers every 10 seconds
        const interval = setInterval(fetchTickers, 10000);

        return () => clearInterval(interval);
    }, [fetchTickers]);

    return { tickerData, refetch: fetchTickers };
}
