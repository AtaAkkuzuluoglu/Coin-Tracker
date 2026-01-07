import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const coinId = searchParams.get("coinId");
    const days = searchParams.get("days") || "30";

    if (!coinId) {
        return NextResponse.json(
            { error: "coinId parameter required" },
            { status: 400 }
        );
    }

    try {
        const response = await fetch(
            `https://api.coingecko.com/api/v3/coins/${coinId}/ohlc?vs_currency=usd&days=${days}`,
            {
                headers: {
                    "Accept": "application/json",
                },
                next: { revalidate: 60 }, // Cache for 60 seconds (CoinGecko rate limits)
            }
        );

        if (!response.ok) {
            // If CoinGecko fails, return empty array instead of error
            console.error(`CoinGecko API error: ${response.status} for ${coinId}`);
            return NextResponse.json([]);
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Failed to fetch CoinGecko OHLC:", error);
        return NextResponse.json([]);
    }
}
