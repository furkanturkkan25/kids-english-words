import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { initWordsService, getLevels } from "./services/words-service.mjs";
import { resolveMedia, mediaCacheSize } from "./services/media-service.mjs";
import { getShopCatalog } from "./services/shop-service.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.join(__dirname, "../public");
const PORT = Number(process.env.PORT) || 5174;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
};

function json(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": status === 200 ? "public, max-age=30" : "no-store",
    "Access-Control-Allow-Origin": "*",
  });
  res.end(payload);
}

async function serveStatic(req, res, urlPath) {
  let rel = decodeURIComponent(urlPath.split("?")[0]);
  if (rel === "/") rel = "/index.html";
  const file = path.normalize(path.join(PUBLIC, rel));
  if (!file.startsWith(PUBLIC)) {
    res.writeHead(403).end("Forbidden");
    return;
  }
  try {
    const data = await fs.readFile(file);
    const ext = path.extname(file);
    res.writeHead(200, {
      "Content-Type": MIME[ext] || "application/octet-stream",
      "Cache-Control": ext === ".html" ? "no-cache" : "public, max-age=3600",
    });
    res.end(data);
  } catch {
    res.writeHead(404).end("Not found");
  }
}

async function handleApi(req, res, url) {
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    });
    res.end();
    return;
  }

  if (url.pathname === "/api/health") {
    return json(res, 200, {
      ok: true,
      services: { words: true, media: true, shop: true },
      mediaCache: mediaCacheSize(),
      levels: getLevels().length,
    });
  }

  if (url.pathname === "/api/levels") {
    const levels = getLevels();
    return json(res, 200, {
      levels,
      meta: {
        levelCount: levels.length,
        wordCount: levels.reduce((n, l) => n + l.words.length, 0),
      },
    });
  }

  if (url.pathname === "/api/media") {
    const word = url.searchParams.get("word");
    if (!word) return json(res, 400, { error: "word query required" });
    try {
      const media = await resolveMedia(word);
      return json(res, 200, media);
    } catch (err) {
      return json(res, 500, { error: err.message || "media failed" });
    }
  }

  if (url.pathname === "/api/shop") {
    return json(res, 200, getShopCatalog());
  }

  json(res, 404, { error: "unknown endpoint" });
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
    if (url.pathname.startsWith("/api/")) return handleApi(req, res, url);
    return serveStatic(req, res, url.pathname);
  } catch (err) {
    console.error(err);
    res.writeHead(500).end("Server error");
  }
});

await initWordsService();
server.listen(PORT, () => {
  console.log(`[gateway] http://localhost:${PORT}`);
  console.log("[gateway] /api/levels  /api/media  /api/shop  /api/health");
});
