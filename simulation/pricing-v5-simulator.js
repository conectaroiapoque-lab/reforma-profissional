"use strict";

const { createFinancialSnapshot, deepFreeze } = require("../domain/financial-engine");
const candidate = require("../catalog-v5-candidate");

const TAX_SCENARIOS = deepFreeze({ CENARIO_A: 0, CENARIO_B: 600, CENARIO_C: 1000 });
const TAX_BASES = deepFreeze(["PLATFORM_REVENUE_ONLY", "GROSS_TRANSACTION_VALUE"]);
// Values are scenario inputs only. They are not claims about actual acquisition costs.
const CAC_SCENARIOS = deepFreeze({ organic: 0, referral: 500, returning_customer: 200, google_ads: 2500, meta_ads: 2000, partner: 1000 });
const CASHBACK_SCENARIOS = deepFreeze([0, 200, 300, 500]);
const MATERIAL_SCENARIOS = deepFreeze({
  none: { partnerRetailPriceCents: 0, partnerAppPriceCents: 0, partnerCommissionCents: 0, partnerRebateCents: 0, customerCashbackCents: 0, platformMaterialRevenueCents: 0 },
  moderate: { partnerRetailPriceCents: 20000, partnerAppPriceCents: 19000, partnerCommissionCents: 1500, partnerRebateCents: 500, customerCashbackCents: 500, platformMaterialRevenueCents: 1000 },
  strong: { partnerRetailPriceCents: 50000, partnerAppPriceCents: 45000, partnerCommissionCents: 5000, partnerRebateCents: 1500, customerCashbackCents: 1000, platformMaterialRevenueCents: 3500 }
});

function simulateService(service, options = {}) {
  if (service.candidatePriceCents === null) return deepFreeze({ serviceCode: service.code, pricingMode: "QUOTE", economicStatus: "REVIEW_REQUIRED", providerAttractivenessStatus: "REVIEW_REQUIRED", recommendation: "OBTAIN_QUOTE" });
  const taxRateBasisPoints = options.taxRateBasisPoints ?? TAX_SCENARIOS.CENARIO_B;
  const cashbackBasisPoints = options.cashbackBasisPoints ?? 0;
  const cac = options.customerAcquisitionCostCents ?? CAC_SCENARIOS.organic;
  const material = options.materialScenario || MATERIAL_SCENARIOS.none;
  const price = service.candidatePriceCents;
  const snapshot = createFinancialSnapshot({
    catalogVersion: candidate.CANDIDATE_VERSION, pricingPolicyVersion: "v5-simulation-policy-v1", serviceCode: service.code,
    serviceName: service.name, category: service.professional, pricingMode: service.pricingMode, customerPriceCents: price,
    providerTier: service.recommendedTier, providerMinimumPayoutCents: service.providerMinimumPayoutCents,
    estimatedServiceMinutes: service.estimatedServiceMinutes, estimatedTravelMinutes: options.estimatedTravelMinutes ?? service.estimatedTravelMinutes,
    estimatedTravelDistanceKm: options.estimatedTravelDistanceKm ?? service.estimatedTravelDistanceKm, minimumProviderHourlyEarningCents: options.minimumProviderHourlyEarningCents ?? 4500,
    taxProfile: { taxProfileId: "V5-SENSITIVITY", taxRegime: "OUTRO", taxBaseType: options.taxBaseType || TAX_BASES[0], taxRateBasisPoints, effectiveFrom: "SIMULATION_ONLY", source: "scenario", approvedBy: "NOT_APPLICABLE", approvedAt: "SIMULATION_ONLY", version: "1" },
    paymentFeeCents: options.paymentFeeCents ?? Math.round(price * 299 / 10000), customerAcquisitionCostCents: cac,
    supportCostCents: options.supportCostCents ?? 300, warrantyReserveCents: options.warrantyReserveCents ?? Math.round(price * 200 / 10000),
    travelSubsidyCents: options.travelSubsidyCents ?? 500, cashbackCostCents: Math.round(price * cashbackBasisPoints / 10000),
    refundReserveCents: options.refundReserveCents ?? Math.round(price * 100 / 10000), otherVariableCostsCents: options.otherVariableCostsCents ?? 0,
    materialPartnerRevenueCents: material.platformMaterialRevenueCents || 0,
    financialRules: { targetContributionMarginCents: 1500, minimumMarginAfterPayoutFloorCents: 500 }, platformMinimumContributionCents: 1500,
    createdAt: "2026-09-16T00:00:00.000Z"
  });
  const hourlyLow = snapshot.providerStatus === "UNATTRACTIVE";
  const economicStatus = hourlyLow ? "REVIEW_REQUIRED" : snapshot.economicStatus;
  const priceHigh = price >= 60000;
  const payoutLow = snapshot.estimatedProviderHourlyEarningCents < 4500;
  const providerAttractivenessStatus = economicStatus === "REVIEW_REQUIRED" ? "REVIEW_REQUIRED" : payoutLow ? "PROVIDER_PAYOUT_LOW" : priceHigh ? "CUSTOMER_PRICE_HIGH" : economicStatus === "HEALTHY" ? "BALANCED" : "CUSTOMER_PRICE_COMPETITIVE";
  return deepFreeze({ ...snapshot, economicStatus, providerAttractivenessStatus, recommendation: economicStatus === "HEALTHY" ? "KEEP_CANDIDATE" : "MANUAL_REVIEW", materialScenario: { ...material } });
}

function simulateCatalog(options) { return candidate.services.map(service => ({ service, result: simulateService(service, options) })); }
module.exports = deepFreeze({ TAX_SCENARIOS, TAX_BASES, CAC_SCENARIOS, CASHBACK_SCENARIOS, MATERIAL_SCENARIOS, simulateService, simulateCatalog });
