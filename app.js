const headlines = [
  "BREAKING: Latest developments and major updates from across the country",
  "Shailesh Gaur Live — stay with us for the latest news and analysis",
  "TOP STORY: New developments expected throughout the day"
];

const track = document.getElementById("tickerTrack");
const clock = document.getElementById("clock");

function buildTicker() {
  track.innerHTML = "";
  const content = [...headlines, ...headlines];
  content.forEach((headline, index) => {
    const item = document.createElement("span");
    item.className = "item";
    item.textContent = headline;
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
