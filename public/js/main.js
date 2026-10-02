import { api } from "./api.js";
import { state, loadProgress, saveProgress } from "./state.js";
import { speech } from "./speech.js";
import { bindScreens, showScreen, $, updateCoins } from "./ui.js";
import { goMap, drawPath } from "./screens/map.js";
import { openLevel, hearAgain, toggleListen } from "./screens/play.js";
import { goPet, setTab, setShopFilter, renderPet } from "./screens/pet.js";

bindScreens();

function open(index) {
  return openLevel(index);
}

function toMap() {
  speech.stop();
  window.speechSynthesis?.cancel();
  goMap(open);
}

function toPet() {
  speech.stop();
  window.speechSynthesis?.cancel();
  goPet();
}

function nextLevel() {
  if (state.completed.size >= state.levels.length && state.levelIndex >= state.levels.length - 1) {
    showScreen("done");
    return;
  }
  open(Math.min(state.levelIndex + 1, state.levels.length - 1));
}

function restartMap() {
  state.completed = new Set();
  state.unlocked = 0;
  state.levelIndex = 0;
  state.wordIndex = 0;
  saveProgress();
  toMap();
}

async function boot() {
  const status = $("load-status");
  const start = $("btn-start");
  start.disabled = true;
  status.textContent = "Servisler bağlanıyor…";

  try {
    const [levelsRes, shopRes] = await Promise.all([api.levels(), api.shop()]);
    state.levels = levelsRes.levels || [];
    state.shop = {
      items: shopRes.items || [],
      kinds: shopRes.kinds || {},
      coins: shopRes.coins || { perWord: 8, levelBonus: 25 },
    };
    loadProgress();
    updateCoins(state.pet.coins);
    status.textContent = `${levelsRes.meta.levelCount} seviye · ${levelsRes.meta.wordCount} kelime hazır`;
    status.classList.add("is-ready");
    start.disabled = false;
  } catch (err) {
    console.error(err);
    status.textContent = "API’ye ulaşılamadı. `npm start` ile sunucuyu aç.";
    status.classList.add("is-error");
  }

  if (!speech.hasRecognition) {
    $("mic-hint").textContent = "Konuşma tanıma için Chrome veya Edge kullan.";
  }
}

function bind() {
  $("btn-start").addEventListener("click", toMap);
  $("btn-to-map").addEventListener("click", toMap);
  $("btn-pet-map").addEventListener("click", toMap);
  $("btn-level-map").addEventListener("click", toMap);
  $("btn-done-map").addEventListener("click", toMap);
  $("dock-map").addEventListener("click", toMap);
  $("dock-map-2").addEventListener("click", toMap);
  $("dock-pet").addEventListener("click", toPet);
  $("dock-pet-2").addEventListener("click", toPet);
  $("btn-level-pet").addEventListener("click", toPet);
  $("btn-done-pet").addEventListener("click", toPet);
  $("btn-pet-shop").addEventListener("click", () => {
    setTab("shop");
    renderPet();
  });
  $("btn-next-level").addEventListener("click", nextLevel);
  $("btn-restart").addEventListener("click", restartMap);
  $("btn-hear").addEventListener("click", hearAgain);
  $("btn-speak").addEventListener("click", () => toggleListen({}));

  document.querySelectorAll(".pet-tab").forEach((tab) => {
    tab.addEventListener("click", () => setTab(tab.dataset.tab));
  });
  $("shop-filters").addEventListener("click", (e) => {
    const btn = e.target.closest(".filter-btn");
    if (!btn) return;
    $("shop-filters").querySelectorAll(".filter-btn").forEach((el) => el.classList.toggle("is-active", el === btn));
    setShopFilter(btn.dataset.kind);
  });

  window.addEventListener("resize", () => {
    if ($("screen-map").classList.contains("is-active")) drawPath();
  });
}

bind();
boot();
