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
const AUTONOMY_NON_PENALIZABLE_EVENTS = Object.freeze(["providerDeclinedOrder", "providerAvailabilityOn", "providerAvailabilityOff", "providerChosenCoverageArea", "providerChosenServices", "providerPause", "providerResume"]);
const REVIEWABLE_COMPLIANCE_EVENTS = Object.freeze(["suspectedFraud", "unauthorizedParallelCharge", "customerDataMisuse", "deliberatePlatformCircumvention", "falsifiedDocument", "safetyViolation", "unauthorizedPriceChange", "serviceScopeViolation"]);

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
  const enterpriseTypes = ["MEI", "ME", "EPP", "OTHER_LEGAL_ENTITY"];
  if (!enterpriseTypes.includes(input?.providerType)) throw new TypeError("INVALID_PROVIDER_TYPE");
  const providerCnpj = sanitizeTaxId(input.providerCnpj, [14], "PROVIDER_CNPJ");
  const customerCpfCnpj = sanitizeTaxId(input.customerCpfCnpj, [11, 14], "CUSTOMER_TAX_ID");
  for (const field of ["orderId", "invoiceNumber", "verificationCode", "municipality"]) if (typeof input[field] !== "string" || !input[field].trim()) throw new TypeError(`INVALID_${field.toUpperCase()}`);
  if (!Number.isInteger(input.serviceAmountCents) || input.serviceAmountCents < 0) throw new TypeError("INVALID_SERVICE_AMOUNT_CENTS");
  if (!isValidDate(input.issueDate)) throw new TypeError("INVALID_ISSUE_DATE");
  const status = input.status || "PENDING";
  if (!INVOICE_STATUS.includes(status)) throw new TypeError("INVALID_INVOICE_STATUS");
  return deepFreeze({ ...input, providerCnpj, customerCpfCnpj, orderId: input.orderId.trim(), invoiceNumber: input.invoiceNumber.trim(), verificationCode: input.verificationCode.trim(), municipality: input.municipality.trim(), status });
}

function createAutonomousTaxProfile(input = {}) {
  const taxDocumentModel = input.taxDocumentModel || "PENDING_ACCOUNTING_VALIDATION";
  const contractingModel = input.contractingModel || "PENDING_LEGAL_ACCOUNTING_VALIDATION";
  const esocialStatus = input.esocialStatus || "PENDING";
  if (!AUTONOMOUS_TAX_DOCUMENT_MODEL.includes(taxDocumentModel)) throw new TypeError("INVALID_AUTONOMOUS_TAX_DOCUMENT_MODEL");
  if (!AUTONOMOUS_CONTRACTING_MODEL.includes(contractingModel)) throw new TypeError("INVALID_AUTONOMOUS_CONTRACTING_MODEL");
  if (!ESOCIAL_REPORTING_STATUS.includes(esocialStatus)) throw new TypeError("INVALID_ESOCIAL_STATUS");
  for (const field of ["providerContributionRate", "contractorContributionRate"]) assertOptionalRate(input[field], field);
  for (const field of ["providerINSSWithholdingCents", "contractorINSSCostCents", "incomeTaxWithholdingCents", "issWithholdingCents", "otherWithholdingCents"]) assertOptionalCents(input[field], field);
  return deepFreeze({ taxDocumentModel, contractingModel, socialSecurityProfile: { contributionBasis: input.contributionBasis || null, providerContributionRate: input.providerContributionRate ?? null, contractorContributionRate: input.contractorContributionRate ?? null, retentionRequired: input.retentionRequired ?? null, esocialRequired: input.esocialRequired ?? null, otherWithholdings: input.otherWithholdings || [], legalReference: input.legalReference || null, effectiveFrom: input.effectiveFrom || null }, providerINSSWithholdingCents: input.providerINSSWithholdingCents ?? null, contractorINSSCostCents: input.contractorINSSCostCents ?? null, incomeTaxWithholdingCents: input.incomeTaxWithholdingCents ?? null, issWithholdingCents: input.issWithholdingCents ?? null, otherWithholdingCents: input.otherWithholdingCents ?? null, accountingStatus: "PENDING_ACCOUNTING_VALIDATION", esocialStatus });
}

function sanitizeTaxId(value, lengths, field) { if (typeof value !== "string" || !/^[\d.\-/\s]+$/.test(value)) throw new TypeError(`INVALID_${field}`); const digits = value.replace(/\D/g, ""); if (!lengths.includes(digits.length)) throw new TypeError(`INVALID_${field}`); return digits; }
function isValidDate(value) { if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}(?:T.*)?$/.test(value)) return false; const [year, month, day] = value.slice(0, 10).split("-").map(Number); const date = new Date(`${value.slice(0, 10)}T00:00:00.000Z`); return Number.isFinite(new Date(value).getTime()) && date.getUTCFullYear() === year && date.getUTCMonth() + 1 === month && date.getUTCDate() === day; }
function assertOptionalRate(value, field) { if (value === undefined || value === null) return; if (!Number.isFinite(value) || value < 0 || value > 1) throw new TypeError(`INVALID_${field.toUpperCase()}`); }
function assertOptionalCents(value, field) { if (value === undefined || value === null) return; if (!Number.isInteger(value) || value < 0) throw new TypeError(`INVALID_${field.toUpperCase()}`); }
function canGenerateRpa({ individualAutonomousEnabled = FEATURE_FLAGS.INDIVIDUAL_AUTONOMOUS_ENABLED, legalReviewApproved = false, accountingReviewApproved = false, taxDocumentModel, contractingModel, providerLegalType, policy } = {}) { return individualAutonomousEnabled === true && legalReviewApproved === true && accountingReviewApproved === true && taxDocumentModel === "RPA" && AUTONOMOUS_CONTRACTING_MODEL.includes(contractingModel) && contractingModel !== "PENDING_LEGAL_ACCOUNTING_VALIDATION" && providerLegalType === "INDIVIDUAL_AUTONOMOUS" && canApplyPolicy(policy); }
function penaltyForEvent(eventName) { return REVIEWABLE_COMPLIANCE_EVENTS.includes(eventName) ? "UNDER_REVIEW" : null; }
function canApplyPolicy(policy) { return policy?.status === "APPROVED" && policy.legalReviewRequired === false && policy.accountingReviewRequired === false; }
function createPrivacyRecord({ privacyPurpose, legalBasis, retentionPeriod }) { if (!privacyPurpose || !PRIVACY_LEGAL_BASES.includes(legalBasis) || !retentionPeriod) throw new TypeError("INVALID_PRIVACY_RECORD"); return deepFreeze({ privacyPurpose, legalBasis, retentionPeriod }); }
function createChangeOrder(input) {
  if (typeof input?.reason !== "string" || !input.reason.trim()) throw new TypeError("CHANGE_ORDER_REASON_REQUIRED");
  for (const field of ["previousAmount", "additionalAmount", "newTotal"]) if (!Number.isInteger(input[field])) throw new TypeError(`INVALID_${field.toUpperCase()}`);
  if (input.previousAmount < 0 || input.newTotal < 0) throw new TypeError("CHANGE_ORDER_AMOUNT_MUST_BE_NON_NEGATIVE");
  const exceptionCodes = ["DISCOUNT", "SCOPE_REDUCTION", "COMMERCIAL_ADJUSTMENT"];
  const hasException = exceptionCodes.includes(input.reasonCode);
  if (input.additionalAmount < 0 && !hasException) throw new TypeError("REDUCTION_REASON_CODE_REQUIRED");
  if (input.newTotal !== input.previousAmount + input.additionalAmount && !hasException) throw new TypeError("CHANGE_ORDER_TOTAL_MISMATCH");
  if (hasException && (typeof input.justification !== "string" || !input.justification.trim())) throw new TypeError("CHANGE_ORDER_JUSTIFICATION_REQUIRED");
  if (!isValidDate(input.previousDeadline) || !isValidDate(input.newDeadline)) throw new TypeError("INVALID_CHANGE_ORDER_DEADLINE");
  if (!Array.isArray(input.evidence)) throw new TypeError("CHANGE_ORDER_EVIDENCE_MUST_BE_ARRAY");
  const deadlineIncreased = new Date(input.newDeadline) > new Date(input.previousDeadline);
  if ((input.additionalAmount > 0 || deadlineIncreased) && input.evidence.length === 0) throw new TypeError("CHANGE_ORDER_EVIDENCE_REQUIRED");
  return deepFreeze({ ...input, reason: input.reason.trim(), status: "PENDING_CUSTOMER_APPROVAL", applied: false, requiredApproval: "CUSTOMER_CHANGE_ORDER_APPROVED" });
}

module.exports = deepFreeze({ LEGAL_POLICY_STATUS, PROVIDER_LEGAL_TYPE, PROVIDER_REGISTRATION_STATUS, AUTONOMOUS_TAX_DOCUMENT_MODEL, AUTONOMOUS_CONTRACTING_MODEL, ESOCIAL_REPORTING_STATUS, INVOICE_STATUS, PENALTY_STATUS, APPEAL_STATUS, LEDGER_ACCOUNTS, PRIVACY_LEGAL_BASES, AUTONOMY_EVENTS, AUTONOMY_NON_PENALIZABLE_EVENTS, REVIEWABLE_COMPLIANCE_EVENTS, FEATURE_FLAGS, ENTERPRISE_PROVIDER_FLOW, INDIVIDUAL_AUTONOMOUS_FLOW, createLegalPolicyVersion, createProviderInvoice, createAutonomousTaxProfile, canGenerateRpa, penaltyForEvent, canApplyPolicy, createPrivacyRecord, createChangeOrder });
