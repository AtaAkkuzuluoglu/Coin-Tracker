import { NextRequest, NextResponse } from "next/server";

const BINANCE_API_BASE = "https://api.binance.com";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const symbols = searchParams.get("symbols");

    if (!symbols) {
        return NextResponse.json({ error: "symbols parameter required" }, { status: 400 });
    }

    try {
        const response = await fetch(
            `${BINANCE_API_BASE}/api/v3/ticker/24hr?symbols=${symbols}`,
            {
                headers: {
                    "Accept": "application/json",
                },
                next: { revalidate: 5 }, // Cache for 5 seconds
            }
        );

        if (!response.ok) {
            throw new Error(`Binance API error: ${response.status}`);
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Failed to fetch tickers:", error);
        return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
    }
}
