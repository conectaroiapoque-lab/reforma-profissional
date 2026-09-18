"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const candidate = require("../catalog-v5-candidate");
const { catalog, CATALOG_VERSION } = require("../catalog-v4");
const { createDiarista4hReview } = require("../simulation/pricing-v5-diarista-4h-review");

const review = createDiarista4hReview();

test("tests exactly the commercial price, percent, radius and acquisition matrix", () => {
  assert.equal(review.scenarios.length, 5 * 3 * 2 * 2);
  assert.deepEqual([...new Set(review.scenarios.map(x => x.customerPriceCents))], [15990, 16990, 17990, 18990, 19990]);
  assert.deepEqual([...new Set(review.scenarios.map(x => x.providerPercent))], [60, 65, 70]);
  assert.deepEqual([...new Set(review.scenarios.map(x => x.recommendedRadiusKm))], [3, 6]);
  assert.deepEqual([...new Set(review.scenarios.map(x => x.acquisitionModel))], ["ONE_OFF", "RECURRING_CUSTOMER"]);
  assert.ok(review.scenarios.every(x => x.customerPriceCents >= 15000 && x.customerPriceCents <= 20000));
});

test("never exceeds 70 percent, hides costs, or bypasses manual approval", () => {
  for (const scenario of review.scenarios) {
    assert.ok(scenario.providerFinalPayoutCents <= Math.round(scenario.customerPriceCents * 0.7));
    assert.ok(scenario.totalPlatformCostsCents > 0);
    assert.equal(scenario.cashbackCostCents, 0);
  }
  assert.ok(review.viableScenarioCount > 0);
  assert.equal(review.finalStatus, "READY_FOR_V5_WITH_MANUAL_APPROVAL");
  assert.equal(review.proposal.manualApprovalRequired, true);
  assert.equal(review.selectedScenario.providerHourlyReferenceStatus, "BELOW_REFERENCE");
});

test("selects balance rather than maximum price and preserves V5C127", () => {
  assert.equal(review.selectedScenario.customerPriceCents, 17990);
  assert.equal(review.selectedScenario.providerPercent, 70);
  assert.equal(review.selectedScenario.recommendedRadiusKm, 3);
  assert.equal(review.selectedScenario.acquisitionModel, "RECURRING_CUSTOMER");
  const daily = candidate.services.find(service => service.code === "V5C127");
  assert.equal(daily.proposedCustomerPriceCents, 24990);
  assert.equal(daily.manualApprovalRequired, true);
  assert.deepEqual(review.preservedV5C127Proposal, { serviceCode: "V5C127", proposedCustomerPriceCents: 24990, manualApprovalRequired: true });
});

test("preserves V4 and V5 release guards", () => {
  assert.equal(CATALOG_VERSION, "RMBH-2026-09-v4");
  assert.equal(catalog.length, 89);
  assert.equal(crypto.createHash("sha256").update(JSON.stringify(catalog)).digest("hex"), "c6ce4e88f0c1f8986dd6c0e4e299e9a167526712fddad34e47af983117eddb4d");
  assert.deepEqual([candidate.CANDIDATE_STATUS, candidate.approved, candidate.effectiveDate], ["DRAFT", false, null]);
});
