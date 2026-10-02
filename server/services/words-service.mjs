import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildLevelsFromNetwork,
  FALLBACK_LEVELS,
} from "./words-core.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CACHE_FILE = path.join(__dirname, "../../cache/levels.json");

let levels = null;
let building = null;

async function readDiskCache() {
  try {
    const raw = await fs.readFile(CACHE_FILE, "utf8");
    const data = JSON.parse(raw);
    if (Array.isArray(data?.levels) && data.levels.length) return data.levels;
  } catch {
    /* miss */
  }
  return null;
}

async function writeDiskCache(next) {
  try {
    await fs.mkdir(path.dirname(CACHE_FILE), { recursive: true });
    await fs.writeFile(
      CACHE_FILE,
      JSON.stringify({ savedAt: Date.now(), levels: next }),
      "utf8"
    );
  } catch {
    /* ignore */
  }
}

async function rebuild() {
  const next = await buildLevelsFromNetwork();
  levels = next?.length ? next : FALLBACK_LEVELS;
  await writeDiskCache(levels);
  return levels;
}

/** Words microservice: seviyeleri bir kez üretir, disk + bellek önbelleği kullanır */
export async function initWordsService() {
  const disk = await readDiskCache();
  if (disk) {
    levels = disk;
    // Arka planda sessiz yenileme
    building = rebuild()
      .then((list) => {
        console.log(`[words] yenilendi · ${list.length} seviye`);
        return list;
      })
      .catch((err) => {
        console.warn("[words] yenileme atlandı:", err.message);
        return levels;
      })
      .finally(() => {
        building = null;
      });
    console.log(`[words] önbellekten ${levels.length} seviye`);
    return levels;
  }

  console.log("[words] ilk kurulum, Cambridge listesi indiriliyor…");
  try {
    levels = await rebuild();
    console.log(`[words] ${levels.length} seviye hazır`);
  } catch (err) {
    console.warn("[words] kurulum başarısız, yedek:", err.message);
    levels = FALLBACK_LEVELS;
  }
  return levels;
}

export function getLevels() {
  return levels || FALLBACK_LEVELS;
}

export async function getLevelsReady() {
  if (building) {
    try {
      await building;
    } catch {
      /* keep current */
    }
  }
  return getLevels();
}
