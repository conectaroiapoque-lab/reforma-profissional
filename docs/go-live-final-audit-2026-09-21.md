# Auditoria final de go-live — 21/09/2026

## Antes (commit `5bbe10d`)

| Controle | Evidência | Estado |
|---|---|---|
| PR #24 | commit de merge `2ab1955` é ancestral do HEAD | Presente |
| Catálogo | `CATALOG_VERSION = RMBH-2026-09-v7-launch` | Preservado |
| Rollback | `catalog-v4.js` | Preservado |
| Mercado Pago | `enabled` somente quando `MERCADO_PAGO_ENABLED=true`; credenciais obrigatórias | Fail closed |
| Contratos v1 | fontes `customer-service-terms-v1.md` e `provider-service-agreement-v1.md` | Presentes, mas Cliente recebia Markdown bruto |
| Compliance | `domain/launch-compliance.js` | Presente |
| Pedidos | `api/orders.js` com repositório Redis e idempotência | Presente; falha fechada sem KV |

Foram encontrados bloqueadores: documento do Cliente publicado como Markdown; hashes jurídicos literais; foto não persistida; métricas e prestador fictícios; mensagem de IA simulada; pagamento demonstrativo.

## Depois

- Contratos têm páginas HTML mobile-first em `/termos/cliente/` e `/termos/prestador/`; Markdown permanece apenas como fonte interna e não entra em `dist`.
- Registry lê a fonte aprovada no servidor e calcula SHA-256. O navegador não define hash, sujeito ou papel.
- Upload valida assinatura real do arquivo, MIME/extensão/tamanho/finalidade, gera UUID e persiste privadamente; pedido guarda apenas `evidenceId`.
- Sessão assinada determina proprietário e papel; compliance/segurança são os únicos papéis com acesso cruzado a documento bruto.
- Métricas, ETA e prestador fictícios foram removidos do web build; pagamento desativado não simula transação.
- Cache PWA foi incrementado e exclui API e áreas privadas; headers de segurança foram configurados.
- Webhook do Mercado Pago valida HMAC e exige repositório idempotente; homologação real segue bloqueada por credenciais externas.

## Bloqueadores externos/operacionais ainda não comprovados

Credenciais e homologação Mercado Pago; configuração e teste real de backup; escala humana; Preview Vercel; validação Android real; conta/assinatura/SHA-256/AAB/publicação Google Play; revisão jurídica externa; validação do domínio/HTTPS a partir do ambiente de deploy.
