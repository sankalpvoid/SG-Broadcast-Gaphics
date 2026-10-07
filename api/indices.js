export default async function handler(req, res) {
  const symbols = {
    nifty: "^NSEI",
    sensex: "^BSESN",
    banknifty: "^NSEBANK",
    finnifty: "^CNXFINANCE"
  };

  const results = await Promise.all(Object.entries(symbols).map(async ([key, symbol]) => {
    try {
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=1d&interval=1m`;
      const response = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
      if (!response.ok) throw new Error(`Yahoo HTTP ${response.status}`);
      const json = await response.json();
      const meta = json?.chart?.result?.[0]?.meta;
      const price = meta?.regularMarketPrice;
      const previousClose = meta?.previousClose ?? meta?.chartPreviousClose;
      if (!Number.isFinite(price) || !Number.isFinite(previousClose)) throw new Error("Missing price data");
      const change = price - previousClose;
      return [key, {
        name: key === "banknifty" ? "BANKNIFTY" : key === "finnifty" ? "FINNIFTY" : key.toUpperCase(),
        price,
        change,
        percent: (change / previousClose) * 100,
        timestamp: meta?.regularMarketTime ? meta.regularMarketTime * 1000 : Date.now()
      }];
    } catch (error) {
      return [key, { error: error.message }];
    }
  }));

  const data = Object.fromEntries(results);
  const hasData = Object.values(data).some(item => !item.error);
  res.setHeader("Cache-Control", "s-maxage=15, stale-while-revalidate=30");
  res.status(hasData ? 200 : 502).json({ data, updatedAt: Date.now() });
}