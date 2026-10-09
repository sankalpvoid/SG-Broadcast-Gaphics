const FEED_URL = "https://nfs.faireconomy.media/ff_calendar_thisweek.json";
const ALLOWED_IMPACTS = new Set(["High", "Medium", "Low"]);

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=300");
  res.setHeader("Access-Control-Allow-Origin", "*");

  try {
    const response = await fetch(FEED_URL, {
      headers: { "Accept": "application/json" },
      signal: AbortSignal.timeout(8000)
    });
    if (!response.ok) throw new Error(`Calendar feed HTTP ${response.status}`);

    const raw = await response.json();
    if (!Array.isArray(raw)) throw new Error("Unexpected calendar feed format");

    const now = Date.now();
    const lookbackMs = 3 * 60 * 60 * 1000;
    const horizonMs = 7 * 24 * 60 * 60 * 1000;

    const events = raw
      .filter((event) => {
        const currency = String(event.country || event.currency || "").toUpperCase();
        const impact = String(event.impact || "").trim();
        const timestamp = new Date(event.date).getTime();
        return currency === "USD"
          && ALLOWED_IMPACTS.has(impact)
          && Number.isFinite(timestamp)
          && timestamp >= now - lookbackMs
          && timestamp <= now + horizonMs;
      })
      .map((event) => ({
        currency: "USD",
        title: String(event.title || "Economic release"),
        date: event.date,
        impact: String(event.impact || "Low"),
        actual: event.actual ?? "",
        forecast: event.forecast ?? "",
        previous: event.previous ?? ""
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    res.status(200).json({ source: "Forex Factory weekly calendar export", events, updatedAt: new Date().toISOString() });
  } catch (error) {
    console.error("USD calendar feed error:", error);
    res.status(502).json({ error: "USD economic calendar temporarily unavailable", events: [] });
  }
}
