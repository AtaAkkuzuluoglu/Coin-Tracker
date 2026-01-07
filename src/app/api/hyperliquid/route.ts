import { NextRequest, NextResponse } from "next/server";

const HYPERLIQUID_API = "https://api.hyperliquid.xyz/info";

export async function GET() {
    try {
        // Fetch spot metadata to get HYPE token info
        const metaResponse = await fetch(HYPERLIQUID_API, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ type: "spotMeta" }),
        });

        if (!metaResponse.ok) {
            throw new Error(`Hyperliquid API error: ${metaResponse.status}`);
        }

        const metaData = await metaResponse.json();

        // Find HYPE token index
        const hypeToken = metaData.tokens?.find(
            (t: { name: string }) => t.name === "HYPE"
        );

        if (!hypeToken) {
            // Fallback: try to get from universe
            const universeToken = metaData.universe?.find(
                (u: { tokens: number[]; name: string }) => u.name === "HYPE/USDC"
            );

            if (!universeToken) {
                throw new Error("HYPE token not found in Hyperliquid metadata");
            }
        }

        // Fetch all mid prices for spot
        const priceResponse = await fetch(HYPERLIQUID_API, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ type: "allMids" }),
        });

        if (!priceResponse.ok) {
            throw new Error(`Hyperliquid price API error: ${priceResponse.status}`);
        }

        const priceData = await priceResponse.json();

        // HYPE is typically @107 on mainnet (spot token index)
        // Try different possible keys for HYPE price
        let hypePrice = priceData["@107"] || priceData["HYPE"] || priceData["@150"];

        // If not found in allMids, try spot context
        if (!hypePrice) {
            const ctxResponse = await fetch(HYPERLIQUID_API, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ type: "spotMetaAndAssetCtxs" }),
            });

            if (ctxResponse.ok) {
                const ctxData = await ctxResponse.json();
                // Find HYPE in the asset contexts
                const hypeCtx = ctxData[1]?.find(
                    (ctx: { coin: string }) => ctx.coin === "HYPE/USDC" || ctx.coin === "HYPE"
                );
                if (hypeCtx) {
                    hypePrice = hypeCtx.midPx || hypeCtx.markPx;
                }
            }
        }

        // Get 24h stats using spot clearinghouse
        let volume24h = 0;
        let priceChange24h = 0;
        let priceChangePercent = 0;

        // Try to get volume from spot meta and asset contexts
        const statsResponse = await fetch(HYPERLIQUID_API, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ type: "spotMetaAndAssetCtxs" }),
        });

        if (statsResponse.ok) {
            const statsData = await statsResponse.json();
            // statsData[0] is spotMeta, statsData[1] is assetCtxs
            if (statsData[1]) {
                const hypeStats = statsData[1].find(
                    (s: { coin: string }) => s.coin === "HYPE/USDC" || s.coin?.includes("HYPE")
                );
                if (hypeStats) {
                    hypePrice = hypePrice || hypeStats.midPx || hypeStats.markPx;
                    volume24h = parseFloat(hypeStats.dayNtlVlm || "0");
                    priceChange24h = parseFloat(hypeStats.prevDayPx || "0")
                        ? parseFloat(hypePrice) - parseFloat(hypeStats.prevDayPx)
                        : 0;
                    priceChangePercent = parseFloat(hypeStats.prevDayPx || "0")
                        ? ((parseFloat(hypePrice) - parseFloat(hypeStats.prevDayPx)) / parseFloat(hypeStats.prevDayPx)) * 100
                        : 0;
                }
            }
        }

        return NextResponse.json({
            symbol: "HYPE",
            price: parseFloat(hypePrice) || 0,
            priceChange24h,
            priceChangePercent,
            volume24h,
            source: "hyperliquid",
        });
    } catch (error) {
        console.error("Failed to fetch Hyperliquid data:", error);

        // Return fallback data from CoinGecko as backup
        try {
            const cgResponse = await fetch(
                "https://api.coingecko.com/api/v3/simple/price?ids=hyperliquid&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true"
            );

            if (cgResponse.ok) {
                const cgData = await cgResponse.json();
                const hype = cgData.hyperliquid;

                return NextResponse.json({
                    symbol: "HYPE",
                    price: hype?.usd || 0,
                    priceChange24h: 0,
                    priceChangePercent: hype?.usd_24h_change || 0,
                    volume24h: hype?.usd_24h_vol || 0,
                    source: "coingecko",
                });
            }
        } catch (cgError) {
            console.error("CoinGecko fallback failed:", cgError);
        }

        return NextResponse.json(
            { error: "Failed to fetch Hyperliquid data" },
            { status: 500 }
        );
    }
}
