import { NextRequest, NextResponse } from "next/server";

const BINANCE_API_BASE = "https://api.binance.com";
const BINANCE_US_API_BASE = "https://api.binance.us";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const symbols = searchParams.get("symbols");

    if (!symbols) {
        return NextResponse.json({ error: "symbols parameter required" }, { status: 400 });
    }

    // Try main Binance API first, then fallback to Binance US
    const endpoints = [
        `${BINANCE_API_BASE}/api/v3/ticker/24hr?symbols=${symbols}`,
        `${BINANCE_US_API_BASE}/api/v3/ticker/24hr?symbols=${symbols}`,
    ];

    for (const endpoint of endpoints) {
        try {
            const response = await fetch(endpoint, {
                headers: {
                    "Accept": "application/json",
                },
                next: { revalidate: 5 }, // Cache for 5 seconds
            });

            if (response.ok) {
                const data = await response.json();
                return NextResponse.json(data);
            }
        } catch (error) {
            console.error(`Failed to fetch from ${endpoint}:`, error);
            // Continue to next endpoint
        }
    }

    // All endpoints failed, return empty array
    console.error("All Binance endpoints failed for tickers");
    return NextResponse.json([]);
}
