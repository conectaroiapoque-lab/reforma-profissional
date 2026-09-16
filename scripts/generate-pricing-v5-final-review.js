"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { createFinalReview } = require("../simulation/pricing-v5-final-review");

const root = path.resolve(__dirname, "..");
const review = createFinalReview();
const money = value => `R$ ${(value / 100).toFixed(2).replace(".", ",")}`;
const percent = value => `${value}%`;
const costs = value => Object.entries(value).map(([key, amount]) => `${key}: ${money(amount)}`).join("; ");

fs.writeFileSync(path.join(root, "simulation", "pricing-v5-final-review.json"), `${JSON.stringify(review, null, 2)}\n`);

let markdown = `# Revisão final dos quatro casos — V5 candidata RMBH

> Revisão administrativa, sem publicação ou alteração automática. Toda proposta exige aprovação manual. A V5 permanece \`${review.metadata.candidateStatus}\`, \`approved = ${review.metadata.approved}\`.

## Classificações

| Momento | READY_FOR_V5 | READY_FOR_V5_WITH_MANUAL_APPROVAL | READY_AS_QUOTE | REVIEW_REQUIRED |
|---|---:|---:|---:|---:|
| Antes | ${review.classificationBefore.READY_FOR_V5} | — | ${review.classificationBefore.READY_AS_QUOTE} | ${review.classificationBefore.REVIEW_REQUIRED} |
| Recomendação final | ${review.classificationAfter.READY_FOR_V5} | ${review.classificationAfter.READY_FOR_V5_WITH_MANUAL_APPROVAL} | ${review.classificationAfter.READY_AS_QUOTE} | ${review.classificationAfter.REVIEW_REQUIRED} |

Split e diaristas somente podem avançar mediante aprovação manual. A referência de remuneração/hora das diaristas permanece visível como BELOW_REFERENCE, mas não bloqueia sozinha a decisão administrativa final.
`;
for (const item of review.cases) {
  markdown += `\n## ${item.serviceCode} — ${item.serviceName}\n\n- Preço candidato atual: ${money(item.currentCandidatePriceCents)}\n- Melhor preço econômico analisado: ${money(item.bestEconomicPriceCents)}\n- Recomendação: \`${item.recommendation}\`\n- Motivo: ${item.priceProposal.reason}\n- Aprovação manual: **${item.priceProposal.manualApprovalRequired ? "obrigatória" : "não"}**\n`;
  if (item.selectedScenario) markdown += `- Cenário selecionado: \`${item.selectedScenario}\`\n`;
  if (item.selectedControls) markdown += `- Controles selecionados: crédito ${money(item.selectedControls.visitCreditCents)}, raio ${item.selectedControls.recommendedMaxRadiusKm} km.\n`;
  if (item.selectedOutcome) markdown += `- Resultado combinado selecionado: payout ${money(item.selectedOutcome.providerFinalPayoutCents)}, ganho/h ${money(item.selectedOutcome.estimatedProviderHourlyEarningCents)}, margem ${money(item.selectedOutcome.contributionMarginCents)} (${item.selectedOutcome.contributionMarginPercent}%), risco ${item.selectedOutcome.offPlatformRiskClassification}.\n`;
  markdown += `\n| Cenário/escopo | Preço | Payout | Ganho/h | Líquido/h após alimentação | Plataforma bruta | Custos | Margem | Margem % | Competitividade | Risco |\n|---|---:|---:|---:|---:|---:|---|---:|---:|---|---|\n`;
  for (const option of item.alternatives) markdown += `| ${option.scopeScenario || option.scenario || "Preço testado"}${option.scopeLabel ? ` — ${option.scopeLabel}` : ""} | ${money(option.testedCustomerPriceCents)} | ${money(option.providerFinalPayoutCents)} | ${money(option.estimatedProviderHourlyEarningCents)} | ${money(option.estimatedProviderNetHourlyAfterMealCents)} | ${money(option.platformGrossRevenueCents)} | ${costs(option.costs)} | ${money(option.contributionMarginCents)} | ${percent(option.contributionMarginPercent)} | ${option.customerPriceCompetitiveness} | ${option.offPlatformRiskClassification} (${option.offPlatformRiskScore}) |\n`;
  if (item.serviceCode === "V5C047") markdown += `\n**Separação de escopo:** A é somente mão de obra; materiais não estão incluídos. B inclui custo hipotético de kit básico, mas sua composição e limite de tubulação precisam ser aprovados antes de qualquer oferta. Os preços dos dois escopos não devem ser misturados.\n`;
}
markdown += `\n## Decisão de segurança\n\n- Nenhum preço oficial foi substituído.\n- Nenhum cashback, crédito, raio ou kit foi ativado.\n- V5C126 e V5C127 são READY_FOR_V5_WITH_MANUAL_APPROVAL e mantêm BELOW_REFERENCE para remuneração/hora.\n- V5C047 tem recomendação financeira condicional, ainda sujeita a aprovação humana do preço e do escopo.\n- V5C001 mantém R$ 99,90 e prioriza crédito parcial mais raio curto.\n`;
fs.writeFileSync(path.join(root, "docs", "pricing-v5-final-four-review.md"), markdown);
console.log("Generated final review for V5C001, V5C047, V5C126 and V5C127.");
