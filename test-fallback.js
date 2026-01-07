
async function test() {
    console.log("--- Testing Hyperliquid (AAVE) ---");
    try {
        const hlRes = await fetch("https://api.hyperliquid.xyz/info", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            },
            body: JSON.stringify({
                type: "candleSnapshot",
                req: { coin: "AAVE", interval: "5m", startTime: 0 }
            })
        });
        if (hlRes.ok) {
            const hlData = await hlRes.json();
            console.log("HL Response Length:", Array.isArray(hlData) ? hlData.length : "Not Array");
            // console.log("HL Sample:", hlData[0]);
        } else {
            console.log("HL Failed:", hlRes.status);
        }
    } catch (e) { console.log("HL Error:", e.message); }

    console.log("\n--- Testing Coinbase (AAVE-USD) ---");
    try {
        const cbRes = await fetch("https://api.exchange.coinbase.com/products/AAVE-USD/candles?granularity=300", {
            headers: { "User-Agent": "CoinTracker/1.0" }
        });
        if (cbRes.ok) {
            const cbData = await cbRes.json();
            console.log("CB Response Length:", Array.isArray(cbData) ? cbData.length : "Not Array");
            if (Array.isArray(cbData) && cbData.length > 0) console.log("CB Sample:", cbData[0]);
        } else {
            console.log("CB Failed:", cbRes.status, await cbRes.text());
        }
    } catch (e) { console.log("CB Error:", e.message); }
}
test();
