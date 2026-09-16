"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const candidate = require("../catalog-v5-candidate");
const { catalog } = require("../catalog");
const { createFinalReview } = require("../simulation/pricing-v5-final-review");

const review = createFinalReview();
const get = code => review.cases.find(item => item.serviceCode === code);

test("reviews only the four requested cases and preserves release guards", () => {
  assert.deepEqual(review.cases.map(item => item.serviceCode), ["V5C001", "V5C047", "V5C126", "V5C127"]);
  assert.equal(review.metadata.candidateStatus, "DRAFT");
  assert.equal(review.metadata.approved, false);
  assert.equal(review.metadata.automaticPriceChanges, false);
  assert.equal(catalog.length, 89);
  assert.equal(crypto.createHash("sha256").update(JSON.stringify(catalog)).digest("hex"), "c6ce4e88f0c1f8986dd6c0e4e299e9a167526712fddad34e47af983117eddb4d");
});

test("split compares all prices under two explicitly separated scopes", () => {
  const split = get("V5C047");
  assert.equal(split.alternatives.length, 8);
  assert.deepEqual([...new Set(split.alternatives.map(item => item.testedCustomerPriceCents))], [54990, 59990, 62990, 64990]);
  assert.deepEqual([...new Set(split.alternatives.map(item => item.scopeScenario))], ["A_LABOR_ONLY", "B_LABOR_PLUS_BASIC_KIT"]);
  assert.ok(split.alternatives.filter(item => item.scopeScenario === "A_LABOR_ONLY").every(item => item.materialsIncluded === false && /não incluídos/u.test(item.scope)));
});

test("diarista alternatives are complete and remain manual-only", () => {
  assert.deepEqual(get("V5C126").alternatives.map(item => item.testedCustomerPriceCents), [15990, 16990, 17990, 18990, 19990]);
  assert.deepEqual(get("V5C127").alternatives.map(item => item.testedCustomerPriceCents), [21990, 22990, 23990, 24990, 25990]);
  assert.equal(get("V5C126").recommendation, "READY_FOR_V5_WITH_MANUAL_APPROVAL");
  assert.equal(get("V5C127").recommendation, "READY_FOR_V5_WITH_MANUAL_APPROVAL");
  assert.equal(get("V5C126").providerHourlyReferenceStatus, "BELOW_REFERENCE");
  assert.equal(get("V5C127").providerHourlyReferenceStatus, "BELOW_REFERENCE");
  assert.ok(get("V5C127").alternatives.every(item => item.costs.estimatedMealAllowanceCents === 2500));
});

test("hydraulic visit prioritizes partial credit and nearby provider without price increase", () => {
  const visit = get("V5C001");
  assert.equal(visit.alternatives.length, 4);
  assert.equal(visit.bestEconomicPriceCents, 9990);
  assert.equal(visit.selectedControls.visitCreditCents, 5000);
  assert.equal(visit.selectedControls.recommendedMaxRadiusKm, 6);
  assert.equal(visit.selectedOutcome.offPlatformRiskClassification, "MEDIUM");
  assert.ok(visit.selectedOutcome.estimatedProviderHourlyEarningCents > visit.alternatives[0].estimatedProviderHourlyEarningCents);
  assert.equal(visit.priceProposal.differenceCents, 0);
});

test("every recommendation is manual-only and candidate prices never mutate", () => {
  for (const item of review.cases) {
    const source = candidate.services.find(service => service.code === item.serviceCode);
    assert.equal(source.candidatePriceCents, item.currentCandidatePriceCents);
    assert.equal(item.priceProposal.currentCandidatePriceCents, source.candidatePriceCents);
    assert.equal(item.priceProposal.manualApprovalRequired, true);
    assert.equal(item.priceProposal.differenceCents, item.priceProposal.proposedCustomerPriceCents - source.candidatePriceCents);
    assert.ok(item.priceProposal.reason);
  }
});

test("post-review classification reflects final manual decisions", () => {
  assert.deepEqual(review.classificationBefore, { READY_FOR_V5: 75, READY_AS_QUOTE: 50, REVIEW_REQUIRED: 3 });
  assert.deepEqual(review.classificationAfter, { READY_FOR_V5: 74, READY_FOR_V5_WITH_MANUAL_APPROVAL: 4, READY_AS_QUOTE: 50, REVIEW_REQUIRED: 0 });
  assert.deepEqual(review.unresolvedCodes, []);
});
