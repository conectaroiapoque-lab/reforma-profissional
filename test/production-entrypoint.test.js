"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const root = path.resolve(__dirname, "..");
const buildSha = "abcdef0123456789abcdef0123456789abcdef01";
const legacyTerms = [
  "4.9 ★",
  "25 min",
  "João Técnico",
  "328 atendimentos",
  "8 anos",
  "MVP demonstrativo",
  "Dados salvos somente neste navegador",
  "Painel Administrativo antigo",
  "IA simulada",
  "pagamento demonstrativo"
];

test("production entrypoint is exclusively built from web/index.html into dist", () => {
  execFileSync(process.execPath, [path.join(root, "scripts", "build-web.js")], {
    cwd: root,
    env: { ...process.env, VERCEL_GIT_COMMIT_SHA: buildSha }
  });

  const source = fs.readFileSync(path.join(root, "web", "index.html"), "utf8");
  const built = fs.readFileSync(path.join(root, "dist", "index.html"), "utf8");
  assert.equal(fs.existsSync(path.join(root, "index.html")), false, "root legacy index.html must be absent");
  assert.equal(
    built.replaceAll(buildSha.slice(0, 7), "__RP_RELEASE__"),
    source,
    "dist/index.html must derive only from web/index.html with marker substitution"
  );
  for (const term of legacyTerms) assert.equal(built.toLowerCase().includes(term.toLowerCase()), false, `${term} must not enter dist`);
  assert.match(built, /<meta name="rp-build" content="go-live-main-abcdef0">/);
  assert.match(built, /<!-- RP_BUILD:abcdef0 -->/);
});

test("Vercel explicitly builds the web bundle and serves only dist", () => {
  const config = JSON.parse(fs.readFileSync(path.join(root, "vercel.json"), "utf8"));
  assert.equal(config.buildCommand, "npm run build:web");
  assert.equal(config.outputDirectory, "dist");
  assert.equal(config.framework, null, "framework auto-detection must remain disabled");
  assert.equal("rewrites" in config, false, "rewrites must not override dist/index.html");
  assert.equal(fs.existsSync(path.join(root, "public", "index.html")), false, "public/index.html must not override the entrypoint");
});
