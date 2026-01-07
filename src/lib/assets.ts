export interface Asset {
    id: string;
    name: string;
    ticker: string;
    symbol: string; // Binance trading pair symbol (empty for non-Binance assets)
    logo: string; // URL to logo image
    color: string;
    source: "binance" | "hyperliquid"; // Data source for this asset
    coingeckoId: string; // CoinGecko ID for logo
}

// Logo CDN base URL (CoinGecko powered, free)
const LOGO_CDN = "https://cdn.jsdelivr.net/gh/simplr-sh/coin-logos/images";

export const assets: Asset[] = [
    {
        id: "btc",
        name: "Bitcoin",
        ticker: "BTC",
        symbol: "BTCUSDT",
        logo: `${LOGO_CDN}/bitcoin/large.png`,
        color: "#F7931A",
        source: "binance",
        coingeckoId: "bitcoin",
    },
    {
        id: "eth",
        name: "Ethereum",
        ticker: "ETH",
        symbol: "ETHUSDT",
        logo: `${LOGO_CDN}/ethereum/large.png`,
        color: "#627EEA",
        source: "binance",
        coingeckoId: "ethereum",
    },
    {
        id: "sol",
        name: "Solana",
        ticker: "SOL",
        symbol: "SOLUSDT",
        logo: `${LOGO_CDN}/solana/large.png`,
        color: "#00FFA3",
        source: "binance",
        coingeckoId: "solana",
    },
    {
        id: "avax",
        name: "Avalanche",
        ticker: "AVAX",
        symbol: "AVAXUSDT",
        logo: `${LOGO_CDN}/avalanche-2/large.png`,
        color: "#E84142",
        source: "binance",
        coingeckoId: "avalanche-2",
    },
    {
        id: "aave",
        name: "Aave",
        ticker: "AAVE",
        symbol: "AAVEUSDT",
        logo: `${LOGO_CDN}/aave/large.png`,
        color: "#B6509E",
        source: "binance",
        coingeckoId: "aave",
    },
    {
        id: "ondo",
        name: "Ondo",
        ticker: "ONDO",
        symbol: "ONDOUSDT",
        logo: `${LOGO_CDN}/ondo-finance/large.png`,
        color: "#1652F0",
        source: "binance",
        coingeckoId: "ondo-finance",
    },
    {
        id: "tao",
        name: "Bittensor",
        ticker: "TAO",
        symbol: "TAOUSDT",
        logo: `${LOGO_CDN}/bittensor/large.png`,
        color: "#252525",
        source: "binance",
        coingeckoId: "bittensor",
    },
    {
        id: "xrp",
        name: "XRP",
        ticker: "XRP",
        symbol: "XRPUSDT",
        logo: `${LOGO_CDN}/ripple/large.png`,
        color: "#23292F",
        source: "binance",
        coingeckoId: "ripple",
    },
    {
        id: "uni",
        name: "Uniswap",
        ticker: "UNI",
        symbol: "UNIUSDT",
        logo: `${LOGO_CDN}/uniswap/large.png`,
        color: "#FF007A",
        source: "binance",
        coingeckoId: "uniswap",
    },
    {
        id: "hype",
        name: "Hyperliquid",
        ticker: "HYPE",
        symbol: "HYPE", // Hyperliquid native token
        logo: `${LOGO_CDN}/hyperliquid/large.png`,
        color: "#00FF88",
        source: "hyperliquid",
        coingeckoId: "hyperliquid",
    },
];

export const getAssetById = (id: string): Asset | undefined => {
    return assets.find((asset) => asset.id === id);
};

export const getBinanceAssets = (): Asset[] => {
    return assets.filter((asset) => asset.source === "binance");
};

export const getHyperliquidAssets = (): Asset[] => {
    return assets.filter((asset) => asset.source === "hyperliquid");
};
