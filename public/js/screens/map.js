import { state, themeKey, themeColor } from "../state.js";
import { $, showScreen } from "../ui.js";

export function renderMap({ onOpenLevel }) {
  const levels = state.levels;
  const root = $("map-nodes");
  root.innerHTML = "";
  let lastTheme = "";

  levels.forEach((level, index) => {
    const theme = themeKey(level.title);
    if (theme !== lastTheme) {
      lastTheme = theme;
      const section = document.createElement("div");
      section.className = "map-section";
      section.innerHTML = `<span class="map-section-label">${theme}</span>`;
      root.appendChild(section);
    }

    const row = document.createElement("div");
    const side = index % 3 === 0 ? "center" : index % 3 === 1 ? "left" : "right";
    row.className = `map-row is-${side}`;

    const done = state.completed.has(index);
    const current = index === state.unlocked && !done;
    const locked = index > state.unlocked && !done;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `node is-${done ? "done" : current ? "current" : locked ? "locked" : "done"}`;
    btn.style.setProperty("--node-color", themeColor(level.title));
    btn.disabled = locked;
    btn.innerHTML = `
      <span class="node-orb"><span class="node-mark">${done ? "✓" : locked ? "·" : level.id}</span></span>
      <p class="node-name">${String(level.title).replace(/\s+(\d+)$/, " ·$1")}</p>
    `;
    btn.addEventListener("click", () => onOpenLevel(index));
    row.appendChild(btn);
    root.appendChild(row);
  });

  updateMapStats();
  requestAnimationFrame(() => {
    drawPath();
    const target = root.querySelector(".node.is-current") || root.querySelector(".node.is-done");
    target?.closest(".map-row")?.scrollIntoView({ block: "center", behavior: "smooth" });
  });
}

function updateMapStats() {
  const levels = state.levels;
  const done = state.completed.size;
  const words = [...state.completed].reduce((n, i) => n + (levels[i]?.words.length || 0), 0);
  $("stat-levels").textContent = `${done}/${levels.length}`;
  $("stat-words").textContent = String(words);
  $("journey-fill").style.width = `${levels.length ? (done / levels.length) * 100 : 0}%`;
  const next = levels[state.unlocked];
  $("map-caption").textContent =
    done >= levels.length
      ? "Tüm bahçeyi dolaştın — tebrikler!"
      : next
        ? `Sıradaki: ${next.id}. ${next.title}`
        : "Haritadan bir durak seç";
}

export function drawPath() {
  const trail = $("map-trail");
  const svg = $("map-path");
  const orbs = $("map-nodes").querySelectorAll(".node-orb");
  if (!orbs.length) {
    svg.innerHTML = "";
    return;
  }
  const box = trail.getBoundingClientRect();
  const pts = [...orbs].map((orb) => {
    const r = orb.getBoundingClientRect();
    return { x: r.left + r.width / 2 - box.left, y: r.top + r.height / 2 - box.top };
  });
  const height = Math.max(trail.scrollHeight, pts.at(-1).y + 40);
  svg.setAttribute("viewBox", `0 0 ${box.width} ${height}`);
  svg.style.height = `${height}px`;
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1];
    const b = pts[i];
    const mid = (a.y + b.y) / 2;
    d += ` C ${a.x} ${mid}, ${b.x} ${mid}, ${b.x} ${b.y}`;
  }
  svg.innerHTML = `<path d="${d}"></path><path class="path-dash" d="${d}"></path>`;
}

export function goMap(openLevel) {
  showScreen("map");
  renderMap({ onOpenLevel: openLevel });
}
