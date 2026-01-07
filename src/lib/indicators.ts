import { CandlestickData } from "./binanceApi";

export interface IndicatorData {
    time: number;
    value: number;
}

export interface RSIData {
    time: number;
    value: number;
}

/**
 * Calculate Simple Moving Average (SMA)
 */
export function calculateSMA(
    data: CandlestickData[],
    period: number
): IndicatorData[] {
    const result: IndicatorData[] = [];

    for (let i = period - 1; i < data.length; i++) {
        let sum = 0;
        for (let j = 0; j < period; j++) {
            sum += data[i - j].close;
        }
        result.push({
            time: data[i].time,
            value: sum / period,
        });
    }

    return result;
}

/**
 * Calculate Exponential Moving Average (EMA)
 */
export function calculateEMA(
    data: CandlestickData[],
    period: number
): IndicatorData[] {
    const result: IndicatorData[] = [];
    const multiplier = 2 / (period + 1);

    // Start with SMA for the first value
    let sum = 0;
    for (let i = 0; i < period; i++) {
        sum += data[i].close;
    }
    let ema = sum / period;

    result.push({
        time: data[period - 1].time,
        value: ema,
    });

    // Calculate EMA for remaining data
    for (let i = period; i < data.length; i++) {
        ema = (data[i].close - ema) * multiplier + ema;
        result.push({
            time: data[i].time,
            value: ema,
        });
    }

    return result;
}

/**
 * Calculate Relative Strength Index (RSI)
 */
export function calculateRSI(
    data: CandlestickData[],
    period: number = 14
): RSIData[] {
    const result: RSIData[] = [];

    if (data.length < period + 1) {
        return result;
    }

    // Calculate price changes
    const changes: number[] = [];
    for (let i = 1; i < data.length; i++) {
        changes.push(data[i].close - data[i - 1].close);
    }

    // Calculate initial average gain and loss
    let avgGain = 0;
    let avgLoss = 0;

    for (let i = 0; i < period; i++) {
        if (changes[i] >= 0) {
            avgGain += changes[i];
        } else {
            avgLoss += Math.abs(changes[i]);
        }
    }

    avgGain /= period;
    avgLoss /= period;

    // First RSI value
    let rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    let rsi = 100 - 100 / (1 + rs);

    result.push({
        time: data[period].time,
        value: rsi,
    });

    // Calculate smoothed RSI for remaining data
    for (let i = period; i < changes.length; i++) {
        const change = changes[i];
        const gain = change >= 0 ? change : 0;
        const loss = change < 0 ? Math.abs(change) : 0;

        avgGain = (avgGain * (period - 1) + gain) / period;
        avgLoss = (avgLoss * (period - 1) + loss) / period;

        rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
        rsi = 100 - 100 / (1 + rs);

        result.push({
            time: data[i + 1].time,
            value: rsi,
        });
    }

    return result;
}

/**
 * Calculate Bollinger Bands
 */
export function calculateBollingerBands(
    data: CandlestickData[],
    period: number = 20,
    stdDevMultiplier: number = 2
): { upper: IndicatorData[]; middle: IndicatorData[]; lower: IndicatorData[] } {
    const upper: IndicatorData[] = [];
    const middle: IndicatorData[] = [];
    const lower: IndicatorData[] = [];

    for (let i = period - 1; i < data.length; i++) {
        // Calculate SMA (middle band)
        let sum = 0;
        for (let j = 0; j < period; j++) {
            sum += data[i - j].close;
        }
        const sma = sum / period;

        // Calculate standard deviation
        let squaredDiffSum = 0;
        for (let j = 0; j < period; j++) {
            squaredDiffSum += Math.pow(data[i - j].close - sma, 2);
        }
        const stdDev = Math.sqrt(squaredDiffSum / period);

        const time = data[i].time;
        middle.push({ time, value: sma });
        upper.push({ time, value: sma + stdDevMultiplier * stdDev });
        lower.push({ time, value: sma - stdDevMultiplier * stdDev });
    }

    return { upper, middle, lower };
}

/**
 * Calculate MACD
 */
export function calculateMACD(
    data: CandlestickData[],
    fastPeriod: number = 12,
    slowPeriod: number = 26,
    signalPeriod: number = 9
): { macd: IndicatorData[]; signal: IndicatorData[]; histogram: IndicatorData[] } {
    const fastEMA = calculateEMA(data, fastPeriod);
    const slowEMA = calculateEMA(data, slowPeriod);

    const macdLine: IndicatorData[] = [];

    // MACD line = Fast EMA - Slow EMA
    const slowStartIndex = slowPeriod - fastPeriod;
    for (let i = 0; i < slowEMA.length; i++) {
        const fastValue = fastEMA[i + slowStartIndex]?.value;
        const slowValue = slowEMA[i]?.value;

        if (fastValue !== undefined && slowValue !== undefined) {
            macdLine.push({
                time: slowEMA[i].time,
                value: fastValue - slowValue,
            });
        }
    }

    // Signal line = EMA of MACD line
    const signal: IndicatorData[] = [];
    const multiplier = 2 / (signalPeriod + 1);

    if (macdLine.length >= signalPeriod) {
        let sum = 0;
        for (let i = 0; i < signalPeriod; i++) {
            sum += macdLine[i].value;
        }
        let ema = sum / signalPeriod;

        signal.push({
            time: macdLine[signalPeriod - 1].time,
            value: ema,
        });

        for (let i = signalPeriod; i < macdLine.length; i++) {
            ema = (macdLine[i].value - ema) * multiplier + ema;
            signal.push({
                time: macdLine[i].time,
                value: ema,
            });
        }
    }

    // Histogram = MACD - Signal
    const histogram: IndicatorData[] = [];
    const signalStartIndex = signalPeriod - 1;

    for (let i = 0; i < signal.length; i++) {
        const macdValue = macdLine[i + signalStartIndex]?.value;
        const signalValue = signal[i]?.value;

        if (macdValue !== undefined && signalValue !== undefined) {
            histogram.push({
                time: signal[i].time,
                value: macdValue - signalValue,
            });
        }
    }

    return { macd: macdLine, signal, histogram };
}

export type IndicatorType = "MA20" | "MA50" | "MA200" | "EMA20" | "RSI" | "MACD" | "BB";

export interface ActiveIndicators {
    MA20: boolean;
    MA50: boolean;
    MA200: boolean;
    EMA20: boolean;
    RSI: boolean;
    MACD: boolean;
    BB: boolean;
}

export const defaultIndicators: ActiveIndicators = {
    MA20: false,
    MA50: false,
    MA200: false,
    EMA20: false,
    RSI: false,
    MACD: false,
    BB: false,
};

export const indicatorColors: Record<IndicatorType, string> = {
    MA20: "#fbbf24",   // Yellow
    MA50: "#f97316",   // Orange
    MA200: "#ef4444",  // Red
    EMA20: "#8b5cf6",  // Purple
    RSI: "#06b6d4",    // Cyan
    MACD: "#10b981",   // Green
    BB: "#6366f1",     // Indigo
};
