"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { createDiaristaFinalReview } = require("../simulation/pricing-v5-diarista-review");
const candidate = require("../catalog-v5-candidate");

const root = path.resolve(__dirname, "..");
const review = createDiaristaFinalReview();
const money = value => `R$ ${(value / 100).toFixed(2).replace(".", ",")}`;
fs.writeFileSync(path.join(root, "simulation", "pricing-v5-diarista-final-review.json"), `${JSON.stringify(review, null, 2)}\n`);
const finalClassification = candidate.services.map(service => ({
  serviceCode: service.code, serviceName: service.name, currentCandidatePriceCents: service.candidatePriceCents,
  proposedCustomerPriceCents: service.proposedCustomerPriceCents ?? null,
  status: service.pricingMode === "QUOTE" ? "READY_AS_QUOTE"
    : ["V5C001", "V5C047", "V5C126", "V5C127"].includes(service.code) ? "READY_FOR_V5_WITH_MANUAL_APPROVAL"
      : "READY_FOR_V5"
}));
fs.writeFileSync(path.join(root, "simulation", "pricing-v5-final-classification.json"), `${JSON.stringify(finalClassification, null, 2)}\n`);

let md = `# Auditoria final — Diarista V5 RMBH

> Simulação administrativa. Nenhum preço, percentual, piso, raio ou CAC foi alterado. Não há regra trabalhista, controle de jornada, subordinação, escala ou disponibilidade obrigatória. A definição “diária” representa somente um pacote comercial de prestador independente.

## Premissas

- Piso simulado: remuneração bruta LOW de R$ 35/h considerando permanência e deslocamento; não é política oficial.
- Atratividade aceitável: bruto ≥ R$ 35/h e líquido estimado ≥ R$ 30/h após deslocamento e, na diária, uma única estimativa de alimentação.
- Serviço avulso usa CAC hipotético de R$ 15; recorrência usa R$ 3 somente para sensibilidade.
- Cashback permanece 0% porque a prioridade é testar payout e viabilidade sem subsídio oculto.
- O custo de alimentação é do cenário operacional do prestador e não é debitado da margem da plataforma.

## Classificação

| Momento | READY_FOR_V5 | READY_FOR_V5_WITH_MANUAL_APPROVAL | READY_AS_QUOTE | REVIEW_REQUIRED |
|---|---:|---:|---:|---:|
| Antes | ${review.classificationBefore.READY_FOR_V5} | ${review.classificationBefore.READY_FOR_V5_WITH_MANUAL_APPROVAL} | ${review.classificationBefore.READY_AS_QUOTE} | ${review.classificationBefore.REVIEW_REQUIRED} |
| Depois | ${review.classificationAfter.READY_FOR_V5} | ${review.classificationAfter.READY_FOR_V5_WITH_MANUAL_APPROVAL} | ${review.classificationAfter.READY_AS_QUOTE} | ${review.classificationAfter.REVIEW_REQUIRED} |
`;
for (const item of review.cases) {
  const s = item.selectedScenario;
  md += `\n## ${item.serviceCode} — ${item.serviceName}\n\n**Causa econômica:** ${item.cause}\n\nForam simulados ${item.scenarios.length} cenários; ${item.viableScenarioCount} atingiram também a referência horária genérica. A decisão final pode avançar apenas com aprovação manual, mantendo BELOW_REFERENCE explícito.\n\n### Conclusão\n\n| Campo | Resultado |\n|---|---|\n| PREÇO ATUAL | ${money(item.currentCandidatePriceCents)} |\n| PREÇO RECOMENDADO | ${money(item.proposal.proposedCustomerPriceCents)} (somente estudo) |\n| PERCENTUAL ATUAL | ${item.currentProviderPercent}% |\n| PERCENTUAL RECOMENDADO | ${item.proposal.proposedProviderPercent}% |\n| PISO NECESSÁRIO PARA LOW | ${money(s.requiredProviderMinimumPayoutCents)} |\n| PISO CONFIGURÁVEL SIMULADO | ${money(s.providerMinimumPayoutCents)} |\n| TETO DE PAYOUT ANTES DOS CUSTOS | ${money(s.maximumPayoutBeforeOperatingCostsCents)} |\n| VALOR PRESTADOR | ${money(s.providerFinalPayoutCents)} |\n| GANHO BRUTO/HORA | ${money(s.estimatedProviderGrossHourlyEarningCents)} |\n| GANHO LÍQUIDO ESTIMADO/HORA | ${money(s.estimatedProviderNetHourlyEarningCents)} |\n| MARGEM PLATAFORMA | ${money(s.contributionMarginCents)} |\n| MARGEM SOBRE RECEITA BRUTA | ${s.contributionMarginPercent}% |\n| MARGEM SOBRE PREÇO | ${s.contributionMarginPercentOfCustomerPrice}% |\n| COMPETITIVIDADE | ${s.customerCompetitiveness} |\n| ATRATIVIDADE PRESTADOR | ${s.providerAttractiveness} |\n| RISCO ATRAVESSAMENTO | ${s.offPlatformRisk} (${s.offPlatformRiskScore}) |\n| RAIO RECOMENDADO | ${s.recommendedRadiusKm} km |\n| STATUS FINAL | ${item.recommendation} |\n\n### Tabela completa\n\n| Aquisição | Preço | % | Piso necessário | Piso configurável | Teto payout | Payout calc. | Payout final | Raio | Desloc. | Bruto/h | Líquido/h | Alimentação | Plataforma bruta | Imposto | Pagamento | CAC | Suporte | Garantia | Subsídio desloc. | Cashback | Margem | Margem/preço | Cliente | Prestador | Plataforma | Risco | Ready |\n|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|---|---|---|---|\n`;
  for (const x of item.scenarios) md += `| ${x.acquisitionScenario} | ${money(x.customerPriceCents)} | ${x.providerPercent}% | ${money(x.requiredProviderMinimumPayoutCents)} | ${money(x.providerMinimumPayoutCents)} | ${money(x.maximumPayoutBeforeOperatingCostsCents)} | ${money(x.providerCalculatedPayoutCents)} | ${money(x.providerFinalPayoutCents)} | ${x.recommendedRadiusKm} | ${x.estimatedTravelMinutes} min | ${money(x.estimatedProviderGrossHourlyEarningCents)} | ${money(x.estimatedProviderNetHourlyEarningCents)} | ${money(x.estimatedMealCents)} | ${money(x.platformGrossRevenueCents)} | ${money(x.taxEstimateCents)} | ${money(x.paymentFeeCents)} | ${money(x.customerAcquisitionCostCents)} | ${money(x.supportCostCents)} | ${money(x.warrantyReserveCents)} | ${money(x.travelSubsidyCents)} | ${money(x.cashbackCostCents)} | ${money(x.contributionMarginCents)} | ${x.contributionMarginPercentOfCustomerPrice}% | ${x.customerCompetitiveness} | ${x.providerAttractiveness} | ${x.platformViability} | ${x.offPlatformRisk} | ${x.readyForV5 ? "SIM" : "NÃO"} |\n`;
}
md += `\n## Revalidação dos demais serviços\n\n- V5C001 mantém recomendação de crédito parcial e raio curto, sujeita a controle manual.\n- V5C047 continua condicionado à aprovação manual de preço e escopo.\n- V5C001–V5C125 e V5C128 não foram recalculados nem modificados por esta auditoria.\n- V4 permanece RMBH-2026-09-v4 com 89 serviços. V5 permanece DRAFT, approved=false e effectiveDate=null.\n`;
fs.writeFileSync(path.join(root, "docs", "pricing-v5-diarista-final-review.md"), md);
console.log("Generated diarista final review.");
