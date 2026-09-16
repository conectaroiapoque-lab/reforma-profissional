"use strict";
const financial=require("../domain/financial-engine");
const {CATALOG_VERSION,getServiceByCode}=require("../catalog-public");
const {getFinancialServiceByCode}=require("../catalog-financial");
const TIERS=Object.freeze({STANDARD:60,TECHNICAL:65,SPECIALIST:70});
const ADJUSTMENTS=Object.freeze(["KEEP","LOWER_CUSTOMER_PRICE","RAISE_PROVIDER_PAYOUT","ADD_TRAVEL_BONUS","ADD_SCARCITY_BONUS","MANUAL_PRICE_REVIEW","REQUIRES_MANUAL_REVIEW"]);
const ATTRACTIVENESS_ACTIONS=Object.freeze(["NEAREST_PROVIDER","GROUP_SMALL_SERVICES","TRAVEL_BONUS","URGENCY_BONUS","PLATFORM_SUBSIDY","ADMIN_TIER_CHANGE","SPECIAL_QUOTE"]);
const simulationTaxProfile=()=>({taxProfileId:"SIMULATION-ZERO-RATE",taxRegime:"OUTRO",taxBaseType:"PLATFORM_REVENUE_ONLY",taxRateBasisPoints:0,effectiveFrom:"2026-01-01",effectiveTo:null,source:"MVP_SIMULATION",approvedBy:"SYSTEM",approvedAt:"2026-01-01T00:00:00.000Z",version:"1"});
function createPricingSnapshot(i){return financial.createFinancialSnapshot({...i,catalogVersion:i.catalogVersion||CATALOG_VERSION,taxProfile:i.taxProfile||simulationTaxProfile()})}
function createCatalogPricingSnapshot(code,i={}){const s=getServiceByCode(code),f=getFinancialServiceByCode(code);if(!s||!f)throw Error(`Serviço de catálogo não encontrado: ${code}`);if(s.pricingMode==="QUOTE")throw Error(`Serviço ${code} exige orçamento antes da precificação.`);return createPricingSnapshot({...i,serviceCode:s.serviceCode,serviceName:s.serviceName,category:s.category,pricingMode:s.pricingMode,providerTier:f.providerTier,providerMinimumPayoutCents:i.providerMinimumPayoutCents??f.providerMinimumPayoutCents,financialRules:{...f.financialRules,...i.financialRules},catalogVersion:s.catalogVersion,customerPriceCents:s.customerPriceCents,laborAmountCents:s.customerPriceCents,materialsIncluded:s.materialsIncluded,scopeNotes:s.scopeNotes,exclusions:s.exclusions})}
function recommendPricingAdjustment(s){if(s.economicStatus==="REVIEW_REQUIRED"||s.contributionMarginCents<s.platformMinimumContributionCents)return"MANUAL_PRICE_REVIEW";if(s.customerPriceCents>s.maximumCompetitivePriceCents)return"LOWER_CUSTOMER_PRICE";return"KEEP"}
const customerPricingView=financial.customerFinancialView;
function providerPricingView(s){return financial.deepFreeze({...financial.providerFinancialView(s),providerPayoutCents:s.providerTotalReceivableCents,estimatedProviderHourlyEarningCents:s.estimatedProviderHourlyEarningCents,providerStatus:s.providerStatus})}
module.exports={...financial,TIERS,ADJUSTMENTS,ATTRACTIVENESS_ACTIONS,createPricingSnapshot,createCatalogPricingSnapshot,recommendPricingAdjustment,customerPricingView,providerPricingView};
