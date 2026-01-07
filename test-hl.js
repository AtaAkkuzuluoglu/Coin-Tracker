
async function test() {
    try {
        const response = await fetch("https://api.hyperliquid.xyz/info", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                type: "candleSnapshot",
                req: {
                    coin: "ONDO",
                    interval: "5m",
                    startTime: 0
                }
            })
        });

        if (!response.ok) {
            console.log("Response status:", response.status);
            return;
        }

        const data = await response.json();
        console.log("Is Array:", Array.isArray(data));
        console.log("Length:", data.length);
        if (data.length > 0) {
            console.log("First candle:", data[0]);
            console.log("Types:", {
                t: typeof data[0].t,
                o: typeof data[0].o,
                v: typeof data[0].v
            });
        }
    } catch (e) {
        console.error(e);
    }
}
test();
