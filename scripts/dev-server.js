"use strict";
// Local development adapter for the existing Vercel handlers. No authentication bypass.
const http = require("node:http"),
  fs = require("node:fs/promises"),
  path = require("node:path");
const root = path.resolve(__dirname, "../dist");
const handlers = {
  orders: "orders",
  evidence: "evidence",
  health: "health",
  "auth/login": "auth/login",
  "geocode/reverse": "geocode/reverse",
  "webhooks/mercado-pago": "webhooks/mercado-pago",
};
const mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".webmanifest": "application/manifest+json",
  ".svg": "image/svg+xml",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".txt": "text/plain; charset=utf-8",
};
function createServer({ agendaHandler, beforeRequest } = {}) {
  return http.createServer(async (req, res) => {
    if (beforeRequest && (await beforeRequest(req, res))) return;
    const url = new URL(req.url, "http://localhost");
    res.status = (code) => {
      res.statusCode = code;
      return res;
    };
    res.json = (value) => res.end(JSON.stringify(value));
    try {
      if (url.pathname.startsWith("/api/")) {
        const route = url.pathname.slice(5),
          [scope, ...segments] = route.split("/");
        req.query = Object.fromEntries(url.searchParams);
        if (
          ["admin", "provider", "customer", "finance", "compliance"].includes(
            scope,
          )
        )
          req.query.path = segments;
        let length = 0,
          chunks = [];
        for await (const chunk of req) {
          length += chunk.length;
          if (length > 12_000_000) {
            res.statusCode = 413;
            return res.end();
          }
          chunks.push(chunk);
        }
        req.body = Buffer.concat(chunks).toString();
        if (
          req.headers["content-type"]?.startsWith("application/json") &&
          req.body
        ) {
          try {
            req.body = JSON.parse(req.body);
          } catch {
            res.setHeader("content-type", "application/json");
            return res.status(400).json({ error: "INVALID_JSON_BODY" });
          }
        }
        res.setHeader("cache-control", "private, no-store");
        if (agendaHandler && segments.length === 1 && segments[0] === "agenda")
          return await agendaHandler(scope)(req, res);
        const modulePath =
          handlers[route] ||
          (["admin", "provider", "customer", "finance", "compliance"].includes(
            scope,
          )
            ? `${scope}/[...path]`
            : null);
        if (!modulePath) return res.status(404).json({ error: "NOT_FOUND" });
        return await require(
          path.join(__dirname, "../api", modulePath + ".js"),
        )(req, res);
      }
      let file = path.resolve(root, "." + decodeURIComponent(url.pathname));
      if (file !== root && !file.startsWith(root + path.sep)) {
        res.statusCode = 403;
        return res.end();
      }
      const stat = await fs.stat(file);
      if (stat.isDirectory()) file = path.join(file, "index.html");
      const real = await fs.realpath(file);
      if (!real.startsWith(root + path.sep)) {
        res.statusCode = 403;
        return res.end();
      }
      res.setHeader(
        "content-type",
        mime[path.extname(file)] || "application/octet-stream",
      );
      res.setHeader("x-content-type-options", "nosniff");
      res.end(await fs.readFile(file));
    } catch (error) {
      res.setHeader("content-type", "application/json");
      res.statusCode = error.code === "ENOENT" ? 404 : 503;
      res.end(
        JSON.stringify({
          error:
            res.statusCode === 404
              ? "NOT_FOUND"
              : "DEVELOPMENT_SERVICE_UNAVAILABLE",
        }),
      );
    }
  });
}
if (require.main === module)
  createServer().listen(Number(process.env.PORT || 8000), "127.0.0.1", () =>
    console.log(
      "Development server listening on port " + (process.env.PORT || 8000),
    ),
  );
module.exports = { createServer };
