"use strict";

const { catalog: v4Catalog } = require("../catalog");
const candidate = require("../catalog-v5-candidate");
const { haversineKm } = require("../services/geo-engine");
const simulator = require("./pricing-v5-simulator");

const PROVIDER_HOURLY_SCENARIOS = Object.freeze({ LOW: 3500, TARGET: 5000, PREMIUM: 7000 });
const MARGIN_SCENARIOS = Object.freeze({ MINIMUM: 500, TARGET: 1000, PREMIUM: 1500 });
const RADIUS_SCENARIOS = Object.freeze({ lowTicketKm: 6, mediumTicketKm: 10, highTicketKm: 18, quoteKm: 12 });
const CATEGORY_MAX_RADIUS_KM = Object.freeze(Object.fromEntries([...new Set(candidate.services.map(service => service.professional))].map(profession => [profession, 18])));
const CATEGORY_PROVIDER_TARGET_CENTS = Object.freeze(Object.fromEntries([...new Set(candidate.services.map(service => service.professional))].map(profession => [profession, PROVIDER_HOURLY_SCENARIOS.TARGET])));
const VISIT_CREDIT_CONDITION = "Crédito aplicado somente após aprovação e conclusão do serviço maior vinculado à visita; sujeito à aprovação administrativa.";
const MATERIAL_PROFESSIONS = /Encanador|Eletricista|Pedreiro|Ar-Condicionado|Gesseiro|Marceneiro|Vidraceiro|Esquadrias|Telhadista|Serralheiro|Casa Inteligente|Energia Fotovoltaica|Impermeabilizador/;
const COMBO_NAMES = /Quadro|Prateleira|Varal|Cortina|tomada|interruptor|Dobradiça|Pequeno reparo|Vedação\/silicone|Pacote até/iu;
const RECURRING_NAMES = /Manutenção|Limpeza|Diarista|Regulagem|Visita|Diagnóstico/iu;
const RETURN_NAMES = /Reparo|Manutenção|Vazamento|Infiltração|Diagnóstico/iu;

function normalize(value) { return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, ""); }
function v4Price(service) {
  const exact = v4Catalog.find(item => normalize(item.name) === normalize(service.name));
  return exact ? exact.customerPriceCents : null;
}
function unitRules(service) {
  if (service.unit !== "m2") return { minimumBillableQuantity: 1, minimumServiceTicketCents: 0 };
  if (/Cerâmica|Alvenaria/u.test(service.name)) return { minimumBillableQuantity: 4, minimumServiceTicketCents: service.candidatePriceCents * 4 };
  return { minimumBillableQuantity: 30, minimumServiceTicketCents: Math.max(39990, service.candidatePriceCents * 30) };
}
function recommendedRadius(price, pricingMode, radius = RADIUS_SCENARIOS, categoryMaximumKm = Infinity) {
  if (pricingMode === "QUOTE") return Math.min(radius.quoteKm, categoryMaximumKm);
  if (price <= 14990) return Math.min(radius.lowTicketKm, categoryMaximumKm);
  if (price < 50000) return Math.min(radius.mediumTicketKm, categoryMaximumKm);
  return Math.min(radius.highTicketKm, categoryMaximumKm);
}
function competitiveness(service, oldPrice, analysisPrice = service.candidatePriceCents) {
  if (service.pricingMode === "QUOTE") return "REVIEW_REQUIRED";
  if (oldPrice === null) return analysisPrice >= 60000 ? "HIGH" : "MARKET_ALIGNED";
  const ratio = analysisPrice / oldPrice;
  if (ratio <= 0.85) return "VERY_COMPETITIVE";
  if (ratio <= 0.97) return "COMPETITIVE";
  if (ratio <= 1.1) return "MARKET_ALIGNED";
  if (ratio <= 1.25) return "HIGH";
  return "VERY_HIGH";
}
function proposedPrice(service) {
  if (service.proposedCustomerPriceCents !== undefined) return service.proposedCustomerPriceCents;
  if (service.professional !== "Diarista") return null;
  if (service.code === "V5C126") return 15990;
  if (service.code === "V5C127") return service.proposedCustomerPriceCents || 24990;
  return null;
}
function cashbackRecommendation(service, snapshot) {
  for (const basisPoints of [...simulator.CASHBACK_SCENARIOS].reverse()) {
    const result = simulator.simulateService({ ...service, candidatePriceCents: snapshot.customerPriceCents }, { cashbackBasisPoints: basisPoints, customerAcquisitionCostCents: 500 });
    if (result.contributionMarginCents > 0 && !["LOW_MARGIN", "NEGATIVE"].includes(result.economicStatus)) return basisPoints / 100;
  }
  return 0;
}
function risk(service, snapshot, context = {}) {
  let score = 0;
  if (snapshot.estimatedProviderHourlyEarningCents < PROVIDER_HOURLY_SCENARIOS.TARGET) score += 25;
  if ((snapshot.customerPriceCents || 0) >= 50000) score += 10;
  if ((snapshot.platformGrossRevenueCents || 0) > (snapshot.providerFinalPayoutCents || 0) * 0.5) score += 15;
  if (RECURRING_NAMES.test(service.name)) score += 10;
  if (context.newCustomer !== false) score += 5;
  if (context.newProvider !== false) score += 5;
  if ((snapshot.estimatedTravelDistanceKm || 0) > 10) score += 10;
  if (RETURN_NAMES.test(service.name)) score += 10;
  if (MATERIAL_PROFESSIONS.test(service.professional) && !context.materialPurchasedInApp) score += 10;
  const classification = score >= 75 ? "CRITICAL" : score >= 50 ? "HIGH" : score >= 25 ? "MEDIUM" : "LOW";
  return { score: Math.min(score, 100), classification };
}
function priceProposal(service) {
  const proposedCustomerPriceCents = proposedPrice(service);
  if (proposedCustomerPriceCents === null) return null;
  const differenceCents = proposedCustomerPriceCents - service.candidatePriceCents;
  return { reason: "Último recurso após testar piso, raio, pacote e custos: o ticket atual não sustenta o cenário TARGET de ganho/hora; requer decisão humana.", oldCandidatePriceCents: service.candidatePriceCents, proposedCustomerPriceCents, differenceCents, differencePercent: Math.round(differenceCents * 10000 / service.candidatePriceCents) / 100, manualApprovalRequired: true };
}
function auditService(service, options = {}) {
  const rules = unitRules(service);
  const analysisUnitPrice = service.proposedCustomerPriceCents ?? service.candidatePriceCents;
  const billablePrice = analysisUnitPrice === null ? null : Math.max(analysisUnitPrice * rules.minimumBillableQuantity, rules.minimumServiceTicketCents);
  const providerHourlyTarget = options.providerHourlyByProfession?.[service.professional] ?? CATEGORY_PROVIDER_TARGET_CENTS[service.professional];
  const categoryMaximumKm = options.categoryRadiusKm?.[service.professional] ?? CATEGORY_MAX_RADIUS_KM[service.professional];
  const radius = service.recommendedMaxRadiusKm ?? recommendedRadius(billablePrice, service.pricingMode, options.radiusScenarios, categoryMaximumKm);
  // Demonstrates that the recommendation is consumed by the existing geo math, without changing dispatch.
  const auditLatitude = -19.92;
  const longitudeDelta = radius / (111 * Math.cos(auditLatitude * Math.PI / 180));
  const radiusValidationDistanceKm = haversineKm({ latitude: auditLatitude, longitude: -43.94 }, { latitude: auditLatitude, longitude: -43.94 + longitudeDelta });
  const adjustedTravelMinutes = service.recommendedMaxRadiusKm === 3 ? 12 : service.candidatePriceCents !== null && service.candidatePriceCents <= 14990 ? 15 : service.estimatedTravelMinutes;
  const proposedTier = service.recommendedProviderPercent === 70 ? "SPECIALIST" : service.recommendedProviderPercent === 65 ? "TECHNICAL" : service.recommendedTier;
  const auditedService = { ...service, candidatePriceCents: billablePrice, recommendedTier: proposedTier, estimatedTravelMinutes: adjustedTravelMinutes, estimatedTravelDistanceKm: Math.min(service.estimatedTravelDistanceKm, radius) };
  let snapshot = simulator.simulateService(auditedService, { customerAcquisitionCostCents: 500, minimumProviderHourlyEarningCents: providerHourlyTarget });
  const proposedMinimumPayout = !service.manualApprovalRequired && snapshot.pricingMode !== "QUOTE" && snapshot.estimatedProviderHourlyEarningCents < providerHourlyTarget
    ? Math.min(billablePrice, Math.ceil(providerHourlyTarget * (service.estimatedServiceMinutes + adjustedTravelMinutes) / 60)) : service.providerMinimumPayoutCents;
  if (proposedMinimumPayout > service.providerMinimumPayoutCents) snapshot = simulator.simulateService({ ...auditedService, providerMinimumPayoutCents: proposedMinimumPayout }, { customerAcquisitionCostCents: 500 });
  const oldPrice = v4Price(service);
  const customerPriceCompetitiveness = competitiveness(service, oldPrice, billablePrice);
  const riskResult = risk(service, snapshot, options.riskContext);
  const proposal = priceProposal(service);
  const isQuote = service.pricingMode === "QUOTE";
  const targetReached = isQuote || snapshot.estimatedProviderHourlyEarningCents >= providerHourlyTarget;
  const ready = !isQuote && !["HIGH", "VERY_HIGH", "REVIEW_REQUIRED"].includes(customerPriceCompetitiveness) && targetReached && snapshot.economicStatus !== "NEGATIVE" && riskResult.classification !== "CRITICAL";
  const manualReady = service.manualApprovalRequired && snapshot.contributionMarginCents >= 0 && !["HIGH", "VERY_HIGH"].includes(customerPriceCompetitiveness) && riskResult.classification !== "CRITICAL";
  const recommendedAction = isQuote ? "READY_AS_QUOTE" : manualReady ? "READY_FOR_V5_WITH_MANUAL_APPROVAL" : ready ? "READY_FOR_V5" : "REVIEW_REQUIRED";
  const creditableVisit = service.creditableVisit || /Visita|Diagnóstico/iu.test(service.name) && /Gesseiro|Impermeabilizador/u.test(service.professional);
  const partnerPotential = MATERIAL_PROFESSIONS.test(service.professional);
  const materialComparisons = partnerPotential ? Object.fromEntries(Object.entries(simulator.MATERIAL_SCENARIOS).map(([name, scenario]) => [name, simulator.simulateService(auditedService, { customerAcquisitionCostCents: 500, materialScenario: scenario }).contributionMarginCents])) : null;
  return {
    serviceCode: service.code, profession: service.professional, serviceName: service.name, pricingMode: service.pricingMode,
    v4PriceCents: oldPrice, currentCandidatePriceCents: service.candidatePriceCents, proposedCustomerPriceCents: proposal?.proposedCustomerPriceCents ?? null, priceProposal: proposal,
    providerTier: snapshot.providerTier ?? service.recommendedTier, providerPercent: snapshot.providerPercent ?? null, providerMinimumPayoutCents: proposedMinimumPayout,
    providerCalculatedPayoutCents: snapshot.providerCalculatedPayoutCents ?? null, providerFinalPayoutCents: snapshot.providerFinalPayoutCents ?? null,
    travelBonusCents: snapshot.travelBonusCents ?? 0, urgencyBonusCents: snapshot.urgencyBonusCents ?? 0, scarcityBonusCents: snapshot.scarcityBonusCents ?? 0, providerTotalReceivableCents: snapshot.providerTotalReceivableCents ?? null,
    estimatedServiceMinutes: service.estimatedServiceMinutes, estimatedTravelMinutes: adjustedTravelMinutes, estimatedTravelDistanceKm: auditedService.estimatedTravelDistanceKm,
    estimatedProviderHourlyEarningCents: snapshot.estimatedProviderHourlyEarningCents ?? null, minimumProviderHourlyEarningScenario: "TARGET", minimumProviderHourlyEarningCents: providerHourlyTarget,
    platformGrossRevenueCents: snapshot.platformGrossRevenueCents ?? null, taxEstimateCents: snapshot.taxEstimateCents ?? null, paymentFeeCents: snapshot.paymentFeeCents ?? null,
    CAC: snapshot.customerAcquisitionCostCents ?? null, supportCostCents: snapshot.supportCostCents ?? null, warrantyReserveCents: snapshot.warrantyReserveCents ?? null,
    cashbackCostCents: snapshot.cashbackCostCents ?? null, travelSubsidyCents: snapshot.travelSubsidyCents ?? null, refundReserveCents: snapshot.refundReserveCents ?? null,
    otherVariableCostsCents: snapshot.otherVariableCostsCents ?? null, materialPartnerRevenueCents: snapshot.materialPartnerRevenueCents ?? null,
    contributionMarginCents: snapshot.contributionMarginCents ?? null, contributionMarginPercent: snapshot.contributionMarginPercent ?? null,
    minimumBillableQuantity: rules.minimumBillableQuantity, minimumServiceTicketCents: rules.minimumServiceTicketCents, simulatedBillablePriceCents: billablePrice,
    recommendedMaxRadiusKm: radius, radiusValidationDistanceKm: Math.round(radiusValidationDistanceKm * 100) / 100,
    visitFeeCents: creditableVisit ? service.candidatePriceCents : 0, visitCreditCents: creditableVisit ? service.candidatePriceCents : 0,
    visitCreditCondition: creditableVisit ? VISIT_CREDIT_CONDITION : null, COMBO_RECOMMENDED: COMBO_NAMES.test(service.name),
    recommendedCashbackPercent: isQuote ? 0 : cashbackRecommendation({ ...auditedService, providerMinimumPayoutCents: proposedMinimumPayout }, snapshot), materialPartnerRecommended: partnerPotential,
    materialScenarioContributionMarginsCents: materialComparisons,
    cashbackScenarioContributionMarginsCents: isQuote ? null : Object.fromEntries(simulator.CASHBACK_SCENARIOS.map(basisPoints => [`${basisPoints / 100}%`, simulator.simulateService({ ...auditedService, providerMinimumPayoutCents: proposedMinimumPayout }, { customerAcquisitionCostCents: 500, cashbackBasisPoints: basisPoints }).contributionMarginCents])),
    customerPriceCompetitiveness, scopeDefined: Boolean(service.name), fiscalConflict: false,
    providerAttractivenessStatus: isQuote ? "REVIEW_REQUIRED" : targetReached ? "TARGET_MET" : "BELOW_TARGET",
    providerHourlyReferenceStatus: isQuote ? "NOT_APPLICABLE" : targetReached ? "MEETS_REFERENCE" : "BELOW_REFERENCE",
    offPlatformRiskScore: riskResult.score, offPlatformRiskClassification: riskResult.classification,
    financialEconomicStatus: snapshot.economicStatus, economicStatus: recommendedAction, recommendedAction, manualApprovalRequired: proposal !== null,
    marginScenarioBasisPoints: MARGIN_SCENARIOS
  };
}
function createEconomicAudit(options = {}) { return candidate.services.map(service => auditService(service, options)); }

module.exports = { PROVIDER_HOURLY_SCENARIOS, MARGIN_SCENARIOS, RADIUS_SCENARIOS, CATEGORY_MAX_RADIUS_KM, CATEGORY_PROVIDER_TARGET_CENTS, VISIT_CREDIT_CONDITION, unitRules, recommendedRadius, risk, auditService, createEconomicAudit };
