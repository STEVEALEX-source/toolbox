const http = require("http");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");

const PORT = process.env.PORT || 8000;
const ROOT = __dirname;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8"
};

function send(res, status, body, headers) {
  res.writeHead(status, headers || {});
  res.end(body);
}

function sendFile(res, filePath, status) {
  const ext = path.extname(filePath).toLowerCase();
  const type = MIME[ext] || "application/octet-stream";
  fs.readFile(filePath, function (err, data) {
    if (err) {
      send404(res);
      return;
    }
    send(res, status || 200, data, {
      "Content-Type": type,
      "Cache-Control": ext === ".html" ? "no-cache" : "public, max-age=3600"
    });
  });
}

function send404(res) {
  const notFound = path.join(ROOT, "404.html");
  fs.readFile(notFound, function (err, data) {
    if (err) {
      send(res, 404, "Not found", { "Content-Type": "text/plain; charset=utf-8" });
      return;
    }
    send(res, 404, data, { "Content-Type": "text/html; charset=utf-8" });
  });
}

function safePath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split("?")[0]);
  const cleaned = path.normalize(decoded).replace(/^(\.\.[/\\])+/, "");
  const full = path.join(ROOT, cleaned);
  if (!full.startsWith(ROOT)) return null;
  return full;
}

const server = http.createServer(function (req, res) {
  if (req.method !== "GET" && req.method !== "HEAD") {
    send(res, 405, "Method not allowed", { "Content-Type": "text/plain; charset=utf-8" });
    return;
  }

  let pathname;
  try {
    pathname = new URL(req.url, "http://localhost").pathname;
  } catch (e) {
    send404(res);
    return;
  }

  if (pathname === "/") {
    sendFile(res, path.join(ROOT, "index.html"));
    return;
  }

  const filePath = safePath(pathname);
  if (!filePath) {
    send404(res);
    return;
  }

  fs.stat(filePath, function (err, stats) {
    if (err || !stats.isFile()) {
      send404(res);
      return;
    }
    sendFile(res, filePath);
  });
});

server.listen(PORT, function () {
  console.log("Toolbox running at http://localhost:" + PORT);
});
