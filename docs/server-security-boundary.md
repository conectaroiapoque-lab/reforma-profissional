# Fronteira server-side, autenticação e RBAC

## Modelo de implantação

As funções em `api/` são funções Node.js compatíveis com Vercel. O navegador público chama apenas `POST /api/orders`. O código em `server/`, `domain/`, `services/`, `repositories/`, `catalog-financial.js` e adapters internos não faz parte do diretório estático `dist/`.

Produção exige estas variáveis, configuradas somente no provedor (nunca com prefixo público):

- `AUTH_SESSION_SECRET`: segredo aleatório com pelo menos 32 caracteres usado para validar sessões HMAC SHA-256 emitidas por um componente de identidade confiável;
- `KV_REST_API_URL` e `KV_REST_API_TOKEN`: armazenamento Redis REST durável e privado para ordens e chaves de idempotência.

A aplicação falha fechada se segredo ou storage durável não estiver configurado. Não há credencial padrão, senha, token administrativo ou papel armazenado no browser.

## Sessões e autorização

`server/auth.js` valida assinatura, expiração, sujeito, papel e permissões no servidor. Os papéis são `CUSTOMER`, `PROVIDER`, `ATTENDANT`, `ADMIN` e `FINANCE`. Alterar payload, query string, `localStorage`, `window` ou CSS não produz uma assinatura válida.

- `/api/admin/orders`: exige `ADMIN_READ`; anônimo recebe 401 e qualquer outro papel recebe 403.
- `/api/finance/orders`: exige `FINANCE_READ`; inclusive ADMIN sem permissão financeira recebe 403.
- endpoints futuros de cliente/prestador devem aplicar sujeito/ownership além da permissão correspondente.

A emissão/login deve ser conectada a um IdP server-side. Esta entrega deliberadamente não cria senha local nem endpoint que permita ao navegador escolher seu papel.

## Ordens e preço

`POST /api/orders` aceita somente dados operacionais: código do serviço, descrição, endereço, localização pontual consentida, urgência, referência de agenda, modo de material e contato. O servidor:

1. resolve o código exclusivamente no catálogo oficial V4;
2. ignora campos financeiros extras enviados pelo browser;
3. calcula FIXED usando catálogo/engine privados;
4. mantém QUOTE sem preço e sem snapshot;
5. cria estado inicial `REQUESTED`;
6. persiste com idempotência no Redis;
7. serializa apenas a projeção pública, nunca o snapshot bruto.

As projeções administrativas e financeiras são produzidas dentro dos endpoints protegidos antes da serialização.

## PWA e cache

O service worker ignora `/api/`, origens externas e respostas que não sejam assets públicos. A allowlist de build não contém domínio, serviços internos, repositories, adapters, catálogo financeiro ou source maps.
