import { NextRequest, NextResponse } from "next/server";
import { assets } from "@/lib/assets";

const BINANCE_API_BASE = "https://api.binance.com";
const BINANCE_US_API_BASE = "https://api.binance.us";
const COINGECKO_API_BASE = "https://api.coingecko.com/api/v3";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const symbolsParam = searchParams.get("symbols");

    if (!symbolsParam) {
        return NextResponse.json({ error: "symbols parameter required" }, { status: 400 });
    }

    // Try main Binance API first, then fallback to Binance US
    const binanceEndpoints = [
        `${BINANCE_API_BASE}/api/v3/ticker/24hr?symbols=${symbolsParam}`,
        `${BINANCE_US_API_BASE}/api/v3/ticker/24hr?symbols=${symbolsParam}`,
    ];

    for (const endpoint of binanceEndpoints) {
        try {
            const response = await fetch(endpoint, {
                headers: { "Accept": "application/json" },
                next: { revalidate: 10 },
            });

            if (response.ok) {
                const data = await response.json();
                // Binance US might return different format for error or empty list, check if array
                if (Array.isArray(data) && data.length > 0) {
                    return NextResponse.json(data);
                }
            }
        } catch (error) {
            console.error(`Failed to fetch from ${endpoint}:`, error);
        }
    }

    console.warn("Binance endpoints failed, falling back to CoinGecko");

    // Fallback: CoinGecko
    // 1. Map requested Binance symbols to CoinGecko IDs
    // symbolsParam format: ["BTCUSDT","ETHUSDT"] or string equivalent
    // The format from front-end usually comes as JSON stringified array or comma separated?
    // Looking at binanceApi.ts, it sends JSON.stringify(symbols) as `symbols` query param is actually incorrect for direct API usage, 
    // BUT binanceApi.ts constructs the URL manually with `JSON.stringify`.
    // Wait, the binance API expects `["BTCUSDT","ETHUSDT"]`.

    // Let's parse the symbols param to get the list of symbols
    let symbols: string[] = [];
    try {
        symbols = JSON.parse(symbolsParam);
    } catch {
        // If not JSON, maybe comma separated?
        symbols = symbolsParam.replace(/[\[\]"]/g, '').split(',');
    }

    const geckoIds = symbols.map(sym => {
        const asset = assets.find(a => a.symbol === sym);
        return asset?.coingeckoId;
    }).filter(Boolean);

    if (geckoIds.length === 0) {
        return NextResponse.json([]);
    }

    try {
        const ids = geckoIds.join(",");
        const cgResponse = await fetch(
            `${COINGECKO_API_BASE}/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true`,
            {
                headers: { "Accept": "application/json" },
                next: { revalidate: 30 }, // Cache slightly longer for CG to avoid rate limits
            }
        );

        if (!cgResponse.ok) throw new Error("CoinGecko failed");

        const cgData = await cgResponse.json();

        // Transform to Binance Ticker format
        // Binance format: { symbol: "BTCUSDT", lastPrice: "90000", priceChangePercent: "5.2", quoteVolume: "1000000" }
        const transformedData = symbols.map(sym => {
            const asset = assets.find(a => a.symbol === sym);
            if (!asset || !asset.coingeckoId || !cgData[asset.coingeckoId]) return null;

            const data = cgData[asset.coingeckoId];
            return {
                symbol: sym,
                lastPrice: data.usd.toString(),
                priceChangePercent: data.usd_24h_change.toString(),
                quoteVolume: data.usd_24h_vol.toString(),
                // Mocking other fields that might be used
                priceChange: "0",
                weightedAvgPrice: data.usd.toString(),
                prevClosePrice: "0",
                lastQty: "0",
                bidPrice: data.usd.toString(),
                bidQty: "0",
                askPrice: data.usd.toString(),
                askQty: "0",
                openPrice: "0",
                highPrice: "0",
                lowPrice: "0",
                volume: "0",
                openTime: 0,
                closeTime: Date.now(),
                firstId: 0,
                lastId: 0,
                count: 0
            };
        }).filter(Boolean);

        return NextResponse.json(transformedData);

    } catch (error) {
        console.error("CoinGecko fallback failed:", error);
        return NextResponse.json([]);
    }
}
