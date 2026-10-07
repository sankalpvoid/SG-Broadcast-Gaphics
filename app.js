const socials = [
  { platform: "instagram", handle: "@instagram_handle", icon: "◎" },
  { platform: "telegram", handle: "@telegram_handle", icon: "✈" },
  { platform: "youtube", handle: "@youtube_handle", icon: "▶" },
  { platform: "whatsapp", handle: "@whatsapp_channel", icon: "◉" }
];

const track = document.getElementById("tickerTrack");
const clock = document.getElementById("clock");

function buildTicker() {
  track.innerHTML = "";
  const content = [...socials, ...socials];

  content.forEach((social, index) => {
    const item = document.createElement("span");
    item.className = "item social-item";

    const icon = document.createElement("span");
    icon.className = `social-icon social-icon--${social.platform}`;
    icon.textContent = social.icon;
    icon.setAttribute("aria-hidden", "true");

    const handle = document.createElement("span");
    handle.textContent = social.handle;

    item.append(icon, handle);
    track.appendChild(item);

    if (index < content.length - 1) {
      const separator = document.createElement("span");
      separator.className = "separator";
      separator.setAttribute("aria-hidden", "true");
      track.appendChild(separator);
    }
  });
}

let position = 0;
let last = performance.now();
const speed = 72;

function animate(now) {
  const delta = Math.min(now - last, 50);
  last = now;
  position -= speed * delta / 1000;

  const resetPoint = track.scrollWidth / 2;
  if (Math.abs(position) >= resetPoint) position += resetPoint;

  track.style.transform = `translate3d(${position}px,0,0)`;
  requestAnimationFrame(animate);
}

function updateClock() {
  clock.textContent = new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).format(new Date());
}

buildTicker();
updateClock();
setInterval(updateClock, 1000);
requestAnimationFrame(animate);
