# Etapa 4 — correções técnicas locais

Repositório: `conectaroiapoque-lab/reforma-profissional`. Branch: `feat/agenda-inteligente`. HEAD mantido em `b297c27`. Sem commit, push, merge, deploy, atualização da PR ou acesso a dados/credenciais de produção. Os demais projetos não foram acessados. As alterações anteriores foram mantidas e foi feita cópia de segurança do diff e dos diretórios server/test/public em `/tmp/reforma-stage4-backup` antes das edições.

## Prestadores: suspensão e auditoria

`server/provider-versioning.js` centraliza gravações Redis em um EVAL que compara `version`, grava o cadastro e mantém o índice de prestadores atomicamente. Ausência de versão em registro legado equivale a zero; a primeira atualização bem-sucedida passa a um. Não há migração em massa nem remoção de campos. Uma gravação com versão obsoleta retorna `STALE_PROVIDER`, HTTP 409, sem alterar o cadastro ou sua auditoria.

Ambos os repositórios Redis (`provider-repository.js` e `order-repository.js`) usam a mesma proteção: reenvio de documento, compliance, cadastro e outros escritores não podem sobrescrever uma suspensão com uma cópia antiga. Essas operações recusam o conflito; devem ser relidas/repetidas pelo usuário quando aplicável. O repositório em memória segue a mesma regra para os testes. `provider-repository.js` também rejeita erros lógicos do Redis REST mesmo com HTTP 200.

`provider-review-service.js` reexecuta ações sem versão explícita sobre uma leitura nova quando há conflito, revalidando estado e recompondo a auditoria a partir do registro atual. Isso mantém compatibilidade com consumidores antigos sem reaplicar o objeto antigo inteiro. Duas suspensões simultâneas resultam em uma suspensão e rejeição da segunda por estado; duas notas concorrentes preservam ambos os eventos. Com `expectedVersion` explícito, o conflito é devolvido imediatamente, sem retry automático. Não se aplica merge cego de documentos ou dados pessoais.

`public/admin/providers.js` envia a versão lida no detalhe. Após visualizar dados sensíveis, recarrega o detalhe porque esse acesso também produz auditoria e avança a versão. Uma tela administrativa obsoleta não recebe uma versão atualizada silenciosamente antes de salvar. Clientes antigos sem expectedVersion continuam compatíveis, mas não recebem a mesma detecção de intenção baseada em versão de tela; suas ações são revalidadas no estado atual e toda gravação possui CAS. Exigir expectedVersion em todos os clientes antigos exige migração coordenada de contrato da API.

## Orçamentos e aditivos

`server/quote-snapshots.js` mantém `quoteSnapshots` e `addendumSnapshots`, somente no servidor, com validação na persistência da OS. Integrações: `schedule-repository.js` (transação comum OS/agenda), `order-mutations.js` (save Redis direto) e `order-repository.js` (save em memória).

Cada snapshot registra quoteId, versão da proposta, versão do evento, serviço/código, nome, catálogo de origem quando existente, descrição/escopo, quantidade/unidade, condições disponíveis, preço do orçamento, snapshot financeiro já existente, instante UTC, responsável disponível, aprovação e estado. Propostas novas recebem identidade e versão próprias; eventos posteriores da mesma proposta acrescentam registros sem reescrever os anteriores. Os campos financeiros restritos continuam no armazenamento do servidor; as projeções públicas existentes não incluem os novos históricos nem a composição financeira. Não foi acrescentado histórico restrito ao bundle do navegador.

As rotas de emissão antigas e da agenda preservam quantidade/unidade/condições informadas, sem derivar unidades ou regras financeiras do CSV. A agenda usa os dados da avaliação técnica; quando um dado não existe no legado ou no atendimento direto, o snapshot registra null. Não se inventam medidas, responsáveis, condições ou aprovações.

Defesas de persistência:

- Alteração ou remoção de snapshots anteriores é recusada com `IMMUTABLE_QUOTE_HISTORY` / `IMMUTABLE_ADDENDUM_HISTORY`.
- Conteúdo comercial alterado mantendo o mesmo quoteId é recusado com `IMMUTABLE_QUOTE_CONTENT`; uma nova proposta antes do aceite deve ter outro quoteId.
- Orçamento aprovado, inclusive legado identificado pelo estado mesmo sem objeto de aceite, não pode ser substituído ou editado; alteração posterior deve usar aditivo. Snapshot financeiro aprovado também é protegido.
- Aditivos mantêm seus estados e valores em snapshots próprios; aditivo aplicado não pode ser editado retroativamente.
- Publicação/aceite e histórico fazem parte da mesma escrita transacional da OS; revisão e aprovação concorrentes produzem um resultado consistente, sem aprovar a proposta substituída.

Legado: o orçamento corrente é capturado como `LEGACY_CAPTURE` na primeira gravação posterior. Não se reconstitui histórico que não existe, não se recalcula com catálogo atual e não se atribui uma data de emissão histórica fictícia: `recordedAt` é o instante de captura; timestamps originais existentes permanecem no objeto quote. Snapshots já existentes de pedidos e contratos não são migrados ou substituídos. Nenhum contrato real foi acessado. Esta estrutura é uma garantia da aplicação, não armazenamento WORM contra administrador que escreva diretamente no Redis.

## Arquivos desta etapa

| Arquivo | Alteração |
| --- | --- |
| `server/provider-versioning.js` (novo) | CAS Redis e versão em memória |
| `server/provider-repository.js` | Save versionado; erro lógico Redis tratado |
| `server/provider-review-service.js` | Releitura/revalidação; recusa expectedVersion obsoleto |
| `server/order-repository.js` | Todos os saves de prestadores versionados; snapshots no save em memória |
| `public/admin/providers.js` | Envio da versão cadastral e atualização após auditoria sensível |
| `server/quote-snapshots.js` (novo) | Histórico e snapshots imutáveis de orçamento/aditivo |
| `server/order-mutations.js` (arquivo local anterior, ampliado) | Defesa no save Redis direto |
| `server/schedule-repository.js` | Snapshots na transação OS/agenda |
| `server/operations-service.js` | Metadados comerciais informados no orçamento legado |
| `server/schedule-service.js` | Escopo, medida e condições da avaliação na proposta |
| `test/stage4-integrity.test.js` (novo) | Onze testes com Redis real isolado |
| `review/stage4-runtime-changes.json` (novo) | Evidência dos hashes de mudanças técnicas autorizadas |
| `review/catalog-reconciliation/validate_review.py` | Distingue a Etapa 4 da referência técnica anterior, sem alterar hashes protegidos dos catálogos |
| Este relatório | Resultados, limites e requisitos |

Os demais arquivos já alterados no início permanecem no diretório de trabalho. O diff total contra HEAD inclui etapas anteriores; não equivale apenas ao trabalho desta etapa. O manifesto original da reconciliação foi preservado: a nova evidência técnica aponta do hash da revisão anterior ao atual, sem redefinir preços ou a fonte.

## Testes efetivamente executados

Antes das edições: **284 aprovados, 0 falhas, 0 ignorados**. Rodada final: **295 aprovados, 0 falhas, 0 ignorados, 0 cancelados e 0 todo**. Os 284 testes anteriores continuam incluídos, sem remoção ou afrouxamento de suas asserções.

Onze novos testes em `test/stage4-integrity.test.js`, todos com Redis real efêmero por socket, sem persistência ou conexões de produção:

1. Suspensão simultânea com nota: ambos os eventos e a suspensão preservados.
2. Duas suspensões simultâneas: uma decisão válida, sem perda de estado.
3. Cópia obsoleta e expectedVersion antigo rejeitados, inclusive registro legado sem versão.
4. Captura do orçamento antigo e aprovação sem recalcular preço; início posterior preserva snapshots.
5. Nova proposta recebe versão própria e preserva a anterior; histórico adulterado é recusado.
6. Edição retroativa, substituição do aprovado e save direto recusados.
7. Aceite de quoteId substituído recusado, com integridade da OS/agenda.
8. Disputa real de aprovação com revisão, com um único resultado comercial consistente.
9. Aditivo preserva orçamento aprovado e seus próprios snapshots; edição retroativa recusada.
10. Três auditorias concorrentes preservam todos os autores/eventos.
11. Aprovado legado sem objeto de aceite protege proposta e snapshot financeiro.

Também executados: `npm run build:web` aprovado; `python3 test-support/schedule-mobile.py` aprovado em Chromium 390 e 1280 px, incluindo cliente/profissional/CAC e HTTP 409 de agenda obsoleta; `python3 review/catalog-reconciliation/validate_review.py` aprovado; `git diff --check` aprovado. Logs locais: `/tmp/reforma-stage4-{baseline,tests-final,build,mobile}.log`.

A primeira validação do manifesto técnico da reconciliação falhou porque o hash de `schedule-service.js` havia mudado nesta etapa autorizada. O manifesto original não foi reescrito: adicionou-se a cadeia de evidência técnica separada e repetiu-se a validação com sucesso. Não foi falha de dados do CSV ou preços. O script histórico `review/final-conference/audit-provider.cjs` demonstrava a falha com repositório sintético sem CAS; permanece como evidência anterior, não substitui os testes atuais de Redis.

## Catálogo, limites e homologação

CSV original preservado com 242 registros. P1/P2/P3, `% Prestador`, preços oficiais e regras financeiras não modificados. Base de comissão não presumida. RP-0236 P2/P3, os 12 conflitos e todas as equivalências continuam pendentes. Nenhum serviço ativado/publicado. A validação confirma integridade da fonte, segregação e 111 ativos preservados.

Pendências e riscos restantes:

- Validar homologação real isolada de Redis REST/auth/armazenamento privado e experiência do painel de prestadores com duas sessões. O teste móvel atual exercita a agenda, não uma homologação completa do painel cadastral.
- A criação de prestadores ainda possui unicidade/idempotência em múltiplas operações; a correção de sobrescrita não resolve corrida de identidade duplicada na criação. Exige etapa específica com testes e migração compatível.
- Regras de reativação/finalização e revisão das projeções legadas apontadas na auditoria anterior continuam pendentes, sem mudanças de política nesta etapa.
- Arquivos enviados antes de uma gravação cadastral recusada podem ficar sem referência; configurar política de retenção/limpeza segura e retry de upload, sem apagar evidências ainda usadas.
- Histórico já perdido no legado não pode ser reconstruído. Campos desconhecidos permanecem explicitamente nulos. Crescimento do documento da OS exige política de arquivamento e limites operacionais; não foi realizado teste de volume de longo prazo.
- Precificação de uma nova proposta ainda consulta o catálogo atual em caminhos existentes. Snapshots impedem alteração retroativa, mas ativar outro catálogo exige resolver a política de versão do catálogo para novas propostas de pedidos antigos. A conciliação e ativação continuam bloqueadas para revisão humana.
- Validar procedimentos de backup/restauração, perfis LGPD e fluxo comercial de aditivos com o CAC. Não houve migração, custos novos ou contratação de serviço externo.

## Como identificar “Requer atenção 2” no Codex

Os textos exatos dos dois avisos continuam **não identificados**; a ferramenta de configuração não fornece o conteúdo desse painel. A ausência de requisitos pendentes na resposta da ferramenta não prova resolução dos avisos.

Na interface do Codex, abra as configurações do ambiente associado a esta tarefa/repositório e clique no indicador “Requer atenção 2” ou expanda os itens sinalizados. Registre o texto completo de cada aviso, seção/campo afetado e a ação sugerida. Se o indicador não abrir, examine as seções do formulário e os logs de preparação disponíveis na interface. Compartilhe apenas o texto dos avisos, removendo credenciais/dados pessoais. Não clique em publicar, deploy ou gravar alterações para tentar eliminá-los antes da revisão. Os nomes exatos dos menus podem variar conforme a versão da interface; não se presume a causa de nenhum aviso.

Todas as alterações permanecem locais, aguardando revisão e aprovação para a próxima etapa.
