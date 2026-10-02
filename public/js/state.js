const KEY = "kelime-bahcesi-progress-v3";

const THEME_COLORS = {
  Hayvanlar: "#3cb371",
  Yiyecek: "#f08a3a",
  Renkler: "#5b8def",
  Vücut: "#e86b8a",
  Kıyafetler: "#d47a9a",
  Ev: "#c48a4a",
  Oyuncaklar: "#ff6b8a",
  Taşıtlar: "#4aa8d8",
  Oyun: "#46b8a0",
  Doğa: "#5fad4a",
  Hava: "#7ec8e3",
  Okul: "#e0a030",
  Yerler: "#6a9a6e",
  Meslekler: "#d4794a",
  Sağlık: "#ef6b6b",
  Nesneler: "#8a9a7a",
};

function defaultPet() {
  return {
    name: "Tomo",
    coins: 600,
    hunger: 70,
    happy: 70,
    energy: 70,
    skin: "#5fad68",
    hat: null,
    owned: {},
    lastTick: Date.now(),
  };
}

export const state = {
  levels: [],
  shop: { items: [], kinds: {}, coins: { perWord: 8, levelBonus: 25 } },
  levelIndex: 0,
  wordIndex: 0,
  completed: new Set(),
  unlocked: 0,
  pet: defaultPet(),
  shopFilter: "all",
};

export function themeKey(title) {
  const base = String(title || "").replace(/\s+\d+$/, "").trim();
  return Object.keys(THEME_COLORS).find((k) => base.startsWith(k)) || base;
}

export function themeColor(title) {
  return THEME_COLORS[themeKey(title)] || "#3cb371";
}

export function clamp(n) {
  return Math.max(0, Math.min(100, Math.round(n)));
}

export function applyPetDecay(pet = state.pet) {
  const now = Date.now();
  const hours = Math.min(24, (now - (pet.lastTick || now)) / 3_600_000);
  if (hours > 0.08) {
    pet.hunger = clamp(pet.hunger - hours * 6);
    pet.happy = clamp(pet.happy - hours * 4);
    pet.energy = clamp(pet.energy - hours * 3);
  }
  pet.lastTick = now;
  return pet;
}

export function petMood(pet = state.pet) {
  const avg = (pet.hunger + pet.happy + pet.energy) / 3;
  if (avg >= 75) return "joy";
  if (avg >= 45) return "ok";
  if (avg >= 25) return "meh";
  return "sad";
}

export function loadProgress() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    const max = Math.max(0, state.levels.length - 1);
    if (Array.isArray(data.completed)) {
      state.completed = new Set(data.completed.filter((n) => n >= 0 && n <= max));
    }
    state.unlocked = Math.min(Math.max(0, Number(data.unlocked) || 0), max);
    state.levelIndex = Math.min(Math.max(0, Number(data.levelIndex) || state.unlocked), max);
    if (data.pet) state.pet = { ...defaultPet(), ...data.pet, owned: data.pet.owned || {} };
    state.pet.coins = Math.max(Number(state.pet.coins) || 0, 600);
    applyPetDecay();
  } catch {
    /* ignore */
  }
}

export function saveProgress() {
  localStorage.setItem(
    KEY,
    JSON.stringify({
      completed: [...state.completed],
      unlocked: state.unlocked,
      levelIndex: state.levelIndex,
      pet: state.pet,
    })
  );
}

export function currentLevel() {
  return state.levels[state.levelIndex];
}

export function currentWord() {
  return currentLevel()?.words[state.wordIndex];
}

export function shopItem(id) {
  return state.shop.items.find((i) => i.id === id) || null;
}
