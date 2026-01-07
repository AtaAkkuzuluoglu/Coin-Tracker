import { NextRequest, NextResponse } from "next/server";
import { assets } from "@/lib/assets";

const BINANCE_API_BASE = "https://api.binance.com";
const BINANCE_US_API_BASE = "https://api.binance.us";
const COINGECKO_API_BASE = "https://api.coingecko.com/api/v3";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get("symbol");
    const interval = searchParams.get("interval");
    const limit = searchParams.get("limit");

    if (!symbol || !interval) {
        return NextResponse.json(
            { error: "symbol and interval parameters required" },
            { status: 400 }
        );
    }

    // Try main Binance API first, then fallback to Binance US
    const bases = [BINANCE_API_BASE, BINANCE_US_API_BASE];

    for (const base of bases) {
        try {
            // Helper to try fetch
            const tryFetch = async (sym: string) => {
                const url = new URL(`${base}/api/v3/klines`);
                url.searchParams.set("symbol", sym);
                url.searchParams.set("interval", interval);
                if (limit) url.searchParams.set("limit", limit);

                const res = await fetch(url.toString(), {
                    headers: { "Accept": "application/json" },
                    next: { revalidate: 10 },
                });
                return res.ok ? await res.json() : null;
            };

            // Attempt 1: Original symbol (e.g., ONDOUSDT)
            let data = await tryFetch(symbol);

            // Attempt 2: If failed, USDT -> USD (common on Binance.US)
            if (!data && symbol.endsWith("USDT")) {
                const usdSymbol = symbol.replace("USDT", "USD");
                data = await tryFetch(usdSymbol);
            }

            if (Array.isArray(data) && data.length > 0) {
                return NextResponse.json(data);
            }
        } catch (error) {
            console.error(`Failed to fetch klines from ${base}:`, error);
        }
    }

    console.warn("Binance endpoints failed for klines, falling back to CoinGecko");

    // Fallback: CoinGecko OHLC
    // Map symbol to CG ID
    const asset = assets.find(a => a.symbol === symbol);
    if (!asset || !asset.coingeckoId) {
        return NextResponse.json([]);
    }

    // Map interval to days for CoinGecko
    // Binance intervals: 1m, 3m, 5m, 15m, 30m, 1h, 2h, 4h, ...
    // CoinGecko OHLC: days = 1 (30m), 7 (4h), 14 (4h), 30 (4h), 90 (4d), 180 (4d), 365 (4d), max
    // This is approximate mapping
    let days = "1";
    if (interval.endsWith("h")) days = "7"; // 1h, 4h -> 7 days (4h)
    if (interval.endsWith("d")) days = "30"; // 1d -> 30 days (4h)
    if (interval === "1w") days = "90";
    if (interval === "1M") days = "365";

    try {
        const response = await fetch(
            `${COINGECKO_API_BASE}/coins/${asset.coingeckoId}/ohlc?vs_currency=usd&days=${days}`,
            {
                headers: { "Accept": "application/json" },
                next: { revalidate: 60 }, // Cache longer
            }
        );

        if (!response.ok) throw new Error("CoinGecko klines failed");

        const cgData: number[][] = await response.json();

        // Transform CoinGecko OHLC to Binance Klines format
        // CG: [time, open, high, low, close]
        // Binance: [time, open, high, low, close, volume, closeTime, ...]
        // We will fake volume and other fields as best effort or 0
        const transformedData = cgData.map(item => [
            item[0], // time
            item[1].toString(), // open
            item[2].toString(), // high
            item[3].toString(), // low
            item[4].toString(), // close
            "0", // volume (not available in standard OHLC endpoint)
            item[0] + (24 * 60 * 60 * 1000), // closeTime (approx)
            "0", // quoteAssetVolume
            0, // trades
            "0", // buyBaseAssetVolume
            "0", // buyQuoteAssetVolume
            "0" // ignore
        ]);

        return NextResponse.json(transformedData);

    } catch (error) {
        console.error("CoinGecko klines fallback failed:", error);
        return NextResponse.json([]);
    }
}
