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
buildSocialBar();
