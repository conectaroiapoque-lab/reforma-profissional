# Certificação de go-live remediada — 21/09/2026

## Escopo e base

- Base obrigatória: `ad2e52a20270bf49f8db9afa009586880a90cc96` (main após PR #26).
- Branch: `codex/remediar-bloqueadores-finais-go-live`.
- Restrições preservadas: catálogo V7, preços, contratos, regras comerciais, layout, WhatsApp, PWA, documentos jurídicos, responsabilidades e adapter Mercado Pago.

## Comparativo

| Severidade | Antes | Depois |
|---|---:|---:|
| CRITICAL | 0 | 0 |
| HIGH | 9 | 0 internos |
| MEDIUM | 4 | 4 não reavaliados neste escopo |
| LOW | 3 | 3 não reavaliados neste escopo |

H-01 fica `EXTERNAL_VALIDATION_REQUIRED`, e não FAIL: o proxy deste ambiente respondeu 403 ao túnel para ambos os hosts. A configuração versionada tem build/output corretos, redirect canônico HTTPS, HSTS, CSP e APIs server-side; o checklist proprietário está em `docs/manual-production-domain-validation.md`.

## Matriz dos bloqueadores

| ID | Resultado | Evidência verificável |
|---|---|---|
| H-01 domínio/HTTPS/deploy | EXTERNAL_VALIDATION_REQUIRED | `vercel.json`, ausência de URL HTTP de produção e checklist manual de 10 passos. |
| H-02 backup/restore | PASS | Export com tipos/TTL/checksum, restore limitado a `restore-test-*` e teste write → backup → delete → restore → read/checksum. |
| H-03 cliente/datastore | PASS | Integração server-side FIXED/FROM/QUOTE com reabertura de repository persistente, preço server-side, aceite, evidenceId e idempotência. |
| H-04 prestador | PASS | Perfil, oportunidades, ordens e ações protegidas por sessão, filtradas por proprietário e persistidas. |
| H-05 admin | PASS | Ordens, prestadores, aprovação/revisão, atribuição, quote, autorização e change order server-side. |
| H-06 quote/change order | PASS | Fluxo completo, rejeição, autorização obrigatória e adicional aplicado somente após aceite. |
| H-07 rate limit | PASS | Redis em produção; pedidos, login, evidence, quote/documentos, aceite legal e webhook invocam limiter com identidade composta por conexão/contexto. |
| H-08 auth/RBAC | PASS | Sessões HMAC, login com PBKDF2, cookies seguros, papéis e allowlists; adulteração, expiração e segregação testadas. |
| H-09 antecedentes | PASS | Upload privado, `UNDER_REVIEW`, revisão humana Compliance/Security, decisão auditada e sem auto-ban. |
| H-09 documento fiscal | PASS | Submissão manual completa, revisão Finance e repasse bloqueado até `APPROVED`. |

## Validações executadas

- `npm test`: 196 total, 196 pass, 0 fail.
- `npm run build:web`: PASS.
- `node --check` em todo JavaScript versionável: PASS.
- `git diff --check`: PASS.
- Busca de fixtures públicas (`João Técnico`, `4.9`, `25 min`, `328`, `8 anos`, palavras inteiras demo/mock/simulado/MVP): limpa.
- Busca de padrões de segredos em `dist`: limpa.
- Busca de payload privado em `dist`: limpa.
- Busca de PDF/DOC/DOCX/Markdown/source map em `dist`: limpa.
- Harness mobile existente cobre estrutura responsiva; não houve alteração visual. Browser/dispositivo real de 360/390/412 px e Android real: `NOT_TESTABLE_IN_ENVIRONMENT`.
- Correção da PR #27 consolidou 33 Functions em 11; novo preview Vercel: `AGUARDANDO` após o push do commit corretivo.

## Dependências externas e decisão fiscal

- Google Play: `EXTERNAL_DEPENDENCY`.
- Credenciais/transação real Mercado Pago: `EXTERNAL_DEPENDENCY`; adapter existente não foi alterado.
- Android real: `NOT_TESTABLE`.
- NFS-e automática: `POST_LAUNCH`.
- Fluxo fiscal manual: `PASS` para go-live.

## Veredito

**PRONTO PARA AUDITORIA FINAL DE LANÇAMENTO**

A publicação continua condicionada à validação externa do domínio/certificado pelo proprietário e ao processo normal de revisão/merge. Esta branch não foi mergeada.
