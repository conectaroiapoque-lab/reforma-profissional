"use strict";
const { recordAcceptance } = require("../domain/launch-compliance");

const CURRENT_CUSTOMER_TERMS_VERSION = "customer-service-terms-v1";
const CURRENT_CUSTOMER_TERMS_HASH = "63bff286031f1b634fbbb7083ee93325a08420ac4fdfdb76ac9e8f05351c2080";
const CURRENT_PROVIDER_CONTRACT_VERSION = "provider-service-agreement-v1";
const CURRENT_PROVIDER_CONTRACT_HASH = "9fcd9c13b02c8d656660e774241eb78b1adab9081eec79d967241566c8f84fae";

function recordCustomerTermsAcceptance({ customerId, orderId, accepted, ip, userAgent }) {
  if (accepted !== true) throw Object.assign(new Error("CUSTOMER_TERMS_ACCEPTANCE_REQUIRED"), { statusCode: 400 });
  const evidence = recordAcceptance({ subjectId: customerId, orderId, documentVersion: CURRENT_CUSTOMER_TERMS_VERSION, documentHash: CURRENT_CUSTOMER_TERMS_HASH, ip, userAgent });
  return Object.freeze({ customerId, orderId, termsVersion: evidence.documentVersion, termsHash: evidence.documentHash, acceptedAt: evidence.acceptedAt, acceptanceEvidenceId: evidence.acceptanceEvidenceId, ipHash: evidence.ipHash, userAgentHash: evidence.userAgentHash });
}
function recordProviderContractAcceptance({ providerId, accepted, ip, userAgent }) {
  if (accepted !== true) throw Object.assign(new Error("PROVIDER_CONTRACT_ACCEPTANCE_REQUIRED"), { statusCode: 400 });
  const evidence = recordAcceptance({ subjectId: providerId, documentVersion: CURRENT_PROVIDER_CONTRACT_VERSION, documentHash: CURRENT_PROVIDER_CONTRACT_HASH, ip, userAgent });
  return Object.freeze({ providerId, contractVersion: evidence.documentVersion, contractHash: evidence.documentHash, acceptedAt: evidence.acceptedAt, acceptanceEvidenceId: evidence.acceptanceEvidenceId, ipHash: evidence.ipHash, userAgentHash: evidence.userAgentHash });
}
module.exports = Object.freeze({ CURRENT_CUSTOMER_TERMS_VERSION, CURRENT_CUSTOMER_TERMS_HASH, CURRENT_PROVIDER_CONTRACT_VERSION, CURRENT_PROVIDER_CONTRACT_HASH, recordCustomerTermsAcceptance, recordProviderContractAcceptance });
