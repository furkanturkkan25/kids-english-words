import { state, applyPetDecay, petMood, clamp, saveProgress, shopItem } from "../state.js";
import { $, showScreen, updateCoins } from "../ui.js";

export function goPet() {
  showScreen("pet");
  setTab("bag");
  renderPet();
}

export function renderPet() {
  applyPetDecay();
  const pet = state.pet;
  const mood = petMood(pet);
  const el = $("pet");
  el.dataset.mood = mood;
  $("pet-body").style.setProperty("--pet-skin", pet.skin || "#5fad68");
  $("pet-name").textContent = pet.name || "Tomo";
  $("meter-hunger").style.width = `${pet.hunger}%`;
  $("meter-happy").style.width = `${pet.happy}%`;
  $("meter-energy").style.width = `${pet.energy}%`;
  $("pet-speech").textContent =
    mood === "joy"
      ? "Harika hissediyorum!"
      : mood === "ok"
        ? "Kelime öğren, bana bak!"
        : mood === "meh"
          ? "Biraz yiyecek isterim…"
          : "Açım ve üzgünüm…";

  const hat = $("pet-hat");
  if (pet.hat) {
    hat.hidden = false;
    hat.dataset.hat = pet.hat;
  } else {
    hat.hidden = true;
    delete hat.dataset.hat;
  }

  renderBag();
  renderShop();
  updateCoins(pet.coins);
}

function react(msg) {
  $("pet-speech").textContent = msg;
  const el = $("pet");
  el.classList.remove("is-react");
  void el.offsetWidth;
  el.classList.add("is-react");
}

function renderBag() {
  const grid = $("bag-grid");
  const entries = Object.entries(state.pet.owned).filter(([, n]) => n > 0);
  grid.innerHTML = "";
  $("bag-hint").textContent = entries.length
    ? "Dokunarak Tomo’ya ver veya giydir."
    : "Marketten yiyecek veya eşya al, burada görünsün.";

  entries.forEach(([id, count]) => {
    const item = shopItem(id);
    if (!item) return;
    grid.appendChild(
      card(item, `${state.shop.kinds[item.kind] || item.kind} · x${count}`, () => useItem(id))
    );
  });
}

function renderShop() {
  const grid = $("shop-grid");
  grid.innerHTML = "";
  state.shop.items
    .filter((item) => state.shopFilter === "all" || item.kind === state.shopFilter)
    .forEach((item) => {
      const owned = state.pet.owned[item.id] || 0;
      const cosmetic = item.kind === "skin" || item.kind === "hat";
      const taken = cosmetic && owned > 0;
      const canBuy = state.pet.coins >= item.price && !taken;
      const btn = card(
        item,
        taken
          ? `${state.shop.kinds[item.kind]} · alındı`
          : `${state.shop.kinds[item.kind]} · <span class="shop-price">${item.price}</span>`,
        () => buyItem(item.id)
      );
      btn.disabled = !canBuy;
      grid.appendChild(btn);
    });
}

function card(item, sub, onClick) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "shop-card";
  btn.innerHTML = `
    <span class="shop-swatch" data-shape="${item.shape}" style="--swatch:${item.swatch}"></span>
    <span class="shop-meta">
      <p class="shop-name">${item.name}</p>
      <p class="shop-sub">${sub}</p>
    </span>
  `;
  btn.addEventListener("click", onClick);
  return btn;
}

function buyItem(id) {
  const item = shopItem(id);
  if (!item) return;
  const cosmetic = item.kind === "skin" || item.kind === "hat";
  if (cosmetic && (state.pet.owned[id] || 0) > 0) return;
  if (state.pet.coins < item.price) return react("Yeterli param yok!");
  state.pet.coins -= item.price;
  state.pet.owned[id] = (state.pet.owned[id] || 0) + 1;
  if (item.kind === "skin") {
    state.pet.skin = item.color;
    react("Yeni rengim süper!");
  } else if (item.kind === "hat") {
    state.pet.hat = item.id;
    react("Şapkam yakıştı mı?");
  } else react("Çantama koydum!");
  saveProgress();
  renderPet();
}

function useItem(id) {
  const item = shopItem(id);
  if (!item || !(state.pet.owned[id] > 0)) return;

  if (item.kind === "skin") {
    state.pet.skin = item.color;
    react("Bu renk bana yakıştı!");
    saveProgress();
    return renderPet();
  }
  if (item.kind === "hat") {
    state.pet.hat = state.pet.hat === id ? null : id;
    react(state.pet.hat ? "Şapkam hazır!" : "Şapkamı çıkardım.");
    saveProgress();
    return renderPet();
  }

  state.pet.owned[id] -= 1;
  if (state.pet.owned[id] <= 0) delete state.pet.owned[id];
  state.pet.hunger = clamp(state.pet.hunger + (item.hunger || 0));
  state.pet.happy = clamp(state.pet.happy + (item.happy || 0));
  state.pet.energy = clamp(state.pet.energy + (item.energy || 0));
  react(item.kind === "food" ? "Afiyet olsun bana!" : "Oynamak çok eğlenceli!");
  saveProgress();
  renderPet();
}

export function setTab(tab) {
  document.querySelectorAll(".pet-tab").forEach((el) => {
    const on = el.dataset.tab === tab;
    el.classList.toggle("is-active", on);
    el.setAttribute("aria-selected", on ? "true" : "false");
  });
  $("panel-bag").hidden = tab !== "bag";
  $("panel-bag").classList.toggle("is-active", tab === "bag");
  $("panel-shop").hidden = tab !== "shop";
  $("panel-shop").classList.toggle("is-active", tab === "shop");
}

export function setShopFilter(kind) {
  state.shopFilter = kind;
  renderShop();
}
