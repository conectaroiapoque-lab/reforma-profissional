# Auditoria inicial de pré-lançamento — 21/09/2026

Auditoria feita antes da alteração, sobre `af13332` (branch local recebida como main atual).

| Verificação | Evidência inicial | Resultado |
|---|---|---|
| PR #22 | merge `ec08f96` | Mesclada |
| PR #23 | merge `af13332` | Mesclada |
| Home limpa | commit `d438e83` e regressões existentes | Confirmada |
| Categoria única Montagem / Instalação / Marido de Aluguel | `CATEGORY_LABELS` e teste de regressão | Funcionando |
| `/api/orders` | handler, validação JSON e testes | Funcionando |
| V4 | `catalog.js`, versão `RMBH-2026-09-v4` | Em produção antes desta release |
| V6 | `catalog-v6-candidate.js` | `DRAFT`, não publicada |
| Contratos | drafts em `docs/` | Ainda `DRAFT` |
| Termos do cliente | `customer-terms-draft.md` | Ainda `DRAFT` |
| Pagamentos | sem adapter de adquirência real | Sem integração real |

## Decisão
Criar V7 explicitamente, preservar V4 em arquivo imutável de rollback e não promover a V6 candidata. A ausência de remote Git neste checkout é uma pendência operacional para publicação da branch/PR, não foi ocultada.
