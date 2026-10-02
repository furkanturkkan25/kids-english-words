const screens = {};
let coinToastTimer = 0;

export function bindScreens() {
  for (const id of ["welcome", "map", "pet", "play", "level", "done"]) {
    screens[id] = document.getElementById(`screen-${id}`);
  }
}

export function showScreen(name) {
  Object.entries(screens).forEach(([key, el]) => {
    const on = key === name;
    el.hidden = !on;
    el.classList.toggle("is-active", on);
  });
  const chip = document.getElementById("coin-chip");
  if (chip) chip.hidden = name === "welcome";
}

export function $(id) {
  return document.getElementById(id);
}

export function updateCoins(n) {
  const el = $("coin-amount");
  if (el) el.textContent = String(n);
}

export function toastCoins(msg) {
  const el = $("coin-toast");
  if (!el) return;
  el.hidden = false;
  el.textContent = msg;
  clearTimeout(coinToastTimer);
  coinToastTimer = setTimeout(() => {
    el.hidden = true;
  }, 1400);
}

export function setStatus(text, kind = "") {
  const el = $("status");
  if (!el) return;
  el.textContent = text;
  el.classList.remove("is-ok", "is-bad", "is-listen");
  if (kind) el.classList.add(kind);
}
