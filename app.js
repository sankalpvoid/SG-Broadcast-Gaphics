const socials = [
  { platform: "instagram", handle: "@wealthwithsg", icon: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="17.5" cy="6.5" r="1.2" fill="currentColor"/></svg>` },
  { platform: "telegram", handle: "@WealthWithSG", icon: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21.4 3.6 3.7 10.4c-1.2.5-1.2 1.2-.2 1.5l4.5 1.4 1.7 5.3c.2.6.1.8.7.8.5 0 .7-.2.9-.4l2.2-2.1 4.6 3.4c.9.5 1.5.3 1.7-.8l3-14.1c.3-1.4-.5-2-1.4-1.6Zm-12.7 9.4 9.8-6.2c.5-.3.9-.1.5.2l-8 7.2-.3 3.1-1.2-3.8-3-.9c-.7-.2-.7-.5.2-.8Z" fill="currentColor"/></svg>` },
  { platform: "youtube", handle: "@wealthwithsg", icon: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M23 12s0-3.5-.4-5.1c-.2-1.8-1.4-3.1-3.1-3.3C17.8 3.2 12 3.2 12 3.2s-5.8 0-7.5.4C2.8 3.8 1.6 5.1 1.4 6.9 1 8.5 1 12 1 12s0 3.5.4 5.1c.2 1.8 1.4 3.1 3.1 3.3 1.7.4 7.5.4 7.5.4s5.8 0 7.5-.4c1.7-.2 2.9-1.5 3.1-3.3.4-1.6.4-5.1.4-5.1Z" fill="currentColor"/><path d="m10 8.5 5 3.5-5 3.5v-7Z" fill="var(--bg)"/></svg>` },
  { platform: "whatsapp", handle: "@whatsapp_channel", icon: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5a9.5 9.5 0 0 0-8.2 14.3L2.5 21.5l4.9-1.3A9.5 9.5 0 1 0 12 2.5Zm0 17a7.5 7.5 0 0 1-3.8-1l-.3-.2-2.9.8.8-2.8-.2-.3A7.5 7.5 0 1 1 12 19.5Zm4.1-5.6c-.2-.1-1.2-.6-1.4-.7-.2-.1-.3-.1-.5.1-.1.2-.5.7-.6.8-.1.2-.3.2-.5.1-1.5-.7-2.5-1.3-3.5-2.9-.3-.5.3-.4.8-1.3.1-.2.1-.3 0-.5l-.6-1.4c-.2-.4-.3-.4-.5-.4h-.4c-.2 0-.5.1-.7.3-.2.2-.8.8-.8 1.9s.8 2.2.9 2.3c.1.2 1.5 2.3 3.6 3.2 1.4.6 1.9.7 2.6.6.4-.1 1.2-.5 1.4-1 .2-.5.2-.9.1-1Z" fill="currentColor"/></svg>` }
];

const marketOrder = ["nifty", "sensex", "banknifty"];
let marketData = {};

const track = document.getElementById("tickerTrack");
const clock = document.getElementById("clock");

function formatPrice(value) {
  return Number(value).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

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

function buildMarketItem(key) {
  const item = marketData[key];
  const wrapper = document.createElement("span");
  wrapper.className = "item market-item";

  const name = document.createElement("span");
  name.className = "market-name";
  name.textContent = item?.name || key.toUpperCase();

  const price = document.createElement("span");
  price.className = "market-price";
  price.textContent = item?.price != null ? formatPrice(item.price) : "—";

  const change = document.createElement("span");
  const percent = Number(item?.percent);
  const valid = Number.isFinite(percent);
  change.className = `market-change ${valid ? percent > 0 ? "market-change--up" : percent < 0 ? "market-change--down" : "market-change--flat" : "market-change--flat"}`;
  change.textContent = valid
    ? `${percent >= 0 ? "▲" : "▼"} ${Math.abs(percent).toFixed(2)}%`
    : "—";

  wrapper.append(name, price, change);
  return wrapper;
}

function appendMarketSeparator() {
  const separator = document.createElement("span");
  separator.className = "separator";
  separator.setAttribute("aria-hidden", "true");
  track.appendChild(separator);
}

function appendCycle() {
  marketOrder.forEach((entry) => {
    track.appendChild(buildMarketItem(entry));
    appendMarketSeparator();
  });
}

function buildTicker() {
  track.innerHTML = "";
  appendCycle();
  appendCycle();
}

const socialBar = document.getElementById("socialBar");

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
  disclaimer.textContent = "For educational purposes only. Not financial, investment, or trading advice. Do your own research before investing.";

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

async function fetchMarketData() {
  try {
    const response = await fetch("/api/indices", { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const payload = await response.json();
    marketData = payload.data || {};
    buildTicker();
  } catch (error) {
    console.warn("Market data unavailable:", error);
    buildTicker();
  }
}

let position = 0;
let last = performance.now();
const speed = 52;

function animate(now) {
  const delta = Math.min(now - last, 50);
  last = now;
  position -= speed * delta / 1000;

  const resetPoint = track.scrollWidth / 2;
  if (resetPoint > 0 && -position >= resetPoint) {
    position += resetPoint;
  }

  track.style.transform = `translate3d(${position}px,0,0)`;
  requestAnimationFrame(animate);
}

function updateClock() {
  clock.textContent = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).format(new Date()) + " IST";
}

buildTicker();
buildSocialBar();
updateClock();
setInterval(updateClock, 1000);
requestAnimationFrame(animate);

fetchMarketData();
setInterval(fetchMarketData, 30000);
