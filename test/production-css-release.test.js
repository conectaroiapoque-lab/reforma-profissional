"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const vm = require("node:vm");
const { execFileSync } = require("node:child_process");

const root = path.resolve(__dirname, "..");
const dist = path.join(root, "dist");

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".webmanifest": "application/manifest+json"
};

test("dist serves the PR 30 release with correct asset MIME types", async t => {
  execFileSync(process.execPath, [path.join(root, "scripts", "build-web.js")]);
  const server = http.createServer((request, response) => {
    const pathname = new URL(request.url, "http://localhost").pathname;
    const relative = pathname === "/" ? "index.html" : pathname.slice(1);
    const file = path.join(dist, relative);
    if (!file.startsWith(`${dist}${path.sep}`) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
      response.writeHead(404).end("Not found");
      return;
    }
    response.setHeader("Content-Type", contentTypes[path.extname(file)] || "application/octet-stream");
    response.end(fs.readFileSync(file));
  });
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  t.after(() => server.close());
  const origin = `http://127.0.0.1:${server.address().port}`;

  const expected = [
    ["/", "text/html"],
    ["/styles.css", "text/css"],
    ["/styles.css?v=6", "text/css"],
    ["/app.js?v=13", "javascript"],
    ["/sw.js", "javascript"],
    ["/manifest.webmanifest", "application/manifest+json"],
    ["/assets/brand/reforma-profissional-logo.svg", "image/svg+xml"],
    ["/assets/brand/reforma-profissional-mark.svg", "image/svg+xml"]
  ];
  for (const [url, type] of expected) {
    const response = await fetch(`${origin}${url}`);
    const body = await response.text();
    assert.equal(response.status, 200, url);
    assert.ok((response.headers.get("content-type") || "").includes(type), `${url} has MIME ${type}`);
    assert.ok(body.length > 0, url);
    if (/\.(?:css|js)/.test(url)) assert.doesNotMatch(body, /<!doctype html/i, `${url} returned HTML`);
  }

  const html = await (await fetch(`${origin}/`)).text();
  assert.match(html, /href="\/styles\.css\?v=6"/);
  assert.match(html, /src="\/app\.js\?v=13"/);
  assert.equal(fs.existsSync(path.join(root, "index.html")), false, "legacy root HTML must not exist");
  assert.equal(fs.existsSync(path.join(dist, "public", "assets", "brand")), false, "brand assets were nested below dist/public");
});

test("service worker deletes only old Reforma caches and rejects wrong asset content", async () => {
  const source = fs.readFileSync(path.join(root, "sw.js"), "utf8");
  const listeners = {};
  const deleted = [];
  const context = {
    URL, Request, Response,
    fetch: async () => new Response("<!doctype html>", { status: 200, headers: { "content-type": "text/html" } }),
    caches: {
      keys: async () => ["reforma-profissional-v15-go-live", "reforma-profissional-v16-production-fix", "reforma-profissional-v17-brand", "unrelated-cache"],
      delete: async key => { deleted.push(key); return true; },
      open: async () => ({ put: async () => {} }),
      match: async () => undefined
    },
    self: {
      location: { origin: "https://reformaprofissional.com.br" },
      clients: { claim() {} },
      skipWaiting() {},
      addEventListener(name, handler) { listeners[name] = handler; }
    }
  };
  vm.runInNewContext(source, context);
  let activation;
  listeners.activate({ waitUntil(promise) { activation = promise; } });
  await activation;
  assert.deepEqual(deleted.sort(), ["reforma-profissional-v15-go-live", "reforma-profissional-v16-production-fix", "reforma-profissional-v17-brand"]);
  assert.equal(context.isCacheable("/styles.css?v=6", await context.fetch()), false);
  assert.equal(context.isCacheable("/app.js?v=13", await context.fetch()), false);
  assert.match(source, /response\.ok/);
  assert.match(source, /response\.redirected/);
});
