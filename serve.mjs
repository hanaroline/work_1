// Mirae Asset Sales Toolkit — dependency-free local static server.
// Serves this folder over http://localhost so the dashboard runs with a real
// browser origin (live-data fetch works) instead of file:// (sample only).
// Run:  node serve.mjs   (optional port:  node serve.mjs 8090)
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL(".", import.meta.url));
const PORT = Number(process.argv[2]) || 8080;
const ENTRY = "tools.html";

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

const server = createServer(async (req, res) => {
  try {
    let path = decodeURIComponent((req.url || "/").split("?")[0]);
    if (path === "/") path = "/" + ENTRY;
    // prevent path traversal outside ROOT
    const abs = normalize(join(ROOT, path));
    if (!abs.startsWith(ROOT)) {
      res.writeHead(403).end("Forbidden");
      return;
    }
    const info = await stat(abs);
    if (info.isDirectory()) {
      res.writeHead(302, { Location: path.replace(/\/?$/, "/") + ENTRY }).end();
      return;
    }
    const body = await readFile(abs);
    res.writeHead(200, {
      "Content-Type": TYPES[extname(abs).toLowerCase()] || "application/octet-stream",
      "Cache-Control": "no-cache",
    });
    res.end(body);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
  }
});

server.listen(PORT, "127.0.0.1", () => {
  const url = `http://localhost:${PORT}/${ENTRY}`;
  console.log(`\n  미래에셋 세일즈 툴킷이 실행 중입니다.`);
  console.log(`  브라우저에서 열어주세요:  ${url}`);
  console.log(`  (종료: 이 창에서 Ctrl + C)\n`);
});
