# Simulação tributária

O perfil tributário é versionado, auditável e configurável; nenhuma alíquota fiscal definitiva está embutida no motor.

- `PLATFORM_REVENUE_ONLY`: usa a receita bruta da plataforma como base.
- `GROSS_TRANSACTION_VALUE`: usa o total final pago pelo cliente como base.

A estimativa é `round(base em centavos × taxRateBasisPoints / 10000)`. Imposto é custo exclusivo da plataforma e nunca reduz o repasse do prestador.

> **A configuração tributária definitiva deverá ser validada pela contabilidade responsável.**

O tratamento fiscal definitivo da Reforma Profissional depende dessa validação. O motor suporta simulação e não determina sozinho a obrigação tributária real.
