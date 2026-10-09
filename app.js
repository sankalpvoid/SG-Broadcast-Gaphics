const socials = [
  { platform: "instagram", handle: "@wealthwithsg", icon: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="17.5" cy="6.5" r="1.2" fill="currentColor"/></svg>` },
  { platform: "telegram", handle: "@WealthWithSG", icon: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21.4 3.6 3.7 10.4c-1.2.5-1.2 1.2-.2 1.5l4.5 1.4 1.7 5.3c.2.6.1.8.7.8.5 0 .7-.2.9-.4l2.2-2.1 4.6 3.4c.9.5 1.5.3 1.7-.8l3-14.1c.3-1.4-.5-2-1.4-1.6Zm-12.7 9.4 9.8-6.2c.5-.3.9-.1.5.2l-8 7.2-.3 3.1-1.2-3.8-3-.9c-.7-.2-.7-.5.2-.8Z" fill="currentColor"/></svg>` },
  { platform: "youtube", handle: "@wealthwithsg", icon: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M23 12s0-3.5-.4-5.1c-.2-1.8-1.4-3.1-3.1-3.3C17.8 3.2 12 3.2 12 3.2s-5.8 0-7.5.4C2.8 3.8 1.6 5.1 1.4 6.9 1 8.5 1 12 1 12s0 3.5.4 5.1c.2 1.8 1.4 3.1 3.1 3.3 1.7.4 7.5.4 7.5.4s5.8 0 7.5-.4c1.7-.2 2.9-1.5 3.1-3.3.4-1.6.4-5.1.4-5.1Z" fill="currentColor"/><path d="m10 8.5 5 3.5-5 3.5v-7Z" fill="var(--bg)"/></svg>` },
  { platform: "whatsapp", handle: "@whatsapp_channel", icon: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5a9.5 9.5 0 0 0-8.2 14.3L2.5 21.5l4.9-1.3A9.5 9.5 0 1 0 12 2.5Zm0 17a7.5 7.5 0 0 1-3.8-1l-.3-.2-2.9.8.8-2.8-.2-.3A7.5 7.5 0 1 1 12 19.5Zm4.1-5.6c-.2-.1-1.2-.6-1.4-.7-.2-.1-.3-.1-.5.1-.1.2-.5.7-.6.8-.1.2-.3.2-.5.1-1.5-.7-2.5-1.3-3.5-2.9-.3-.5.3-.4.8-1.3.1-.2.1-.3 0-.5l-.6-1.4c-.2-.4-.3-.4-.5-.4h-.4c-.2 0-.5.1-.7.3-.2.2-.8.8-.8 1.9s.8 2.2.9 2.3c.1.2 1.5 2.3 3.6 3.2 1.4.6 1.9.7 2.6.6.4-.1 1.2-.5 1.4-1 .2-.5.2-.9.1-1Z" fill="currentColor"/></svg>` }
];


const track = document.getElementById("tickerTrack");
const clock = document.getElementById("clock");
const socialBar = document.getElementById("socialBar");
const NEWS_REFRESH_MS = 60 * 60 * 1000; // ForexFactory export updates hourly and is rate-limited.
const FOREX_REFRESH_MS = 15 * 1000;
const FOREX_PAIRS = [
  { symbol: "EURUSD", label: "Euro / US Dollar", digits: 5 },
  { symbol: "GBPUSD", label: "British Pound / US Dollar", digits: 5 },
  { symbol: "USDJPY", label: "US Dollar / Japanese Yen", digits: 3 },
  { symbol: "AUDUSD", label: "Australian Dollar / US Dollar", digits: 5 },
  { symbol: "USDCAD", label: "US Dollar / Canadian Dollar", digits: 5 },
  { symbol: "USDCHF", label: "US Dollar / Swiss Franc", digits: 5 }
];
let newsEvents = [];
let newsStatus = "LOADING USD ECONOMIC NEWS";
let forexQuotes = new Map();
let tickerPosition = 0;
let lastFrame = performance.now();
let refreshInFlight = false;
let lastFetchAt = 0;
const speed = 52;

function buildSocialItem(social) {
  const item = document.createElement("span");
  item.className = "item social-item";
  const icon = document.createElement("span");
  icon.className = `social-icon social-icon--${social.platform}`;
  icon.innerHTML = social.icon;
  icon.setAttribute("aria-hidden", "true");
  const handle = document.createElement("span");
  handle.textContent = social.handle;
  item.append(icon, handle);
  return item;
}

function buildSocialBar() {
  socialBar.innerHTML = "";
  socialBar.classList.add("social-bar--marquee");

  const handlesState = document.createElement("div");
  handlesState.className = "social-state social-state--handles";
  const marquee = document.createElement("div");
  marquee.className = "social-marquee";

  // Two identical groups create a seamless, continuous loop on phones.
  for (let copy = 0; copy < 2; copy++) {
    const group = document.createElement("div");
    group.className = "social-marquee__group";
    group.setAttribute("aria-hidden", copy === 1 ? "true" : "false");
    socials.forEach((social, index) => {
      group.appendChild(buildSocialItem(social));
      if (index < socials.length - 1) {
        const separator = document.createElement("span");
        separator.className = "social-separator";
        separator.setAttribute("aria-hidden", "true");
      group.appendChild(separator);
      }
    });
    marquee.appendChild(group);
  }
  handlesState.appendChild(marquee);

  const disclaimerState = document.createElement("div");
  disclaimerState.className = "social-state social-state--disclaimer";
  const disclaimerMarquee = document.createElement("div");
  disclaimerMarquee.className = "disclaimer-marquee";
  for (let copy = 0; copy < 2; copy++) {
    const group = document.createElement("div");
    group.className = "disclaimer-marquee__group";
    group.setAttribute("aria-hidden", copy === 1 ? "true" : "false");
    const disclaimer = document.createElement("span");
    disclaimer.className = "disclaimer";
    disclaimer.innerHTML = '<span class="disclaimer-label">DISCLAIMER</span>Trading involves market risk. Make independent decisions. Educational purposes only; not financial advice.';
    group.appendChild(disclaimer);
    disclaimerMarquee.appendChild(group);
  }
  disclaimerState.appendChild(disclaimerMarquee);
  disclaimerState.setAttribute("aria-hidden", "true");
  socialBar.append(handlesState, disclaimerState);

  const mobile = window.matchMedia("(max-width: 767px)");
  let cycleTimer;
  let showingDisclaimer = false;
  let desktopTimer;
  const setState = (showDisclaimer) => {
    showingDisclaimer = showDisclaimer;
    socialBar.classList.toggle("social-bar--show-disclaimer", showDisclaimer);
    handlesState.setAttribute("aria-hidden", String(showDisclaimer));
    disclaimerState.setAttribute("aria-hidden", String(!showDisclaimer));
  };

  function startMobileCycle() {
    clearTimeout(cycleTimer);
    setState(false);
    if (!mobile.matches) return;
    const speedPxPerSecond = 40;
    const group = marquee.querySelector(".social-marquee__group");
    const socialDuration = Math.max(8000, (group?.getBoundingClientRect().width || 600) / speedPxPerSecond * 1000);
    const disclaimerGroup = disclaimerMarquee.querySelector(".disclaimer-marquee__group");
    const disclaimerDuration = Math.max(5000, (disclaimerGroup?.getBoundingClientRect().width || 350) / speedPxPerSecond * 1000);
    const restartMarquee = (element, duration) => {
      element.style.animation = "none";
      element.style.transform = "translateX(0)";
      void element.offsetWidth;
      element.style.animation = `social-marquee-scroll ${duration}ms linear infinite`;
    };
    restartMarquee(marquee, socialDuration);
    cycleTimer = setTimeout(() => {
      setState(true);
      restartMarquee(disclaimerMarquee, disclaimerDuration);
      cycleTimer = setTimeout(startMobileCycle, disclaimerDuration);
    }, socialDuration);
  }

  function startDesktopCycle() {
    clearTimeout(desktopTimer);
    if (mobile.matches) return;
    setState(false);
    desktopTimer = setTimeout(() => {
      setState(true);
      desktopTimer = setTimeout(startDesktopCycle, 6500);
    }, 9000);
  }

  const updateMode = () => {
    clearTimeout(cycleTimer);
    clearTimeout(desktopTimer);
    socialBar.classList.toggle("social-bar--mobile", mobile.matches);
    setState(false);
    if (mobile.matches) startMobileCycle();
    else startDesktopCycle();
  };
  mobile.addEventListener?.("change", updateMode);
  window.addEventListener("resize", updateMode, { passive: true });
  updateMode();
}
function todayInIndia() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit"
  }).format(new Date());
}

function formatEventTime(value) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "TIME TBA";
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", hour12: false
  }).format(date);
}

function impactClass(impact) {
  const value = String(impact || "").toLowerCase();
  if (value.includes("high")) return "impact--high";
  if (value.includes("medium")) return "impact--medium";
  if (value.includes("low")) return "impact--low";
  return "impact--other";
}

function buildEventItem(event) {
  const item = document.createElement("span");
  item.className = "item news-item";
  const time = document.createElement("span");
  time.className = "news-time";
  time.textContent = formatEventTime(event.date);
  const impact = document.createElement("span");
  impact.className = `news-impact ${impactClass(event.impact)}`;
  impact.setAttribute("role", "img");
  impact.setAttribute("aria-label", `${String(event.impact || "Other").toLowerCase()} impact`);
  impact.title = `${String(event.impact || "Other").toLowerCase()} impact`;
  const title = document.createElement("span");
  title.className = "news-title";
  title.textContent = event.title || "USD economic event";
  item.append(time, impact, title);

  const values = [];
  if (event.actual) values.push(`ACTUAL ${event.actual}`);
  if (event.forecast) values.push(`FCST ${event.forecast}`);
  if (event.previous) values.push(`PREV ${event.previous}`);
  if (values.length) {
    const details = document.createElement("span");
    details.className = "news-details";
    details.textContent = values.join("  ·  ");
    item.appendChild(details);
  }
  return item;
}

function buildForexItem(pair) {
  const item = document.createElement("span");
  item.className = "item forex-item";
  item.dataset.forexSymbol = pair.symbol;
  const label = document.createElement("span");
  label.className = "forex-label";
  label.textContent = pair.label;
  const price = document.createElement("span");
  price.className = "forex-price";
  price.textContent = "--";
  const change = document.createElement("span");
  change.className = "forex-change forex-change--flat";
  change.textContent = "—";
  const state = document.createElement("span");
  state.className = "forex-state";
  state.textContent = "LIVE";
  item.append(label, price, change, state);
  const quote = forexQuotes.get(pair.symbol);
  if (quote) updateForexItem(item, pair, quote);
  return item;
}

function updateForexItem(item, pair, quote) {
  const price = item.querySelector(".forex-price");
  const change = item.querySelector(".forex-change");
  const state = item.querySelector(".forex-state");
  const rawPrice = Number(quote.mid ?? quote.bid ?? quote.ask);
  price.textContent = Number.isFinite(rawPrice) && rawPrice > 0 ? rawPrice.toFixed(pair.digits) : "--";

  const closed = String(quote.marketState || "").toLowerCase() === "closed";
  const stale = quote.stale === true || Number(quote.quoteAgeSeconds) > 300;
  const percent = Number(quote.dayDiffPercent);
  const movementKnown = !closed && !stale && quote.dayDiffPercent != null && quote.dayDiffPercent !== "" && Number.isFinite(percent);
  item.classList.remove("forex-item--up", "forex-item--down", "forex-item--flat");
  change.classList.remove("forex-change--up", "forex-change--down", "forex-change--flat");
  const direction = movementKnown && percent > 0 ? "up" : movementKnown && percent < 0 ? "down" : "flat";
  item.classList.add(`forex-item--${direction}`);
  change.classList.add(`forex-change--${direction}`);
  change.textContent = movementKnown ? `${percent > 0 ? "+" : ""}${percent.toFixed(2)}%` : "—";
  state.classList.toggle("forex-state--stale", stale);
  state.textContent = closed ? "CLOSED" : stale ? "STALE" : "LIVE";
  item.title = `${pair.label} · ${closed ? "market closed — last quote" : stale ? "quote may be delayed" : "live quote"}${quote.timestamp ? " · " + quote.timestamp : ""}`;
}

function updateForexPrices() {
  for (const pair of FOREX_PAIRS) {
    const quote = forexQuotes.get(pair.symbol);
    if (!quote) continue;
    track.querySelectorAll(`[data-forex-symbol="${pair.symbol}"]`).forEach(item => updateForexItem(item, pair, quote));
  }
}

function renderTicker() {
  track.innerHTML = "";
  tickerPosition = 0;
  const appendSeparator = () => {
    const separator = document.createElement("span");
    separator.className = "separator";
    separator.setAttribute("aria-hidden", "true");
    track.appendChild(separator);
  };
  if (!newsEvents.length) {
    const status = document.createElement("span");
    status.className = "item news-item news-item--status";
    status.textContent = newsStatus;
    track.appendChild(status);
  } else {
    newsEvents.forEach((event, index) => {
      if (index) appendSeparator();
      track.appendChild(buildEventItem(event));
    });
  }
  appendSeparator();
  const fxHeading = document.createElement("span");
  fxHeading.className = "item forex-heading";
  fxHeading.textContent = "FX SPOT";
  track.appendChild(fxHeading);
  FOREX_PAIRS.forEach(pair => {
    appendSeparator();
    track.appendChild(buildForexItem(pair));
  });

  // Distinct section break at the loop boundary: FX quotes → USD news.
  const sectionDivider = document.createElement("span");
  sectionDivider.className = "section-divider";
  sectionDivider.setAttribute("aria-hidden", "true");
  track.appendChild(sectionDivider);

  track.insertAdjacentHTML("beforeend", track.innerHTML);
}

function renderNews(events, message) {
  newsEvents = events;
  newsStatus = message || "NO USD EVENTS SCHEDULED";
  renderTicker();
}

async function fetchNews(force = false) {
  if (refreshInFlight) return;
  if (!force && lastFetchAt && Date.now() - lastFetchAt < NEWS_REFRESH_MS) return;
  refreshInFlight = true;
  lastFetchAt = Date.now();
  try {
    const response = await fetch("/api/news", { cache: "no-store" });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload?.error || `News feed HTTP ${response.status}`);
    const today = todayInIndia();
    const events = (Array.isArray(payload.events) ? payload.events : [])
      .filter(event => event.currency === "USD" && event.date)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    renderNews(events, "NO USD EVENTS SCHEDULED FOR TODAY OR TOMORROW");
    track.title = `USD calendar · ${payload.todayCount ?? events.length} event(s) today; showing ${events.length} across today/next day when needed · updated ${new Date(payload.updatedAt || Date.now()).toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata" })} IST`;
    console.info(`USD calendar refreshed: ${events.length} event(s) selected for ${today}`);
  } catch (error) {
    console.error("USD news unavailable:", error);
    renderNews([], "USD NEWS FEED UNAVAILABLE — RETRYING");
    track.title = "USD calendar refresh failed; retrying automatically";
  } finally {
    refreshInFlight = false;
  }
}


async function fetchForex() {
  try {
    const response = await fetch("/api/forex", { cache: "no-store" });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload?.error || `FX feed HTTP ${response.status}`);
    const quotes = Array.isArray(payload.quotes) ? payload.quotes : [];
    for (const quote of quotes) {
      const symbol = String(quote.symbol || "").toUpperCase();
      if (FOREX_PAIRS.some(pair => pair.symbol === symbol)) forexQuotes.set(symbol, quote);
    }
    updateForexPrices();
    if (!track.querySelector(".forex-item")) renderTicker();
    const updated = payload.updatedAt ? new Date(payload.updatedAt).toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata" }) : "recently";
    track.title = `USD economic news + major FX pairs · FX quotes refreshed ${updated} IST · source: biquote MT5 feed`;
  } catch (error) {
    console.error("FX prices unavailable:", error);
    track.querySelectorAll(".forex-state").forEach(state => {
      state.textContent = "UNAVAILABLE";
      state.classList.add("forex-state--stale");
    });
  }
}

function updateClock() {
  clock.textContent = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", hour12: false
  }).format(new Date()) + " IST";
}

function animate(now) {
  const delta = Math.min(now - lastFrame, 50);
  lastFrame = now;
  tickerPosition -= speed * delta / 1000;
  const resetPoint = track.scrollWidth / 2;
  if (resetPoint > 0 && -tickerPosition >= resetPoint) tickerPosition += resetPoint;
  track.style.transform = `translate3d(${tickerPosition}px,0,0)`;
  requestAnimationFrame(animate);
}

buildSocialBar();
updateClock();
setInterval(updateClock, 1000);
requestAnimationFrame(animate);
fetchNews();
setInterval(fetchNews, NEWS_REFRESH_MS);
fetchForex();
setInterval(fetchForex, FOREX_REFRESH_MS);
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) { fetchNews(false); fetchForex(); }
});
