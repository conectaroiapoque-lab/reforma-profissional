"use strict";

const { CATALOG_VERSION, getServiceByCode } = require("../catalog");

const TIERS = Object.freeze({ STANDARD: 60, TECHNICAL: 65, SPECIALIST: 70 });
const ADJUSTMENTS = Object.freeze([
  "KEEP", "LOWER_CUSTOMER_PRICE", "RAISE_CUSTOMER_PRICE", "RAISE_PROVIDER_PAYOUT",
  "ADD_TRAVEL_BONUS", "ADD_SCARCITY_BONUS", "REQUIRES_MANUAL_REVIEW"
]);
const ATTRACTIVENESS_ACTIONS = Object.freeze([
  "NEAREST_PROVIDER", "GROUP_SMALL_SERVICES", "TRAVEL_BONUS", "URGENCY_BONUS",
  "PLATFORM_SUBSIDY", "ADMIN_TIER_CHANGE", "SPECIAL_QUOTE"
]);

function cents(value) {
  if (!Number.isInteger(value) || value < 0) throw new TypeError("Valores devem ser centavos inteiros não negativos.");
  return value;
}

function createPricingSnapshot(input) {
  const customerPriceCents = cents(input.customerPriceCents);
  const percent = input.providerPercent ?? TIERS[input.tier || "STANDARD"];
  if (percent > 70) throw new Error("Participação acima de 70% exige aprovação Admin e não pode ser aplicada automaticamente.");
  if (percent < 0 || percent > 100) throw new RangeError("Percentual inválido.");

  const providerPayoutCents = Math.round(customerPriceCents * percent / 100);
  const travelBonusCents = cents(input.travelBonusCents || 0);
  const urgencyBonusCents = cents(input.urgencyBonusCents || 0);
  const scarcityBonusCents = cents(input.scarcityBonusCents || 0);
  const providerTotalPayoutCents = providerPayoutCents + travelBonusCents + urgencyBonusCents + scarcityBonusCents;
  const estimatedServiceMinutes = cents(input.estimatedServiceMinutes || 0);
  const estimatedTravelMinutes = cents(input.estimatedTravelMinutes || 0);
  const totalMinutes = estimatedServiceMinutes + estimatedTravelMinutes;
  const estimatedProviderHourlyEarningCents = totalMinutes ? Math.round(providerTotalPayoutCents * 60 / totalMinutes) : 0;
  const minimumProviderHourlyEarningCents = cents(input.minimumProviderHourlyEarningCents || 0);
  const providerStatus = estimatedProviderHourlyEarningCents < minimumProviderHourlyEarningCents ? "UNATTRACTIVE" : "ATTRACTIVE";

  const costFields = ["cacCents", "paymentFeesCents", "taxesCents", "supportCostCents", "warrantyReserveCents", "travelSubsidyCents", "refundReserveCents", "otherVariableCostsCents"];
  const variableCostsCents = costFields.reduce((sum, key) => sum + cents(input[key] || 0), 0);
  const laborAmountCents = customerPriceCents;
  const materialCostCents = cents(input.materialCostCents || 0);
  const materialSaleCents = cents(input.materialSaleCents || 0);
  const platformGrossRevenueCents = laborAmountCents - providerPayoutCents;
  const contributionMarginCents = laborAmountCents - providerTotalPayoutCents - variableCostsCents;
  const marketStatus = customerPriceCents > (input.marketMaxCents ?? Infinity) ? "ABOVE_MARKET" : customerPriceCents > (input.maximumCompetitivePriceCents ?? Infinity) ? "ATTENTION" : "COMPETITIVE";
  const platformMinimumContributionCents = cents(input.platformMinimumContributionCents || 0);
  const platformStatus = contributionMarginCents < 0 ? "UNVIABLE" : contributionMarginCents < platformMinimumContributionCents ? "LOW_MARGIN" : "VIABLE";
  const alerts = [];
  if (providerTotalPayoutCents < (input.providerMinimumPayoutCents || 0)) alerts.push("PROVIDER_PAYOUT_TOO_LOW");
  if (providerStatus === "UNATTRACTIVE") alerts.push("UNATTRACTIVE");

  return Object.freeze({
    ...input,
    catalogVersion: input.catalogVersion || CATALOG_VERSION,
    tier: input.tier || "STANDARD",
    providerPercent: percent,
    customerPriceCents,
    laborAmountCents,
    materialCostCents,
    materialSaleCents,
    providerPayoutCents,
    providerBasePayoutCents: providerPayoutCents,
    travelBonusCents,
    urgencyBonusCents,
    scarcityBonusCents,
    providerTotalPayoutCents,
    estimatedServiceMinutes,
    estimatedTravelMinutes,
    estimatedProviderHourlyEarningCents,
    minimumProviderHourlyEarningCents,
    providerStatus,
    attractivenessActions: providerStatus === "UNATTRACTIVE" ? ATTRACTIVENESS_ACTIONS : [],
    platformGrossRevenueCents,
    variableCostsCents,
    contributionMarginCents,
    platformMinimumContributionCents,
    marketStatus,
    platformStatus,
    alerts,
    createdAt: new Date().toISOString()
  });
}

function recommendPricingAdjustment(snapshot) {
  if (snapshot.providerPercent > 70) return "REQUIRES_MANUAL_REVIEW";
  if (snapshot.customerPriceCents > snapshot.maximumCompetitivePriceCents) return "LOWER_CUSTOMER_PRICE";
  if (snapshot.providerTotalPayoutCents < snapshot.providerMinimumPayoutCents) return snapshot.scarcityLevel && ["HIGH", "CRITICAL"].includes(snapshot.scarcityLevel) ? "ADD_SCARCITY_BONUS" : "RAISE_PROVIDER_PAYOUT";
  if (snapshot.contributionMarginCents < snapshot.platformMinimumContributionCents) return snapshot.customerPriceCents < snapshot.maximumCompetitivePriceCents ? "RAISE_CUSTOMER_PRICE" : "REQUIRES_MANUAL_REVIEW";
  return "KEEP";
}

function createCatalogPricingSnapshot(code, input = {}) {
  const service = getServiceByCode(code);
  if (!service) throw new Error(`Serviço de catálogo não encontrado: ${code}`);
  if (service.pricingMode === "QUOTE") throw new Error(`Serviço ${code} exige orçamento antes da precificação.`);
  return createPricingSnapshot({ ...input, serviceCode: service.code, tier: service.tier, catalogVersion: service.catalogVersion, customerPriceCents: service.customerPriceCents });
}

function customerPricingView(snapshot) {
  return Object.freeze({ serviceCode: snapshot.serviceCode, pricingMode: "FIXED", laborAmountCents: snapshot.laborAmountCents, materialSaleCents: snapshot.materialSaleCents, totalAmountCents: snapshot.laborAmountCents + snapshot.materialSaleCents, catalogVersion: snapshot.catalogVersion });
}

function providerPricingView(snapshot) {
  return Object.freeze({ serviceCode: snapshot.serviceCode, providerPayoutCents: snapshot.providerTotalPayoutCents, estimatedServiceMinutes: snapshot.estimatedServiceMinutes, estimatedTravelMinutes: snapshot.estimatedTravelMinutes, estimatedProviderHourlyEarningCents: snapshot.estimatedProviderHourlyEarningCents, providerStatus: snapshot.providerStatus });
}

module.exports = { TIERS, ADJUSTMENTS, ATTRACTIVENESS_ACTIONS, createPricingSnapshot, createCatalogPricingSnapshot, recommendPricingAdjustment, customerPricingView, providerPricingView };
