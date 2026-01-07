import { NextRequest, NextResponse } from "next/server";

const BINANCE_API_BASE = "https://api.binance.com";

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

    try {
        const url = new URL(`${BINANCE_API_BASE}/api/v3/klines`);
        url.searchParams.set("symbol", symbol);
        url.searchParams.set("interval", interval);
        if (limit) url.searchParams.set("limit", limit);

        const response = await fetch(url.toString(), {
            headers: {
                "Accept": "application/json",
            },
            next: { revalidate: 10 }, // Cache for 10 seconds
        });

        if (!response.ok) {
            throw new Error(`Binance API error: ${response.status}`);
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Failed to fetch klines:", error);
        return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
    }
}
