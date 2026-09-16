# Auditoria completa pós-merge — Reforma Profissional

**Data:** 2026-09-16

**Escopo:** estado local imediatamente após o merge da PR #18

**Branch/HEAD auditados:** `work` / `0a05728`

**Método:** revisão estática, testes automatizados, build local e inspeção dos artefatos em `dist/`. Nenhuma integração externa recebeu dados e nenhum preço, catálogo ou arquivo de produção foi alterado.

## Veredito

# NÃO APROVADO PARA TESTE CONTROLADO NO APP/SITE

Há exposição, no artefato web e no cache offline, do motor financeiro interno. Conforme o critério solicitado, qualquer exposição financeira interna é **CRITICAL** e impede aprovação. A V5 candidata, por outro lado, continua em `DRAFT`, não substituiu a V4 e não foi localizada no build público.

## Legenda

- ✅ **APPROVED** — evidência suficiente e resultado conforme.
- ⚠️ **ATTENTION** — funcionamento parcial, limitação ou risco que requer ação/revisão.
- ❌ **FAILED** — requisito verificável não atendido.
- ⏸ **NOT_TESTABLE** — impossível validar integralmente neste ambiente.
- Gravidade: **CRITICAL**, **HIGH**, **MEDIUM** ou **LOW**. Itens aprovados não recebem gravidade.

## Resumo executivo

| Área | Resultado | Síntese |
|---|---|---|
| Testes | ✅ APPROVED | 95 total, 95 aprovados, 0 falhos, 0 ignorados, 0 cancelados |
| Build web | ✅ APPROVED | concluído; warning de configuração npm `http-proxy` |
| Git/base | ✅ APPROVED | PR #18 no HEAD, sem conflito; árvore inicialmente limpa |
| V4 | ✅ APPROVED | `RMBH-2026-09-v4`, 89 serviços, permanece oficial |
| V5 | ✅ APPROVED | `RMBH-2026-09-v5-candidate`, `DRAFT`, `approved=false`, `effectiveDate=null`; ausente do build |
| Cliente | ⚠️ ATTENTION — HIGH | fluxo é um MVP local e não integra catálogo/preço/order engine de produção |
| Prestador | ⚠️ ATTENTION — HIGH | cadastro e disponibilidade locais; sem autenticação/backend real |
| Atendente | ⏸ NOT_TESTABLE — HIGH | não há superfície/papel autenticado específico implementado |
| Admin | ❌ FAILED — CRITICAL | painel administrativo é acessível sem autenticação e artefatos financeiros internos são públicos |
| Financeiro | ❌ FAILED — CRITICAL | `domain/financial-engine.js` é enviado e pré-cacheado no cliente |
| WhatsApp | ✅ APPROVED | número oficial `5531990102500`; testes e varredura sem número antigo de produção |
| Formulários | ⚠️ ATTENTION — HIGH | validações básicas; PII fica em `localStorage`; sem antifraude/anti-submit robusto |
| Geolocalização | ⚠️ ATTENTION — MEDIUM | captura pontual e remoção ao ficar offline; retenção/eliminação não automatizadas |
| Matching | ⚠️ ATTENTION — HIGH | lógica unitária aprovada, mas atomicidade é apenas em memória/conceitual |
| PWA | ⚠️ ATTENTION — CRITICAL | instalabilidade estrutural aprovada, porém cache inclui motor financeiro interno |
| Google Ads | ✅ APPROVED | conversão ocorre no clique de WhatsApp, sem PII/valor e sem disparo em pageview |
| GestãoClick | ⚠️ ATTENTION — HIGH | mapeadores segregados, mas adapter interno é distribuído e não houve teste de API real |
| Android | ⏸ NOT_TESTABLE — HIGH | SDK/ADB ausentes e projeto nativo Android inexistente |
| iOS | ⏸ NOT_TESTABLE — HIGH | Linux sem Xcode; existem apenas templates/manifesto/associação e documentação |
| Segurança | ❌ FAILED — CRITICAL | ausência de autenticação/autorização servidor, PII local e código financeiro no público |
| LGPD | ⚠️ ATTENTION — HIGH | avisos/finalidade existem, mas retenção, exclusão e controles efetivos dependem de backend e jurídico |
| Performance | ⚠️ ATTENTION — MEDIUM | artefatos pequenos, porém módulos backend/internal desnecessários são publicados e cacheados |
| Responsividade | ⏸ NOT_TESTABLE — MEDIUM | CSS contém breakpoints/safe areas; matriz visual e teclado não executada em navegadores/dispositivos |
| SEO | ⚠️ ATTENTION — MEDIUM | landings completas; home sem canonical, Open Graph e structured data |

### Contagem de achados por gravidade

Contagem consolidada de achados únicos (um achado pode afetar várias áreas):

| Gravidade | Quantidade |
|---|---:|
| CRITICAL | 2 |
| HIGH | 7 |
| MEDIUM | 7 |
| LOW | 3 |

## 1. Git / base

✅ **APPROVED**

- `git status --short --branch` mostrou `## work`, sem mudanças antes da auditoria.
- HEAD `0a05728` é `Merge pull request #18 from conectaroiapoque-lab/codex/criar-v5-candidata-de-precos-e-simulador-financeiro`.
- O histórico de 20 commits contém os merges #18 a #8 relevantes e não exibe marcadores de conflito.
- `git diff --check` passou antes da auditoria.
- A branch local se chama `work`, não `main`; não há upstream exibido, portanto divergência/push pendente contra remoto não pôde ser afirmada.

## 2. Garantia V4 / V5

✅ **APPROVED**

- V4: `RMBH-2026-09-v4`, 89 serviços, é a única versão usada por `catalog.js`.
- V5: `RMBH-2026-09-v5-candidate`, 128 serviços, `CANDIDATE_STATUS="DRAFT"`, `approved=false`, `effectiveDate=null`.
- `index.html` carrega `catalog.js`, mas não `catalog-v5-candidate.js` nem `catalog-financial.js`.
- A busca no `dist/` por versão/nome/códigos V5 não retornou ocorrências.
- O build não copia `catalog-v5-candidate.js`, scripts de simulação, relatórios V5 nem `catalog-financial.js`.
- Não há publicação automática nem caminho de promoção da candidata no frontend.

## 3. Build e testes

✅ **APPROVED**

- `npm test`: **95 total / 95 pass / 0 fail / 0 cancelled / 0 skipped / 0 todo**.
- `npm run build:web`: sucesso, gerou `dist/`.
- `node --check`: todos os arquivos `.js` do repositório, excetuando dependências e o `dist/` gerado, passaram.
- Warning não bloqueante: npm informa que a configuração desconhecida `http-proxy` deixará de funcionar em uma versão principal futura.
- `git diff --check`: sem whitespace errors.

## 4. Home / site

⚠️ **ATTENTION — MEDIUM**

- Nome, logo textual, menus, navegação SPA, rodapé, CTAs e telefone oficial `(31) 2510-2500` estão presentes.
- WhatsApp central é `5531990102500`; links externos usam `noopener`.
- Manifest e registro do service worker estão presentes.
- Não houve execução visual real; imagens são predominantemente ícones/elementos textuais e SVG.
- O link `Painel Admin` está exposto na navegação e no rodapé sem autenticação (**ver achado crítico S2**).

## 5. Fluxo cliente completo

⚠️ **ATTENTION — HIGH**

- O wizard implementa tipo → descrição/foto → urgência → endereço/GPS → dados/termos → confirmação → acompanhamento.
- `Agora`, `Hoje`, `Amanhã` e `Agendar` existem; agendamento exige data/hora.
- Continuar/Voltar, validação por etapa, foto opcional, endereço manual e fallback de geolocalização estão implementados.
- Dados das etapas permanecem no DOM ao avançar/voltar, mas `startRequest()` intencionalmente reinicia o formulário ao iniciar nova solicitação.
- Não há etapa explícita de escolha de profissional, material ou preço V4. A solicitação grava `pricingSnapshot:null`, `materialMode:"NONE"` e opera apenas em `localStorage`; logo o fluxo completo de produção solicitado não está integrado.
- O acompanhamento usa uma sequência simplificada de sete rótulos, diferente da máquina de estados de domínio.

## 6. Preço do cliente

⚠️ **ATTENTION — HIGH**

- As allowlists automatizadas de `customerFinancialView` removem payout, percentual, imposto, CAC, suporte e margem.
- O catálogo público contém apenas campos públicos e não expõe regras financeiras globais.
- A UI de solicitação, entretanto, não apresenta preço FIXED do catálogo; todo pedido nasce sem snapshot e depende de orçamento manual no painel local.
- O artefato público contém o motor financeiro completo, incluindo nomes e fórmulas internas (**CRITICAL F1**), embora ele não esteja em uma tag `<script>` da home.

## 7. Orçamento / QUOTE

⚠️ **ATTENTION — HIGH**

- Todos os itens V4 `QUOTE` têm `customerPriceCents:null`; os testes garantem que QUOTE não é precificado pelo pricing engine.
- O catálogo público usa a apresentação “Sob orçamento”.
- Descrição, foto opcional, endereço e solicitação são aceitos.
- A UI não vincula a modalidade do catálogo à solicitação; o admin local pode informar orçamento para qualquer pedido, inclusive um serviço conceitualmente FIXED. Assim, não existe garantia ponta a ponta de que FIXED/QUOTE não seja alterado silenciosamente na UI.

## 8. Diarista

✅ **APPROVED**

- `V5C126` mantém preço candidato base R$ 129,90 e proposta manual R$ 179,90; `manualApprovalRequired=true`.
- `V5C127` mantém preço candidato base R$ 199,90 e proposta manual R$ 249,90; `manualApprovalRequired=true`.
- Nenhum código ou valor V5 aparece no build público.
- As views automatizadas segregam preço do cliente, payout e composição administrativa.

## 9. Split / ar-condicionado

✅ **APPROVED**

- `V5C047` existe somente na candidata, com `candidatePriceCents=64990`, tier recomendado `SPECIALIST` e mínimo de repasse separado.
- Relatório/simulação distingue escopo A (mão de obra) de escopo B (kit hipotético), exige aprovação humana e não altera V4.
- Não há publicação no `dist/`.

## 10. Visita hidráulica

✅ **APPROVED**

- `V5C001` mantém R$ 99,90, `creditableVisit=true`, raio/distância recomendada de 12 km no registro e recomendação posterior de raio curto/crédito parcial.
- Testes cobrem preservação do preço e aprovação manual, sem aumento automático.
- Ausente do build e sem conflito com o código oficial V4.

## 11. Geolocalização

⚠️ **ATTENTION — MEDIUM**

- Cliente e prestador usam `getCurrentPosition`, não `watchPosition`; não há tracking contínuo/background.
- Captura inclui latitude, longitude, accuracy, timestamp/capture time e consentimento; matching calcula Haversine, raio, rota/ETA fallback.
- Falha/negação mantém endereço manual para cliente e prestador offline.
- Ao ficar indisponível, a localização do prestador é removida.
- A política declara retenção (24 h prestador/90 dias pedido), mas não há job de expiração/exclusão; coordenadas do cliente persistem em `localStorage` sem criptografia. `source` não é salvo na captura da UI do cliente.

## 12. Matching / despacho

⚠️ **ATTENTION — HIGH**

- Testes cobrem disponibilidade, especialidade, proximidade/fora do raio, ordenação, ondas, segunda tentativa conceitual e ausência de candidatos.
- Reserva rejeita segunda aceitação e usa chave de idempotência em um `Map` no processo.
- Não há transação/banco/lock distribuído. Concorrência entre processos, abas ou dispositivos pode gerar dupla reserva; timeout e recusas não são orquestrados pela UI.

## 13. Prestador

⚠️ **ATTENTION — HIGH**

- `providerFinancialView` limita dados a serviço/escopo/distância/tempo, payout, bônus e total, sem preço cliente/margem/imposto/CAC.
- Não há UI real de oportunidade usando essa view; a área do prestador é um portal demonstrativo e não mostra ofertas ou remuneração antes do aceite.
- Cadastro e identidade são locais, sem autenticação.

## 14. Disponibilidade do prestador

⚠️ **ATTENTION — MEDIUM**

- Botões AVAILABLE/OFFLINE, consentimento GPS, negação segura e remoção da localização ao ficar offline estão implementados.
- Apenas prestador local em status aprovado pode ficar disponível.
- Como estado e aprovação ficam no cliente, podem ser manipulados via DevTools; não há fonte autoritativa para impedir disponibilidade falsa.

## 15. Status da ordem

⚠️ **ATTENTION — MEDIUM**

- A máquina de domínio contém os 17 estados solicitados, transições explícitas, cancelamento, disputa, conclusão, pagamento, payout e trilha de auditoria.
- Testes rejeitam transições inválidas e segunda reserva.
- A UI administrativa não usa `transitionOrderStatus`; ela avança por um array simplificado de sete status. Portanto a garantia de domínio não protege o fluxo visível.

## 16. Snapshot financeiro

✅ **APPROVED**

- `deepFreeze`, serialização estável, SHA-256, validação de hash e repositório append-only são testados.
- Criação de OS rejeita snapshot inválido.
- Snapshot é copiado para a OS e não é recalculado por mudança posterior do catálogo.
- Limite: persistência é uma interface/memória; produção ainda exigirá armazenamento transacional e imutável.

## 17. Segregação financeira

❌ **FAILED — CRITICAL**

- As cinco funções de visão existem e os testes de allowlist passam: cliente, prestador, atendente com permissões, admin e financeiro.
- Apesar disso, o build copia `domain/financial-engine.js` e o service worker o pré-cacheia. O arquivo público revela percentuais, campos, fórmulas de payout, imposto, CAC, suporte, reservas e margem.
- `services/pricing-engine.js`, `services/payment-engine.js` e `adapters/gestao-click-adapter.js` também são publicados/cacheados; o primeiro referencia `../catalog-financial`, que propositalmente não existe no build.
- `catalog-financial.js` em si **não** está no `dist/`, mas a regra solicitada abrange exposição financeira interna; logo o resultado é CRITICAL.

## 18. Atendente

⏸ **NOT_TESTABLE — HIGH**

- A função `attendantFinancialView` aplica permissões `CAN_VIEW_PROVIDER_PAYOUT` e `CAN_VIEW_PLATFORM_MARGIN` corretamente em testes.
- Não existe login, papel ou tela específica de atendente para validar cadastro, consulta, agenda e observações ponta a ponta.

## 19. Admin

❌ **FAILED — CRITICAL**

- `adminFinancialView` inclui preço, payout, percentuais, materiais, descontos, cashback, imposto, taxas, CAC, suporte, garantia, deslocamento, reservas, receita de parceiro, margem, status, aprovação, hash e versão.
- A tela admin visível não usa essa view nem mostra a composição completa.
- Qualquer visitante no mesmo navegador acessa o painel sem autenticação, visualiza PII local e altera orçamento, pagamento, prestador e status.

## 20. Financeiro

⚠️ **ATTENTION — HIGH**

- `financeFinancialView`, ledger e conciliação contêm os campos financeiros necessários e não incluem PII na allowlist.
- Não há papel autenticado, tela financeira, persistência contábil ou conciliação externa.
- O motor financeiro foi publicado no cliente (**F1**).

## 21. Materiais

✅ **APPROVED**

- Snapshot separa mão de obra, custo/venda de material, receita de parceiro e cashback.
- Payout incide sobre mão de obra, não automaticamente sobre material.
- Testes cobrem os modos e a separação. A UI cliente ainda fixa `materialMode:"NONE"` e não oferece os três cenários.

## 22. Cashback

⚠️ **ATTENTION — MEDIUM**

- Regras exigem serviço pago/concluído, bloqueiam saque e autoindicação e modelam cashback como custo separado.
- Simulações impedem recomendação silenciosa quando a margem deixa de ser positiva.
- Saldo, utilização concorrente, limite e expiração não possuem persistência/backend operacional; expiração não está implementada como processo.

## 23. WhatsApp

✅ **APPROVED**

- Home, sucesso/acompanhamento, admin e seis landing pages usam `wa.me`.
- O número corporativo central é `5531990102500`; o telefone fixo não é usado como WhatsApp.
- Não foram encontrados `api.whatsapp.com`, `whatsapp:` ou `intent:` em produção; isso é ausência de formatos alternativos, não link incorreto.
- O link admin para falar com o cliente usa o número informado pelo próprio cliente, como esperado.

## 24. Formulários

⚠️ **ATTENTION — HIGH**

- `required`, tipos de input, mensagens `role="alert"`, foco no erro, foto opcional/obrigatória conforme fluxo e mensagens de sucesso estão presentes.
- WhatsApp, CPF, CNPJ, Pix e endereço não têm validação semântica robusta; caracteres especiais são aceitos e escapados nas principais renderizações.
- Não há token/idempotência de submit no formulário DOM; clique repetido pode criar protocolos duplicados.
- PII de cliente/prestador (inclusive CPF/CNPJ/Pix) persiste em texto claro no `localStorage`.

## 25. GestãoClick

⚠️ **ATTENTION — HIGH**

- Adapter mapeia venda, conta a pagar e catálogo (código, descrição, categoria, modalidade, preço cliente e material) em funções separadas.
- O mapeamento de venda não inclui payout; payout vai em função própria.
- Não houve envio real, conforme requerido.
- O adapter é copiado para o build/cache público e depende do chamador para autorização/segregação; não existe cliente de API, autenticação, retry ou contrato remoto validado.

## 26. PWA

❌ **FAILED — CRITICAL**

- Manifest tem nome, descrição, start URL, scope, display standalone, cores e ícones `any`/`maskable`.
- Service worker usa versão `v9`, `skipWaiting`, `clients.claim` e remove caches antigos.
- Estratégia network-first com fallback existe.
- O `APP_SHELL` pré-cacheia motores financeiros e administrativos internos. Offline passa a disponibilizar esses arquivos e, além disso, qualquer falha de recurso devolve `index.html` sem verificar destino/tipo, podendo mascarar erros.

## 27. Google Ads

✅ **APPROVED**

- Tag `AW-17424041657` e `send_to` de conversão são consistentes.
- Conversão é acionada somente por clique em `.whatsapp-general`/`[data-whatsapp-cta]`, sem PII ou valor.
- Testes comprovam ausência de disparo no carregamento e tolerância quando `gtag` não está disponível.

## 28. SEO

⚠️ **ATTENTION — MEDIUM**

- Landings têm title/description, canonical, robots, Open Graph e JSON-LD; sitemap/robots incluem rotas.
- A home possui title, description e viewport, mas não canonical, Open Graph ou structured data.
- Nenhum dado financeiro foi inserido em metadados SEO.

## 29. Responsividade

⏸ **NOT_TESTABLE — MEDIUM**

- CSS possui breakpoints, grids responsivos, sticky CTA, safe-area e mitigação de teclado mobile.
- Não havia Chromium/browser disponível; portanto 320, 360, 390, 414, 768, 1024 e 1440 px não foram inspecionados visualmente. Não se declara ausência de corte, overflow, modal/tabela quebrada ou CTA encoberto.

## 30. Acessibilidade

⚠️ **ATTENTION — MEDIUM**

- Formulários usam labels/legends, alerta com role, botões nativos, foco programático no primeiro erro e alt em imagens quando aplicável.
- Muitos botões de opção customizados não expõem `aria-pressed`/estado selecionado; navegação SPA não gerencia foco no título; contraste não foi medido e não houve auditoria automatizada/browser por teclado.

## 31. Segurança

❌ **FAILED — CRITICAL**

- Renderizações de dados do usuário aplicam `escapeHtml` nos principais pontos; não foram encontrados `eval`/`new Function` ou segredos reais versionados.
- Não há `.env`, token, senha, chave privada ou credencial detectada.
- Contudo, toda autorização é client-side: admin aberto, status manipulável, idempotência em memória e PII/financeiro no navegador.
- `localStorage` guarda solicitações, coordenadas, CPF/CNPJ/Pix e cadastros sem criptografia, controle de acesso ou expiração.
- Motor financeiro interno é publicamente distribuído (**F1**) e o painel local permite operações privilegiadas (**S2**).

## 32. LGPD / privacidade

⚠️ **ATTENTION — HIGH**

- Há consentimento explícito de termos/localização, aviso de finalidade, captura pontual e minimização de logs por blacklist de PII.
- Foto de solicitação não é salva; documentos de prestador guardam somente nomes no MVP.
- Faltam execução de retenção, exclusão/portabilidade, revogação, base legal registrada, controle de acesso, criptografia e backend seguro.
- Blacklist de logs não substitui allowlist e pode deixar novos campos sensíveis passarem.
- **Revisão jurídica obrigatória** para bases legais, textos, prazos, direitos dos titulares, controlador/operador, canal e compartilhamentos. Este relatório não declara conformidade jurídica.

## 33. Android

⏸ **NOT_TESTABLE — HIGH**

- Capacitor e dependências Android constam no package; config compartilha `dist/` e usa scheme HTTPS.
- Não existe diretório/projeto `android/`, AndroidManifest, recursos nativos, permissões, ícones/splash ou configuração de push/deep link verificável.
- `adb` e `sdkmanager` não estão disponíveis. Status de Google Play: **NOT_TESTABLE_IN_ENVIRONMENT / não pronto demonstrado**.

## 34. iOS

⏸ **NOT_TESTABLE — HIGH**

- Bundle ID é centralizado; há templates de Info.plist/entitlements, privacy manifest, Apple App Site Association, adapters e documentação.
- O repositório não contém um projeto Xcode completo gerado; push é adapter, e não integração APNs comprovada.
- Ambiente Linux sem `xcodebuild`: build, assinatura, Universal Links em dispositivo, permissões e App Store readiness são **NOT_TESTABLE_IN_ENVIRONMENT**.

## 35. Performance

⚠️ **ATTENTION — MEDIUM**

- Maiores arquivos próprios: `app.js` 27.622 B, `index.html` 23.035 B, `provider.js` 19.084 B, `styles.css` 18.950 B e `catalog.js` 17.085 B; não há framework pesado.
- Imagens são SVG leves; cache e assets têm versionamento parcial.
- O build não agrega/minifica e envia diretórios inteiros de domain/services/repositories/adapters sem tree-shaking.
- `catalog-financial.js` não está no bundle público, porém `domain/financial-engine.js` (11.250 B) e outros módulos financeiros estão, contrariando a intenção de segregação.

## 36. V5 no build

✅ **APPROVED**

- Busca explícita no `dist/`, HTML, JS público, service worker, manifest e assets por `RMBH-2026-09-v5-candidate`, `catalog-v5-candidate`, `V5C001`, `V5C126` e `V5C127`: zero ocorrências.
- A candidata está presente apenas no repositório-fonte, testes, simulações, scripts e documentação; não é copiada/carregada no cliente oficial.

## 37. Regressão

⚠️ **ATTENTION — HIGH**

- Testes automatizados aprovam WhatsApp, Ads, PWA estrutural, catálogo/preço V4, geo/matching, regras admin/prestador e adapter.
- Solicitação/acompanhamento continuam no MVP local.
- Android/iOS não foram compilados; GestãoClick não foi integrado a ambiente externo; UI não integra os engines de order/pricing. Assim, regressão ponta a ponta não pode ser aprovada.

## Catálogo e preços — verificações adicionais

- V4 possui 89 serviços e todos os `QUOTE` têm preço nulo.
- V5 possui 128 serviços e permanece candidata.
- Nenhum preço foi modificado durante esta auditoria.
- Os valores de `V5C126`/`V5C127`, split e visita hidráulica não estão públicos.
- Separação de material, payout e margem é correta no domínio testado, mas a publicação do motor financeiro invalida a segregação no artefato.

## Achados consolidados

### CRITICAL

1. **F1 — código financeiro interno publicado/cacheado:** `dist/domain/financial-engine.js` revela fórmulas/campos internos; service worker pré-cacheia esse e outros módulos de preço/pagamento/adapter.
2. **S2 — controles privilegiados sem autenticação:** painel Admin público e estado sensível em `localStorage`, permitindo leitura/alteração local de PII, orçamento, pagamento e status.

### HIGH

1. Fluxo cliente não integrado ao catálogo/preço/order engine; pedidos têm snapshot nulo.
2. Matching/idempotência apenas em memória, sem garantia transacional distribuída.
3. Área de prestador/atendente/financeiro sem autenticação ou operação backend.
4. PII (CPF/CNPJ/Pix/endereço/telefone/localização) em `localStorage` sem proteção/expiração.
5. GestãoClick é somente mapper local e é distribuído no frontend.
6. Android não possui projeto nativo auditável.
7. iOS não possui projeto Xcode completo auditável no repositório/ambiente.

### MEDIUM

1. Retenção geográfica declarada, mas não executada; `source` ausente na captura UI.
2. Máquina de estados de domínio não é usada pela UI simplificada.
3. Validação semântica insuficiente e ausência de proteção robusta contra submit duplicado.
4. Cashback/expiração sem persistência operacional.
5. Home com SEO social/canonical incompleto.
6. Responsividade sem validação visual na matriz exigida.
7. Acessibilidade sem estados ARIA completos, gestão de foco e contraste medido.

### LOW

1. Warning npm sobre `http-proxy` desconhecido.
2. Fallback do service worker devolve HTML para qualquer recurso ausente.
3. Build sem minificação/tree-shaking e com cache-busting parcial.

## Evidências/comandos executados

```text
git status --short --branch
git log --oneline --decorate -20
git diff --check
npm test
npm run build:web
find . -type f -name '*.js' ... | node --check
rg (versões V4/V5, códigos V5, scripts, WhatsApp, telefones, dados financeiros, segurança)
find dist -type f -printf '%p %s bytes\n'
command -v adb; command -v sdkmanager; command -v xcodebuild; command -v chromium
```

## Decisão e próximos passos

**NÃO APROVADO PARA TESTE CONTROLADO NO APP/SITE.**

Nenhuma correção foi feita. Aguardar revisão manual e próximo comando. Antes de qualquer teste controlado, é necessário decidir e implementar, em tarefa separada, a fronteira servidor/cliente, remover motores financeiros internos do artefato/cache público e proteger superfícies privilegiadas com autenticação/autorização efetivas.
