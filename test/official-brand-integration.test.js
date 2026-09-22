"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const root = path.resolve(__dirname, "..");
const brandUrl = "/assets/brand/reforma-profissional-oficial.jpeg";
const read = file => fs.readFileSync(path.join(root, file), "utf8");

test("official brand file exists and all requested web surfaces reference it", () => {
  const asset = path.join(root, "public/assets/brand/reforma-profissional-oficial.jpeg");
  assert.ok(fs.existsSync(asset));
  assert.ok(fs.statSync(asset).size > 0);
  for (const file of [
    "web/index.html", "prestador/cadastro/index.html", "prestador/login/index.html",
    "prestador/painel/index.html", "solicitar-servico/index.html", "admin/prestadores/index.html"
  ]) assert.ok(read(file).includes(brandUrl), file);
  const home = read("web/index.html");
  assert.match(home, /👷 SOU PROFISSIONAL/);
  assert.match(home, /Cadastre-se para receber oportunidades de serviços\./);
  assert.match(home, /href="\/prestador\/cadastro\/">QUERO SER PROFISSIONAL →<\/a>/);
});

test("customer terms and provider contract use only the official visual identity", () => {
  execFileSync(process.execPath, [path.join(root, "scripts/build-web.js")]);
  for (const route of ["cliente", "prestador"]) {
    const legal = read(`dist/termos/${route}/index.html`);
    assert.ok(legal.includes(brandUrl), route);
    assert.doesNotMatch(legal, /reforma-profissional-(?:logo|mark)\.svg/);
  }
  const built = path.join(root, "dist/assets/brand/reforma-profissional-oficial.jpeg");
  assert.ok(fs.existsSync(built));
  assert.deepEqual(fs.readFileSync(built), fs.readFileSync(path.join(root, "public/assets/brand/reforma-profissional-oficial.jpeg")));
});

test("official JPEG is validated by the build and service worker", () => {
  const build = read("scripts/build-web.js");
  const worker = read("sw.js");
  assert.match(build, /Official brand asset is required/);
  assert.ok(worker.includes(brandUrl.slice(1)));
  assert.match(worker, /image\\\/jpeg/);
  assert.match(worker, /!response\.ok/);
  assert.match(worker, /expected\.test\(response\.headers\.get\("content-type"\)/);
});

test("working tree contains no modified binary file", () => {
  const numstat = execFileSync("git", ["diff", "--numstat", "HEAD"], { cwd: root, encoding: "utf8" });
  assert.doesNotMatch(numstat, /^-\s+-\s+/m);
});
