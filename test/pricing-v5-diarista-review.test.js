"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const candidate = require("../catalog-v5-candidate");
const { catalog, CATALOG_VERSION } = require("../catalog-v4");
const { createDiaristaFinalReview } = require("../simulation/pricing-v5-diarista-review");
const previousReview = require("../simulation/pricing-v5-final-review").createFinalReview();

const review = createDiaristaFinalReview();
const get = code => review.cases.find(item => item.serviceCode === code);

test("only diarista services are recomputed and release guards remain intact", () => {
  assert.deepEqual(review.cases.map(item => item.serviceCode), ["V5C126", "V5C127"]);
  assert.equal(CATALOG_VERSION, "RMBH-2026-09-v4");
  assert.equal(catalog.length, 89);
  assert.equal(crypto.createHash("sha256").update(JSON.stringify(catalog)).digest("hex"), "c6ce4e88f0c1f8986dd6c0e4e299e9a167526712fddad34e47af983117eddb4d");
  assert.deepEqual([candidate.CANDIDATE_STATUS, candidate.approved, candidate.effectiveDate], ["DRAFT", false, null]);
});

test("covers every requested price, percentage, radius and acquisition combination", () => {
  assert.equal(get("V5C126").scenarios.length, 4 * 3 * 3 * 2);
  assert.equal(get("V5C127").scenarios.length, 6 * 3 * 3 * 2);
  for (const item of review.cases) {
    assert.deepEqual([...new Set(item.scenarios.map(x => x.providerPercent))], [60, 65, 70]);
    assert.deepEqual([...new Set(item.scenarios.map(x => x.recommendedRadiusKm))], [3, 6, 10]);
    assert.deepEqual([...new Set(item.scenarios.map(x => x.acquisitionScenario))], ["ONE_OFF", "RECURRING_CUSTOMER"]);
  }
});

test("meal is separated once from provider net and never charged to platform margin", () => {
  for (const scenario of get("V5C127").scenarios) {
    assert.equal(scenario.estimatedMealCents, 2500);
    assert.equal(scenario.estimatedProviderNetAfterOperatingCostsCents, Math.max(0, scenario.providerFinalPayoutCents - scenario.providerTravelOperatingCostCents - 2500));
  }
  assert.ok(get("V5C126").scenarios.every(scenario => scenario.estimatedMealCents === 0));
});

test("recurrence lowers only simulated CAC and can improve margin", () => {
  const oneOff = get("V5C126").scenarios.find(x => x.customerPriceCents === 15990 && x.providerPercent === 65 && x.recommendedRadiusKm === 3 && x.acquisitionScenario === "ONE_OFF");
  const recurring = get("V5C126").scenarios.find(x => x.customerPriceCents === 15990 && x.providerPercent === 65 && x.recommendedRadiusKm === 3 && x.acquisitionScenario === "RECURRING_CUSTOMER");
  assert.equal(oneOff.customerAcquisitionCostCents - recurring.customerAcquisitionCostCents, 1200);
  assert.equal(recurring.contributionMarginCents - oneOff.contributionMarginCents, 1200);
  assert.equal(oneOff.providerFinalPayoutCents, recurring.providerFinalPayoutCents);
});

test("commercial decisions remain manual and expose the hourly reference", () => {
  for (const item of review.cases) {
    assert.equal(item.recommendation, "READY_FOR_V5_WITH_MANUAL_APPROVAL");
    assert.equal(item.viableScenarioCount, 0);
    assert.equal(item.proposal.manualApprovalRequired, true);
    assert.equal(item.providerHourlyReferenceStatus, "BELOW_REFERENCE");
    assert.equal(item.currentCandidatePriceCents, candidate.services.find(service => service.code === item.serviceCode).candidatePriceCents);
    assert.ok(item.scenarios.every(scenario => scenario.providerMinimumPayoutCents <= scenario.customerPriceCents));
    assert.ok(item.scenarios.every(scenario => scenario.platformGrossRevenueCents >= 0));
  }
  assert.deepEqual(review.classificationAfter, { READY_FOR_V5: 74, READY_FOR_V5_WITH_MANUAL_APPROVAL: 4, READY_AS_QUOTE: 50, REVIEW_REQUIRED: 0 });
});

test("daily candidate records the commercial proposal and segregated financial views", () => {
  const short = candidate.services.find(service => service.code === "V5C126");
  const source = candidate.services.find(service => service.code === "V5C127");
  const daily = get("V5C127");
  assert.deepEqual({ price: short.proposedCustomerPriceCents, percent: short.recommendedProviderPercent, radius: short.recommendedMaxRadiusKm, recurring: short.recurringServiceEligible, manual: short.manualApprovalRequired }, { price: 17990, percent: 70, radius: 3, recurring: true, manual: true });
  assert.equal(source.name, "Diarista diária");
  assert.equal(source.proposedCustomerPriceCents, 24990);
  assert.equal(source.manualApprovalRequired, true);
  assert.equal(source.recurringServiceEligible, true);
  assert.equal(daily.recommendedProviderPercent, 70);
  assert.equal(daily.recommendedMaxRadiusKm, 3);
  assert.deepEqual(Object.keys(daily.financialViews.customer), ["serviceCode", "serviceName", "pricingMode", "proposedCustomerPriceCents"]);
  assert.deepEqual(Object.keys(daily.financialViews.provider), ["serviceCode", "serviceName", "providerFinalPayoutCents", "providerTotalReceivableCents"]);
  assert.equal(daily.financialViews.customer.providerFinalPayoutCents, undefined);
  assert.equal(daily.financialViews.provider.proposedCustomerPriceCents, undefined);
});

test("QUOTE remains unpriced and V5 is absent from production build entries", () => {
  const fs = require("node:fs");
  assert.ok(candidate.services.filter(service => service.pricingMode === "QUOTE").every(service => service.candidatePriceCents === null && service.proposedCustomerPriceCents === undefined));
  const buildScript = fs.readFileSync(require.resolve("../scripts/build-web"), "utf8");
  assert.equal(buildScript.includes("catalog-v5-candidate"), false);
  assert.equal(buildScript.includes("pricing-v5"), false);
});

test("previous manual recommendations are preserved", () => {
  assert.equal(review.preservedRecommendations.V5C001, previousReview.cases.find(item => item.serviceCode === "V5C001").recommendation);
  assert.equal(review.preservedRecommendations.V5C047, previousReview.cases.find(item => item.serviceCode === "V5C047").recommendation);
});

test("final 128-service classification is exhaustive", () => {
  const classification = require("../simulation/pricing-v5-final-classification.json");
  assert.equal(classification.length, 128);
  const count = status => classification.filter(item => item.status === status).length;
  assert.deepEqual({ ready: count("READY_FOR_V5"), manual: count("READY_FOR_V5_WITH_MANUAL_APPROVAL"), quote: count("READY_AS_QUOTE"), review: count("REVIEW_REQUIRED") }, { ready: 74, manual: 4, quote: 50, review: 0 });
  assert.deepEqual(classification.filter(item => item.status === "REVIEW_REQUIRED"), []);
});
