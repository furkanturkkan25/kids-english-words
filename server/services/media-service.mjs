import { fetchWikiImage, fetchTurkish, TR_FALLBACK } from "./words-core.mjs";

const imageCache = new Map();
const inflight = new Map();

/** Media microservice: kelime görseli + TR çeviri (bellek önbellekli) */
export async function resolveMedia(word) {
  const key = String(word || "").toLowerCase().trim();
  if (!key) throw new Error("word required");

  if (imageCache.has(key)) return imageCache.get(key);
  if (inflight.has(key)) return inflight.get(key);

  const job = (async () => {
    const [image, tr] = await Promise.all([
      fetchWikiImage(key),
      Promise.resolve(TR_FALLBACK[key] || null).then((hit) => hit || fetchTurkish(key)),
    ]);
    const payload = { en: key, tr, image, alt: `${tr} — ${key}` };
    imageCache.set(key, payload);
    return payload;
  })();

  inflight.set(key, job);
  try {
    return await job;
  } finally {
    inflight.delete(key);
  }
}

export function mediaCacheSize() {
  return imageCache.size;
}
