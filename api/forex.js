const BASE_URL = "https://biquote.io/api/latest";
const SYMBOLS = ["EURUSD", "GBPUSD", "USDJPY", "AUDUSD", "USDCAD", "USDCHF"];

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "s-maxage=10, stale-while-revalidate=5");
  res.setHeader("Access-Control-Allow-Origin", "*");
  try {
    const url = new URL(BASE_URL);
    for (const symbol of SYMBOLS) url.searchParams.append("symbols", symbol);
    const response = await fetch(url.toString(), {
      headers: { "User-Agent": "SG-Broadcast-Graphics/1.0", "Accept": "application/json" },
      signal: AbortSignal.timeout(8000)
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload?.message || payload?.error || `FX provider returned HTTP ${response.status}`);

    const rows = Array.isArray(payload) ? payload
      : Array.isArray(payload.items) ? payload.items
      : Array.isArray(payload.quotes) ? payload.quotes
      : Array.isArray(payload.data) ? payload.data
      : [];
    const quotes = rows.map(row => {
      const bid = Number(row.bid);
      const ask = Number(row.ask);
      const mid = Number(row.mid) > 0 ? Number(row.mid)
        : bid > 0 && ask > 0 ? (bid + ask) / 2
        : Number(row.bid || row.ask || row.rate);
      return {
        symbol: String(row.symbol || row.name || row.currency || "").replace("/", "").toUpperCase(),
        mid,
        bid: row.bid,
        ask: row.ask,
        dayDiffPercent: row.dayDiffPercent,
        marketState: row.marketState || "open",
        stale: row.stale === true,
        quoteAgeSeconds: row.quoteAgeSeconds,
        timestamp: row.timestamp || row.lastQuoteAt || null,
        source: row.source || "MT5"
      };
    }).filter(row => SYMBOLS.includes(row.symbol) && Number.isFinite(row.mid) && row.mid > 0);

    res.status(200).json({ source: "biquote MT5 market-data feed", updatedAt: new Date().toISOString(), count: quotes.length, quotes });
  } catch (error) {
    console.error("FX quote fetch failed:", error);
    res.setHeader("Cache-Control", "no-store");
    res.status(502).json({ error: "FX quotes are temporarily unavailable", detail: error.message, updatedAt: new Date().toISOString() });
  }
}
