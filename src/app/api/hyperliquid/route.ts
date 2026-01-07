import { NextRequest, NextResponse } from "next/server";

const HYPERLIQUID_API = "https://api.hyperliquid.xyz/info";

export async function GET() {
    try {
        // Fetch spot metadata and context (prices, stats)
        const response = await fetch(HYPERLIQUID_API, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type: "spotMetaAndAssetCtxs" }),
            next: { revalidate: 5 }
        });

        if (!response.ok) {
            throw new Error(`Hyperliquid API error: ${response.status}`);
        }

        const data = await response.json();
        // data[0] is spotMeta (universe, tokens)
        // data[1] is assetCtxs (state, stats)

        const spotMeta = data[0];
        const assetCtxs = data[1];

        if (!spotMeta || !assetCtxs) {
            throw new Error("Invalid data format from Hyperliquid");
        }

        // Map universe to find tokens
        const universe = spotMeta.universe; // [{name: "HYPE/USDC", tokens: [...]}, ...]

        const tickers = universe.map((u: any, index: number) => {
            const ctx = assetCtxs[index];
            if (!ctx) return null;

            // Name is like "BTC/USDC" or "HYPE/USDC" or "PURR/USDC"
            // We want just "BTC", "HYPE"
            const symbol = u.name.split("/")[0];

            const price = parseFloat(ctx.midPx || ctx.markPx || "0");
            const prevDayPx = parseFloat(ctx.prevDayPx || "0");
            const volume24h = parseFloat(ctx.dayNtlVlm || "0");

            let priceChange24h = 0;
            let priceChangePercent = 0;

            if (prevDayPx > 0) {
                priceChange24h = price - prevDayPx;
                priceChangePercent = ((price - prevDayPx) / prevDayPx) * 100;
            }

            return {
                symbol: symbol, // e.g. "BTC"
                price,
                priceChange24h,
                priceChangePercent,
                volume24h,
                source: "hyperliquid"
            };
        }).filter(Boolean);

        // Also ensure we cover HYPE if it wasn't in universe (it usually is)

        return NextResponse.json(tickers);

    } catch (error) {
        console.error("Failed to fetch Hyperliquid data:", error);
        return NextResponse.json(
            { error: "Failed to fetch Hyperliquid data" },
            { status: 500 }
        );
    }
}
