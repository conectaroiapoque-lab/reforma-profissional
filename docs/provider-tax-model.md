# Modelo fiscal do prestador empresarial — DRAFT

`legalReviewRequired = true` · `accountingReviewRequired = true`

MEI, ME, EPP e outra PJ usam cadastro, contrato, documento e payout próprios. `providerInvoice` contém CNPJ do prestador, CPF/CNPJ do tomador, OS, número, código de verificação, emissão, valor em centavos, município e estado (`PENDING`, `ISSUED`, `VALIDATING`, `VALID`, `REJECTED`, `CANCELLED`).

Fluxo: `SERVICE_COMPLETED → CUSTOMER_CONFIRMATION → NFSE_PENDING → NFSE_VALIDATION → PAYOUT_APPROVED → PAID`. Falha do portal gera `TAX_SYSTEM_UNAVAILABLE` e análise administrativa, nunca punição automática. A data candidata `NATIONAL_NFSE_ME_EPP_REQUIRED_FROM = 2026-11-01` é configuração protegida e requer confirmação contábil antes de qualquer ativação.
