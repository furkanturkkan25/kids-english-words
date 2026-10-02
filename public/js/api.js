const BASE = "";

async function get(path) {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`${path} → ${res.status}`);
  return res.json();
}

export const api = {
  levels: () => get("/api/levels"),
  shop: () => get("/api/shop"),
  media: (word) => get(`/api/media?word=${encodeURIComponent(word)}`),
  health: () => get("/api/health"),
};
