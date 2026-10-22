"use strict";
const { catalog } = require("../catalog");
const normalize = (value) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
// A future language model may call these read tools. It receives no booking or acceptance authority.
const TOOL_POLICY = Object.freeze({
  readTools: [
    "SEARCH_OFFICIAL_SERVICES",
    "READ_OWN_AGENDA",
    "READ_AVAILABLE_SLOTS",
    "DRAFT_APPROVED_MESSAGE",
  ],
  autonomousConfirmation: false,
  verifiedQualificationsOnly: true,
  externalModelEnabled: false,
});
function suggestServices(description) {
  const terms = normalize(description)
    .split(/\W+/)
    .filter((t) => t.length > 2);
  if (!terms.length) return { services: [], policy: TOOL_POLICY };
  return {
    services: catalog
      .map((s) => ({
        s,
        score: terms.reduce(
          (n, t) =>
            n +
            (normalize(s.name).includes(t)
              ? 2
              : normalize(s.category).includes(t)
                ? 1
                : 0),
          0,
        ),
      }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map(({ s }) => ({
        serviceCode: s.code,
        name: s.name,
        category: s.category,
        pricingMode: s.pricingMode,
        customerPriceCents: s.customerPriceCents,
      })),
    policy: TOOL_POLICY,
    notice:
      "Sugestões do catálogo oficial. Modalidade, habilitação e horários dependem dos registros verificados pelo CAC.",
  };
}
module.exports = { suggestServices, TOOL_POLICY };
