const BASE_URL = "https://biquote.io/api/latest";
const SYMBOLS = ["EURUSD", "GBPUSD", "USDJPY", "AUDUSD", "USDCAD", "USDCHF"];

function rowsFrom(payload) {
  if (Array.isArray(payload)) return payload.map(row => ({ row }));
  for (const key of ["items", "quotes", "data", "results", "ticks"]) {
    if (Array.isArray(payload?.[key])) return payload[key].map(row => ({ row }));
  }
  // Some aggregate endpoints return an object keyed by instrument symbol.
  if (payload && typeof payload === "object") {
    return Object.entries(payload)
      .filter(([, value]) => value && typeof value === "object" && !Array.isArray(value))
      .map(([symbol, row]) => ({ row, symbolHint: symbol }));
  }
  return [];
}

function normalize(row, symbolHint = "") {
  const symbol = String(row.symbol || row.name || row.currency || symbolHint || "")
    .replace(/[^A-Za-z]/g, "").toUpperCase();
  const bid = Number(row.bid);
  const ask = Number(row.ask);
  const mid = Number(row.mid) > 0 ? Number(row.mid)
    : bid > 0 && ask > 0 ? (bid + ask) / 2
    : Number(row.rate || row.price || row.close);
  return {
    symbol,
    mid,
    bid: Number.isFinite(bid) && bid > 0 ? bid : null,
    ask: Number.isFinite(ask) && ask > 0 ? ask : null,
    dayDiffPercent: row.dayDiffPercent ?? row.changePercent ?? row.changePct ?? null,
    marketState: row.marketState || "open",
    stale: row.stale === true,
    quoteAgeSeconds: row.quoteAgeSeconds,
    timestamp: row.timestamp || row.lastQuoteAt || row.time || null,
    source: row.source || "MT5"
  };
}

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

    let quotes = rowsFrom(payload).map(({ row, symbolHint }) => normalize(row, symbolHint))
      .filter(row => SYMBOLS.includes(row.symbol) && Number.isFinite(row.mid) && row.mid > 0);

    // Defensive fallback for provider response-format changes: fetch each known symbol
    // only when the batched response could not be normalized.
    if (!quotes.length) {
      const individual = await Promise.allSettled(SYMBOLS.map(async symbol => {
        const r = await fetch(`https://biquote.io/api/${symbol}`, {
          headers: { "User-Agent": "SG-Broadcast-Graphics/1.0", "Accept": "application/json" },
          signal: AbortSignal.timeout(6000)
        });
        const data = await r.json();
        if (!r.ok) throw new Error(data?.message || data?.error || `${symbol} HTTP ${r.status}`);
        return normalize(data, symbol);
      }));
      quotes = individual
        .filter(result => result.status === "fulfilled")
        .map(result => result.value)
        .filter(row => SYMBOLS.includes(row.symbol) && Number.isFinite(row.mid) && row.mid > 0);
    }

    res.status(200).json({
      source: "biquote MT5 market-data feed",
      updatedAt: new Date().toISOString(),
      count: quotes.length,
      quotes
    });
  } catch (error) {
    console.error("FX quote fetch failed:", error);
    res.setHeader("Cache-Control", "no-store");
    res.status(502).json({
      error: "FX quotes are temporarily unavailable",
      detail: error.message,
      updatedAt: new Date().toISOString()
    });
  }
}
