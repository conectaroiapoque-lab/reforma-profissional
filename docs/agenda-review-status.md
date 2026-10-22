# Revisão local — fontes, correções, testes e bloqueios

Estado: **alterações somente no diretório de trabalho de Reforma Profissional**, sem stage, commit, push, merge, atualização da PR ou publicação. HEAD de referência: `b297c27`. Nenhum dado de produção foi acessado ou migrado; apenas fixtures e Redis temporário de testes.

## 1. Qual fonte foi analisada e o que mudou

A revisão anterior analisou o TXT recebido, não o CSV. **Não houve conversão do CSV pelo assistente.** Agora o CSV original é a fonte primária; foi confrontado com o TXT de mesmo SHA-256 do anexo anterior.

| Fonte | SHA-256 | Registros | Campos |
| --- | --- | ---: | ---: |
| `Reforma_Profissional_3_Precos_BH_RMBH_2026_CHATGPT.csv` | `64d903dcbaffe2fa5775ab7fed9bc326139950ec801109cf8d0efec1d08b9475` | 242 | 13 |
| `Reforma_Profissional_Tabela_Precos_ChatGPT_242_Servicos.txt` | `ceea136e1110ce11a4e629f07c47c6be37d0ca6271ce09d83184a6f994772ebb` | 242 | 12 |

Foram conferidos os 242 códigos exatos e todos os campos: **2.904 comparações dos 12 campos comuns**, mais **242 registros de `% Prestador`**, campo exclusivo do CSV. Os campos comuns tiveram 1.936 resultados iguais, 966 equivalentes apenas em representação e duas divergências de conteúdo. Ambas são de `RP-0236`, P2 e P3; valores e versões ficam em arquivo administrativo restrito. P1 e demais campos não divergiram em conteúdo. O TXT não é representação completa/sem perda do CSV.

A tabela por campo e a metodologia estão em [source-concordance-report.md](../review/catalog-reconciliation/source-concordance-report.md). A conferência detalhada está em `review/catalog-reconciliation/source-concordance-fields.json`; percentuais originais e diferenças monetárias internas ficam somente em `private/`.

## 2. Correção sobre percentual e piso

A afirmação anterior de ausência de repasse era incompleta para o CSV. **O CSV possui `% Prestador` nas 242 linhas.** O percentual foi preservado por código e linha, em representação original e decimal, como dado da fonte, separado de P3.

P3 é piso comercial, não percentual nem piso de remuneração do prestador. O CSV não explicita a base de cálculo do percentual. Não foi presumida incidência sobre P1, P2, P3, mão de obra, total cobrado ou receita líquida. Nenhum valor monetário de repasse foi calculado e nenhuma regra financeira foi alterada. As referências financeiras ficam segregadas da projeção pública e fora de `dist/`.

## 3. Categorias da reconciliação: exemplos sem aprovação

| Categoria | Total de serviços da fonte | Exemplo | Decisão necessária |
| --- | ---: | --- | --- |
| Descrição idêntica candidata | 20 | `RP-0001` → candidato `RP0030`, suporte de TV | Confirmar unidade, modelo, parede, tamanho, fornecimento e especialidade. Não corresponde a `RP0001`, tomada. |
| Atividade relacionada candidata | 37 | `RP-0032` → candidato `RP0001`, tomada em ponto existente versus tomada simples | Confirmar ponto preparado, circuito e exclusões; não incluir criação de circuito. |
| Sobreposição / desdobramento | 63 | `RP-0015` → `RP0017` / `RP0018`, instalação e troca de sifão | Separar as operações e decidir se são alternativas; não somar automaticamente. |
| Conflito de escopo ou operação | 12 | `RP-0087` versus `RP0046`, capacidade de split maior que o limite ativo | Definir serviço/escopo específico; não herdar preço fixo de equipamento menor. |
| Novo candidato sem contraparte direta identificada | 110 | `RP-0069`, ART para reforma simples | Validar escopo, responsabilidade profissional e habilitação; não tratar como execução de reparo. |

Total: 242. Existem 145 relações analíticas, pois um serviço pode ter vários candidatos. Os 24 serviços ativos sem contraparte identificada no anexo permanecem preservados. **Nenhuma equivalência ou preço aprovado.** Não foram removidos hífens para cruzar códigos.

As listas completas estão em [comparison-report.md](../review/catalog-reconciliation/comparison-report.md) e nas planilhas `comparison-source-242.csv`, `comparison-pairs.csv`, `new-service-candidates.csv` e `active-111-coverage.csv`. As 95 linhas da fonte com vistoria/orçamento e os 54 QUOTE / sete FROM ativos permanecem dependentes das respectivas regras; números na fonte não autorizam FIXED.

### Os 12 conflitos de escopo, um por serviço da fonte

| Fonte | Ativo relacionado | Conflito | Decisão humana necessária |
| --- | --- | --- | --- |
| `RP-0029` | `RP0023` | Caça-vazamento/diagnóstico versus reparo visível; diagnóstico excluído do escopo simples | Definir diagnóstico/visita independente e sua relação com execução; não igualar os serviços. |
| `RP-0030` | `RP0023` | Vazamento embutido versus visível/acessível | Definir serviço sujeito a avaliação e intervenções necessárias; não aproveitar preço simples. |
| `RP-0041` | `RP0001` | Criação de ponto/circuito versus instalação em ponto pronto | Validar infraestrutura e responsabilidade; manter orçamento e identidade própria quando necessário. |
| `RP-0050` | `RP0063` | Execução de reboco/emboço por m² versus reparo localizado | Definir operação, unidade, preparação e quantidade; não mapear tarifa unitária a reparo genérico. |
| `RP-0087` | `RP0046` | Split 18.000–24.000 BTU versus escopo ativo até 9.000/12.000 BTU | Decidir faixa e condições específicas; não herdar preço do equipamento menor. |
| `RP-0088` | `RP0046` | Split de 30.000 BTU versus limite ativo menor | Validar capacidade, infraestrutura, equipe e orçamento específicos. |
| `RP-0096` | `RP0046` | Reinstalação versus instalação padrão | Confirmar remoção, reaproveitamento, conexões e testes; só aprovar relação se o escopo real coincidir. |
| `RP-0103` | `RP0075` / `RP0076` | Reparo de gesso/drywall versus instalação de parede/forro | Separar reparo de instalação; definir área, acabamento e mínimo de atendimento. |
| `RP-0121` | `RP0038` | Projeto/fabricação de planejado versus montagem de móvel convencional pronto | Definir contrato e entregáveis de fabricação/projeto separados da montagem. |
| `RP-0134` | `RP0038` | Desmontagem versus montagem convencional | Criar/validar operação distinta e eventual remontagem, sem equivalência automática. |
| `RP-0141` | `RP0034` | Espelho grande/especial versus escopo pequeno/médio | Definir dimensões, fixação, segurança e vistoria/orçamento próprios. |
| `RP-0162` | `V7M002` | Manutenção de motor/mecanismo versus instalação de telhado retrátil | Separar manutenção de instalação e validar habilitação técnica/equipe. |

“Conflito” impede equivalência por padrão; não substitui a decisão humana sobre novos itens, limites ou relações condicionais.

## 4. Andamento individual das correções técnicas

### 4.1 Versão do orçamento nas rotas antigas — corrigido localmente

Arquivos: `server/operations-service.js`, `server/operations-api.js`, `server/order-service.js`.

- `quote-decision`, `approve-quote` e `authorize-service` validam o `quoteId` atual. Ausência recebe 400; outra versão recebe 409, sem alterar a OS. Decisões fora de APPROVE/REJECT são recusadas.
- Orçamentos adicionais exigem `changeOrderId` na revisão e no aceite; cópia antiga não aplica valores à OS.
- A consulta pública devolve os identificadores e somente a projeção de orçamento liberada ao cliente; a resposta de decisão não devolve composição financeira interna.
- As ações administrativas de OS também exigem `expectedVersion`, validado dentro da transação. Clientes de API devem obter a versão pela leitura antes da edição.

Regressões efetivamente executadas em `test/review-corrections.test.js`: “rota antiga quote-decision exige quoteId atual e decisão explícita”; “aprovação e autorização administrativas antigas recusam orçamento de outra versão”; “orçamento adicional antigo exige changeOrderId na revisão e no aceite”. O teste operacional anterior foi adaptado para fornecer os identificadores, mantendo suas verificações financeiras e fiscais.

**Pendente distinto:** isto protege a identidade do orçamento, não resolve ainda a seleção histórica da versão do catálogo. `ScheduleService.proposal()`/preparação comercial ainda consultam o catálogo corrente. A ativação de outro catálogo exige resolver por versão/snapshot da ordem antes de homologar a migração.

### 4.2 Concorrência entre OS e agenda — corrigido nos caminhos operacionais revisados

Arquivos: `server/order-mutations.js`, `server/order-repository.js`, `server/schedule-repository.js`, `server/operations-service.js`.

- Todas as mutações de OS em `operations-service` usam a mesma transação CAS da agenda, incluindo leitura do pedido e dependências. Uma escrita que perdeu a disputa é revalidada; não reaplica o objeto antigo inteiro sobre uma OS iniciada pela agenda.
- O `version` da OS avança em gravações de agenda/OS; `save` Redis de cópia antiga é rejeitado com `STALE_ORDER`.
- Início/conclusão legados consultam o plano dentro da transação; criar o plano durante uma tentativa antiga de início faz a tentativa ser revalidada e recusada. A guarda preliminar do handler não é a única defesa.
- Redistribuir profissional de pedido com compromisso vigente exige o fluxo da agenda.

Regressões **em Redis real isolado**, executadas em `test/review-concurrency.test.js`: “escrita antiga da OS pausada não desfaz início confirmado pela agenda”; “plano criado durante início antigo força revalidação e impede bypass”; “save de cópia desatualizada da OS é rejeitado após escrita da agenda”. Os testes pausam operações de verdade antes do EVAL para forçar a disputa. Um quarto teste, descrito abaixo, também revalida a hora após conflito.

Limite: qualquer escritor futuro de OS deverá usar o contrato transacional/versionado; não foi validado acesso de processos externos que gravem diretamente no Redis fora da aplicação.

### 4.3 Início dentro dos períodos efetivamente reservados — corrigido localmente

Arquivo: `server/schedule-service.js`.

A validação exige que a hora do servidor pertença a **um dos intervalos individuais**, com início inclusivo e fim exclusivo. O intervalo entre o fim de um dia e o começo do próximo não é uma reserva. Recusa antes do primeiro período, exatamente no fim, entre dias e depois do último, sem mudar a OS ou a agenda. Aceita início dentro de um período posterior reservado. A hora é consultada novamente em cada tentativa da transação; uma revalidação após disputa não reutiliza a hora antiga.

Regressões executadas em `test/review-corrections.test.js`: “início não é permitido antes, no fim ou entre períodos reservados de vários dias” (cinco cenários); “início no começo e dentro do segundo período realmente reservado é aceito” (três cenários). Em `test/review-concurrency.test.js`, “início revalida hora no retry e recusa pedido que saiu do período reservado” comprova a rejeição após uma disputa real mudar a revisão enquanto o horário válido termina.

### 4.4 Mensagens distintas para visita e execução — corrigido localmente

Arquivos: `server/schedule-service.js`, `public/agenda/agenda.js`.

Conclusão de visita gera `VISIT_COMPLETED`, com avaliação para orçamento; não conclui a OS de execução nem libera pós-venda de execução. Conclusão de execução gera `EXECUTION_COMPLETED`, atualiza a OS e permite pós-venda. A geração manual oferece opções distintas e rejeita evento incompatível. Chamadas legadas ao evento `COMPLETED` são normalizadas pelo tipo real; mensagens históricas já persistidas não foram reescritas.

Regressões executadas em `test/review-corrections.test.js`: “conclusão de visita emite VISIT_COMPLETED, sem concluir OS ou liberar pós-venda de execução”; “conclusão de execução emite EXECUTION_COMPLETED e habilita mensagem de pós-venda”.

### 4.5 Edições administrativas desatualizadas — corrigido na agenda e nas ações de OS revisadas

Arquivos: `server/schedule-service.js`, `public/agenda/agenda.js`, `server/operations-service.js`, `server/operations-api.js`.

- A leitura administrativa da agenda devolve `revision`. Edição de regra, habilitação, disponibilidade, plano e proposta exige `expectedRevision`; falta recebe 400, cópia desatualizada recebe 409. A comparação ocorre novamente se o CAS precisar repetir.
- A interface envia a revisão lida e pede atualização diante de conflito. Não substitui silenciosamente a revisão pelo valor mais recente ao enviar.
- As ações antigas de OS (`assign-provider`, `approve-quote`, `authorize-service`, `review-change-order`) exigem `expectedVersion`, validado atomicamente. Não sobrescrevem uma edição posterior com dados de tela antiga.
- Alterações de compromissos continuam usando `appointment.version`.

Regressões executadas em `test/review-corrections.test.js`: “edição administrativa exige revisão lida e rejeita configuração desatualizada nas cinco ações”; “cliente administrativo antigo não sobrescreve proposta mais recente”; “atribuição administrativa antiga exige versão da OS e não sobrescreve outra edição”. `test-support/schedule-mobile.py` testa envio da revisão e rejeição HTTP 409 com outra sessão concorrente em 390 e 1280 px.

**Escopo pendente:** o painel cadastral legado de prestadores, em `server/provider-review-service.js`, não foi convertido nesta revisão para um contrato geral de versão de edição. A proteção acima foi verificada para configuração/compromissos da agenda e ações de OS descritas; não representa homologação de toda a administração da plataforma.

## 5. “Requer atenção 2”

**Os dois avisos exatos ainda não foram identificados.** As ferramentas disponíveis não expõem o conteúdo desse painel e não houve acesso à interface que contém o rótulo. Não se presume o texto, a causa ou a resolução de nenhum deles. As duas divergências internas CSV/TXT de `RP-0236` são fatos independentes e **não foram identificadas como os avisos da interface**.

## 6. Validação e diff resumido

| Verificação executada | Resultado final |
| --- | --- |
| `PATH="/workspace/.tools/bin:$PATH" npm test` | **284 testes, 284 aprovados, 0 falhas, 0 ignorados, 0 cancelados** |
| Novas regressões específicas | 11 testes de API/regras + 4 disputas em Redis real; todos aprovados |
| `npm run build:web` | Aprovado; catálogo ativo preservado |
| `python3 test-support/schedule-mobile.py` | Aprovado em Chromium, 390 e 1280 px; revisão enviada, disputa com outra sessão recusada com 409, sem overflow |
| `python3 review/catalog-reconciliation/validate_review.py` | Aprovado: 242 fontes, 111 ativos, 3.146 campos CSV comparados/capturados, percentual original preservado em privado, zero ativações |
| `node --check` | 152 arquivos JavaScript validados |
| `git diff --check` | Aprovado |
| HTTP local | Aplicação/CAC 200; agenda anônima 401 JSON; caminho da fonte privada 404 |
| Integridade | Catálogos e autoridade contratual inalterados; contratos/snapshots reais não acessados ou migrados |
| Git | HEAD `b297c27`, índice vazio, alterações somente no working tree |

Os 409 de conflito são resultados esperados dos testes negativos, não falhas da suíte. Em execuções intermediárias houve um erro de sintaxe no ajuste de handler e um timeout no cenário Playwright após o formulário ser recriado; ambos foram corrigidos e os testes reexecutados com os resultados finais acima. Não há teste com falha remanescente nessas execuções. Isso não valida infraestrutura de produção nem elimina as pendências da seção seguinte.

Diff de arquivos já rastreados:

```text
public/agenda/agenda.js          | 22 ++++++++++++--
 server/operations-api.js         |  8 ++---
 server/operations-service.js     | 21 +++++++------
 server/order-repository.js       |  4 +--
 server/order-service.js          |  2 +-
 server/schedule-repository.js    |  6 ++--
 server/schedule-service.js       | 64 ++++++++++++++++++++++++++++++++++++----
 test-support/schedule-fixture.js | 17 ++++++++---
 test-support/schedule-mobile.py  | 32 +++++++++++++++++++-
 test/go-live-remediation.test.js |  4 +--
 test/schedule-api.test.js        |  1 +
 test/schedule.test.js            |  2 +-
 12 files changed, 150 insertions(+), 33 deletions(-)
```

Além desse diff, permanecem **não rastreados e sem stage**:

- `server/order-mutations.js`: implementação compartilhada de mutação/CAS e save versionado.
- `test/review-corrections.test.js`: 11 regressões de rotas antigas, períodos, mensagens e edição desatualizada.
- `test/review-concurrency.test.js`: quatro disputas forçadas em Redis real.
- `test-support/isolated-redis.js`: infraestrutura de teste isolada por socket, sem persistência.
- `docs/agenda-review-status.md`, `docs/catalog-reconciliation-pending.md`: resultados, decisões humanas e proposta.
- `review/`: fonte preservada privadamente, relatórios/planilhas de conferência e scripts somente de revisão.

O [patch técnico local](../review/technical-local.diff) contém código e testes rastreados e os quatro arquivos técnicos novos; não inclui dados financeiros confidenciais. Os relatórios de fonte/reconciliação estão linkados nas seções anteriores. Nenhuma biblioteca de runtime ou dependência declarada foi adicionada.

## 7. Pendências que impedem homologação global ou produção

1. Revisão humana de equivalências, 12 conflitos, unidades, escopos, habilitações, 110 novos candidatos e políticas comerciais; catálogo continua inativo como proposta.
2. Definir a base e autoridade de aplicação de `% Prestador`; resolver as duas divergências internas de `RP-0236`. Nenhuma dessas decisões modifica automaticamente a política financeira vigente.
3. Resolver preços por catálogo/snapshot de origem para migração futura, sem recálculo retroativo ou substituição de contratos/aceites.
4. Validar conexão Redis REST/ambiente real de desenvolvimento, RBAC, EVAL e fluxos com credenciais seguras reais; os testes desta revisão usam Redis local e sessões sintéticas. Nenhum teste de produção foi executado.
5. Atualizar consumidores legados para enviar `quoteId`, `changeOrderId` e `expectedVersion`; chamadas sem esses identificadores falham fechadas. Revisar separadamente o versionamento do painel cadastral legado de prestadores.
6. Identificar os dois avisos reais de “Requer atenção 2”.
7. Aprovação do usuário para qualquer etapa de commit/push/ativação/deploy, além dos requisitos operacionais já documentados (capacidade/arquivamento da agenda, disponibilidade real e regras oficiais). Nenhuma aprovação foi presumida.
