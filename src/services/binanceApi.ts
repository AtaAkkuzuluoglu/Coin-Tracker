import { Asset } from "@/lib/assets";

export interface CandlestickData {
    time: number; // Unix timestamp in seconds
    open: number;
    high: number;
    low: number;
    close: number;
}

export interface TickerData {
    price: number;
    priceChange: number;
    priceChangePercent: number;
    volume: number;
}

export type Timeframe = "1D" | "1W" | "1M" | "1Y" | "5Y";

// Map our timeframes to Binance intervals
const timeframeToInterval: Record<Timeframe, string> = {
    "1D": "5m",   // 5-minute candles for 1 day
    "1W": "1h",   // 1-hour candles for 1 week
    "1M": "4h",   // 4-hour candles for 1 month
    "1Y": "1d",   // Daily candles for 1 year
    "5Y": "1w",   // Weekly candles for 5 years
};

const timeframeToLimit: Record<Timeframe, number> = {
    "1D": 288,    // 288 * 5min = 24 hours
    "1W": 168,    // 168 * 1h = 7 days
    "1M": 180,    // 180 * 4h = 30 days
    "1Y": 365,    // 365 daily candles
    "5Y": 260,    // ~5 years of weekly candles
};

const timeframeToDays: Record<Timeframe, number> = {
    "1D": 1,
    "1W": 7,
    "1M": 30,
    "1Y": 365,
    "5Y": 1825,
};

/**
 * Fetch candlestick (kline) data via our API proxy
 */
export async function fetchCandlestickData(
    asset: Asset,
    timeframe: Timeframe
): Promise<CandlestickData[]> {
    const interval = timeframeToInterval[timeframe];
    const limit = timeframeToLimit[timeframe];

    try {
        const response = await fetch(
            `/api/klines?symbol=${asset.symbol}&interval=${interval}&limit=${limit}`
        );

        if (!response.ok) {
            console.warn(`Binance API failed for ${asset.symbol}, falling back to CoinGecko`);
            return fetchCoinGeckoChartData(asset, timeframe);
        }

        const data = await response.json();

        // Check if data has error property
        if (data.error || !Array.isArray(data)) {
            console.warn(`Invalid Binance data for ${asset.symbol}, falling back to CoinGecko`);
            return fetchCoinGeckoChartData(asset, timeframe);
        }

        // Binance kline format:
        // [0] Open time, [1] Open, [2] High, [3] Low, [4] Close, [5] Volume, ...
        return data.map((kline: (string | number)[]) => ({
            time: Math.floor(Number(kline[0]) / 1000), // Convert ms to seconds
            open: parseFloat(kline[1] as string),
            high: parseFloat(kline[2] as string),
            low: parseFloat(kline[3] as string),
            close: parseFloat(kline[4] as string),
        }));
    } catch (error) {
        console.error(`Failed to fetch klines for ${asset.symbol}:`, error);
        // Fall back to CoinGecko on error
        return fetchCoinGeckoChartData(asset, timeframe);
    }
}

/**
 * Fetch chart data from CoinGecko via our API proxy
 */
async function fetchCoinGeckoChartData(
    asset: Asset,
    timeframe: Timeframe
): Promise<CandlestickData[]> {
    const days = timeframeToDays[timeframe];

    try {
        const response = await fetch(
            `/api/coingecko?coinId=${asset.coingeckoId}&days=${days}`
        );

        if (!response.ok) {
            console.error(`CoinGecko API error: ${response.status}`);
            return [];
        }

        const data = await response.json();

        if (!Array.isArray(data) || data.length === 0) {
            return [];
        }

        // CoinGecko OHLC format: [timestamp, open, high, low, close]
        return data.map((ohlc: number[]) => ({
            time: Math.floor(ohlc[0] / 1000),
            open: ohlc[1],
            high: ohlc[2],
            low: ohlc[3],
            close: ohlc[4],
        }));
    } catch (error) {
        console.error(`Failed to fetch CoinGecko data for ${asset.coingeckoId}:`, error);
        return [];
    }
}

/**
 * Fetch tickers for all assets (Binance + Hyperliquid)
 */
export async function fetchAllTickers(
    assetList: Asset[]
): Promise<Map<string, TickerData>> {
    const tickerMap = new Map<string, TickerData>();

    // Separate assets by source
    const binanceAssets = assetList.filter((a) => a.source === "binance");
    const hyperliquidAssets = assetList.filter((a) => a.source === "hyperliquid");

    // Fetch Binance tickers
    if (binanceAssets.length > 0) {
        try {
            const symbols = binanceAssets.map((a) => a.symbol);
            const response = await fetch(
                `/api/tickers?symbols=${JSON.stringify(symbols)}`
            );

            if (response.ok) {
                const data = await response.json();

                if (Array.isArray(data)) {
                    for (const ticker of data) {
                        const asset = binanceAssets.find((a) => a.symbol === ticker.symbol);
                        if (asset) {
                            tickerMap.set(asset.id, {
                                price: parseFloat(ticker.lastPrice),
                                priceChange: parseFloat(ticker.priceChange),
                                priceChangePercent: parseFloat(ticker.priceChangePercent),
                                volume: parseFloat(ticker.quoteVolume),
                            });
                        }
                    }
                }
            }
        } catch (error) {
            console.error("Failed to fetch Binance tickers:", error);
        }
    }

    // Fetch Hyperliquid tickers
    for (const asset of hyperliquidAssets) {
        try {
            const response = await fetch("/api/hyperliquid");

            if (response.ok) {
                const data = await response.json();
                if (!data.error) {
                    tickerMap.set(asset.id, {
                        price: data.price || 0,
                        priceChange: data.priceChange24h || 0,
                        priceChangePercent: data.priceChangePercent || 0,
                        volume: data.volume24h || 0,
                    });
                }
            }
        } catch (error) {
            console.error(`Failed to fetch Hyperliquid ticker for ${asset.ticker}:`, error);
        }
    }

    return tickerMap;
}

// Formatting utilities
export function formatPrice(price: number): string {
    if (price >= 10000) {
        return price.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    } else if (price >= 1) {
        return price.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    } else if (price >= 0.01) {
        return price.toLocaleString("en-US", {
            minimumFractionDigits: 4,
            maximumFractionDigits: 4,
        });
    } else {
        return price.toLocaleString("en-US", {
            minimumFractionDigits: 6,
            maximumFractionDigits: 6,
        });
    }
}

export function formatVolume(volume: number): string {
    if (volume >= 1e12) {
        return `$${(volume / 1e12).toFixed(2)}T`;
    } else if (volume >= 1e9) {
        return `$${(volume / 1e9).toFixed(2)}B`;
    } else if (volume >= 1e6) {
        return `$${(volume / 1e6).toFixed(2)}M`;
    } else if (volume >= 1e3) {
        return `$${(volume / 1e3).toFixed(2)}K`;
    }
    return `$${volume.toFixed(2)}`;
}

export function formatChange(change: number): string {
    const sign = change >= 0 ? "+" : "";
    return `${sign}${change.toFixed(2)}%`;
}
