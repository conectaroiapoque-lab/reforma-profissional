"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { catalog, getServiceByCode, CATALOG_VERSION, CATALOG_RELEASE } = require("../catalog");
const pricing = require("../services/pricing-engine");
const { createOrder, resetIdempotencyForTests } = require("../domain/order-engine");
const { exportCatalog } = require("../adapters/gestao-click-adapter");

test("catálogo v4 contém os 89 códigos únicos e sequenciais", () => {
  assert.equal(CATALOG_VERSION, "RMBH-2026-09-v4");
  assert.equal(CATALOG_RELEASE.actor, "ADMIN:REFORMA_PROFISSIONAL");
  assert.equal(catalog.length, 89);
  assert.equal(new Set(catalog.map(service => service.code)).size, 89);
  assert.deepEqual(catalog.map(service => service.code), Array.from({ length: 89 }, (_, index) => `RP${String(index + 1).padStart(4, "0")}`));
});

test("catálogo mantém 51 FIXED, 38 QUOTE, materiais separados e escopo dos fixos", () => {
  assert.equal(catalog.filter(service => service.pricingMode === "FIXED").length, 51);
  assert.equal(catalog.filter(service => service.pricingMode === "QUOTE").length, 38);
  for (const service of catalog.filter(service => service.pricingMode === "QUOTE")) {
    assert.equal(service.customerPriceCents, null);
    assert.equal(service.providerPayoutCents, null);
    assert.equal(service.platformRevenueCents, null);
  }
  assert.ok(catalog.filter(service => service.pricingMode === "FIXED").every(service => service.scopeNotes));
  assert.ok(catalog.every(service => service.materialsIncluded === false));
  assert.ok(catalog.slice(57).every(service => service.pricingMode === "QUOTE" && service.customerPriceCents === null));
});

test("valores oficiais e divisões 60/65/70 estão corretos em centavos", () => {
  check("RP0014", "TECHNICAL", 16000, 10400, 5600);
  check("RP0015", "TECHNICAL", 15000, 9750, 5250);
  check("RP0030", "TECHNICAL", 16000, 10400, 5600);
  check("RP0037", "STANDARD", 15000, 9000, 6000);
  check("RP0046", "SPECIALIST", 70000, 49000, 21000);
  for (const service of catalog.filter(item => item.pricingMode === "FIXED")) {
    assert.ok(Number.isInteger(service.customerPriceCents));
    assert.equal(service.providerPayoutCents + service.platformRevenueCents, service.customerPriceCents);
  }
});

test("serviços dependentes de diagnóstico foram convertidos para QUOTE", () => {
  for (const code of ["RP0012", "RP0049", "RP0052", "RP0054", "RP0055", "RP0057"]) {
    assert.equal(getServiceByCode(code).pricingMode, "QUOTE");
    assert.equal(getServiceByCode(code).customerPriceCents, null);
    assert.throws(() => pricing.createCatalogPricingSnapshot(code), /exige orçamento/);
  }
});

test("atratividade não altera preço nem supera 70% automaticamente", () => {
  const snapshot = pricing.createCatalogPricingSnapshot("RP0014", { estimatedServiceMinutes: 60, estimatedTravelMinutes: 30, minimumProviderHourlyEarningCents: 10000 });
  assert.equal(snapshot.providerPayoutCents, 10400);
  assert.equal(snapshot.estimatedProviderHourlyEarningCents, 6933);
  assert.equal(snapshot.providerStatus, "UNATTRACTIVE");
  assert.ok(snapshot.attractivenessActions.includes("NEAREST_PROVIDER"));
  assert.equal(snapshot.customerPriceCents, 16000);
  assert.throws(() => pricing.createPricingSnapshot({ customerPriceCents: 10000, providerPercent: 71 }), /70%/);
});

test("visões separam dados internos, preço do cliente e materiais", () => {
  const snapshot = pricing.createCatalogPricingSnapshot("RP0014", { materialCostCents: 3000, materialSaleCents: 4000 });
  const customer = pricing.customerPricingView(snapshot);
  const provider = pricing.providerPricingView(snapshot);
  assert.equal(customer.laborAmountCents, 16000);
  assert.equal(customer.materialSaleCents, 4000);
  assert.equal("providerPayoutCents" in customer, false);
  assert.equal(provider.providerPayoutCents, 10400);
  assert.equal("customerPriceCents" in provider, false);
  assert.equal(snapshot.providerPayoutCents, 10400, "material não participa do repasse");
});

test("OS preserva snapshot e versão originais", () => {
  resetIdempotencyForTests();
  const snapshot = pricing.createCatalogPricingSnapshot("RP0014");
  const order = createOrder({ serviceId: "RP0014", pricingSnapshot: snapshot }, "catalog-snapshot-v4");
  assert.strictEqual(order.pricingSnapshot, snapshot);
  assert.equal(order.pricingSnapshot.catalogVersion, "RMBH-2026-09-v4");
  assert.equal(order.pricingSnapshot.customerPriceCents, 16000);
});

test("pricing engine e GestãoClick consomem a mesma fonte", () => {
  const exported = exportCatalog();
  assert.equal(exported.length, 89);
  assert.equal(exported[0].codigo, "RP0001");
  assert.equal(exported.at(-1).codigo, "RP0089");
});

function check(code, tier, customerPriceCents, providerPayoutCents, platformRevenueCents) {
  const service = getServiceByCode(code);
  assert.equal(service.tier, tier);
  assert.equal(service.customerPriceCents, customerPriceCents);
  assert.equal(service.providerPayoutCents, providerPayoutCents);
  assert.equal(service.platformRevenueCents, platformRevenueCents);
}
