import { NextResponse } from "next/server";

const HYPERLIQUID_API = "https://api.hyperliquid.xyz/info";

export const dynamic = 'force-dynamic';

interface Ticker {
    symbol: string;
    price: number;
    priceChange24h: number;
    priceChangePercent: number;
    volume24h: number;
    source: string;
}

export async function GET() {
    try {
        // Fetch BOTH Perps and Spot metadata in parallel to cover all assets
        // Perps: BTC, ETH, SOL, etc.
        // Spot: HYPE, PURR, etc.
        const [perpRes, spotRes] = await Promise.all([
            fetch(HYPERLIQUID_API, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type: "metaAndAssetCtxs" }),
                next: { revalidate: 5 }
            }),
            fetch(HYPERLIQUID_API, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type: "spotMetaAndAssetCtxs" }),
                next: { revalidate: 5 }
            })
        ]);

        const tickers: Ticker[] = [];

        // --- Process Perps Data ---
        if (perpRes.ok) {
            const perpData = await perpRes.json();
            // perpData[0] is Object { universe: [...] }
            // perpData[1] is assetCtxs (array of context objects)
            const universe = perpData[0].universe;
            const assetCtxs = perpData[1];

            if (universe && assetCtxs) {
                universe.forEach((u: { name: string }, index: number) => {
                    const ctx = assetCtxs[index];
                    if (!ctx) return;

                    const price = parseFloat(ctx.midPx || ctx.markPx || "0");
                    const prevDayPx = parseFloat(ctx.prevDayPx || "0");
                    const volume24h = parseFloat(ctx.dayNtlVlm || "0");

                    let priceChange24h = 0;
                    let priceChangePercent = 0;

                    if (prevDayPx > 0) {
                        priceChange24h = price - prevDayPx;
                        priceChangePercent = ((price - prevDayPx) / prevDayPx) * 100;
                    }

                    tickers.push({
                        symbol: u.name, // "BTC", "ETH"
                        price,
                        priceChange24h,
                        priceChangePercent,
                        volume24h,
                        source: "hyperliquid-perp"
                    });
                });
            }
        }

        // --- Process Spot Data ---
        if (spotRes.ok) {
            const spotData = await spotRes.json();
            // spotData[0] is spotMeta containing universe
            // spotData[1] is spotAssetCtxs
            const spotMeta = spotData[0];
            const assetCtxs = spotData[1];

            if (spotMeta && spotMeta.universe && assetCtxs) {
                spotMeta.universe.forEach((u: { name: string }, index: number) => {
                    const ctx = assetCtxs[index];
                    if (!ctx) return;

                    // Spot names are like "HYPE/USDC". We want "HYPE".
                    // Filter out internal IDs starting with @ unless requested
                    if (u.name.startsWith("@")) return;

                    const symbol = u.name.split("/")[0];

                    // Avoid duplicates if asset exists in Perps (Perps usually have more liquidity/relevance for price)
                    if (tickers.find(t => t.symbol === symbol)) return;

                    const price = parseFloat(ctx.midPx || ctx.markPx || "0");
                    const prevDayPx = parseFloat(ctx.prevDayPx || "0");
                    const volume24h = parseFloat(ctx.dayNtlVlm || "0");

                    let priceChange24h = 0;
                    let priceChangePercent = 0;

                    if (prevDayPx > 0) {
                        priceChange24h = price - prevDayPx;
                        priceChangePercent = ((price - prevDayPx) / prevDayPx) * 100;
                    }

                    tickers.push({
                        symbol: symbol,
                        price,
                        priceChange24h,
                        priceChangePercent,
                        volume24h,
                        source: "hyperliquid-spot"
                    });
                });
            }
        }

        return NextResponse.json(tickers);

    } catch (error) {
        console.error("Failed to fetch Hyperliquid data:", error);
        return NextResponse.json(
            { error: "Failed to fetch Hyperliquid data" },
            { status: 500 }
        );
    }
}
