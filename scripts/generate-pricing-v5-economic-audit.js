"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { createEconomicAudit } = require("../simulation/pricing-v5-economic-audit");

const root = path.resolve(__dirname, "..");
const audit = createEconomicAudit();
const money = value => value === null || value === undefined ? "—" : `R$ ${(value / 100).toFixed(2).replace(".", ",")}`;
const list = (title, records, detail = record => `${record.serviceCode} — ${record.profession}: ${record.serviceName}`) => `## ${title}\n\n${records.length ? records.map(record => `- ${detail(record)}`).join("\n") : "- Nenhum no cenário-base."}\n`;
const filter = predicate => audit.filter(predicate);

fs.writeFileSync(path.join(root, "simulation", "pricing-v5-economic-audit.json"), `${JSON.stringify(audit, null, 2)}\n`);

const executive = [
  "# Auditoria econômica profunda — V5 candidata RMBH\n",
  "> Documento administrativo. Nenhum controle, piso, ticket, cashback ou preço proposto é ativado automaticamente. A candidata continua DRAFT, não aprovada e sem vigência.\n",
  "## Premissas\n\n- Cenário fiscal B: 6% sobre receita da plataforma; apenas sensibilidade.\n- CAC-base de auditoria: R$ 5,00; parâmetro de cenário, não custo real declarado.\n- Ganho/hora TARGET: R$ 50,00; LOW R$ 35,00 e PREMIUM R$ 70,00 permanecem cenários configuráveis.\n- Margens administrativas MINIMUM/TARGET/PREMIUM: 5%/10%/15%; não são política publicada.\n- Serviços de baixo ticket usam raio recomendado menor e 15 minutos de deslocamento para testar matching próximo.\n- Ticket e quantidade mínima são somente valores simulados da candidata.\n",
  list("A. Serviços aprovados sem mudança", filter(record => record.recommendedAction === "READY_FOR_V5" && !record.priceProposal)),
  list("B. Serviços que precisam aumentar payout", filter(record => record.providerMinimumPayoutCents > 0 && record.providerFinalPayoutCents === record.providerMinimumPayoutCents), record => `${record.serviceCode} — ${record.serviceName}: piso auditado ${money(record.providerMinimumPayoutCents)}`),
  list("C. Serviços que precisam de ticket mínimo", filter(record => record.minimumServiceTicketCents > 0), record => `${record.serviceCode} — ${record.serviceName}: ${money(record.minimumServiceTicketCents)}`),
  list("D. Serviços que precisam de quantidade mínima", filter(record => record.minimumBillableQuantity > 1), record => `${record.serviceCode} — ${record.serviceName}: ${record.minimumBillableQuantity} unidades`),
  list("E. Serviços que precisam de raio menor", filter(record => record.recommendedMaxRadiusKm === 6), record => `${record.serviceCode} — ${record.serviceName}: ${record.recommendedMaxRadiusKm} km`),
  list("F. Serviços indicados para combo", filter(record => record.COMBO_RECOMMENDED)),
  list("G. Serviços indicados para material parceiro", filter(record => record.materialPartnerRecommended)),
  list("H. Serviços com alto risco de atravessamento", filter(record => ["HIGH", "CRITICAL"].includes(record.offPlatformRiskClassification)), record => `${record.serviceCode} — ${record.serviceName}: ${record.offPlatformRiskClassification} (${record.offPlatformRiskScore})`),
  list("I. Serviços com possível preço alto", filter(record => ["HIGH", "VERY_HIGH"].includes(record.customerPriceCompetitiveness)), record => `${record.serviceCode} — ${record.serviceName}: ${record.customerPriceCompetitiveness}`),
  list("J. Serviços sob orçamento", filter(record => record.recommendedAction === "READY_AS_QUOTE")),
  list("K. Serviços que precisam revisão manual", filter(record => record.recommendedAction === "REVIEW_REQUIRED"), record => `${record.serviceCode} — ${record.serviceName}${record.priceProposal ? `; proposta ${money(record.priceProposal.oldCandidatePriceCents)} → ${money(record.priceProposal.proposedCustomerPriceCents)}, aprovação manual obrigatória` : ""}`)
].join("\n");
fs.writeFileSync(path.join(root, "docs", "pricing-v5-economic-audit-rmbh.md"), executive);

let views = "# Três visões financeiras — auditoria administrativa V5\n\n> Estas tabelas não alteram as allowlists nem as visões financeiras de produção. Valores são do cenário administrativo de auditoria.\n\n## Tabela cliente\n\n| Código | Serviço | Valor Cliente | Material | Desconto/Cashback | Total |\n|---|---|---:|---|---:|---:|\n";
for (const record of audit) views += `| ${record.serviceCode} | ${record.serviceName} | ${money(record.simulatedBillablePriceCents)} | Não incluído | ${record.recommendedCashbackPercent}% | ${money(record.simulatedBillablePriceCents)} |\n`;
views += "\n## Tabela prestador\n\n| Código | Serviço | Valor que receberá | Bônus | Total a receber |\n|---|---|---:|---:|---:|\n";
for (const record of audit) views += `| ${record.serviceCode} | ${record.serviceName} | ${money(record.providerFinalPayoutCents)} | ${money(record.travelBonusCents + record.urgencyBonusCents + record.scarcityBonusCents)} | ${money(record.providerTotalReceivableCents)} |\n`;
views += "\n## Tabela plataforma\n\n| Código | Serviço | Valor Cliente | Repasse | Receita Bruta Plataforma | Imposto | Taxa Pagamento | CAC | Suporte | Garantia | Cashback | Deslocamento | Material Parceiro | Margem R$ | Margem % |\n|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|\n";
for (const record of audit) views += `| ${record.serviceCode} | ${record.serviceName} | ${money(record.simulatedBillablePriceCents)} | ${money(record.providerFinalPayoutCents)} | ${money(record.platformGrossRevenueCents)} | ${money(record.taxEstimateCents)} | ${money(record.paymentFeeCents)} | ${money(record.CAC)} | ${money(record.supportCostCents)} | ${money(record.warrantyReserveCents)} | ${money(record.cashbackCostCents)} | ${money(record.travelSubsidyCents)} | ${money(record.materialPartnerRevenueCents)} | ${money(record.contributionMarginCents)} | ${record.contributionMarginPercent ?? "—"}% |\n`;
fs.writeFileSync(path.join(root, "docs", "pricing-v5-three-views.md"), views);

console.log(`Generated economic audit for ${audit.length} candidate services.`);
