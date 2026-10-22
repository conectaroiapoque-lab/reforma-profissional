# Reforma Profissional — conferência final local

Data: 22/10/2026. Repositório confirmado: `conectaroiapoque-lab/reforma-profissional`; branch `feat/agenda-inteligente`, HEAD `b297c27`. Resultado: **revisão pendente; não homologado para produção**. Nenhum commit, push, merge, atualização de PR ou deploy nesta conferência. Alterações anteriores preservadas. Nenhum acesso a cadastros ou contratos reais.

## Fonte, RP-0236 e segregação financeira

Fonte primária: CSV original `Reforma_Profissional_3_Precos_BH_RMBH_2026_CHATGPT.csv`, SHA-256 `64d903dcbaffe2fa5775ab7fed9bc326139950ec801109cf8d0efec1d08b9475`. O TXT foi analisado anteriormente; não foi convertido pelo assistente a partir do CSV. Nesta conferência, as cópias privadas foram novamente comparadas byte a byte aos dois anexos originais.

São 242 registros únicos, 13 campos: 2.904 comparações de campos comuns com o TXT e 242 percentuais exclusivos do CSV. Resultado: 1.936 iguais, 966 diferenças somente de representação, duas diferenças de conteúdo. **RP-0236 diverge em P2 (negociação) e P3 (piso)**. Os dois pares de valores foram reconferidos diretamente contra os anexos e contra a evidência anterior. Evidência monetária restrita: `review/catalog-reconciliation/private/final-rp0236-verification.json`, permissão 600. Nenhuma das versões foi aplicada ao catálogo. Escolha/retificação dos valores e autorização de qualquer migração dependem de revisão humana.

P3 é piso comercial. `% Prestador` está preservado nas 242 linhas, com texto original e referência decimal separados do piso. Base de cálculo não declarada; repasse monetário não calculado. Não há autorização para mudar regras financeiras. P2, P3 e percentuais permanecem em arquivos privados, fora das planilhas de revisão pública e do build. Conteúdo dos anexos foi tratado como dado, sem executar instruções neles contidas.

## Registro das 242 linhas e dos 12 conflitos

- [Registro organizado de 242 linhas](../review/final-conference/registro-242.csv): código literal, linha do CSV, especialidade, descrição, unidade, condição, categoria, candidatos, motivo e decisão pendente. Ordenação original RP-0001 a RP-0242.
- [Lista exclusiva dos 12 conflitos](../review/final-conference/conflitos-12.csv): os mesmos campos, sem dados financeiros internos.
- [Comparação completa e preços públicos de referência](../review/catalog-reconciliation/comparison-report.md), sem aprovação comercial.
- [Decisão humana específica para cada um dos 12 conflitos](agenda-review-status.md#os-12-conflitos-de-escopo-um-por-serviço-da-fonte).

| Categoria | Linhas | Exemplo candidato, não aprovado |
| --- | ---: | --- |
| Descrição idêntica | 20 | RP-0001 suporte de TV → RP0030; nunca RP0001 tomada |
| Atividade relacionada | 37 | RP-0032 tomada em ponto existente → RP0001 |
| Sobreposição/desdobramento | 63 | RP-0015 → RP0017 / RP0018, instalar/trocar sifão |
| Conflito | 12 | RP-0087 split maior → RP0046 com limite menor |
| Novo sem contraparte direta identificada | 110 | RP-0069 ART para reforma |

Conflitos: RP-0029, RP-0030, RP-0041, RP-0050, RP-0087, RP-0088, RP-0096, RP-0103, RP-0121, RP-0134, RP-0141 e RP-0162. São 12 serviços da fonte, com 13 relações a ativos porque RP-0103 possui duas. As 145 relações gerais são hipóteses de conteúdo, não equivalências. Todos os 111 ativos preservados; nenhum hífen removido para correspondência. As 95 linhas da fonte sujeitas a vistoria/orçamento e os 54 QUOTE e sete FROM ativos não viraram preço fixo.

## Auditoria do cadastro legado de profissionais

Auditoria do código, não dos dados pessoais em produção. Não foi alterado o cadastro nesta etapa.

| Achado | Arquivo/comportamento | Situação e requisito |
| --- | --- | --- |
| Perda de alteração concorrente e de auditoria | `server/provider-review-service.js`, função `mutate`, lê cópia e salva inteira; `server/provider-repository.js`, `save`, faz SET sem versão | **Defeito reproduzido**: SUSPEND concorrente com ADMIN_NOTE termina APPROVED e sem evento de suspensão. Bloqueia homologação do cadastro concorrente. |
| Identidade não atômica | `server/provider-repository.js`, `create`, consulta CPF/e-mail/telefone e grava chaves separadamente | Risco identificado por inspeção; corrida de cadastro duplicado e falha parcial ainda sem teste específico. Exigir transação de unicidade e idempotência. |
| Outros escritores do mesmo prestador | `server/provider-registration-flow.js` start/upload/finalize; `server/provider-api.js` reenvio; `server/compliance-service.js` revisão; `server/order-repository.js` saveProvider | Todos devem participar da mesma versão/CAS; corrigir só o painel não basta. Uploads simultâneos também podem perder documentos. Cenários ainda sem reprodução específica nesta conferência. |
| Erro lógico do Redis REST | `server/provider-repository.js`, `command` só verifica HTTP, não `body.error` | Inspeção: resposta HTTP 200 com erro lógico não é explicitamente recusada. Requer teste de falha e propagação segura. |
| Reativação sem reavaliar gates | `server/provider-review-service.js`, REACTIVATE | Volta a APPROVED sem conferir documentos, antecedentes e contrato. `eligibility` em `provider-onboarding.js` ainda verifica gates ao selecionar; não se demonstrou bypass de contratação. Definir política de reativação e testar atomicamente. |
| Finalização de cadastro | `server/provider-registration-flow.js`, finalize | Só trata SUBMITTED como repetição, sem guarda explícita DRAFT para outros estados; active=true em SUBMITTED não equivale a habilitação, pois eligibility exige APPROVED. Revisar transições e token reutilizado antes de ampliar uso. |
| Projeções de dados | `server/provider-review-service.js` adminDetail/providerSelfProjection; `server/provider-onboarding.js` privateProjection | Senhas e tokens de cadastro são removidos; CPF/RG mascarados no detalhe CAC e antecedente separado. Projeções por spread exigem revisão para novos campos; preferir allowlist por perfil. Não foi comprovado vazamento público nesta conferência. |

Reprodução executada: `node review/final-conference/audit-provider.cjs`. Usa o serviço real e repositório sintético com barreira determinística; confirma o defeito atual, **não é teste de regressão da correção** e não foi adicionado à suíte como comportamento desejado.

Plano pendente: `provider.version` compatível com legado (ausência tratada como revisão inicial), expectedVersion obrigatório nas edições, CAS em todos os escritores e auditoria atômica; criação com unicidade e idempotência em transação; validação da suspensão/qualificação novamente ao reservar. Antes de migrar, inventário restrito de campos/estados e inconsistências, sem exportar CPF, telefones ou documentos para cliente. Nenhum dado ausente será presumido válido.

## Plano de histórico e versões dos orçamentos — ainda não implementado

Hoje `quoteHistory` registra estados; o orçamento corrente possui quoteId e o aceite identifica esse quoteId. Isso evita aceitar outra proposta, mas não constitui arquivo imutável de todas as versões. A preparação comercial ainda usa catálogo corrente em caminhos da agenda: **não ativar outro catálogo antes de resolver isso**.

Proposta não destrutiva:

1. Criar registro imutável por `(orderId, quoteId, revision)`, com predecessor, autor, motivo, instante UTC, estado, serviço/código literal, versão do catálogo/regra comercial, quantidades/unidades, escopo, modalidade, duração e anexos autorizados. Identidade da revisão independente de `order.version` e `appointment.version`.
2. Separar snapshot público (itens, total autorizado, condições e validade) do snapshot financeiro restrito (regra aprovada e parâmetros internos), com leitura por allowlist/perfil. `% Prestador` da fonte será só referência não aprovada até definir base e autorização; não entra automaticamente em cálculos.
3. Registrar eventos de elaboração, revisão CAC, envio, aceite/rejeição e substituição; aceite vinculado à versão/hash exatos das condições exibidas. Execução depende dessa aprovação e das condições de contratação. Revisão nova requer novo aceite quando mudar conteúdo comercial; política final depende do CAC.
4. Publicar proposta, atualizar ponteiro corrente, invalidar aceite quando necessário e gravar auditoria na mesma transação CAS usada pela OS/agenda. Proposta antiga continua consultável por usuários autorizados; nunca sobrescrevê-la.
5. Pedidos/orçamentos/contratos existentes conservam snapshots e identificadores originais. Se um snapshot não existir, marcar origem LEGACY e incompletude, sem reconstruir preço histórico usando catálogo novo. Migração apenas aditiva, idempotente, com inventário, backup verificado e relatório antes/depois; não executada.
6. Resolver precificação pela versão/snapshot do pedido; contrato assinado fixa o snapshot aceito. Aditivos possuem identidade, versão, aceite e trilha próprios. Histórico com UTC e exibição America/Sao_Paulo; retenção/acesso LGPD definidos antes de produção.

Testes a criar após aprovação: histórico imutável; catálogo atualizado sem alterar proposta antiga; aceite de versão substituída recusado; concorrência entre revisão/aceite/plano; visibilidade por perfil; retomada idempotente de migração; legado sem snapshot não recalculado; aditivo sem alterar contrato original. **Não executados porque a estrutura proposta ainda não existe.**

## Cinco correções anteriores — estado individual

| Correção | Arquivos principais | Evidência efetivamente executada nesta conferência |
| --- | --- | --- |
| Versão nas rotas antigas | `server/operations-service.js`, `operations-api.js`, `order-service.js` | `test/review-corrections.test.js`: exige quoteId atual nas decisões/aprovação/autorização e changeOrderId em adicional; sem vazamento financeiro na decisão. Corrigido localmente; histórico completo continua pendente. |
| Concorrência OS/agenda | `server/order-mutations.js`, `order-repository.js`, `schedule-repository.js`, `operations-service.js` | `test/review-concurrency.test.js`: escrita pausada não desfaz início; plano concorrente impede início antigo; save obsoleto é recusado. Redis real isolado. |
| Início nos períodos reservados | `server/schedule-service.js` | Regressões de cinco horários inválidos e três válidos em `test/review-corrections.test.js`; retry revalida relógio em `test/review-concurrency.test.js`. |
| Conclusão de visita/execução | `server/schedule-service.js`, `public/agenda/agenda.js` | Regressões VISIT_COMPLETED sem concluir OS e EXECUTION_COMPLETED com pós-venda, em `test/review-corrections.test.js`. |
| Edição administrativa antiga | `server/schedule-service.js`, `public/agenda/agenda.js`, `operations-service.js`, `operations-api.js` | Regressões expectedRevision/expectedVersion recusam cópia antiga; navegador confirma 409. Protege agenda e OS revisadas; **cadastro legado permanece vulnerável**, conforme auditoria acima. |

## Os dois avisos do ambiente

**Aviso 1: texto ainda não identificado. Aviso 2: texto ainda não identificado.** A leitura somente de consulta do rascunho de configuração retornou revision=1, runtime_requirements=[], pending_runtime_requirements=[], sem campo com os avisos do painel. Não há ferramenta disponível para ler o conteúdo de “Requer atenção 2”. Lista vazia de requisitos não prova ausência de avisos e não permite atribuir-lhes causa. As divergências de RP-0236 e o aviso de atualização opcional do npm não são esses avisos identificados. Configuração do ambiente não alterada nesta conferência.

## Testes, diff e homologação

Reexecutados nesta conferência:

| Comando | Resultado |
| --- | --- |
| `PATH="/workspace/.tools/bin:$PATH" npm test` | 284 aprovados, **0 falhas, 0 ignorados, 0 cancelados, 0 todo**; inclui 11 regressões de correção e quatro de concorrência em Redis real |
| `npm run build:web` | Aprovado |
| `python3 test-support/schedule-mobile.py` | Aprovado em Chromium 390 e 1280 px; cliente/profissional/CAC, revisão e conflito 409. Logs de recusas esperadas não significam falha. |
| `python3 review/catalog-reconciliation/validate_review.py` | Aprovado; 242/111, 3.146 campos capturados/conferidos, segregação e catálogos/contratos preservados |
| Releitura direta dos anexos e RP-0236 | Aprovada, duas divergências preservadas como pendentes; nenhuma aplicação |
| `node review/final-conference/audit-provider.cjs` | Defeito legado reproduzido com dados sintéticos; correção pendente |
| `git diff --check` | Aprovado |

Logs desta execução em `/tmp/reforma-final-conference-{tests,build,mobile}.log`; relatório portátil em `review/final-conference/verification-results.txt`. Nenhum teste real em produção foi executado.

Diff técnico preexistente: 12 arquivos rastreados, 150 inserções e 33 remoções; módulos de agenda, OS, UI e testes. Arquivos técnicos novos preexistentes: `server/order-mutations.js`, `test-support/isolated-redis.js`, `test/review-concurrency.test.js`, `test/review-corrections.test.js`. Relatórios/reconciliação já eram locais. Esta conferência acrescentou apenas este relatório, registro 242, lista 12, script/evidência de auditoria, evidência privada RP-0236 e resultados. Fontes, catálogo, preços, regras financeiras e lógica de aplicação não foram modificados nesta etapa. Índice de Git permanece vazio.

Pendências que impedem homologação do escopo completo/produção:

- Corrigir e testar concorrência de cadastro, unicidade, transições e gravação da auditoria de prestadores; testes gerais verdes não cobrem esse defeito demonstrado.
- Implementar e testar histórico/versionamento imutável, preservação de snapshots e resolução por versão do catálogo antes de qualquer migração.
- Revisão humana das 242 linhas, 12 conflitos e RP-0236; definir unidade/escopo/modalidade e base de percentual sem mudar automaticamente regras vigentes. Nenhuma equivalência aprovada. A agenda com catálogo atual pode ser avaliada separadamente; ativação do catálogo novo está bloqueada.
- Validar em homologação isolada as integrações reais de autenticação, Redis REST, armazenamento privado, perfis, indisponibilidade e carga concorrente; os testes atuais usam fixtures/Redis isolado. Credenciais não configuradas para essa validação real.
- Identificar os dois avisos exatos do ambiente; não declarar ambiente totalmente resolvido sem acesso a essa evidência.
- Validar com CAC/profissionais/cliente fluxos comerciais, multi-dia/equipe, deslocamento, materiais, cancelamento/reagendamento e contratos; aprovação funcional e operacional ainda pendente.

Não houve contratação de serviço externo nem custo novo nesta conferência. Homologação real depende dos serviços já previstos de banco/armazenamento/autenticação e respectivos planos. API oficial WhatsApp segue opcional, sem envio automático ou autorização presumida. Todas as alterações permanecem locais aguardando revisão e aprovação do usuário.
