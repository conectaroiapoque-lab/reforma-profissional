"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const catalog = require("../catalog");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "web", "app.js"), "utf8");
const html = fs.readFileSync(path.join(root, "web", "index.html"), "utf8");

const expectedPopularServices = [
  ["RP0001", "Instalação de tomada simples"],
  ["RP0002", "Troca de tomada"],
  ["RP0003", "Instalação de interruptor"],
  ["RP0012", "Reparo em curto-circuito"],
  ["RP0013", "Revisão elétrica de circuito"],
  ["RP0014", "Instalação simples de torneira em ponto existente"]
];

test("cards populares carregam os códigos oficiais V7 esperados", () => {
  for (const [code, name] of expectedPopularServices) {
    assert.equal(catalog.getServiceByCode(code)?.name, name);
    assert.ok(catalog.catalog.slice(0, 14).some(service => service.code === code));
  }
  assert.match(app, /data-code="\$\{s\.code\}"/);
});

test("card inteiro e seta compartilham uma única ação que avança para detalhes", () => {
  assert.match(app, /<button type="button" class="service-card"[^>]+data-code=/);
  assert.match(app, /<span aria-hidden="true">→<\/span>/);
  assert.match(app, /if\(service\)\{activateServiceCard\(service\.dataset\.code\);return\}/);
  assert.match(app, /function activateServiceCard\(code\)\{startRequest\(code\);if\(!selectedServiceCode\)return false;showStep\(2\);return true;\}/);
  assert.equal((app.match(/activateServiceCard\(service\.dataset\.code\)/g) || []).length, 1);
});

test("seleção mantém serviceCode, preço FIXED, QUOTE e Continuar disponíveis", () => {
  const fixed = catalog.getServiceByCode("RP0001");
  const quote = catalog.getServiceByCode("RP0012");
  assert.deepEqual(
    { code: fixed.code, mode: fixed.pricingMode, price: fixed.customerPriceCents },
    { code: "RP0001", mode: "FIXED", price: 14990 }
  );
  assert.deepEqual(
    { code: quote.code, mode: quote.pricingMode, price: quote.customerPriceCents },
    { code: "RP0012", mode: "QUOTE", price: null }
  );
  assert.match(app, /pricingMode==='QUOTE'\?`\$\{service\.name\} — Sob orçamento`/);
  assert.match(app, /money\(service\.customerPriceCents\)/);
  assert.match(app, /selectedServiceCode=s\.code/);
  assert.match(app, /#next-step'\)\.hidden=currentStep===4/);
  assert.match(html, /id="selected-service-summary" aria-live="polite"/);
});

test("botões de serviço preservam ativação nativa por clique, toque, Enter e Espaço", () => {
  assert.match(app, /<button type="button" class="service-card"/);
  assert.doesNotMatch(app, /data-code[^\n]+(?:keydown|keyup)|(?:keydown|keyup)[^\n]+data-code/);
  assert.doesNotMatch(app, /preventDefault\(\).*data-code|data-code.*preventDefault\(\)/);
});
