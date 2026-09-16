"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { createDiarista4hReview } = require("../simulation/pricing-v5-diarista-4h-review");

const root = path.resolve(__dirname, "..");
const review = createDiarista4hReview();
const money = value => `R$ ${(value / 100).toFixed(2).replace(".", ",")}`;
fs.writeFileSync(path.join(root, "simulation", "pricing-v5-diarista-4h-review.json"), `${JSON.stringify(review, null, 2)}\n`);
const s = review.selectedScenario;
let md = `# Revisão comercial final — V5C126 Diarista até 4h

> Simulação exclusiva da V5 candidata. Nenhum preço, percentual, raio, CAC ou cashback foi ativado. Faixa comercial respeitada: R$ 150,00–R$ 200,00.

## Conclusão

Foram testados ${review.scenarios.length} cenários e ${review.viableScenarioCount} atenderam simultaneamente todos os critérios. O serviço permanece **${review.finalStatus}**.

**Observação de auditoria:** ${review.auditObservation}

| Resultado solicitado | Recomendação de estudo |
|---|---:|
| MELHOR PREÇO PARA O CLIENTE | ${money(s.customerPriceCents)} |
| MELHOR PERCENTUAL DO PRESTADOR | ${s.providerPercent}% |
| VALOR QUE A DIARISTA RECEBE | ${money(s.providerFinalPayoutCents)} |
| GANHO ESTIMADO POR HORA | ${money(s.estimatedProviderHourlyEarningCents)} |
| RECEITA BRUTA DA PLATAFORMA | ${money(s.platformGrossRevenueCents)} |
| CUSTOS DA PLATAFORMA | ${money(s.totalPlatformCostsCents)} |
| MARGEM DE CONTRIBUIÇÃO | ${money(s.contributionMarginCents)} |
| MARGEM % SOBRE PREÇO | ${s.contributionMarginPercent}% |
| RAIO RECOMENDADO | ${s.recommendedRadiusKm} km |
| MODELO | ${s.acquisitionModel} |
| RISCO DE ATRAVESSAMENTO | ${s.bypassRisk} (${s.bypassRiskScore}) |
| STATUS ECONÔMICO | ${review.finalStatus} |

R$ 179,90 foi selecionado por equilíbrio relativo, não por aprovação: R$ 159,90/R$ 169,90 pagam menos; R$ 189,90/R$ 199,90 continuam abaixo de R$ 35/h e passam a HIGH. A proposta exige aprovação manual e não substitui R$ 129,90 na candidata.

## Tabela comparativa completa

| Preço | % prestador | Modelo | Raio | Payout | Plataforma bruta | Imposto | Pagamento | CAC | Suporte | Garantia | Deslocamento | Cashback | Custos | Margem | Margem % | Ganho/h | Competitividade | Atratividade | Plataforma | Risco | Status |
|---:|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|---|---|---|---|
`;
for (const x of review.scenarios) md += `| ${money(x.customerPriceCents)} | ${x.providerPercent}% | ${x.acquisitionModel} | ${x.recommendedRadiusKm} km | ${money(x.providerFinalPayoutCents)} | ${money(x.platformGrossRevenueCents)} | ${money(x.taxEstimateCents)} | ${money(x.paymentFeeCents)} | ${money(x.customerAcquisitionCostCents)} | ${money(x.supportCostCents)} | ${money(x.warrantyReserveCents)} | ${money(x.travelSubsidyCents)} | ${money(x.cashbackCostCents)} | ${money(x.totalPlatformCostsCents)} | ${money(x.contributionMarginCents)} | ${x.contributionMarginPercent}% | ${money(x.estimatedProviderHourlyEarningCents)} | ${x.competitiveness} | ${x.providerAttractiveness} | ${x.platformViability} | ${x.bypassRisk} | ${x.economicStatus} |\n`;
md += `\n## Proteções\n\n- V5C127 permanece com proposta manual de R$ 249,90, sem qualquer alteração nesta execução.\n- Os outros 126 serviços não foram modificados.\n- V4 permanece RMBH-2026-09-v4, com 89 serviços.\n- V5 permanece DRAFT, approved=false e effectiveDate=null.\n`;
fs.writeFileSync(path.join(root, "docs", "pricing-v5-diarista-4h-review.md"), md);
console.log("Generated focused V5C126 review.");
