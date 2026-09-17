"use strict";

const { deepFreeze } = require("./financial-engine");

const QUOTE_FLOW = Object.freeze(["CUSTOMER_REQUEST", "PROVIDER_ANALYSIS", "PROVIDER_QUOTE_SUBMITTED", "PLATFORM_REVIEW", "QUOTE_APPROVED", "CUSTOMER_QUOTE_SENT", "CUSTOMER_APPROVED", "PROVIDER_AUTHORIZED", "SERVICE_STARTED"]);
const CUSTOMER_QUOTE_VISIBLE_STATUSES = Object.freeze(["CUSTOMER_QUOTE_SENT", "CUSTOMER_APPROVED", "PROVIDER_AUTHORIZED", "SERVICE_STARTED"]);

function pick(source, fields) {
  if (!source || typeof source !== "object") return null;
  return Object.fromEntries(fields.filter(field => source[field] !== undefined).map(field => [field, source[field]]));
}

function customerView(order) {
  const financial = order.financial || {};
  const quoteVisible = CUSTOMER_QUOTE_VISIBLE_STATUSES.includes(order.quoteStatus);
  return deepFreeze({
    service: order.service,
    scope: order.scope,
    labor: quoteVisible ? financial.labor : undefined,
    materials: quoteVisible ? financial.materials : undefined,
    discount: quoteVisible ? financial.discount : undefined,
    cashback: financial.cashback,
    total: quoteVisible ? financial.customerTotal : undefined,
    guarantee: order.guarantee,
    professional: pick(order.professional, ["name", "displayName", "photoUrl", "rating", "specialty", "publicProviderId", "verifiedStatus"]),
    invoice: pick(order.invoice, ["invoiceNumber", "issueDate", "status", "publicDocumentUrl", "issuerDisplayName", "municipality"]),
    status: order.status,
    quoteStatus: order.quoteStatus
  });
}

function providerView(order) {
  const financial = order.financial || {};
  return deepFreeze({ serviceCode: order.serviceCode, scope: order.scope, necessaryLocation: order.necessaryLocation, grossReceivable: financial.providerGross, withholdings: financial.providerWithholdings ?? financial.withholdings, netReceivable: financial.providerNet, bonus: financial.providerBonus ?? financial.bonus, taxDocumentStatus: order.taxDocumentStatus, status: order.status, quoteStatus: order.quoteStatus });
}

function adminView(order) {
  const financial = order.financial || {};
  return deepFreeze({
    operational: pick(order, ["orderId", "serviceCode", "service", "scope", "status", "quoteStatus", "createdAt"]),
    financial: pick(financial, ["customerTotal", "providerGross", "providerWithholdings", "withholdings", "providerNet", "platformRevenue", "taxes", "CAC", "fees", "reserves", "margin"]),
    fiscal: { taxDocumentStatus: order.taxDocumentStatus, invoice: pick(order.invoice, ["invoiceNumber", "issueDate", "status", "issuerDisplayName", "municipality", "verificationStatus"]) },
    parties: { customer: pick(order.customer, ["customerId", "name"]), provider: pick(order.professional, ["publicProviderId", "displayName", "verifiedStatus"]) },
    documents: Array.isArray(order.documents) ? order.documents.map(document => pick(document, ["type", "status", "referenceId"])) : [],
    settlement: pick(order.settlement, ["status", "settledAt", "reconciliationId"])
  });
}

function canStartQuotedService(status) { return status === "PROVIDER_AUTHORIZED"; }
function recordImmediateExecutionRequest(requested, timestamp = new Date()) { return deepFreeze({ customerRequestedImmediateExecution: requested === true, timestamp: requested === true ? new Date(timestamp).toISOString() : null, waiverOfWithdrawalRight: false }); }

module.exports = { QUOTE_FLOW, CUSTOMER_QUOTE_VISIBLE_STATUSES, customerView, providerView, adminView, canStartQuotedService, recordImmediateExecutionRequest };
