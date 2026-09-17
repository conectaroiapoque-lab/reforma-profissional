# Modelo fiscal do autônomo PF — DRAFT

`legalReviewRequired = true` · `accountingReviewRequired = true` · funcionalidade desativada

O modelo fiscal padrão é `PENDING_ACCOUNTING_VALIDATION`; o contratante padrão é `PENDING_LEGAL_ACCOUNTING_VALIDATION`. Município, atividade, natureza, contratante real e parecer contábil definem entre `MUNICIPAL_NFSE`, `RPA` ou outro documento permitido. Não se presume RPA nem retenção de 11%.

O perfil configurável registra base e alíquotas (nulas até aprovação), necessidade de retenção/eSocial, outras retenções, referência e vigência. Valores separados: `providerINSSWithholdingCents`, `contractorINSSCostCents`, `incomeTaxWithholdingCents`, `issWithholdingCents`, `otherWithholdingCents`.

NFS-e PF, quando admitida, registra CPF, inscrição municipal, número, verificação, CPF/CNPJ do tomador, valor, emissão, município e status. RPA somente após aprovação contábil e deve discriminar prestador, CPF, PIS/NIT quando necessário, serviço, bruto, INSS, IRRF, ISS, outras retenções, líquido, data, contratante e OS.
