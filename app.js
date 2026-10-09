const socials = [
  { platform: "instagram", handle: "@wealthwithsg", icon: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="17.5" cy="6.5" r="1.2" fill="currentColor"/></svg>` },
  { platform: "telegram", handle: "@WealthWithSG", icon: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21.4 3.6 3.7 10.4c-1.2.5-1.2 1.2-.2 1.5l4.5 1.4 1.7 5.3c.2.6.1.8.7.8.5 0 .7-.2.9-.4l2.2-2.1 4.6 3.4c.9.5 1.5.3 1.7-.8l3-14.1c.3-1.4-.5-2-1.4-1.6Zm-12.7 9.4 9.8-6.2c.5-.3.9-.1.5.2l-8 7.2-.3 3.1-1.2-3.8-3-.9c-.7-.2-.7-.5.2-.8Z" fill="currentColor"/></svg>` },
  { platform: "youtube", handle: "@wealthwithsg", icon: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M23 12s0-3.5-.4-5.1c-.2-1.8-1.4-3.1-3.1-3.3C17.8 3.2 12 3.2 12 3.2s-5.8 0-7.5.4C2.8 3.8 1.6 5.1 1.4 6.9 1 8.5 1 12 1 12s0 3.5.4 5.1c.2 1.8 1.4 3.1 3.1 3.3 1.7.4 7.5.4 7.5.4s5.8 0 7.5-.4c1.7-.2 2.9-1.5 3.1-3.3.4-1.6.4-5.1.4-5.1Z" fill="currentColor"/><path d="m10 8.5 5 3.5-5 3.5v-7Z" fill="var(--bg)"/></svg>` },
  { platform: "whatsapp", handle: "@whatsapp_channel", icon: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5a9.5 9.5 0 0 0-8.2 14.3L2.5 21.5l4.9-1.3A9.5 9.5 0 1 0 12 2.5Zm0 17a7.5 7.5 0 0 1-3.8-1l-.3-.2-2.9.8.8-2.8-.2-.3A7.5 7.5 0 1 1 12 19.5Zm4.1-5.6c-.2-.1-1.2-.6-1.4-.7-.2-.1-.3-.1-.5.1-.1.2-.5.7-.6.8-.1.2-.3.2-.5.1-1.5-.7-2.5-1.3-3.5-2.9-.3-.5.3-.4.8-1.3.1-.2.1-.3 0-.5l-.6-1.4c-.2-.4-.3-.4-.5-.4h-.4c-.2 0-.5.1-.7.3-.2.2-.8.8-.8 1.9s.8 2.2.9 2.3c.1.2 1.5 2.3 3.6 3.2 1.4.6 1.9.7 2.6.6.4-.1 1.2-.5 1.4-1 .2-.5.2-.9.1-1Z" fill="currentColor"/></svg>` }
];


const track = document.getElementById("tickerTrack");
const clock = document.getElementById("clock");
const socialBar = document.getElementById("socialBar");
const NEWS_REFRESH_MS = 5 * 60 * 1000;
let tickerPosition = 0;
let lastFrame = performance.now();
let refreshInFlight = false;
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
  const handles = document.createElement("div");
  handles.className = "social-state social-state--handles";
  socials.forEach((social, index) => {
    handles.appendChild(buildSocialItem(social));
    if (index < socials.length - 1) {
      const separator = document.createElement("span");
      separator.className = "social-separator";
      separator.setAttribute("aria-hidden", "true");
      handles.appendChild(separator);
    }
  });
  const disclaimer = document.createElement("div");
  disclaimer.className = "social-state disclaimer";
  disclaimer.textContent = "For educational purposes only. Not financial or investment advice. Do your own research before investing.";
  socialBar.append(handles, disclaimer);
  let showDisclaimer = false;
  const setState = () => {
    showDisclaimer = !showDisclaimer;
    handles.style.opacity = showDisclaimer ? "0" : "1";
    handles.style.transform = showDisclaimer ? "translateY(4px)" : "translateY(0)";
    disclaimer.style.opacity = showDisclaimer ? "1" : "0";
    disclaimer.style.transform = showDisclaimer ? "translateY(0)" : "translateY(-4px)";
  };
  handles.style.opacity = "1";
  handles.style.transform = "translateY(0)";
  disclaimer.style.opacity = "0";
  disclaimer.style.transform = "translateY(-4px)";
  setTimeout(() => setInterval(setState, 4000), 2500);
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
  impact.textContent = String(event.impact || "NEWS").toUpperCase();
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

function renderNews(events, message) {
  track.innerHTML = "";
  tickerPosition = 0;
  if (!events.length) {
    const status = document.createElement("span");
    status.className = "item news-item news-item--status";
    status.textContent = message || "NO USD EVENTS SCHEDULED FOR TODAY";
    track.appendChild(status);
  } else {
    events.forEach((event, index) => {
      track.appendChild(buildEventItem(event));
      if (index < events.length - 1) {
        const separator = document.createElement("span");
        separator.className = "separator";
        separator.setAttribute("aria-hidden", "true");
        track.appendChild(separator);
      }
    });
  }
  track.insertAdjacentHTML("beforeend", track.innerHTML);
}

async function fetchNews() {
  if (refreshInFlight) return;
  refreshInFlight = true;
  try {
    const response = await fetch("/api/news", { cache: "no-store" });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload?.error || `News feed HTTP ${response.status}`);
    const today = todayInIndia();
    const events = (Array.isArray(payload.events) ? payload.events : [])
      .filter(event => event.currency === "USD" && event.date)
      .filter(event => new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit"
      }).format(new Date(event.date)) === today)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    renderNews(events, "NO USD EVENTS SCHEDULED FOR TODAY");
    track.title = `USD calendar · updated ${new Date(payload.updatedAt || Date.now()).toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata" })} IST`;
    console.info(`USD calendar refreshed: ${events.length} event(s) for ${today}`);
  } catch (error) {
    console.error("USD news unavailable:", error);
    renderNews([], "USD NEWS FEED UNAVAILABLE — RETRYING");
    track.title = "USD calendar refresh failed; retrying automatically";
  } finally {
    refreshInFlight = false;
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
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) fetchNews();
});
