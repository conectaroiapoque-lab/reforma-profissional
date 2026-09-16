"use strict";

const candidate = require("../catalog-v5-candidate");
const { simulateService } = require("./pricing-v5-simulator");
const { risk } = require("./pricing-v5-economic-audit");

const REVIEW_CODES = Object.freeze(["V5C001", "V5C047", "V5C126", "V5C127"]);
const byCode = code => candidate.services.find(service => service.code === code);
const proposal = (service, proposedCustomerPriceCents, reason) => Object.freeze({
  currentCandidatePriceCents: service.candidatePriceCents,
  proposedCustomerPriceCents,
  reason,
  differenceCents: proposedCustomerPriceCents - service.candidatePriceCents,
  differencePercent: Math.round((proposedCustomerPriceCents - service.candidatePriceCents) * 10000 / service.candidatePriceCents) / 100,
  manualApprovalRequired: true
});
function costBreakdown(snapshot, estimatedMealAllowanceCents = 0) {
  return {
    taxEstimateCents: snapshot.taxEstimateCents, paymentFeeCents: snapshot.paymentFeeCents,
    customerAcquisitionCostCents: snapshot.customerAcquisitionCostCents, supportCostCents: snapshot.supportCostCents,
    warrantyReserveCents: snapshot.warrantyReserveCents, travelSubsidyCents: snapshot.travelSubsidyCents,
    cashbackCostCents: snapshot.cashbackCostCents, refundReserveCents: snapshot.refundReserveCents,
    otherVariableCostsCents: snapshot.otherVariableCostsCents, estimatedMealAllowanceCents,
    totalPlatformCostsCents: snapshot.variableCostsCents
  };
}
function commonResult(service, price, options = {}) {
  const evaluated = { ...service, candidatePriceCents: price };
  const snapshot = simulateService(evaluated, {
    customerAcquisitionCostCents: 500, cashbackBasisPoints: options.cashbackBasisPoints || 0,
    estimatedTravelMinutes: options.estimatedTravelMinutes ?? service.estimatedTravelMinutes,
    estimatedTravelDistanceKm: options.estimatedTravelDistanceKm ?? service.estimatedTravelDistanceKm,
    otherVariableCostsCents: options.otherVariableCostsCents || 0
  });
  const riskResult = risk(evaluated, snapshot, { newCustomer: true, newProvider: true, materialPurchasedInApp: options.materialPurchasedInApp === true });
  const meal = options.estimatedMealAllowanceCents || 0;
  const netHourly = Math.round(Math.max(0, snapshot.providerTotalReceivableCents - meal) * 60 / (service.estimatedServiceMinutes + (options.estimatedTravelMinutes ?? service.estimatedTravelMinutes)));
  return {
    testedCustomerPriceCents: price, providerFinalPayoutCents: snapshot.providerFinalPayoutCents,
    providerTotalReceivableCents: snapshot.providerTotalReceivableCents,
    estimatedProviderHourlyEarningCents: snapshot.estimatedProviderHourlyEarningCents,
    estimatedProviderNetHourlyAfterMealCents: netHourly,
    platformGrossRevenueCents: snapshot.platformGrossRevenueCents, costs: costBreakdown(snapshot, meal),
    contributionMarginCents: snapshot.contributionMarginCents, contributionMarginPercent: snapshot.contributionMarginPercent,
    offPlatformRiskScore: riskResult.score, offPlatformRiskClassification: riskResult.classification
  };
}
function splitCompetitiveness(price, includesKit) {
  if (includesKit) return price <= 62990 ? "COMPETITIVE" : "MARKET_ALIGNED";
  if (price <= 54990) return "VERY_COMPETITIVE";
  if (price <= 59990) return "COMPETITIVE";
  if (price <= 62990) return "MARKET_ALIGNED";
  return "HIGH";
}
function splitReview() {
  const service = byCode("V5C047");
  const prices = [54990, 59990, 62990, 64990];
  const scopes = [
    { id: "A_LABOR_ONLY", label: "Mão de obra apenas", includesKit: false, materialCostCents: 0, scope: "Instalação padrão, suporte, perfuração, teste, vácuo e acabamento básico. Tubulação, cabos, dreno, suporte físico e demais materiais não incluídos." },
    { id: "B_LABOR_PLUS_BASIC_KIT", label: "Mão de obra + kit básico", includesKit: true, materialCostCents: 12000, scope: "Mesmo escopo de mão de obra, com kit básico candidato de instalação. Limite de tubulação e composição do kit exigem definição comercial antes da aprovação." }
  ];
  const alternatives = scopes.flatMap(scope => prices.map(price => ({
    scopeScenario: scope.id, scopeLabel: scope.label, materialsIncluded: scope.includesKit,
    materialCostScenarioCents: scope.materialCostCents, scope: scope.scope,
    customerPriceCompetitiveness: splitCompetitiveness(price, scope.includesKit),
    ...commonResult(service, price, { otherVariableCostsCents: scope.materialCostCents, materialPurchasedInApp: scope.includesKit })
  })));
  return {
    serviceCode: service.code, serviceName: service.name, currentCandidatePriceCents: service.candidatePriceCents,
    alternatives, selectedScenario: "A_LABOR_ONLY", bestEconomicPriceCents: 59990,
    priceProposal: proposal(service, 59990, "Equilibra competitividade e margem no cenário de mão de obra apenas; materiais permanecem expressamente excluídos."),
    recommendation: "REVIEW_REQUIRED_PENDING_MANUAL_SCOPE_AND_PRICE_APPROVAL"
  };
}
function diaristaCompetitiveness(hours, price) {
  if (hours === 4) return price <= 13990 ? "VERY_COMPETITIVE" : price <= 14990 ? "COMPETITIVE" : price <= 15990 ? "MARKET_ALIGNED" : "HIGH";
  return price <= 21990 ? "COMPETITIVE" : price <= 23990 ? "MARKET_ALIGNED" : price <= 24990 ? "HIGH" : "VERY_HIGH";
}
function diaristaReview(code, prices, selectedPrice, hours) {
  const service = byCode(code);
  const meal = hours === 8 ? 2500 : 0;
  const alternatives = prices.map(price => ({
    customerPriceCompetitiveness: diaristaCompetitiveness(hours, price),
    possibleCashbackPercent: commonResult(service, price, { estimatedMealAllowanceCents: meal }).contributionMarginCents > price * 0.05 ? 2 : 0,
    ...commonResult(service, price, { estimatedMealAllowanceCents: meal })
  }));
  return {
    serviceCode: service.code, serviceName: service.name, currentCandidatePriceCents: service.candidatePriceCents,
    alternatives, bestEconomicPriceCents: selectedPrice,
    priceProposal: proposal(service, selectedPrice, "Melhor compromisso testado entre preço psicológico, contribuição e remuneração; ganho/hora ainda exige validação operacional e aprovação humana."),
    providerHourlyReferenceStatus: "BELOW_REFERENCE",
    recommendation: "READY_FOR_V5_WITH_MANUAL_APPROVAL"
  };
}
function hydraulicVisitReview() {
  const service = byCode("V5C001");
  const definitions = [
    { id: "A_FULL_CREDIT", price: 9990, credit: 9990, radius: 10, travel: 25, conversion: "HIGH", riskReduction: 20 },
    { id: "B_PARTIAL_CREDIT", price: 9990, credit: 5000, radius: 10, travel: 25, conversion: "MEDIUM_HIGH", riskReduction: 15 },
    { id: "C_HIGHER_FULL_CREDIT", price: 11990, credit: 11990, radius: 10, travel: 25, conversion: "MEDIUM", riskReduction: 15 },
    { id: "D_NEARBY_PROVIDER", price: 9990, credit: 0, radius: 6, travel: 15, conversion: "MEDIUM", riskReduction: 10 }
  ];
  const alternatives = definitions.map(item => {
    const result = commonResult(service, item.price, { estimatedTravelMinutes: item.travel, estimatedTravelDistanceKm: item.radius });
    const score = Math.max(0, result.offPlatformRiskScore - item.riskReduction);
    return { scenario: item.id, visitCreditCents: item.credit, recommendedMaxRadiusKm: item.radius, probableConversion: item.conversion, ...result, offPlatformRiskScore: score, offPlatformRiskClassification: score >= 75 ? "CRITICAL" : score >= 50 ? "HIGH" : score >= 25 ? "MEDIUM" : "LOW", customerPriceCompetitiveness: item.price === 9990 ? "COMPETITIVE" : "MARKET_ALIGNED" };
  });
  const combined = commonResult(service, 9990, { estimatedTravelMinutes: 15, estimatedTravelDistanceKm: 6 });
  const combinedRiskScore = Math.max(0, combined.offPlatformRiskScore - 15);
  return {
    serviceCode: service.code, serviceName: service.name, currentCandidatePriceCents: service.candidatePriceCents,
    alternatives, selectedScenario: "B_PARTIAL_CREDIT_PLUS_D_NEARBY_PROVIDER", bestEconomicPriceCents: 9990,
    priceProposal: proposal(service, 9990, "Manter preço e combinar crédito parcial de R$ 50,00 com raio de 6 km antes de considerar aumento."),
    selectedControls: { visitFeeCents: 9990, visitCreditCents: 5000, recommendedMaxRadiusKm: 6, visitCreditCondition: "Crédito após aprovação e conclusão do serviço maior vinculado." },
    selectedOutcome: { ...combined, customerPriceCompetitiveness: "COMPETITIVE", offPlatformRiskScore: combinedRiskScore, offPlatformRiskClassification: combinedRiskScore >= 50 ? "HIGH" : combinedRiskScore >= 25 ? "MEDIUM" : "LOW" },
    recommendation: "READY_FOR_V5_WITH_MANUAL_CONTROL_APPROVAL"
  };
}
function createFinalReview() {
  return Object.freeze({
    metadata: { candidateVersion: candidate.CANDIDATE_VERSION, candidateStatus: candidate.CANDIDATE_STATUS, approved: candidate.approved, automaticPriceChanges: false },
    cases: Object.freeze([hydraulicVisitReview(), splitReview(), diaristaReview("V5C126", [15990, 16990, 17990, 18990, 19990], 17990, 4), diaristaReview("V5C127", [21990, 22990, 23990, 24990, 25990], 24990, 8)]),
    classificationBefore: { READY_FOR_V5: 75, READY_AS_QUOTE: 50, REVIEW_REQUIRED: 3 },
    classificationAfter: { READY_FOR_V5: 74, READY_FOR_V5_WITH_MANUAL_APPROVAL: 4, READY_AS_QUOTE: 50, REVIEW_REQUIRED: 0 },
    unresolvedCodes: []
  });
}

module.exports = { REVIEW_CODES, proposal, commonResult, splitCompetitiveness, diaristaCompetitiveness, createFinalReview };
