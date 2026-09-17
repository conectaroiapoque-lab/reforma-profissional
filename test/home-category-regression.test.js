"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const v4 = require("../catalog");
const v6 = require("../catalog-v6-candidate");

const root = path.join(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");

test("Home mantém o hero limpo, sem destaque separado de marido de aluguel", () => {
  for (const file of ["index.html", "web/index.html"]) {
    const html = read(file);
    const hero = html.match(/<section class="hero"[\s\S]*?<\/section>/)?.[0] || "";
    assert.doesNotMatch(hero, /quick-services-highlight/);
    assert.doesNotMatch(hero, /MONTAGEM \/ INSTALAÇÃO \/ MARIDO DE ALUGUEL/);
    assert.match(hero, /Solicitar Serviço Agora/);
    assert.match(hero, /Acompanhar Serviço/);
    assert.match(hero, /Falar no WhatsApp/);
  }
});

test("frontend usa uma categoria visual unificada sem alterar o catálogo V4", () => {
  const app = read("web/app.js");
  assert.equal((app.match(/"MONTAGEM \/ INSTALAÇÃO \/ MARIDO DE ALUGUEL"/g) || []).length, 1);
  assert.match(app, /data-category=.*categoryLabel\(c\)/);
  assert.equal(v4.CATALOG_VERSION, "RMBH-2026-09-v4");
  assert.equal(v4.catalog.length, 89);
  assert.equal(v4.catalog.filter(service => service.category === "MONTAGEM E INSTALAÇÃO").length, 16);
});

test("V6 segue candidata DRAFT e ausente do build público", () => {
  assert.equal(v6.CANDIDATE_VERSION, "RMBH-2026-09-v6-candidate");
  assert.equal(v6.CANDIDATE_STATUS, "DRAFT");
  assert.equal(v6.approved, false);
  assert.equal(v6.effectiveDate, null);
  assert.doesNotMatch(read("scripts/build-web.js"), /catalog-v6-candidate/);
});

test("WhatsApp oficial permanece configurado no frontend", () => {
  assert.match(read("web/app.js"), /WHATSAPP_NUMBER="5531990102500"/);
});
