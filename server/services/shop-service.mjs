/** Shop microservice catalog */
const COIN_PER_WORD = 8;
const COIN_LEVEL_BONUS = 25;

const SHOP_ITEMS = [
  // Yiyecek
  {
    id: "apple_snack",
    name: "Elma dilimi",
    kind: "food",
    price: 12,
    hunger: 18,
    happy: 4,
    energy: 2,
    swatch: "#ef6b4a",
    shape: "fruit",
  },
  {
    id: "cookie",
    name: "Kurabiye",
    kind: "food",
    price: 18,
    hunger: 22,
    happy: 10,
    energy: 4,
    swatch: "#c48a4a",
    shape: "cookie",
  },
  {
    id: "milk",
    name: "Süt",
    kind: "food",
    price: 15,
    hunger: 14,
    happy: 6,
    energy: 12,
    swatch: "#f5f0e6",
    shape: "cup",
  },
  {
    id: "cake",
    name: "Pasta",
    kind: "food",
    price: 35,
    hunger: 30,
    happy: 20,
    energy: 8,
    swatch: "#ff9eb5",
    shape: "cake",
  },
  {
    id: "salad",
    name: "Salata",
    kind: "food",
    price: 22,
    hunger: 26,
    happy: 8,
    energy: 10,
    swatch: "#5fad4a",
    shape: "bowl",
  },
  {
    id: "juice",
    name: "Meyve suyu",
    kind: "food",
    price: 16,
    hunger: 12,
    happy: 8,
    energy: 14,
    swatch: "#ffb84d",
    shape: "cup",
  },
  // Oyuncak
  {
    id: "ball_toy",
    name: "Top",
    kind: "toy",
    price: 28,
    hunger: -4,
    happy: 22,
    energy: -8,
    swatch: "#4aa8d8",
    shape: "ball",
  },
  {
    id: "kite_toy",
    name: "Uçurtma",
    kind: "toy",
    price: 40,
    hunger: -2,
    happy: 28,
    energy: -6,
    swatch: "#ef6b6b",
    shape: "kite",
  },
  {
    id: "music_box",
    name: "Müzik kutusu",
    kind: "toy",
    price: 45,
    hunger: 0,
    happy: 26,
    energy: 4,
    swatch: "#e0a030",
    shape: "box",
  },
  // Görünüm
  {
    id: "skin_leaf",
    name: "Yaprak yeşili",
    kind: "skin",
    price: 50,
    color: "#5fad68",
    swatch: "#5fad68",
    shape: "blob",
  },
  {
    id: "skin_sun",
    name: "Güneş sarısı",
    kind: "skin",
    price: 55,
    color: "#ffc14d",
    swatch: "#ffc14d",
    shape: "blob",
  },
  {
    id: "skin_sky",
    name: "Gökyüzü mavisi",
    kind: "skin",
    price: 55,
    color: "#6eb8d9",
    swatch: "#6eb8d9",
    shape: "blob",
  },
  {
    id: "skin_berry",
    name: "Berry pembesi",
    kind: "skin",
    price: 70,
    color: "#ef7a9a",
    swatch: "#ef7a9a",
    shape: "blob",
  },
  {
    id: "hat_cap",
    name: "Kep",
    kind: "hat",
    price: 60,
    swatch: "#4aa8d8",
    shape: "cap",
  },
  {
    id: "hat_leaf",
    name: "Yaprak taç",
    kind: "hat",
    price: 48,
    swatch: "#3cb371",
    shape: "leaf",
  },
  {
    id: "hat_crown",
    name: "Altın taç",
    kind: "hat",
    price: 120,
    swatch: "#ffc14d",
    shape: "crown",
  },
  {
    id: "hat_flower",
    name: "Çiçek",
    kind: "hat",
    price: 42,
    swatch: "#ff8aad",
    shape: "flower",
  },
];

const KIND_LABELS = {
  food: "Yiyecek",
  toy: "Oyuncak",
  skin: "Renk",
  hat: "Şapka",
};


export { COIN_PER_WORD, COIN_LEVEL_BONUS, SHOP_ITEMS, KIND_LABELS };

export function getShopCatalog() {
  return { coins: { perWord: COIN_PER_WORD, levelBonus: COIN_LEVEL_BONUS }, items: SHOP_ITEMS, kinds: KIND_LABELS };
}

export function shopItemById(id) {
  return SHOP_ITEMS.find((item) => item.id === id) || null;
}
