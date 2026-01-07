import { NextRequest, NextResponse } from "next/server";

export interface NewsItem {
    id: string;
    title: string;
    url: string;
    source: string;
    publishedAt: string;
    content: string;
    description: string;
    imageUrl?: string;
    currencies?: { code: string; title: string }[];
    sentiment?: "positive" | "negative" | "neutral";
}

// RSS Feed URLs for crypto news
const RSS_FEEDS = [
    {
        url: "https://cointelegraph.com/rss",
        source: "Cointelegraph",
    },
    {
        url: "https://decrypt.co/feed",
        source: "Decrypt",
    },
];

// Generate a unique ID from URL and timestamp
function generateUniqueId(url: string, pubDate: string, index: number): string {
    const urlHash = url.split("/").pop() || url.substring(url.length - 20);
    const dateHash = new Date(pubDate).getTime().toString(36);
    return `${urlHash}-${dateHash}-${index}`;
}

// Function to parse RSS XML
function parseRSSItem(item: string, source: string, index: number): NewsItem | null {
    try {
        const getTagContent = (tag: string): string => {
            const regex = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>|<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i");
            const match = item.match(regex);
            return (match?.[1] || match?.[2] || "").trim();
        };

        const title = getTagContent("title");
        const link = getTagContent("link");
        const pubDate = getTagContent("pubDate");
        const description = getTagContent("description");
        const content = getTagContent("content:encoded") || getTagContent("content") || description;

        // Extract image from content or media:content
        let imageUrl = "";
        const imgMatch = item.match(/<media:content[^>]*url="([^"]+)"/i) ||
            item.match(/<enclosure[^>]*url="([^"]+)"/i) ||
            item.match(/<img[^>]*src="([^"]+)"/i) ||
            content.match(/<img[^>]*src="([^"]+)"/i);
        if (imgMatch) {
            imageUrl = imgMatch[1];
        }

        if (!title || !link) return null;

        // Detect mentioned cryptocurrencies
        const cryptoPatterns = [
            { pattern: /\bBitcoin\b|\bBTC\b/i, code: "BTC", title: "Bitcoin" },
            { pattern: /\bEthereum\b|\bETH\b/i, code: "ETH", title: "Ethereum" },
            { pattern: /\bSolana\b|\bSOL\b/i, code: "SOL", title: "Solana" },
            { pattern: /\bXRP\b|\bRipple\b/i, code: "XRP", title: "XRP" },
            { pattern: /\bAvalanche\b|\bAVAX\b/i, code: "AVAX", title: "Avalanche" },
            { pattern: /\bUniswap\b|\bUNI\b/i, code: "UNI", title: "Uniswap" },
            { pattern: /\bAave\b|\bAAVE\b/i, code: "AAVE", title: "Aave" },
            { pattern: /\bHyperliquid\b|\bHYPE\b/i, code: "HYPE", title: "Hyperliquid" },
        ];

        const currencies: { code: string; title: string }[] = [];
        const fullText = title + " " + description;
        for (const { pattern, code, title: currencyTitle } of cryptoPatterns) {
            if (pattern.test(fullText)) {
                currencies.push({ code, title: currencyTitle });
            }
        }

        // Simple sentiment analysis
        const positiveWords = ["surge", "soar", "rally", "gain", "rise", "bullish", "high", "record", "launch", "adoption", "growth", "milestone"];
        const negativeWords = ["crash", "fall", "drop", "plunge", "bearish", "low", "hack", "scam", "fraud", "ban", "lawsuit", "warning"];

        const lowerText = fullText.toLowerCase();
        const positiveScore = positiveWords.filter(w => lowerText.includes(w)).length;
        const negativeScore = negativeWords.filter(w => lowerText.includes(w)).length;

        let sentiment: "positive" | "negative" | "neutral" = "neutral";
        if (positiveScore > negativeScore) sentiment = "positive";
        else if (negativeScore > positiveScore) sentiment = "negative";

        // Clean HTML from description
        const cleanDescription = description
            .replace(/<[^>]*>/g, "")
            .replace(/&nbsp;/g, " ")
            .replace(/&amp;/g, "&")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&quot;/g, '"')
            .substring(0, 300);

        // Clean HTML from content for display
        const cleanContent = content
            .replace(/<script[\s\S]*?<\/script>/gi, "")
            .replace(/<style[\s\S]*?<\/style>/gi, "")
            .replace(/<[^>]*>/g, "")
            .replace(/&nbsp;/g, " ")
            .replace(/&amp;/g, "&")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&quot;/g, '"')
            .replace(/\s+/g, " ")
            .trim()
            .substring(0, 1000);

        return {
            id: generateUniqueId(link, pubDate, index),
            title,
            url: link,
            source,
            publishedAt: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
            description: cleanDescription,
            content: cleanContent,
            imageUrl,
            currencies,
            sentiment,
        };
    } catch (error) {
        console.error("Error parsing RSS item:", error);
        return null;
    }
}

async function fetchRSSFeed(feedUrl: string, source: string): Promise<NewsItem[]> {
    try {
        const response = await fetch(feedUrl, {
            headers: {
                "User-Agent": "Mozilla/5.0 (compatible; CoinTracker/1.0)",
                "Accept": "application/rss+xml, application/xml, text/xml",
            },
            next: { revalidate: 300 }, // Cache for 5 minutes
        });

        if (!response.ok) {
            console.error(`Failed to fetch RSS from ${source}: ${response.status}`);
            return [];
        }

        const xml = await response.text();

        // Extract all <item> elements
        const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
        const items: NewsItem[] = [];
        let match;
        let index = 0;

        while ((match = itemRegex.exec(xml)) !== null && items.length < 10) {
            const parsed = parseRSSItem(match[1], source, index);
            if (parsed) {
                items.push(parsed);
                index++;
            }
        }

        return items;
    } catch (error) {
        console.error(`Error fetching RSS from ${source}:`, error);
        return [];
    }
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter") || "";

    try {
        // Fetch from multiple RSS feeds in parallel
        const feedPromises = RSS_FEEDS.map((feed) =>
            fetchRSSFeed(feed.url, feed.source)
        );

        const results = await Promise.all(feedPromises);
        let allNews = results.flat();

        // Ensure unique IDs by adding source prefix
        allNews = allNews.map((item, index) => ({
            ...item,
            id: `${item.source.toLowerCase().replace(/\s/g, "-")}-${index}-${item.id}`,
        }));

        // Sort by published date (newest first)
        allNews.sort(
            (a, b) =>
                new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
        );

        // Filter by currency if specified
        if (filter) {
            allNews = allNews.filter(
                (news) =>
                    news.currencies?.some(
                        (c) => c.code.toLowerCase() === filter.toLowerCase()
                    ) || news.title.toLowerCase().includes(filter.toLowerCase())
            );
        }

        // Limit to 15 articles
        allNews = allNews.slice(0, 15);

        return NextResponse.json({
            news: allNews,
            count: allNews.length,
        });
    } catch (error) {
        console.error("Failed to fetch news:", error);
        return NextResponse.json({ news: [], count: 0, error: "Failed to fetch news" });
    }
}
