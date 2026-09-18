"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const { catalog } = require("../catalog-v4");
const candidate = require("../catalog-v5-candidate");
const simulator = require("../simulation/pricing-v5-simulator");
const auditEngine = require("../simulation/pricing-v5-economic-audit");

const audit = auditEngine.createEconomicAudit();
const get = code => audit.find(record => record.serviceCode === code);

test("audits all candidate services without publishing or changing V4", () => {
  assert.equal(audit.length, 128);
  assert.equal(candidate.CANDIDATE_STATUS, "DRAFT");
  assert.equal(candidate.approved, false);
  assert.equal(catalog.length, 89);
  assert.equal(crypto.createHash("sha256").update(JSON.stringify(catalog)).digest("hex"), "c6ce4e88f0c1f8986dd6c0e4e299e9a167526712fddad34e47af983117eddb4d");
});

test("minimum quantity and ticket make small square-meter calls auditable", () => {
  assert.deepEqual(auditEngine.unitRules(candidate.services.find(service => service.code === "V5C034")), { minimumBillableQuantity: 4, minimumServiceTicketCents: 19960 });
  assert.equal(get("V5C034").simulatedBillablePriceCents, 19960);
  assert.equal(get("V5C123").minimumBillableQuantity, 30);
  assert.equal(get("V5C123").minimumServiceTicketCents, 39990);
});

test("low-ticket visits receive a smaller geo radius and conditional credit", () => {
  const visit = get("V5C001");
  assert.equal(visit.recommendedMaxRadiusKm, 6);
  assert.ok(Math.abs(visit.radiusValidationDistanceKm - 6) < 0.1);
  assert.equal(visit.visitFeeCents, 9990);
  assert.equal(visit.visitCreditCents, 9990);
  assert.match(visit.visitCreditCondition, /aprovação e conclusão/u);
});

test("hourly scenarios are configurable and audited payout reaches target where viable", () => {
  assert.deepEqual(auditEngine.PROVIDER_HOURLY_SCENARIOS, { LOW: 3500, TARGET: 5000, PREMIUM: 7000 });
  assert.ok(get("V5C001").estimatedProviderHourlyEarningCents >= auditEngine.PROVIDER_HOURLY_SCENARIOS.TARGET);
  assert.equal(get("V5C126").providerAttractivenessStatus, "BELOW_TARGET");
});

test("off-platform risk has a non-blocking score and classification", () => {
  const result = auditEngine.risk(candidate.services[0], { estimatedProviderHourlyEarningCents: 1000, customerPriceCents: 60000, platformGrossRevenueCents: 40000, providerFinalPayoutCents: 20000, estimatedTravelDistanceKm: 20 });
  assert.ok(result.score >= 50);
  assert.ok(["HIGH", "CRITICAL"].includes(result.classification));
  assert.equal(typeof get("V5C001").recommendedAction, "string");
});

test("cashback is suggested only while positive and partner material improves contribution", () => {
  for (const record of audit.filter(item => item.recommendedCashbackPercent > 0)) assert.ok(record.contributionMarginCents > 0);
  const service = candidate.services.find(item => item.code === "V5C002");
  const none = simulator.simulateService(service, { materialScenario: simulator.MATERIAL_SCENARIOS.none });
  const strong = simulator.simulateService(service, { materialScenario: simulator.MATERIAL_SCENARIOS.strong });
  assert.ok(strong.contributionMarginCents > none.contributionMarginCents);
});

test("customer price never changes automatically and every proposal requires manual approval", () => {
  for (const record of audit) {
    assert.equal(record.currentCandidatePriceCents, candidate.services.find(service => service.code === record.serviceCode).candidatePriceCents);
    if (record.proposedCustomerPriceCents !== null) {
      assert.equal(record.manualApprovalRequired, true);
      assert.equal(record.priceProposal.manualApprovalRequired, true);
      assert.equal(record.priceProposal.oldCandidatePriceCents, record.currentCandidatePriceCents);
      assert.equal(record.priceProposal.differenceCents, record.proposedCustomerPriceCents - record.currentCandidatePriceCents);
      assert.ok(record.priceProposal.reason);
    }
  }
});
