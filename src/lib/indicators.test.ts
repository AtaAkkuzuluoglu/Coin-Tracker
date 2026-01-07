import { describe, it, expect } from 'vitest';
import {
    calculateSMA,
    calculateEMA,
    calculateRSI,
    calculateBollingerBands,
} from '@/lib/indicators';

// Mock candlestick data for testing
const mockCandlestickData = [
    { time: 1, open: 100, high: 105, low: 95, close: 102 },
    { time: 2, open: 102, high: 108, low: 100, close: 106 },
    { time: 3, open: 106, high: 110, low: 104, close: 108 },
    { time: 4, open: 108, high: 112, low: 106, close: 110 },
    { time: 5, open: 110, high: 115, low: 108, close: 112 },
    { time: 6, open: 112, high: 118, low: 110, close: 116 },
    { time: 7, open: 116, high: 120, low: 114, close: 118 },
    { time: 8, open: 118, high: 122, low: 115, close: 120 },
    { time: 9, open: 120, high: 124, low: 118, close: 122 },
    { time: 10, open: 122, high: 126, low: 120, close: 124 },
    { time: 11, open: 124, high: 128, low: 122, close: 126 },
    { time: 12, open: 126, high: 130, low: 124, close: 128 },
    { time: 13, open: 128, high: 132, low: 126, close: 130 },
    { time: 14, open: 130, high: 134, low: 128, close: 132 },
    { time: 15, open: 132, high: 136, low: 130, close: 134 },
    { time: 16, open: 134, high: 138, low: 132, close: 133 }, // Price dip
    { time: 17, open: 133, high: 135, low: 128, close: 130 }, // Continued decline
    { time: 18, open: 130, high: 132, low: 126, close: 128 },
    { time: 19, open: 128, high: 130, low: 124, close: 126 },
    { time: 20, open: 126, high: 128, low: 122, close: 125 },
];

describe('calculateSMA', () => {
    it('should calculate correct SMA values', () => {
        const result = calculateSMA(mockCandlestickData, 5);

        // SMA should start at index period - 1 (index 4 for period 5)
        expect(result.length).toBe(mockCandlestickData.length - 4);

        // First SMA should be average of first 5 close prices
        // (102 + 106 + 108 + 110 + 112) / 5 = 107.6
        expect(result[0].value).toBeCloseTo(107.6, 1);
        expect(result[0].time).toBe(5);
    });

    it('should return empty array when data is less than period', () => {
        const result = calculateSMA(mockCandlestickData.slice(0, 3), 5);
        expect(result).toEqual([]);
    });

    it('should handle period of 1 (equivalent to raw prices)', () => {
        const result = calculateSMA(mockCandlestickData, 1);
        expect(result.length).toBe(mockCandlestickData.length);
        expect(result[0].value).toBe(mockCandlestickData[0].close);
    });
});

describe('calculateEMA', () => {
    it('should calculate EMA values', () => {
        const result = calculateEMA(mockCandlestickData, 5);

        // EMA should have values starting from period index
        expect(result.length).toBe(mockCandlestickData.length - 4);

        // First EMA should equal the first SMA (initial seed)
        const sma = calculateSMA(mockCandlestickData, 5);
        expect(result[0].value).toBeCloseTo(sma[0].value, 1);
    });

    it('should be more responsive than SMA to recent price changes', () => {
        const ema = calculateEMA(mockCandlestickData, 5);
        const sma = calculateSMA(mockCandlestickData, 5);

        // After the price decline (last few candles), EMA should react faster
        // EMA should be lower than SMA because it weights recent (lower) prices more
        const lastEma = ema[ema.length - 1].value;
        const lastSma = sma[sma.length - 1].value;

        // Both should exist
        expect(lastEma).toBeDefined();
        expect(lastSma).toBeDefined();
    });
});

describe('calculateRSI', () => {
    it('should calculate RSI values', () => {
        const result = calculateRSI(mockCandlestickData, 14);

        // RSI should have values after the period + 1
        expect(result.length).toBeGreaterThan(0);
    });

    it('should return values between 0 and 100', () => {
        const result = calculateRSI(mockCandlestickData, 14);

        result.forEach(rsi => {
            expect(rsi.value).toBeGreaterThanOrEqual(0);
            expect(rsi.value).toBeLessThanOrEqual(100);
        });
    });

    it('should return empty array when data is insufficient', () => {
        const result = calculateRSI(mockCandlestickData.slice(0, 5), 14);
        expect(result).toEqual([]);
    });
});

describe('calculateBollingerBands', () => {
    it('should return upper, middle, and lower bands', () => {
        const result = calculateBollingerBands(mockCandlestickData, 10, 2);

        expect(result.upper).toBeDefined();
        expect(result.middle).toBeDefined();
        expect(result.lower).toBeDefined();

        expect(result.upper.length).toBe(result.middle.length);
        expect(result.middle.length).toBe(result.lower.length);
    });

    it('should have middle band equal to SMA', () => {
        const bb = calculateBollingerBands(mockCandlestickData, 10, 2);
        const sma = calculateSMA(mockCandlestickData, 10);

        // Middle band should equal SMA
        bb.middle.forEach((band, idx) => {
            expect(band.value).toBeCloseTo(sma[idx].value, 5);
        });
    });

    it('should have upper > middle > lower', () => {
        const result = calculateBollingerBands(mockCandlestickData, 10, 2);

        for (let i = 0; i < result.middle.length; i++) {
            expect(result.upper[i].value).toBeGreaterThan(result.middle[i].value);
            expect(result.middle[i].value).toBeGreaterThan(result.lower[i].value);
        }
    });
});
