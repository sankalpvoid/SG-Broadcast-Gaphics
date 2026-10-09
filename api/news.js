const FEED_URL = "https://nfs.faireconomy.media/ff_calendar_thisweek.json";
const TIME_ZONE = "Asia/Kolkata";

function dayKeyInIndia(value) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return null;
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map(part => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=3600");
  res.setHeader("Access-Control-Allow-Origin", "*");

  try {
    const response = await fetch(FEED_URL, {
      headers: { "User-Agent": "SG-Broadcast-Graphics/1.0" }
    });
    if (!response.ok) throw new Error(`ForexFactory feed returned HTTP ${response.status}`);

    const events = await response.json();
    if (!Array.isArray(events)) throw new Error("Unexpected calendar feed format");

    const today = dayKeyInIndia(new Date());
    const usdEvents = events
      .filter(event => String(event.currency || event.country || "").toUpperCase() === "USD")
      .filter(event => event.date && dayKeyInIndia(event.date) === today)
      .map(event => ({
        date: event.date,
        title: event.title || event.event || "USD economic event",
        currency: "USD",
        impact: event.impact || "Unspecified",
        actual: event.actual ?? "",
        forecast: event.forecast ?? "",
        previous: event.previous ?? ""
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    res.status(200).json({
      source: "ForexFactory weekly calendar export",
      timeZone: TIME_ZONE,
      day: today,
      count: usdEvents.length,
      events: usdEvents,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("USD calendar fetch failed:", error);
    res.setHeader("Cache-Control", "no-store");
    res.status(502).json({
      error: "USD news feed is temporarily unavailable",
      detail: error.message,
      updatedAt: new Date().toISOString()
    });
  }
}
