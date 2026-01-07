import { Asset } from "./assets";

export interface CandlestickData {
    time: number; // Unix timestamp in seconds
    open: number;
    high: number;
    low: number;
    close: number;
}

export type Timeframe = "1D" | "1W" | "1M" | "1Y" | "5Y";

interface TimeframeConfig {
    intervalMs: number;
    numCandles: number;
}

const timeframeConfigs: Record<Timeframe, TimeframeConfig> = {
    "1D": { intervalMs: 5 * 60 * 1000, numCandles: 288 }, // 5-min candles for 24h
    "1W": { intervalMs: 30 * 60 * 1000, numCandles: 336 }, // 30-min candles for 7 days
    "1M": { intervalMs: 4 * 60 * 60 * 1000, numCandles: 180 }, // 4-hour candles for 30 days
    "1Y": { intervalMs: 24 * 60 * 60 * 1000, numCandles: 365 }, // Daily candles for 1 year
    "5Y": { intervalMs: 7 * 24 * 60 * 60 * 1000, numCandles: 260 }, // Weekly candles for 5 years
};

// Seeded random number generator for consistent data per asset/timeframe
function seededRandom(seed: number): () => number {
    return function () {
        seed = (seed * 9301 + 49297) % 233280;
        return seed / 233280;
    };
}

function hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
}

export function generateCandlestickData(
    asset: Asset,
    timeframe: Timeframe
): CandlestickData[] {
    const config = timeframeConfigs[timeframe];
    const data: CandlestickData[] = [];

    // Create a seed based on asset ID and timeframe for consistent data
    const seed = hashString(`${asset.id}-${timeframe}`);
    const random = seededRandom(seed);

    const now = Date.now();
    const startTime = now - config.numCandles * config.intervalMs;

    // Start at a percentage of the base price
    let currentPrice = asset.basePrice * (0.7 + random() * 0.6);

    // Volatility scales with timeframe (longer = more cumulative movement)
    const timeframeVolatilityMultiplier: Record<Timeframe, number> = {
        "1D": 0.3,
        "1W": 0.5,
        "1M": 0.8,
        "1Y": 1.2,
        "5Y": 1.5,
    };

    const effectiveVolatility = asset.volatility * timeframeVolatilityMultiplier[timeframe];

    // Add some trend bias
    const trendBias = (random() - 0.5) * 0.001;

    for (let i = 0; i < config.numCandles; i++) {
        const time = Math.floor((startTime + i * config.intervalMs) / 1000);

        // Random walk with volatility
        const changePercent = (random() - 0.5 + trendBias) * effectiveVolatility * 2;
        const open = currentPrice;

        // Generate intra-candle movements
        const moves = [
            1 + (random() - 0.5) * effectiveVolatility,
            1 + (random() - 0.5) * effectiveVolatility,
            1 + (random() - 0.5) * effectiveVolatility,
        ];

        const prices = [open];
        moves.forEach((move) => {
            prices.push(prices[prices.length - 1] * move);
        });

        const close = open * (1 + changePercent);
        prices.push(close);

        const high = Math.max(...prices) * (1 + random() * effectiveVolatility * 0.3);
        const low = Math.min(...prices) * (1 - random() * effectiveVolatility * 0.3);

        data.push({
            time,
            open: parseFloat(open.toFixed(asset.basePrice < 10 ? 4 : 2)),
            high: parseFloat(high.toFixed(asset.basePrice < 10 ? 4 : 2)),
            low: parseFloat(low.toFixed(asset.basePrice < 10 ? 4 : 2)),
            close: parseFloat(close.toFixed(asset.basePrice < 10 ? 4 : 2)),
        });

        currentPrice = close;
    }

    return data;
}

export function getCurrentPrice(data: CandlestickData[]): number {
    if (data.length === 0) return 0;
    return data[data.length - 1].close;
}

export function get24hChange(data: CandlestickData[]): number {
    if (data.length < 2) return 0;
    const oldPrice = data[0].open;
    const newPrice = data[data.length - 1].close;
    return ((newPrice - oldPrice) / oldPrice) * 100;
}

export function get24hVolume(asset: Asset, data: CandlestickData[]): number {
    // Generate realistic volume based on asset and price movements
    const seed = hashString(`${asset.id}-volume`);
    const random = seededRandom(seed);

    const baseVolume = asset.basePrice * 1000000 * (0.5 + random() * 1.5);
    const volatilityBonus = asset.volatility * 5;

    return baseVolume * (1 + volatilityBonus);
}

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
    } else {
        return price.toLocaleString("en-US", {
            minimumFractionDigits: 4,
            maximumFractionDigits: 4,
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
