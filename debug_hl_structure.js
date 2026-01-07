const HYPERLIQUID_API = "https://api.hyperliquid.xyz/info";

async function fetchHL(type) {
    console.log(`Fetching ${type}...`);
    try {
        const response = await fetch(HYPERLIQUID_API, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type }),
        });

        if (!response.ok) {
            console.error(`${type} failed: ${response.status}`);
            return;
        }

        const data = await response.json();
        console.log(`${type} success. Data type: ${Array.isArray(data) ? "Array" : typeof data}`);
        if (Array.isArray(data)) {
            console.log(`${type} length: ${data.length}`);
            if (data.length > 0) {
                console.log(`${type}[0] keys:`, Object.keys(data[0]));
            }
            if (data.length > 1) {
                console.log(`${type}[1] keys:`, Object.keys(data[1] || {}));
            }
        }
    } catch (e) {
        console.error(`${type} error:`, e.message);
    }
}

async function main() {
    await fetchHL("metaAndAssetCtxs");
    await fetchHL("spotMetaAndAssetCtxs");
}

main();
