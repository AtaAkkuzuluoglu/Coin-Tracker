import { NextRequest, NextResponse } from "next/server";

const BINANCE_API_BASE = "https://api.binance.com";
const BINANCE_US_API_BASE = "https://api.binance.us";

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
            const url = new URL(`${base}/api/v3/klines`);
            url.searchParams.set("symbol", symbol);
            url.searchParams.set("interval", interval);
            if (limit) url.searchParams.set("limit", limit);

            const response = await fetch(url.toString(), {
                headers: {
                    "Accept": "application/json",
                },
                next: { revalidate: 10 }, // Cache for 10 seconds
            });

            if (response.ok) {
                const data = await response.json();
                return NextResponse.json(data);
            }
        } catch (error) {
            console.error(`Failed to fetch klines from ${base}:`, error);
            // Continue to next endpoint
        }
    }

    // All endpoints failed
    console.error("All Binance endpoints failed for klines");
    return NextResponse.json([]);
}
