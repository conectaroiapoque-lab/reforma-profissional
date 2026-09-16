"use strict";

const candidate = require("../catalog-v5-candidate");
const { simulateService } = require("./pricing-v5-simulator");
const { risk } = require("./pricing-v5-economic-audit");

const PRICES = Object.freeze({ V5C126: [14990, 15990, 16990, 17990], V5C127: [22990, 23990, 24990, 25990, 26990, 27990] });
const PROVIDER_PERCENTAGES = Object.freeze([60, 65, 70]);
const RADII_KM = Object.freeze([3, 6, 10]);
const ACQUISITION_SCENARIOS = Object.freeze({ ONE_OFF: 1500, RECURRING_CUSTOMER: 300 });
const SERVICE_DEFINITIONS = Object.freeze({
  V5C126: { commercialLabel: "Diarista 4h", serviceMinutes: 240, presenceMinutes: 240, intervalMinutes: 0, mealEstimateCents: 0 },
  V5C127: { commercialLabel: "Diarista diária", serviceMinutes: 420, presenceMinutes: 480, intervalMinutes: 60, mealEstimateCents: 2500 }
});
const tierFor = percent => ({ 60: "STANDARD", 65: "TECHNICAL", 70: "SPECIALIST" })[percent];
const travelFor = radiusKm => radiusKm === 3 ? { minutes: 12, subsidyCents: 200 } : radiusKm === 6 ? { minutes: 20, subsidyCents: 350 } : { minutes: 30, subsidyCents: 500 };
function competitiveness(code, price) {
  if (code === "V5C126") return price <= 14990 ? "COMPETITIVE" : price <= 15990 ? "MARKET_ALIGNED" : "HIGH";
  return price <= 23990 ? "COMPETITIVE" : price <= 24990 ? "MARKET_ALIGNED" : price <= 26990 ? "HIGH" : "VERY_HIGH";
}
function coherentFloor(definition, travelMinutes) {
  // LOW (R$35/h) is the minimum sensitivity threshold, not an employment or production policy.
  return Math.ceil(3500 * (definition.presenceMinutes + travelMinutes) / 60);
}
function classifyRisk(service, snapshot, acquisitionScenario) {
  const base = risk(service, snapshot, { newCustomer: acquisitionScenario === "ONE_OFF", newProvider: true, materialPurchasedInApp: true });
  const valueProtection = 10; // garantia, suporte, pagamento, histórico, verificação e substituição
  const recurrenceReduction = acquisitionScenario === "RECURRING_CUSTOMER" ? 15 : 0;
  // Recurring in-home work retains at least MEDIUM direct-contracting risk even with platform value mechanisms.
  const score = Math.max(25, base.score - valueProtection - recurrenceReduction);
  return { score, classification: score >= 75 ? "CRITICAL" : score >= 50 ? "HIGH" : score >= 25 ? "MEDIUM" : "LOW" };
}
function scenario(service, price, providerPercent, radiusKm, acquisitionScenario) {
  const definition = SERVICE_DEFINITIONS[service.code];
  const travel = travelFor(radiusKm);
  const requiredFloor = coherentFloor(definition, travel.minutes);
  // Preserve the candidate floor; report the LOW target and a sustainable ceiling separately.
  const floor = service.providerMinimumPayoutCents;
  const maximumPayoutBeforeOperatingCostsCents = Math.floor(price * 0.75);
  const evaluated = { ...service, candidatePriceCents: price, recommendedTier: tierFor(providerPercent), providerMinimumPayoutCents: floor, estimatedServiceMinutes: definition.presenceMinutes };
  const snapshot = simulateService(evaluated, {
    customerAcquisitionCostCents: ACQUISITION_SCENARIOS[acquisitionScenario], estimatedTravelMinutes: travel.minutes,
    estimatedTravelDistanceKm: radiusKm, travelSubsidyCents: travel.subsidyCents, cashbackBasisPoints: 0
  });
  const providerTravelOperatingCostCents = radiusKm * 120;
  const providerNetAfterOperatingCostsCents = Math.max(0, snapshot.providerTotalReceivableCents - providerTravelOperatingCostCents - definition.mealEstimateCents);
  const providerGrossHourlyCents = Math.round(snapshot.providerTotalReceivableCents * 60 / (definition.presenceMinutes + travel.minutes));
  const providerNetHourlyCents = Math.round(providerNetAfterOperatingCostsCents * 60 / (definition.presenceMinutes + travel.minutes));
  const customerCompetitiveness = competitiveness(service.code, price);
  const providerAttractiveness = providerGrossHourlyCents >= 3500 && providerNetHourlyCents >= 3000 ? "ACCEPTABLE" : "BELOW_MINIMUM_SCENARIO";
  const platformViability = snapshot.contributionMarginCents >= 0 && snapshot.contributionMarginCents / price >= 0.05 ? "ACCEPTABLE" : "INADEQUATE";
  const riskResult = classifyRisk(evaluated, snapshot, acquisitionScenario);
  const ready = !["HIGH", "VERY_HIGH"].includes(customerCompetitiveness) && providerAttractiveness === "ACCEPTABLE" && platformViability === "ACCEPTABLE" && snapshot.contributionMarginCents >= 0;
  return {
    acquisitionScenario, customerPriceCents: price, providerPercent, providerCalculatedPayoutCents: snapshot.providerCalculatedPayoutCents,
    requiredProviderMinimumPayoutCents: requiredFloor, maximumPayoutBeforeOperatingCostsCents,
    providerMinimumPayoutCents: floor, providerFinalPayoutCents: snapshot.providerFinalPayoutCents,
    estimatedProviderGrossHourlyEarningCents: providerGrossHourlyCents, providerTravelOperatingCostCents,
    estimatedMealCents: definition.mealEstimateCents, providerOperationalCostEstimateCents: providerTravelOperatingCostCents + definition.mealEstimateCents,
    estimatedProviderNetAfterOperatingCostsCents: providerNetAfterOperatingCostsCents,
    estimatedProviderNetHourlyEarningCents: providerNetHourlyCents, serviceMinutes: definition.serviceMinutes,
    presenceMinutes: definition.presenceMinutes, intervalMinutes: definition.intervalMinutes, estimatedTravelMinutes: travel.minutes,
    recommendedRadiusKm: radiusKm, platformGrossRevenueCents: snapshot.platformGrossRevenueCents,
    taxEstimateCents: snapshot.taxEstimateCents, paymentFeeCents: snapshot.paymentFeeCents,
    customerAcquisitionCostCents: snapshot.customerAcquisitionCostCents, supportCostCents: snapshot.supportCostCents,
    warrantyReserveCents: snapshot.warrantyReserveCents, travelSubsidyCents: snapshot.travelSubsidyCents,
    cashbackCostCents: snapshot.cashbackCostCents, refundReserveCents: snapshot.refundReserveCents,
    contributionMarginCents: snapshot.contributionMarginCents, contributionMarginPercent: snapshot.contributionMarginPercent,
    contributionMarginPercentOfCustomerPrice: Math.round(snapshot.contributionMarginCents * 10000 / price) / 100,
    customerCompetitiveness, providerAttractiveness, platformViability,
    offPlatformRiskScore: riskResult.score, offPlatformRisk: riskResult.classification, readyForV5: ready
  };
}
function proposalFor(service, selected, reason) {
  return {
    currentCandidatePriceCents: service.candidatePriceCents, proposedCustomerPriceCents: selected.customerPriceCents,
    currentProviderPercent: 60, proposedProviderPercent: selected.providerPercent,
    providerMinimumPayoutCents: selected.providerMinimumPayoutCents, reason,
    differenceCents: selected.customerPriceCents - service.candidatePriceCents,
    differencePercent: Math.round((selected.customerPriceCents - service.candidatePriceCents) * 10000 / service.candidatePriceCents) / 100,
    manualApprovalRequired: true
  };
}
function reviewService(code) {
  const service = candidate.services.find(item => item.code === code);
  const scenarios = [];
  for (const price of PRICES[code]) for (const percent of PROVIDER_PERCENTAGES) for (const radius of RADII_KM) for (const acquisition of Object.keys(ACQUISITION_SCENARIOS)) scenarios.push(scenario(service, price, percent, radius, acquisition));
  const viable = scenarios.filter(item => item.readyForV5);
  const studyPrice = code === "V5C126" ? 15990 : service.proposedCustomerPriceCents;
  const selected = scenarios.find(item => item.customerPriceCents === studyPrice && item.providerPercent === 70 && item.recommendedRadiusKm === 3 && item.acquisitionScenario === "RECURRING_CUSTOMER");
  const manuallyEligible = selected.contributionMarginCents >= 0 && !["HIGH", "VERY_HIGH"].includes(selected.customerCompetitiveness) && selected.offPlatformRisk !== "CRITICAL";
  const cause = code === "V5C126"
    ? "O piso necessário para alcançar o cenário LOW comprime ou elimina a margem nos preços competitivos; preços que recuperam margem já são HIGH."
    : "Mesmo o maior preço e tier testados não financiam o piso LOW para oito horas de permanência; alimentação e deslocamento agravam o ganho líquido, mas não são a causa única.";
  return {
    serviceCode: code, serviceName: service.name, commercialDefinition: SERVICE_DEFINITIONS[code], currentCandidatePriceCents: service.candidatePriceCents,
    currentProviderPercent: 60, cause, scenarios, viableScenarioCount: viable.length,
    recommendation: manuallyEligible ? "READY_FOR_V5_WITH_MANUAL_APPROVAL" : "REVIEW_REQUIRED",
    proposal: proposalFor(service, selected, service.reason || `${cause} Melhor cenário relativo mantido apenas como proposta de estudo; nenhuma configuração será aplicada automaticamente.`),
    selectedScenario: selected,
    recommendedProviderPercent: 70, recommendedMaxRadiusKm: 3, recurringServiceEligible: true,
    providerHourlyReferenceStatus: selected.providerAttractiveness === "ACCEPTABLE" ? "MEETS_REFERENCE" : "BELOW_REFERENCE",
    financialViews: {
      customer: { serviceCode: code, serviceName: service.name, pricingMode: service.pricingMode, proposedCustomerPriceCents: selected.customerPriceCents },
      provider: { serviceCode: code, serviceName: service.name, providerFinalPayoutCents: selected.providerFinalPayoutCents, providerTotalReceivableCents: selected.providerFinalPayoutCents },
      platformAdmin: { serviceCode: code, proposedCustomerPriceCents: selected.customerPriceCents, providerPercent: selected.providerPercent, providerFinalPayoutCents: selected.providerFinalPayoutCents, platformGrossRevenueCents: selected.platformGrossRevenueCents, taxEstimateCents: selected.taxEstimateCents, paymentFeeCents: selected.paymentFeeCents, customerAcquisitionCostCents: selected.customerAcquisitionCostCents, supportCostCents: selected.supportCostCents, warrantyReserveCents: selected.warrantyReserveCents, travelSubsidyCents: selected.travelSubsidyCents, cashbackCostCents: selected.cashbackCostCents, refundReserveCents: selected.refundReserveCents, contributionMarginCents: selected.contributionMarginCents, contributionMarginPercent: selected.contributionMarginPercent }
    },
    platformValueMechanisms: ["GARANTIA", "SUPORTE", "PAGAMENTO_ORGANIZADO", "HISTORICO", "PROFISSIONAL_VERIFICADO", "SUBSTITUICAO", "RECORRENCIA_NA_PLATAFORMA"]
  };
}
function createDiaristaFinalReview() {
  const cases = [reviewService("V5C126"), reviewService("V5C127")];
  return {
    metadata: { candidateVersion: candidate.CANDIDATE_VERSION, status: candidate.CANDIDATE_STATUS, approved: candidate.approved, effectiveDate: candidate.effectiveDate, automaticChanges: false },
    cases,
    classificationBefore: { READY_FOR_V5: 74, READY_FOR_V5_WITH_MANUAL_APPROVAL: 2, READY_AS_QUOTE: 50, REVIEW_REQUIRED: 2 },
    classificationAfter: { READY_FOR_V5: 74, READY_FOR_V5_WITH_MANUAL_APPROVAL: 2 + cases.filter(item => item.recommendation.startsWith("READY")).length, READY_AS_QUOTE: 50, REVIEW_REQUIRED: cases.filter(item => item.recommendation === "REVIEW_REQUIRED").length },
    preservedRecommendations: { V5C001: "READY_FOR_V5_WITH_MANUAL_CONTROL_APPROVAL", V5C047: "REVIEW_REQUIRED_PENDING_MANUAL_SCOPE_AND_PRICE_APPROVAL" }
  };
}

module.exports = { PRICES, PROVIDER_PERCENTAGES, RADII_KM, ACQUISITION_SCENARIOS, SERVICE_DEFINITIONS, competitiveness, coherentFloor, scenario, reviewService, createDiaristaFinalReview };
