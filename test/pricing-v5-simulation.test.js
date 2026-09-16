"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const { catalog } = require("../catalog");
const candidate = require("../catalog-v5-candidate");
const simulator = require("../simulation/pricing-v5-simulator");

const service = candidate.services.find(item => item.code === "V5C002");
const simulate = options => simulator.simulateService(service, { paymentFeeCents: 0, supportCostCents: 0, warrantyReserveCents: 0, travelSubsidyCents: 0, refundReserveCents: 0, ...options });

test("candidate remains an unpublished draft", () => {
  assert.equal(candidate.CANDIDATE_STATUS, "DRAFT");
  assert.equal(candidate.approved, false);
  assert.equal(candidate.effectiveDate, null);
  assert.equal(candidate.services.length, 128);
  assert.equal(fs.readFileSync(require.resolve("../scripts/build-web"), "utf8").includes("catalog-v5-candidate"), false);
});

test("official V4 remains byte-for-data intact with 89 services", () => {
  assert.equal(catalog.length, 89);
  assert.equal(crypto.createHash("sha256").update(JSON.stringify(catalog)).digest("hex"), "c6ce4e88f0c1f8986dd6c0e4e299e9a167526712fddad34e47af983117eddb4d");
});

test("candidate supports every mode and stores valid cent values", () => {
  assert.deepEqual(new Set(candidate.services.map(item => item.pricingMode)), new Set(["FIXED", "FROM", "QUOTE", "PACKAGE"]));
  for (const item of candidate.services) {
    assert.ok(item.candidatePriceCents === null || Number.isInteger(item.candidatePriceCents));
    assert.ok(Number.isInteger(item.providerMinimumPayoutCents));
    if (item.candidatePriceCents !== null && item.unit !== "m2") assert.equal(item.candidatePriceCents % 100, 90);
  }
});

test("floor applies and tax never reduces provider payout", () => {
  const floorService = { ...service, providerMinimumPayoutCents: 12000 };
  const untaxed = simulator.simulateService(floorService, { taxRateBasisPoints: 0 });
  const taxed = simulator.simulateService(floorService, { taxRateBasisPoints: 1000 });
  assert.equal(untaxed.providerFinalPayoutCents, 12000);
  assert.equal(taxed.providerFinalPayoutCents, untaxed.providerFinalPayoutCents);
  assert.equal(taxed.providerTotalReceivableCents, untaxed.providerTotalReceivableCents);
});

test("CAC and cashback reduce margin while separate partner revenue improves it", () => {
  const base = simulate();
  assert.ok(simulate({ customerAcquisitionCostCents: 1000 }).contributionMarginCents < base.contributionMarginCents);
  assert.ok(simulate({ cashbackBasisPoints: 500 }).contributionMarginCents < base.contributionMarginCents);
  const partner = simulate({ materialScenario: simulator.MATERIAL_SCENARIOS.moderate });
  assert.ok(partner.contributionMarginCents > base.contributionMarginCents);
  assert.equal(partner.materialScenario.partnerAppPriceCents, 19000);
  assert.equal(partner.customerPriceCents, base.customerPriceCents);
});

test("travel can trigger review without automatically changing customer price", () => {
  const base = simulate();
  const distant = simulate({ estimatedTravelMinutes: 240, estimatedTravelDistanceKm: 100 });
  assert.equal(distant.economicStatus, "REVIEW_REQUIRED");
  assert.equal(distant.customerPriceCents, base.customerPriceCents);
});
