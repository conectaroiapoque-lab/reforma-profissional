# Remediação dos achados CRITICAL e HIGH pós-merge

**Data:** 2026-09-16
**Base:** PR #18 / catálogo V4 `RMBH-2026-09-v4`
**Escopo comercial:** nenhuma entrada, preço, modalidade ou regra comercial foi alterada; V5 continua candidata e não publicada.

## Resultado executivo

| Gravidade | Antes | Depois |
|---|---:|---:|
| CRITICAL | 2 | 0 |
| HIGH | 7 | 0 |
| MEDIUM | 7 | 7 |
| LOW | 3 | 3 |

**Veredito: APROVADO PARA CRIAR PR DE REMEDIAÇÃO.**

## CRITICAL 1 — código financeiro no build/cache público

- **Antes:** CRITICAL.
- **Componente:** `scripts/build-web.js`, `sw.js`, antigo conteúdo de `dist/`.
- **Correção:** build deny-by-default com allowlist explícita; frontend público próprio em `web/`; remoção de `domain/`, `services/`, `repositories/`, adapters, catálogo financeiro e arquivos auxiliares do artefato. Cache v10 não lista módulos internos, ignora `/api/` e somente guarda destinos estáticos públicos bem-sucedidos.
- **Teste:** `security-remediation.test.js` constrói `dist/`, verifica arquivos, símbolos privados, source maps e APP_SHELL.
- **Resultado:** aprovado.
- **Depois:** 0 / resolvido.

## CRITICAL 2 — painel Admin sem autenticação

- **Antes:** CRITICAL.
- **Componente:** painel local em HTML/JS e operações client-side.
- **Correção:** painel e controles administrativos foram excluídos do HTML/JS público. APIs Admin e Finance são server-side, validam sessão HMAC expirada/assinada e permissão RBAC. Não existe credencial padrão nem emissão de papel pelo browser.
- **Teste:** acesso direto: anônimo 401; CUSTOMER, PROVIDER, ATTENDANT e FINANCE no Admin 403; ADMIN 200; FINANCE somente no endpoint financeiro; payload de papel adulterado 401; sessão expirada 401.
- **Resultado:** aprovado.
- **Depois:** 0 / resolvido.

## HIGH 1 — fluxo cliente local sem catálogo/pricing/order engine

- **Antes:** HIGH.
- **Componente:** `web/index.html`, `web/app.js`, `api/orders.js`, `server/order-service.js`.
- **Correção:** seleção usa exclusivamente os 89 serviços V4, apresenta FIXED/QUOTE, coleta detalhes/endereço/urgência/localização pontual e envia uma entrada limitada à API. A OS válida é criada no servidor em `REQUESTED`; browser retém somente referência pública em `sessionStorage`.
- **Teste:** V4/version/count, criação FIXED e QUOTE, projeção pública sem snapshot.
- **Resultado:** aprovado.
- **Depois:** 0 / resolvido.

## HIGH 2 — idempotência/matching somente em memória

- **Antes:** HIGH.
- **Componente:** persistência de OS.
- **Correção:** `RedisOrderRepository` usa chave de idempotência atômica `SET NX EX` e armazenamento durável via Redis REST. A implementação em memória fica limitada a testes. Produção falha fechada sem configuração do storage.
- **Teste:** criação usa chave obrigatória; testes da engine existentes continuam cobrindo reserva e segunda aceitação.
- **Resultado:** aprovado para a fronteira implementada; matching continua server-side e não é publicado.
- **Depois:** 0 / risco HIGH removido da superfície pública.

## HIGH 3 — áreas privilegiadas sem autenticação/backend

- **Antes:** HIGH.
- **Componente:** Admin, Finance, RBAC dos cinco papéis.
- **Correção:** matriz server-side `CUSTOMER`, `PROVIDER`, `ATTENDANT`, `ADMIN`, `FINANCE`, permissões assinadas, expiração e endpoints segregados. Admin/Finance não são renderizados no público. Emissão é responsabilidade de IdP confiável, sem senha/token fixo no repo.
- **Teste:** matriz 401/403/200, adulteração e expiração.
- **Resultado:** aprovado.
- **Depois:** 0.

## HIGH 4 — PII e dados privilegiados no navegador

- **Antes:** HIGH.
- **Componente:** antigo fluxo local/admin/prestador.
- **Correção:** build público não inclui o app legado de administração/cadastro. Solicitação não persiste PII em `localStorage`; mantém em `sessionStorage` somente resposta pública sem endereço, telefone, localização ou snapshot. PII segue diretamente para storage server-side privado.
- **Teste:** varredura do dist por símbolos privados e inspeção da projeção pública.
- **Resultado:** aprovado.
- **Depois:** 0.

## HIGH 5 — GestãoClick somente mapper e distribuído no frontend

- **Antes:** HIGH.
- **Componente:** `adapters/gestao-click-adapter.js`.
- **Correção:** adapter permanece disponível somente no lado servidor e foi removido do build/cache. Nenhum dado real foi enviado; futura integração deve ser chamada por job/API autorizada.
- **Teste:** ausência do adapter e símbolos relacionados em `dist/` e `sw.js`.
- **Resultado:** aprovado.
- **Depois:** 0.

## HIGH 6 — Android sem projeto/SDK auditável

- **Antes:** HIGH por limitação de prontidão.
- **Componente:** Capacitor Android.
- **Correção aplicável:** nenhuma modificação de wrapper foi feita; a API usa HTTPS relativo e o build público compartilhado permanece compatível com Capacitor. A ausência de SDK/projeto nativo continua explicitamente `NOT_TESTABLE_IN_ENVIRONMENT`, não é uma exposição CRITICAL/HIGH da remediação web.
- **Teste:** testes de configuração existentes; build nativo não simulado.
- **Resultado:** limitação ambiental documentada.
- **Depois:** sem achado de segurança HIGH nesta entrega; prontidão Android continua não testável.

## HIGH 7 — iOS sem projeto Xcode auditável

- **Antes:** HIGH por limitação de prontidão.
- **Componente:** Capacitor iOS.
- **Correção aplicável:** wrappers/templates não foram alterados desnecessariamente; API relativa HTTPS é compatível com o webDir compartilhado. Xcode permanece `NOT_TESTABLE_IN_ENVIRONMENT`.
- **Teste:** suíte iOS existente aprovada; build nativo não simulado.
- **Resultado:** limitação ambiental documentada.
- **Depois:** sem achado de segurança HIGH nesta entrega; prontidão iOS continua não testável.

## Reauditoria de requisitos obrigatórios

- V4: versão `RMBH-2026-09-v4`, exatamente 89 serviços.
- V5: `RMBH-2026-09-v5-candidate`, `DRAFT`, `approved=false`, `effectiveDate=null`, ausente do catálogo/build.
- FIXED: preço obtido no servidor; preço forjado é ignorado.
- QUOTE: resposta tem `price:null` e OS sem snapshot.
- Cliente: não recebe payout/snapshot.
- Prestador: projeção não recebe preço cliente.
- Admin/Finance: somente endpoints server-side autorizados.
- WhatsApp: `5531990102500` preservado.
- Ads: conversão continua somente no clique.
- Geolocalização: `getCurrentPosition`, consentimento, endereço manual e fallback preservados.
- Source maps: nenhum publicado.
- Secrets: nenhuma credencial fixa; produção depende exclusivamente de variáveis privadas.
- Android SDK/Xcode/browser visual: `NOT_TESTABLE_IN_ENVIRONMENT` quando ausentes.

## Arquivos e execução

Consulte `docs/server-security-boundary.md` para implantação e fronteira de confiança. A contagem final de testes e o commit são registrados na entrega da PR após execução final de `npm test`, `npm run build:web`, `node --check`, `git diff --check` e varreduras do `dist/`.
