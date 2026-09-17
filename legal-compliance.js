"use strict";

const { deepFreeze } = require("./domain/financial-engine");

const LEGAL_POLICY_STATUS = Object.freeze(["DRAFT", "UNDER_LEGAL_REVIEW", "UNDER_ACCOUNTING_REVIEW", "APPROVED", "SUPERSEDED"]);
const PROVIDER_LEGAL_TYPE = Object.freeze(["MEI", "ME", "EPP", "OTHER_LEGAL_ENTITY", "INDIVIDUAL_AUTONOMOUS"]);
const PROVIDER_REGISTRATION_STATUS = Object.freeze(["PENDING_DOCUMENTS", "UNDER_REVIEW", "APPROVED", "REJECTED", "SUSPENDED"]);
const AUTONOMOUS_TAX_DOCUMENT_MODEL = Object.freeze(["MUNICIPAL_NFSE", "RPA", "OTHER_ALLOWED_DOCUMENT", "PENDING_ACCOUNTING_VALIDATION"]);
const AUTONOMOUS_CONTRACTING_MODEL = Object.freeze(["CUSTOMER_DIRECT", "PLATFORM_DIRECT", "INTERMEDIATED", "PENDING_LEGAL_ACCOUNTING_VALIDATION"]);
const ESOCIAL_REPORTING_STATUS = Object.freeze(["NOT_APPLICABLE", "PENDING", "REQUIRED", "SUBMITTED", "ACCEPTED", "REJECTED"]);
const INVOICE_STATUS = Object.freeze(["PENDING", "ISSUED", "VALIDATING", "VALID", "REJECTED", "CANCELLED"]);
const PENALTY_STATUS = Object.freeze(["GUIDANCE", "WARNING", "TEMPORARY_SUSPENSION", "UNDER_REVIEW", "CONTRACT_TERMINATION", "BANNED"]);
const APPEAL_STATUS = Object.freeze(["APPEAL_SUBMITTED", "APPEAL_UNDER_REVIEW", "APPEAL_ACCEPTED", "APPEAL_REJECTED"]);
const LEDGER_ACCOUNTS = Object.freeze(["CUSTOMER_FUNDS", "PROVIDER_GROSS_PAYABLE", "PROVIDER_WITHHOLDINGS", "PROVIDER_NET_PAYABLE", "PLATFORM_REVENUE", "TAX_PAYABLE", "PROCESSOR_FEES", "REFUND_RESERVE", "WARRANTY_RESERVE"]);
const PRIVACY_LEGAL_BASES = Object.freeze(["CONTRACT_EXECUTION", "LEGAL_OBLIGATION", "LEGITIMATE_INTEREST", "CONSENT"]);
const AUTONOMY_EVENTS = Object.freeze(["providerAcceptedOrder", "providerDeclinedOrder", "providerAvailabilityOn", "providerAvailabilityOff", "providerChosenCoverageArea", "providerChosenServices", "providerPause", "providerResume"]);

const FEATURE_FLAGS = deepFreeze({
  INDIVIDUAL_AUTONOMOUS_ENABLED: false,
  NATIONAL_NFSE_ME_EPP_REQUIRED_FROM: "2026-11-01"
});

const ENTERPRISE_PROVIDER_FLOW = deepFreeze({
  registration: ["cnpj", "corporateName", "tradeName", "legalRepresentative", "legalRepresentativeCpf", "cnae", "municipalRegistration", "businessAddress", "phone", "email", "bankAccount", "technicalDocuments", "licenses", "certifications"],
  agreement: "docs/provider-enterprise-agreement-draft.md",
  payout: ["SERVICE_COMPLETED", "CUSTOMER_CONFIRMATION", "NFSE_PENDING", "NFSE_VALIDATION", "PAYOUT_APPROVED", "PAID"]
});
const INDIVIDUAL_AUTONOMOUS_FLOW = deepFreeze({
  enabled: false,
  activationRequirements: { legalReviewApproved: true, accountingReviewApproved: true },
  registration: ["cpf", "fullName", "officialDocument", "birthDate", "address", "phone", "email", "ownBankAccount", "specialties", "experience", "technicalDocuments", "certifications", "licensesWhenRequired", "pisNitNisWhenRequired", "socialSecurityDataWhenRequired", "municipalRegistrationWhenRequired", "taxDocumentDataWhenRequired"],
  agreement: "docs/provider-autonomous-agreement-draft.md",
  payout: ["SERVICE_COMPLETED", "CUSTOMER_CONFIRMATION", "TAX_DOCUMENT_PENDING", "TAX_VALIDATION", "WITHHOLDINGS_CALCULATED", "PAYOUT_APPROVED", "PAYOUT_PROCESSING", "PAID"]
});

function createLegalPolicyVersion(input) {
  if (!input?.id || !input?.version) throw new TypeError("POLICY_IDENTIFICATION_REQUIRED");
  const status = input.status || "DRAFT";
  if (!LEGAL_POLICY_STATUS.includes(status)) throw new TypeError("INVALID_POLICY_STATUS");
  if (status === "APPROVED" && (!input.reviewedBy || !input.reviewedAt || input.legalReviewRequired !== false || input.accountingReviewRequired !== false)) throw new Error("POLICY_REVIEW_REQUIRED");
  return deepFreeze({ id: input.id, version: input.version, effectiveFrom: input.effectiveFrom || null, effectiveUntil: input.effectiveUntil || null, reviewedBy: input.reviewedBy || null, reviewedAt: input.reviewedAt || null, legalReviewRequired: input.legalReviewRequired ?? true, accountingReviewRequired: input.accountingReviewRequired ?? true, status, sourceReferences: input.sourceReferences || [], notes: input.notes || "" });
}

function createProviderInvoice(input) {
  const required = ["providerCnpj", "customerCpfCnpj", "orderId", "invoiceNumber", "verificationCode", "issueDate", "serviceAmountCents", "municipality"];
  if (required.some(field => input?.[field] === undefined || input[field] === null || input[field] === "")) throw new TypeError("INCOMPLETE_PROVIDER_INVOICE");
  const status = input.status || "PENDING";
  if (!INVOICE_STATUS.includes(status)) throw new TypeError("INVALID_INVOICE_STATUS");
  return deepFreeze({ ...input, status });
}

function createAutonomousTaxProfile(input = {}) {
  return deepFreeze({ taxDocumentModel: input.taxDocumentModel || "PENDING_ACCOUNTING_VALIDATION", contractingModel: input.contractingModel || "PENDING_LEGAL_ACCOUNTING_VALIDATION", socialSecurityProfile: { contributionBasis: input.contributionBasis || null, providerContributionRate: input.providerContributionRate ?? null, contractorContributionRate: input.contractorContributionRate ?? null, retentionRequired: input.retentionRequired ?? null, esocialRequired: input.esocialRequired ?? null, otherWithholdings: input.otherWithholdings || [], legalReference: input.legalReference || null, effectiveFrom: input.effectiveFrom || null }, providerINSSWithholdingCents: input.providerINSSWithholdingCents ?? null, contractorINSSCostCents: input.contractorINSSCostCents ?? null, incomeTaxWithholdingCents: input.incomeTaxWithholdingCents ?? null, issWithholdingCents: input.issWithholdingCents ?? null, otherWithholdingCents: input.otherWithholdingCents ?? null, accountingStatus: "PENDING_ACCOUNTING_VALIDATION", esocialStatus: input.esocialStatus || "PENDING" });
}

function canGenerateRpa({ accountingReviewApproved = false, taxDocumentModel } = {}) { return accountingReviewApproved === true && taxDocumentModel === "RPA"; }
function penaltyForEvent(eventName) { return eventName === "providerDeclinedOrder" ? null : "UNDER_REVIEW"; }
function canApplyPolicy(policy) { return policy?.status === "APPROVED" && policy.legalReviewRequired === false && policy.accountingReviewRequired === false; }
function createPrivacyRecord({ privacyPurpose, legalBasis, retentionPeriod }) { if (!privacyPurpose || !PRIVACY_LEGAL_BASES.includes(legalBasis) || !retentionPeriod) throw new TypeError("INVALID_PRIVACY_RECORD"); return deepFreeze({ privacyPurpose, legalBasis, retentionPeriod }); }
function createChangeOrder(input) { const required = ["reason", "previousAmount", "additionalAmount", "newTotal", "previousDeadline", "newDeadline", "evidence"]; if (required.some(field => input?.[field] === undefined)) throw new TypeError("INCOMPLETE_CHANGE_ORDER"); return deepFreeze({ ...input, status: "PENDING_CUSTOMER_APPROVAL", requiredApproval: "CUSTOMER_CHANGE_ORDER_APPROVED" }); }

module.exports = deepFreeze({ LEGAL_POLICY_STATUS, PROVIDER_LEGAL_TYPE, PROVIDER_REGISTRATION_STATUS, AUTONOMOUS_TAX_DOCUMENT_MODEL, AUTONOMOUS_CONTRACTING_MODEL, ESOCIAL_REPORTING_STATUS, INVOICE_STATUS, PENALTY_STATUS, APPEAL_STATUS, LEDGER_ACCOUNTS, PRIVACY_LEGAL_BASES, AUTONOMY_EVENTS, FEATURE_FLAGS, ENTERPRISE_PROVIDER_FLOW, INDIVIDUAL_AUTONOMOUS_FLOW, createLegalPolicyVersion, createProviderInvoice, createAutonomousTaxProfile, canGenerateRpa, penaltyForEvent, canApplyPolicy, createPrivacyRecord, createChangeOrder });
