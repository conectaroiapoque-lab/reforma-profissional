# FINAL GO-LIVE AUDIT — REFORMA PROFISSIONAL

**Data da auditoria:** 21/09/2026
**Escopo:** auditoria estática completa, testes automatizados, build local e inspeção dos artefatos públicos. Nenhum dado foi enviado às integrações externas, nenhum restore foi executado e nenhuma regra de negócio foi alterada.

## Sumário obrigatório

**BRANCH:** `work`
**SHA AUDITADO:** `c66e08592d6c099de57eec59c648569de098dbbc`
**PR:** #27
**VERCEL PREVIEW:** PASS — implantação mais recente informada pelo proprietário como concluída; a suíte local confirma 11 Functions importáveis. O status remoto não pôde ser consultado independentemente pelo proxy deste ambiente.
**CATÁLOGO ATIVO:** `RMBH-2026-09-v7-launch`
**SERVIÇOS:** 111
**CONTRATO CLIENTE:** `customer-service-terms-v1`
**CONTRATO PRESTADOR:** `provider-service-agreement-v1`
**BUILD APP:** `1.0.0` / versionCode `1` / iOS build `1`

**CRITICAL:** 0
**HIGH:** 7
**MEDIUM:** 6
**LOW:** 3

**TESTES:** 196 / 196 / 0
**BUILD:** PASS
**CLIENTE:** FAIL
**PRESTADOR:** FAIL
**ADMIN:** FAIL
**FINANCE:** PASS (API; UI real não testável)
**COMPLIANCE:** PARTIAL
**RBAC:** PASS para os casos automatizados; FAIL no resultado global devido às projeções de dados do Prestador
**QUOTE:** PASS
**CHANGE ORDER:** PASS

**GEOLOCALIZAÇÃO:** FAIL
**GEOLOCALIZAÇÃO GPS:** PARTIAL — fallback manual e timeout existem; browser real indisponível.
**ENDEREÇO MANUAL:** FAIL — contratação não exige GPS, mas UF não existe e CEP não é persistido pelo serviço.
**PRIVACIDADE DE LOCALIZAÇÃO:** FAIL — a API de oportunidades devolve a ordem bruta.
**MATCHING CLIENTE/PRESTADOR:** FAIL — engines existem, mas não estão conectadas ao fluxo operacional.
**DISTÂNCIA:** PARTIAL — Haversine geodésica existe e é testada; não é distância rodoviária, e faltam ranges no engine.
**SEM PRESTADOR PRÓXIMO:** PARTIAL — o engine retorna lista vazia sem inventar prestador, mas não há tratamento conectado para cliente/fila administrativa.

**MOBILE:** NOT_TESTABLE_IN_ENVIRONMENT
**CONTRATO CLIENTE MOBILE:** NOT_TESTABLE_IN_ENVIRONMENT
**CONTRATO PRESTADOR MOBILE:** NOT_TESTABLE_IN_ENVIRONMENT
**DOMÍNIO:** EXTERNAL_VALIDATION_REQUIRED
**HTTPS:** EXTERNAL_VALIDATION_REQUIRED
**PWA:** PASS por inspeção/build/testes; instalação real não testável
**BACKUP/RESTORE:** PARTIAL — algoritmo testado isoladamente; restore real do provider não executado
**SEGURANÇA:** FAIL
**PRIVACIDADE:** FAIL
**WHATSAPP:** PASS
**GOOGLE ADS:** PASS
**MERCADO PAGO:** EXTERNAL_DEPENDENCY
**GOOGLE PLAY:** EXTERNAL_DEPENDENCY
**ANDROID REAL:** NOT_TESTABLE
**NFS-e AUTOMÁTICA:** POST_LAUNCH
**FLUXO FISCAL MANUAL:** PASS

## Metodologia e limitações

Foram executados `npm test`, `npm run build:web`, `node --check` em todos os arquivos JavaScript fora de `node_modules`/`dist`, `git diff --check`, import das 11 Functions sem secrets e buscas por segredos, dados privados, documentos, source maps e fixtures no `dist`. O build público possui 29 arquivos e aproximadamente 300 KiB.

O proxy recusou com HTTP 403 todas as conexões HTTPS ao apex, `www`, manifest, termos e API. Não havia Chrome/Chromium/Firefox/Playwright, `adb` ou `sdkmanager`. Por isso não foram simulados visualmente os viewports 360/375/390/412/430/768/1024/1366/1920, GPS real, instalação PWA, certificado ou Android real. O Gradle existente, sozinho, não comprova o aplicativo.

`npm audit --omit=dev` não pôde rodar porque o repositório não possui lockfile na raiz. Isso é uma constatação do repositório, não uma limitação de rede.

## Achados HIGH — bloqueadores internos

### HIGH-01 — O endpoint do Prestador expõe a ordem bruta antes da autorização

`GET opportunities` filtra apenas `providerId` e `OFFERED`, mas devolve o objeto integral persistido. Esse objeto contém endereço, latitude/longitude, nome/WhatsApp do cliente, aceite, evidência e `pricingSnapshot` financeiro. `GET orders` também devolve a ordem integral. Isso viola minimização, revela endereço antes do aceite/autorização e pode revelar margem, CAC e demais campos internos ao Prestador.

**Evidência:** `server/operations-api.js`, retornos diretos de `orders`; `server/order-service.js`, composição da ordem com dados privados; `domain/order-engine.js`, persistência do endereço e snapshot.

**Necessário:** projeções allowlist distintas para oportunidade pré-aceite e ordem autorizada; nunca serializar o aggregate bruto.

### HIGH-02 — Coordenadas de pedido adulteradas são aceitas pelo servidor

O endpoint reverso valida ranges, mas `createCustomerOrder` aceita qualquer latitude/longitude finita. Assim, `91`, `-91`, `181` e `-181` enviados diretamente a `POST /api/orders` são persistidos. `haversineKm` também valida apenas finitude, não ranges. O frontend não constitui fronteira de confiança.

**Necessário:** validação server-side compartilhada para ranges, precisão, timestamp e formato; rejeitar coordenadas inválidas em criação, indexação e matching.

### HIGH-03 — Endereço manual está incompleto para operação real

O formulário não possui UF. O frontend envia `postalCode`, mas o sanitizador server-side não o inclui no endereço persistido. CEP e UF são necessários para desambiguação operacional/fiscal e faziam parte do checklist solicitado.

**Necessário:** modelar, validar e persistir CEP/UF server-side sem alterar preços ou catálogo.

### HIGH-04 — Matching e elegibilidade não estão conectados às oportunidades reais

Há Haversine/matching em `services/**`, mas o fluxo operacional atribui manualmente por `providerId` e exige somente `onboardingStatus === APPROVED`. Ele não verifica disponibilidade, especialidade/serviço, raio, documentação válida, expiração ou antecedente `VALIDATED`. O endpoint de oportunidades apenas lista ordens já atribuídas. Logo PENDENTE/SUSPENSO/documentação vencida/antecedente não validado podem receber atribuição caso o único campo esteja `APPROVED`.

**Necessário:** política única de elegibilidade no serviço de atribuição/dispatch, integrando disponibilidade, catálogo, cobertura, distância, documentos, antecedentes e suspensão.

### HIGH-05 — Rate limit de produção pode não agrupar requisições do mesmo cliente

A identidade inclui `x-vercel-id`, valor de execução/request que varia entre requisições. Isso pode criar uma chave Redis diferente a cada chamada e impedir que o contador alcance o limite. O teste atual comprova o limiter em memória e que handlers chamam o spy, mas não prova 429 através das Functions/Redis. Além disso, `change-order`, accept/start/complete e reverse geocode não têm enforcement explícito equivalente.

**Necessário:** identidade estável derivada de subject autenticado e IP confiável normalizado pela plataforma; teste de integração que atravesse cada Function e produza 429.

### HIGH-06 — Não existe jornada operacional frontend de Prestador/Admin conectada às APIs

O build allowlist publica `web/index.html`/`web/app.js`, que implementam a jornada do cliente. `provider.js`, o dashboard local antigo e `app.js` não entram no `dist`; as Functions existem, mas não há UI pública conectada para cadastro, login, oportunidades, revisão administrativa e ações operacionais. O cadastro antigo que existe fora do build usa `localStorage` e marcadores `LOCAL_MVP`, portanto não é alternativa de produção.

**Necessário:** frontend autenticado que consuma as APIs existentes, ou ferramenta operacional formal validada, antes de atender Prestador/Admin reais.

### HIGH-07 — Retentativa de criação pode duplicar uma OS

O submit cria `crypto.randomUUID()` a cada tentativa. Duplo clique durante a mesma promessa é contido pelo botão desabilitado, mas se o servidor persistir e a resposta se perder, a retentativa recebe uma nova chave e cria outra OS. A idempotência server-side funciona apenas quando a chave é reutilizada.

**Necessário:** gerar uma chave por intenção de pedido e mantê-la até sucesso definitivo/reset explícito.

## Achados MEDIUM

1. **Fluxos de reclamação, garantia e cancelamento não estão expostos nas APIs operacionais.** Os textos e estados de domínio existem parcialmente, mas a jornada completa solicitada não é executável.
2. **Reverse geocode público não possui rate limit.** Uma chave Google configurada pode sofrer consumo/custo abusivo.
3. **Webhook Mercado Pago exportado não injeta repository.** A Function responde `WEBHOOK_STORE_NOT_CONFIGURED` até haver wiring real; permanece EXTERNAL_DEPENDENCY com feature flag desligada.
4. **Backup/restore não foi provado contra o Redis/KV real.** O teste usa cliente em memória. Tipos, TTL e checksum estão cobertos, e o restore recusa namespace não isolado, mas RPO/RTO/provider snapshot continuam sem evidência nesta auditoria.
5. **Sem lockfile raiz.** Instalações não são totalmente reproduzíveis e `npm audit` não funciona; versões transitivas podem variar.
6. **Termos renderizados exibem metadados técnicos.** O HTML mostra nomes como `acceptanceEvidenceId`, `termsHash`, `providerId` e a expressão “HTML/Markdown”. Não é Markdown cru, mas não atende integralmente ao requisito de não exibir metadados técnicos ao cliente.

## Achados LOW

1. Documentação histórica e arquivos raiz ainda contêm referências a “MVP”, “demo” e fluxo local; eles não entram no build público, mas aumentam risco operacional de uso do entrypoint errado.
2. A resposta pública usa códigos de erro internos em inglês em alguns cenários; o frontend apresenta a string diretamente, reduzindo clareza para o cliente.
3. O `iosBundleId` contém comentário de confirmação pendente; não bloqueia Web, mas precisa decisão antes das lojas.

## Áreas aprovadas ou parciais

### Cliente

FIXED, FROM e QUOTE têm preço resolvido server-side; campos financeiros enviados pelo browser são ignorados; aceite/evidência/idempotência de repository persistem nos testes. O frontend possui obrigatórios, voltar/avançar, loading de localização, falha de API e bloqueio de duplo submit. O resultado global é FAIL pelos HIGH-02, HIGH-03 e HIGH-07, e por não haver reclamação/garantia operacional.

### Quote, change order e fiscal

A máquina testada impede início de QUOTE sem autorização, exige revisão antes do cliente, cobre rejeição e só aplica adicional após aceite. Documento fiscal passa por REQUIRED/SUBMITTED/APPROVED/REJECTED e apenas aprovação torna repasse `READY`.

### RBAC, upload e Compliance

Assinatura HMAC, expiração, cookie/token/role alterados e segregação vertical/horizontal têm testes. Upload valida magic bytes, MIME, extensão, tamanho e propósito; antecedentes ficam no storage privado e revisão é humana. A ativação/matching, entretanto, não usa de forma consistente o estado de antecedentes (HIGH-04), e a projeção do Prestador falha em privacidade (HIGH-01).

### Geolocalização

- **GPS:** solicitação one-shot, timeout de 10 s, sem background/continuous tracking no frontend publicado; permissão negada/navegador sem suporte retornam ao formulário manual.
- **Manual:** rua, número, complemento, bairro, cidade, CEP e referência aparecem, mas falta UF e CEP não persiste.
- **Distância:** `haversineKm` é distância geodésica. `StraightLineRoutingProvider` é estimativa por fator, identificada como `STRAIGHT_LINE_FALLBACK`; não é rota rodoviária real.
- **0/1/3/5/10/20 km:** matemática e limites básicos são exercitados pela suíte de engines, mas ranges de coordenadas não são validados pelo engine.
- **Sem profissional:** `matches` retorna `[]`; não há mensagem/fila conectada ao pedido real.

### Vercel

Há 11 Functions, catch-alls com allowlists e 404 para caminho não reconhecido. Todas importam sem secrets. `vercel.json` mantém build `npm run build:web`, output `dist`, CSP, HSTS, no-store para API e redirect canônico HTTPS. A implantação verde foi informada pelo proprietário; o proxy impediu confirmação independente.

### PWA, WhatsApp e Ads

Manifest e ícones são válidos; service worker exclui API/rotas sensíveis e source maps/documentos não entram no build. Os testes confirmam `5531990102500`, ausência do número antigo, CTAs das landing pages e uma única conversão oficial sem PII.

### Performance e acessibilidade

Não há framework pesado; `dist` tem aproximadamente 300 KiB, JS principal ~16 KiB e CSS principal ~24 KiB. Não foi identificado bloqueador grave estático. HTML usa labels, elementos nativos, `aria-live`, foco visível nos termos e botões de ao menos 44 px. Contratos gerados têm `h1`/`h2`, fonte base 18 px, line-height 1.7, zoom A−/A+ e checkbox de 24 px. Contraste, reflow e interação nos nove viewports permanecem NOT_TESTABLE sem browser.

### Android/Google Play e Mercado Pago

Digital Asset Links/fingerprint real não foi localizado no build auditado e ferramentas/dispositivo Android não estavam disponíveis. Não foi inventada assinatura. Mercado Pago permanece desabilitado por padrão e falha fechado sem credenciais; homologação/transação real não foi feita.

## Buscas de artefatos

- Nenhuma chave/segredo literal foi encontrada; ocorrências da busca são nomes de variáveis em testes.
- Nenhum payload de antecedentes, CPF/CNPJ serializado ou campo financeiro interno foi encontrado no `dist`.
- Nenhum `.map`, `.md`, PDF ou DOCX foi publicado.
- Nenhuma fixture pública dos termos pesquisados foi encontrada no `dist`.
- Existem mocks/demos/MVP somente em código antigo, testes e documentação fora da allowlist pública.

## BLOQUEADORES INTERNOS

1. Criar projeções seguras para oportunidade/ordem do Prestador (HIGH-01).
2. Validar ranges de coordenadas em todas as fronteiras server-side (HIGH-02).
3. Incluir e persistir UF/CEP no endereço manual (HIGH-03).
4. Conectar matching e política completa de elegibilidade ao fluxo real (HIGH-04).
5. Corrigir identidade/enforcement e provar 429 em produção-like (HIGH-05).
6. Disponibilizar jornada operacional real de Prestador/Admin conectada às APIs (HIGH-06).
7. Reutilizar idempotency key durante retentativas do mesmo pedido (HIGH-07).

## BLOQUEADORES EXTERNOS / NÃO TESTÁVEIS

- Validação independente do Preview, domínio, certificado, redirect e headers no deployment.
- Homologação Mercado Pago e credenciais reais.
- Google Play, assinatura/fingerprint, Android SDK/dispositivo e teste nativo.
- Browser/device matrix e instalação PWA reais.
- Restore do datastore em instância real isolada e evidência de RPO/RTO.
- Revisão jurídica externa indicada nos próprios documentos.

## Veredito

# NÃO APTO PARA LANÇAMENTO

Existem **7 HIGH internos** que podem comprometer privacidade do endereço/dados financeiros, integridade da geolocalização, seleção de profissionais, proteção contra abuso, operação dos painéis e duplicidade de OS. A implantação verde e os 196 testes aprovados não cobrem esses riscos.

Não foi feito merge nem publicação. Preços, catálogo, contratos e regras comerciais permaneceram inalterados. Aguardar correção dos HIGH e revisão humana final.
