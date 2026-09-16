# Revisão final dos quatro casos — V5 candidata RMBH

> Revisão administrativa, sem publicação ou alteração automática. Toda proposta exige aprovação manual. A V5 permanece `DRAFT`, `approved = false`.

## Classificações

| Momento | READY_FOR_V5 | READY_FOR_V5_WITH_MANUAL_APPROVAL | READY_AS_QUOTE | REVIEW_REQUIRED |
|---|---:|---:|---:|---:|
| Antes | 75 | — | 50 | 3 |
| Recomendação final | 74 | 4 | 50 | 0 |

Split e diaristas somente podem avançar mediante aprovação manual. A referência de remuneração/hora das diaristas permanece visível como BELOW_REFERENCE, mas não bloqueia sozinha a decisão administrativa final.

## V5C001 — Visita / diagnóstico

- Preço candidato atual: R$ 99,90
- Melhor preço econômico analisado: R$ 99,90
- Recomendação: `READY_FOR_V5_WITH_MANUAL_CONTROL_APPROVAL`
- Motivo: Manter preço e combinar crédito parcial de R$ 50,00 com raio de 6 km antes de considerar aumento.
- Aprovação manual: **obrigatória**
- Cenário selecionado: `B_PARTIAL_CREDIT_PLUS_D_NEARBY_PROVIDER`
- Controles selecionados: crédito R$ 50,00, raio 6 km.
- Resultado combinado selecionado: payout R$ 64,94, ganho/h R$ 51,95, margem R$ 13,87 (39.67%), risco MEDIUM.

| Cenário/escopo | Preço | Payout | Ganho/h | Líquido/h após alimentação | Plataforma bruta | Custos | Margem | Margem % | Competitividade | Risco |
|---|---:|---:|---:|---:|---:|---|---:|---:|---|---|
| A_FULL_CREDIT | R$ 99,90 | R$ 64,94 | R$ 45,84 | R$ 45,84 | R$ 34,96 | taxEstimateCents: R$ 2,10; paymentFeeCents: R$ 2,99; customerAcquisitionCostCents: R$ 5,00; supportCostCents: R$ 3,00; warrantyReserveCents: R$ 2,00; travelSubsidyCents: R$ 5,00; cashbackCostCents: R$ 0,00; refundReserveCents: R$ 1,00; otherVariableCostsCents: R$ 0,00; estimatedMealAllowanceCents: R$ 0,00; totalPlatformCostsCents: R$ 21,09 | R$ 13,87 | 39.67% | COMPETITIVE | HIGH (60) |
| B_PARTIAL_CREDIT | R$ 99,90 | R$ 64,94 | R$ 45,84 | R$ 45,84 | R$ 34,96 | taxEstimateCents: R$ 2,10; paymentFeeCents: R$ 2,99; customerAcquisitionCostCents: R$ 5,00; supportCostCents: R$ 3,00; warrantyReserveCents: R$ 2,00; travelSubsidyCents: R$ 5,00; cashbackCostCents: R$ 0,00; refundReserveCents: R$ 1,00; otherVariableCostsCents: R$ 0,00; estimatedMealAllowanceCents: R$ 0,00; totalPlatformCostsCents: R$ 21,09 | R$ 13,87 | 39.67% | COMPETITIVE | HIGH (65) |
| C_HIGHER_FULL_CREDIT | R$ 119,90 | R$ 77,94 | R$ 55,02 | R$ 55,02 | R$ 41,96 | taxEstimateCents: R$ 2,52; paymentFeeCents: R$ 3,59; customerAcquisitionCostCents: R$ 5,00; supportCostCents: R$ 3,00; warrantyReserveCents: R$ 2,40; travelSubsidyCents: R$ 5,00; cashbackCostCents: R$ 0,00; refundReserveCents: R$ 1,20; otherVariableCostsCents: R$ 0,00; estimatedMealAllowanceCents: R$ 0,00; totalPlatformCostsCents: R$ 22,71 | R$ 19,25 | 45.88% | MARKET_ALIGNED | MEDIUM (40) |
| D_NEARBY_PROVIDER | R$ 99,90 | R$ 64,94 | R$ 51,95 | R$ 51,95 | R$ 34,96 | taxEstimateCents: R$ 2,10; paymentFeeCents: R$ 2,99; customerAcquisitionCostCents: R$ 5,00; supportCostCents: R$ 3,00; warrantyReserveCents: R$ 2,00; travelSubsidyCents: R$ 5,00; cashbackCostCents: R$ 0,00; refundReserveCents: R$ 1,00; otherVariableCostsCents: R$ 0,00; estimatedMealAllowanceCents: R$ 0,00; totalPlatformCostsCents: R$ 21,09 | R$ 13,87 | 39.67% | COMPETITIVE | MEDIUM (45) |

## V5C047 — Instalação split 9.000 a 12.000 BTU

- Preço candidato atual: R$ 649,90
- Melhor preço econômico analisado: R$ 599,90
- Recomendação: `REVIEW_REQUIRED_PENDING_MANUAL_SCOPE_AND_PRICE_APPROVAL`
- Motivo: Equilibra competitividade e margem no cenário de mão de obra apenas; materiais permanecem expressamente excluídos.
- Aprovação manual: **obrigatória**
- Cenário selecionado: `A_LABOR_ONLY`

| Cenário/escopo | Preço | Payout | Ganho/h | Líquido/h após alimentação | Plataforma bruta | Custos | Margem | Margem % | Competitividade | Risco |
|---|---:|---:|---:|---:|---:|---|---:|---:|---|---|
| A_LABOR_ONLY — Mão de obra apenas | R$ 549,90 | R$ 409,44 | R$ 116,98 | R$ 116,98 | R$ 140,46 | taxEstimateCents: R$ 8,43; paymentFeeCents: R$ 16,44; customerAcquisitionCostCents: R$ 5,00; supportCostCents: R$ 3,00; warrantyReserveCents: R$ 11,00; travelSubsidyCents: R$ 5,00; cashbackCostCents: R$ 0,00; refundReserveCents: R$ 5,50; otherVariableCostsCents: R$ 0,00; estimatedMealAllowanceCents: R$ 0,00; totalPlatformCostsCents: R$ 54,37 | R$ 86,09 | 61.29% | VERY_COMPETITIVE | MEDIUM (40) |
| A_LABOR_ONLY — Mão de obra apenas | R$ 599,90 | R$ 419,93 | R$ 119,98 | R$ 119,98 | R$ 179,97 | taxEstimateCents: R$ 10,80; paymentFeeCents: R$ 17,94; customerAcquisitionCostCents: R$ 5,00; supportCostCents: R$ 3,00; warrantyReserveCents: R$ 12,00; travelSubsidyCents: R$ 5,00; cashbackCostCents: R$ 0,00; refundReserveCents: R$ 6,00; otherVariableCostsCents: R$ 0,00; estimatedMealAllowanceCents: R$ 0,00; totalPlatformCostsCents: R$ 59,74 | R$ 120,23 | 66.81% | COMPETITIVE | MEDIUM (40) |
| A_LABOR_ONLY — Mão de obra apenas | R$ 629,90 | R$ 440,93 | R$ 125,98 | R$ 125,98 | R$ 188,97 | taxEstimateCents: R$ 11,34; paymentFeeCents: R$ 18,83; customerAcquisitionCostCents: R$ 5,00; supportCostCents: R$ 3,00; warrantyReserveCents: R$ 12,60; travelSubsidyCents: R$ 5,00; cashbackCostCents: R$ 0,00; refundReserveCents: R$ 6,30; otherVariableCostsCents: R$ 0,00; estimatedMealAllowanceCents: R$ 0,00; totalPlatformCostsCents: R$ 62,07 | R$ 126,90 | 67.15% | MARKET_ALIGNED | MEDIUM (40) |
| A_LABOR_ONLY — Mão de obra apenas | R$ 649,90 | R$ 454,93 | R$ 129,98 | R$ 129,98 | R$ 194,97 | taxEstimateCents: R$ 11,70; paymentFeeCents: R$ 19,43; customerAcquisitionCostCents: R$ 5,00; supportCostCents: R$ 3,00; warrantyReserveCents: R$ 13,00; travelSubsidyCents: R$ 5,00; cashbackCostCents: R$ 0,00; refundReserveCents: R$ 6,50; otherVariableCostsCents: R$ 0,00; estimatedMealAllowanceCents: R$ 0,00; totalPlatformCostsCents: R$ 63,63 | R$ 131,34 | 67.36% | HIGH | MEDIUM (40) |
| B_LABOR_PLUS_BASIC_KIT — Mão de obra + kit básico | R$ 549,90 | R$ 409,44 | R$ 116,98 | R$ 116,98 | R$ 140,46 | taxEstimateCents: R$ 8,43; paymentFeeCents: R$ 16,44; customerAcquisitionCostCents: R$ 5,00; supportCostCents: R$ 3,00; warrantyReserveCents: R$ 11,00; travelSubsidyCents: R$ 5,00; cashbackCostCents: R$ 0,00; refundReserveCents: R$ 5,50; otherVariableCostsCents: R$ 120,00; estimatedMealAllowanceCents: R$ 0,00; totalPlatformCostsCents: R$ 174,37 | R$ -33,91 | -24.14% | COMPETITIVE | MEDIUM (30) |
| B_LABOR_PLUS_BASIC_KIT — Mão de obra + kit básico | R$ 599,90 | R$ 419,93 | R$ 119,98 | R$ 119,98 | R$ 179,97 | taxEstimateCents: R$ 10,80; paymentFeeCents: R$ 17,94; customerAcquisitionCostCents: R$ 5,00; supportCostCents: R$ 3,00; warrantyReserveCents: R$ 12,00; travelSubsidyCents: R$ 5,00; cashbackCostCents: R$ 0,00; refundReserveCents: R$ 6,00; otherVariableCostsCents: R$ 120,00; estimatedMealAllowanceCents: R$ 0,00; totalPlatformCostsCents: R$ 179,74 | R$ 0,23 | 0.13% | COMPETITIVE | MEDIUM (30) |
| B_LABOR_PLUS_BASIC_KIT — Mão de obra + kit básico | R$ 629,90 | R$ 440,93 | R$ 125,98 | R$ 125,98 | R$ 188,97 | taxEstimateCents: R$ 11,34; paymentFeeCents: R$ 18,83; customerAcquisitionCostCents: R$ 5,00; supportCostCents: R$ 3,00; warrantyReserveCents: R$ 12,60; travelSubsidyCents: R$ 5,00; cashbackCostCents: R$ 0,00; refundReserveCents: R$ 6,30; otherVariableCostsCents: R$ 120,00; estimatedMealAllowanceCents: R$ 0,00; totalPlatformCostsCents: R$ 182,07 | R$ 6,90 | 3.65% | COMPETITIVE | MEDIUM (30) |
| B_LABOR_PLUS_BASIC_KIT — Mão de obra + kit básico | R$ 649,90 | R$ 454,93 | R$ 129,98 | R$ 129,98 | R$ 194,97 | taxEstimateCents: R$ 11,70; paymentFeeCents: R$ 19,43; customerAcquisitionCostCents: R$ 5,00; supportCostCents: R$ 3,00; warrantyReserveCents: R$ 13,00; travelSubsidyCents: R$ 5,00; cashbackCostCents: R$ 0,00; refundReserveCents: R$ 6,50; otherVariableCostsCents: R$ 120,00; estimatedMealAllowanceCents: R$ 0,00; totalPlatformCostsCents: R$ 183,63 | R$ 11,34 | 5.82% | MARKET_ALIGNED | MEDIUM (30) |

**Separação de escopo:** A é somente mão de obra; materiais não estão incluídos. B inclui custo hipotético de kit básico, mas sua composição e limite de tubulação precisam ser aprovados antes de qualquer oferta. Os preços dos dois escopos não devem ser misturados.

## V5C126 — Diarista até 4h

- Preço candidato atual: R$ 129,90
- Melhor preço econômico analisado: R$ 179,90
- Recomendação: `READY_FOR_V5_WITH_MANUAL_APPROVAL`
- Motivo: Melhor compromisso testado entre preço psicológico, contribuição e remuneração; ganho/hora ainda exige validação operacional e aprovação humana.
- Aprovação manual: **obrigatória**

| Cenário/escopo | Preço | Payout | Ganho/h | Líquido/h após alimentação | Plataforma bruta | Custos | Margem | Margem % | Competitividade | Risco |
|---|---:|---:|---:|---:|---:|---|---:|---:|---|---|
| Preço testado | R$ 159,90 | R$ 120,00 | R$ 26,67 | R$ 26,67 | R$ 39,90 | taxEstimateCents: R$ 2,39; paymentFeeCents: R$ 4,78; customerAcquisitionCostCents: R$ 5,00; supportCostCents: R$ 3,00; warrantyReserveCents: R$ 3,20; travelSubsidyCents: R$ 5,00; cashbackCostCents: R$ 0,00; refundReserveCents: R$ 1,60; otherVariableCostsCents: R$ 0,00; estimatedMealAllowanceCents: R$ 0,00; totalPlatformCostsCents: R$ 24,97 | R$ 14,93 | 37.42% | MARKET_ALIGNED | HIGH (55) |
| Preço testado | R$ 169,90 | R$ 120,00 | R$ 26,67 | R$ 26,67 | R$ 49,90 | taxEstimateCents: R$ 2,99; paymentFeeCents: R$ 5,08; customerAcquisitionCostCents: R$ 5,00; supportCostCents: R$ 3,00; warrantyReserveCents: R$ 3,40; travelSubsidyCents: R$ 5,00; cashbackCostCents: R$ 0,00; refundReserveCents: R$ 1,70; otherVariableCostsCents: R$ 0,00; estimatedMealAllowanceCents: R$ 0,00; totalPlatformCostsCents: R$ 26,17 | R$ 23,73 | 47.56% | HIGH | HIGH (55) |
| Preço testado | R$ 179,90 | R$ 120,00 | R$ 26,67 | R$ 26,67 | R$ 59,90 | taxEstimateCents: R$ 3,59; paymentFeeCents: R$ 5,38; customerAcquisitionCostCents: R$ 5,00; supportCostCents: R$ 3,00; warrantyReserveCents: R$ 3,60; travelSubsidyCents: R$ 5,00; cashbackCostCents: R$ 0,00; refundReserveCents: R$ 1,80; otherVariableCostsCents: R$ 0,00; estimatedMealAllowanceCents: R$ 0,00; totalPlatformCostsCents: R$ 27,37 | R$ 32,53 | 54.31% | HIGH | HIGH (55) |
| Preço testado | R$ 189,90 | R$ 120,00 | R$ 26,67 | R$ 26,67 | R$ 69,90 | taxEstimateCents: R$ 4,19; paymentFeeCents: R$ 5,68; customerAcquisitionCostCents: R$ 5,00; supportCostCents: R$ 3,00; warrantyReserveCents: R$ 3,80; travelSubsidyCents: R$ 5,00; cashbackCostCents: R$ 0,00; refundReserveCents: R$ 1,90; otherVariableCostsCents: R$ 0,00; estimatedMealAllowanceCents: R$ 0,00; totalPlatformCostsCents: R$ 28,57 | R$ 41,33 | 59.13% | HIGH | HIGH (70) |
| Preço testado | R$ 199,90 | R$ 120,00 | R$ 26,67 | R$ 26,67 | R$ 79,90 | taxEstimateCents: R$ 4,79; paymentFeeCents: R$ 5,98; customerAcquisitionCostCents: R$ 5,00; supportCostCents: R$ 3,00; warrantyReserveCents: R$ 4,00; travelSubsidyCents: R$ 5,00; cashbackCostCents: R$ 0,00; refundReserveCents: R$ 2,00; otherVariableCostsCents: R$ 0,00; estimatedMealAllowanceCents: R$ 0,00; totalPlatformCostsCents: R$ 29,77 | R$ 50,13 | 62.74% | HIGH | HIGH (70) |

## V5C127 — Diarista diária

- Preço candidato atual: R$ 199,90
- Melhor preço econômico analisado: R$ 249,90
- Recomendação: `READY_FOR_V5_WITH_MANUAL_APPROVAL`
- Motivo: Melhor compromisso testado entre preço psicológico, contribuição e remuneração; ganho/hora ainda exige validação operacional e aprovação humana.
- Aprovação manual: **obrigatória**

| Cenário/escopo | Preço | Payout | Ganho/h | Líquido/h após alimentação | Plataforma bruta | Custos | Margem | Margem % | Competitividade | Risco |
|---|---:|---:|---:|---:|---:|---|---:|---:|---|---|
| Preço testado | R$ 219,90 | R$ 131,94 | R$ 15,52 | R$ 12,58 | R$ 87,96 | taxEstimateCents: R$ 5,28; paymentFeeCents: R$ 6,58; customerAcquisitionCostCents: R$ 5,00; supportCostCents: R$ 3,00; warrantyReserveCents: R$ 4,40; travelSubsidyCents: R$ 5,00; cashbackCostCents: R$ 0,00; refundReserveCents: R$ 2,20; otherVariableCostsCents: R$ 0,00; estimatedMealAllowanceCents: R$ 25,00; totalPlatformCostsCents: R$ 31,46 | R$ 56,50 | 64.23% | COMPETITIVE | HIGH (70) |
| Preço testado | R$ 229,90 | R$ 137,94 | R$ 16,23 | R$ 13,29 | R$ 91,96 | taxEstimateCents: R$ 5,52; paymentFeeCents: R$ 6,87; customerAcquisitionCostCents: R$ 5,00; supportCostCents: R$ 3,00; warrantyReserveCents: R$ 4,60; travelSubsidyCents: R$ 5,00; cashbackCostCents: R$ 0,00; refundReserveCents: R$ 2,30; otherVariableCostsCents: R$ 0,00; estimatedMealAllowanceCents: R$ 25,00; totalPlatformCostsCents: R$ 32,29 | R$ 59,67 | 64.89% | MARKET_ALIGNED | HIGH (70) |
| Preço testado | R$ 239,90 | R$ 143,94 | R$ 16,93 | R$ 13,99 | R$ 95,96 | taxEstimateCents: R$ 5,76; paymentFeeCents: R$ 7,17; customerAcquisitionCostCents: R$ 5,00; supportCostCents: R$ 3,00; warrantyReserveCents: R$ 4,80; travelSubsidyCents: R$ 5,00; cashbackCostCents: R$ 0,00; refundReserveCents: R$ 2,40; otherVariableCostsCents: R$ 0,00; estimatedMealAllowanceCents: R$ 25,00; totalPlatformCostsCents: R$ 33,13 | R$ 62,83 | 65.48% | MARKET_ALIGNED | HIGH (70) |
| Preço testado | R$ 249,90 | R$ 149,94 | R$ 17,64 | R$ 14,70 | R$ 99,96 | taxEstimateCents: R$ 6,00; paymentFeeCents: R$ 7,47; customerAcquisitionCostCents: R$ 5,00; supportCostCents: R$ 3,00; warrantyReserveCents: R$ 5,00; travelSubsidyCents: R$ 5,00; cashbackCostCents: R$ 0,00; refundReserveCents: R$ 2,50; otherVariableCostsCents: R$ 0,00; estimatedMealAllowanceCents: R$ 25,00; totalPlatformCostsCents: R$ 33,97 | R$ 65,99 | 66.02% | HIGH | HIGH (70) |
| Preço testado | R$ 259,90 | R$ 155,94 | R$ 18,35 | R$ 15,40 | R$ 103,96 | taxEstimateCents: R$ 6,24; paymentFeeCents: R$ 7,77; customerAcquisitionCostCents: R$ 5,00; supportCostCents: R$ 3,00; warrantyReserveCents: R$ 5,20; travelSubsidyCents: R$ 5,00; cashbackCostCents: R$ 0,00; refundReserveCents: R$ 2,60; otherVariableCostsCents: R$ 0,00; estimatedMealAllowanceCents: R$ 25,00; totalPlatformCostsCents: R$ 34,81 | R$ 69,15 | 66.52% | VERY_HIGH | HIGH (70) |

## Decisão de segurança

- Nenhum preço oficial foi substituído.
- Nenhum cashback, crédito, raio ou kit foi ativado.
- V5C126 e V5C127 são READY_FOR_V5_WITH_MANUAL_APPROVAL e mantêm BELOW_REFERENCE para remuneração/hora.
- V5C047 tem recomendação financeira condicional, ainda sujeita a aprovação humana do preço e do escopo.
- V5C001 mantém R$ 99,90 e prioriza crédito parcial mais raio curto.
