"use strict";

const candidate = require("../catalog-v5-candidate");
const { simulateService } = require("./pricing-v5-simulator");

const PRICES_CENTS = Object.freeze([15990, 16990, 17990, 18990, 19990]);
const PROVIDER_PERCENTAGES = Object.freeze([60, 65, 70]);
const RADII_KM = Object.freeze([3, 6]);
const ACQUISITION = Object.freeze({ ONE_OFF: 1500, RECURRING_CUSTOMER: 300 });
const travelFor = radiusKm => radiusKm === 3 ? { minutes: 12, subsidyCents: 200 } : { minutes: 20, subsidyCents: 350 };
const tierFor = percent => ({ 60: "STANDARD", 65: "TECHNICAL", 70: "SPECIALIST" })[percent];
function competitiveness(price) {
  if (price <= 15990) return "COMPETITIVE";
  if (price <= 17990) return "MARKET_ALIGNED";
  return "HIGH";
}
function createScenario(service, customerPriceCents, providerPercent, radiusKm, acquisitionModel) {
  const travel = travelFor(radiusKm);
  const evaluated = {
    ...service, candidatePriceCents: customerPriceCents, recommendedTier: tierFor(providerPercent),
    // Do not let the generic candidate floor lift payout above the percentage under review.
    providerMinimumPayoutCents: 0, estimatedServiceMinutes: 240
  };
  const snapshot = simulateService(evaluated, {
    customerAcquisitionCostCents: ACQUISITION[acquisitionModel], estimatedTravelMinutes: travel.minutes,
    estimatedTravelDistanceKm: radiusKm, travelSubsidyCents: travel.subsidyCents, cashbackBasisPoints: 0
  });
  const estimatedProviderHourlyEarningCents = Math.round(snapshot.providerFinalPayoutCents * 60 / (240 + travel.minutes));
  const customerCompetitiveness = competitiveness(customerPriceCents);
  const providerAttractiveness = estimatedProviderHourlyEarningCents >= 3500 ? "ACCEPTABLE" : "BELOW_MINIMUM_SCENARIO";
  const contributionMarginPercent = Math.round(snapshot.contributionMarginCents * 10000 / customerPriceCents) / 100;
  const platformViability = snapshot.contributionMarginCents >= 0 && contributionMarginPercent >= 5 ? "ACCEPTABLE" : "INADEQUATE";
  const bypassRiskScore = Math.max(25, 50 + (providerAttractiveness === "ACCEPTABLE" ? -15 : 10) + (acquisitionModel === "RECURRING_CUSTOMER" ? -10 : 0) + (radiusKm === 3 ? -5 : 0));
  const bypassRisk = bypassRiskScore >= 75 ? "CRITICAL" : bypassRiskScore >= 50 ? "HIGH" : bypassRiskScore >= 25 ? "MEDIUM" : "LOW";
  const economicallyViableCashbackPercent = platformViability === "ACCEPTABLE" && snapshot.contributionMarginCents - Math.round(customerPriceCents * 0.02) > 0 ? 2 : 0;
  const ready = !["HIGH", "VERY_HIGH"].includes(customerCompetitiveness) && platformViability === "ACCEPTABLE" && bypassRisk !== "CRITICAL";
  return {
    customerPriceCents, providerPercent, providerFinalPayoutCents: snapshot.providerFinalPayoutCents,
    platformGrossRevenueCents: snapshot.platformGrossRevenueCents, taxEstimateCents: snapshot.taxEstimateCents,
    paymentFeeCents: snapshot.paymentFeeCents, customerAcquisitionCostCents: snapshot.customerAcquisitionCostCents,
    supportCostCents: snapshot.supportCostCents, warrantyReserveCents: snapshot.warrantyReserveCents,
    travelSubsidyCents: snapshot.travelSubsidyCents, cashbackCostCents: 0, refundReserveCents: snapshot.refundReserveCents,
    totalPlatformCostsCents: snapshot.variableCostsCents, contributionMarginCents: snapshot.contributionMarginCents,
    contributionMarginPercent, estimatedProviderHourlyEarningCents, estimatedTravelMinutes: travel.minutes,
    recommendedRadiusKm: radiusKm, acquisitionModel, recurringServiceEligible: true,
    competitiveness: customerCompetitiveness, providerAttractiveness,
    providerHourlyReferenceStatus: providerAttractiveness === "ACCEPTABLE" ? "MEETS_REFERENCE" : "BELOW_REFERENCE", platformViability,
    bypassRiskScore, bypassRisk, economicallyViableCashbackPercent,
    economicStatus: ready ? "READY_FOR_V5_WITH_MANUAL_APPROVAL" : "REVIEW_REQUIRED"
  };
}
function createDiarista4hReview() {
  const service = candidate.services.find(item => item.code === "V5C126");
  const scenarios = [];
  for (const price of PRICES_CENTS) for (const percent of PROVIDER_PERCENTAGES) for (const radius of RADII_KM) for (const acquisitionModel of Object.keys(ACQUISITION)) scenarios.push(createScenario(service, price, percent, radius, acquisitionModel));
  const selectedScenario = scenarios.find(item => item.customerPriceCents === 17990 && item.providerPercent === 70 && item.recommendedRadiusKm === 3 && item.acquisitionModel === "RECURRING_CUSTOMER");
  return Object.freeze({
    metadata: { candidateVersion: candidate.CANDIDATE_VERSION, status: candidate.CANDIDATE_STATUS, approved: candidate.approved, effectiveDate: candidate.effectiveDate, automaticChanges: false },
    serviceCode: service.code, serviceName: service.name, currentCandidatePriceCents: service.candidatePriceCents,
    testedPriceRangeCents: { minimum: 15000, maximum: 20000 }, scenarios, viableScenarioCount: scenarios.filter(item => item.economicStatus.startsWith("READY")).length,
    selectedScenario,
    proposal: { currentCandidatePriceCents: service.candidatePriceCents, proposedCustomerPriceCents: 17990, currentProviderPercent: 60, proposedProviderPercent: 70, reason: "Melhor equilíbrio relativo dentro da faixa: preço ainda alinhado ao mercado, margem positiva, raio curto e CAC recorrente; remuneração/hora permanece abaixo do mínimo simulado.", differenceCents: 5000, differencePercent: 38.49, manualApprovalRequired: true },
    finalStatus: "READY_FOR_V5_WITH_MANUAL_APPROVAL",
    auditObservation: "A remuneração estimada permanece abaixo da referência genérica de R$ 35/h; a decisão comercial permite aprovação manual porque margem, competitividade, risco e segregação atendem aos critérios finais.",
    preservedV5C127Proposal: { serviceCode: "V5C127", proposedCustomerPriceCents: 24990, manualApprovalRequired: true }
  });
}

module.exports = { PRICES_CENTS, PROVIDER_PERCENTAGES, RADII_KM, ACQUISITION, competitiveness, createScenario, createDiarista4hReview };
