# Reconciliação do catálogo — comparação concluída, pendente de revisão humana

**Estado: proposta local, sem ativação e sem commit/push.** Nenhum catálogo, regra financeira, pedido, orçamento, contrato ou snapshot foi alterado. A branch e a PR #42 da entrega anterior já existiam antes deste complemento e não foram atualizadas.

## Fontes conferidas: CSV original e TXT

A revisão anterior analisou somente `Reforma_Profissional_Tabela_Precos_ChatGPT_242_Servicos.txt`; não houve conversão do CSV pelo assistente. Agora foi conferido o CSV original `Reforma_Profissional_3_Precos_BH_RMBH_2026_CHATGPT.csv`, UTF-8, separado por ponto e vírgula, com 242 registros e 13 campos. O CSV é a fonte primária desta revisão.

- CSV: 75.219 bytes; SHA-256 `64d903dcbaffe2fa5775ab7fed9bc326139950ec801109cf8d0efec1d08b9475`.
- TXT: 117.567 bytes; SHA-256 `ceea136e1110ce11a4e629f07c47c6be37d0ca6271ce09d83184a6f994772ebb`, idêntico ao TXT analisado anteriormente.
- 242 códigos literais conferidos, sem duplicatas/lacunas. Todos os 13 campos do CSV foram verificados: 2.904 comparações dos 12 campos comuns e registro adicional de 242 percentuais de prestador.
- Resultado dos campos comuns: **1.936 iguais, 966 equivalentes apenas em apresentação e duas diferenças reais** em `RP-0236`, P2 e P3. Os valores divergentes permanecem somente na área administrativa restrita.
- `% Prestador` está preenchido nas 242 linhas do CSV e ausente no TXT. O TXT não é uma representação completa/sem perda do CSV. Os cabeçalhos e resultados por campo estão no [relatório de concordância](../review/catalog-reconciliation/source-concordance-report.md).
- P1, códigos, descrições, especialidades, unidades, condições e referências não divergiram em conteúdo. As classificações anteriores permanecem 20/37/63/12/110.
- Foram mantidos 24 grupos de especialidade, oito unidades literais, 95 registros “Vistoria / orçamento” e 147 “Tabela sujeita ao escopo”.

**Correção:** a afirmação anterior sobre ausência de repasse aplicava-se ao TXT e foi incompleta para o CSV. O CSV **contém `% Prestador`**, registrado como dado da fonte, em representação original e decimal na área privada. P3 continua piso comercial, separado desse percentual. **A base de cálculo não está declarada; nenhum valor de repasse foi calculado e nenhuma regra financeira foi alterada.** Não se presume incidência sobre P1, P2, P3, mão de obra, total ou valor líquido.

As orientações do anexo foram tratadas como conteúdo da fonte, sem execução de oferta/negociação ou autorização de mudança. Nenhum link de concorrente foi acessado.

## Entregáveis da comparação

[Relatório completo](../review/catalog-reconciliation/comparison-report.md), com as 242 linhas e referências públicas por par. Arquivos locais em `review/catalog-reconciliation/`:

- `comparison-source-242.csv`: todos os serviços, especialidade, unidade, condição, P1 sugerido, candidatos e decisões pendentes.
- `comparison-pairs.csv`: 145 relações analíticas com descrição, categoria/especialidade, unidade, escopo, modalidade, preços públicos lado a lado e riscos.
- `new-service-candidates.csv`: lista dos 110 candidatos sem contraparte direta identificada.
- `active-111-coverage.csv`: cobertura e preservação dos 111 ativos, inclusive os 24 sem contraparte identificada.
- `conflicts-and-decisions.csv`: lista de conflitos, sobreposições e decisões pendentes.
- `source-validation.json` e `baseline-manifest.json`: validação da fonte e hashes da base.
- `private/`: referências de negociação, piso comercial e composição financeira existentes, separadas e com permissões locais restritas. Não publicar ou encaminhar a clientes.

Esses arquivos estão fora da allowlist de `scripts/build-web.js` e do servidor estático `dist/`. Não foram criados endpoints de consulta da fonte ou das referências internas.

## Resultado, sem equivalências aprovadas

As classificações abaixo são uma análise conservadora por conteúdo, não uma migração. Igualdade de descrição não prova igualdade de unidade, escopo, habilitação ou preço.

| Classificação por serviço da fonte | Quantidade |
| --- | ---: |
| Descrição idêntica candidata | 20 |
| Atividade relacionada candidata | 37 |
| Sobreposição / pacote / componente / desdobramento | 63 |
| Conflito de escopo ou operação, não equivalente | 12 |
| Novo candidato sem contraparte direta identificada | 110 |
| **Total** | **242** |

Há 145 relações para análise porque um serviço pode exigir confronto com vários ativos. Dos 111 ativos, 57 têm candidato direto de atividade/descrição, 30 apenas relação de escopo/conflito e 24 nenhuma contraparte identificada. **Todos os ativos permanecem preservados. Zero equivalências aprovadas.** “Novo candidato” não significa inclusão autorizada nem ausência comprovada de toda possibilidade de composição por serviços existentes.

| Dimensão | Ativo V7 | Anexo recebido |
| --- | --- | --- |
| Serviços | 111 | 242 |
| Classificação | 7 categorias comerciais | 24 especialidades da fonte; sem validação automática de habilitações |
| Modalidade | 50 FIXED, 7 FROM, 54 QUOTE | 95 exigem vistoria/orçamento; 147 condicionados ao escopo, sem declaração FIXED |
| Unidade estruturada | Ausente nos 111 | serviço (182), diária (6), hora* (4), m² (37), semana (1), mês (1), m linear (10), kWp (1) |
| Escopo | 58 com notas, incluindo padrões genéricos | Descrição + condição; materiais, deslocamento e extras separados, conforme legenda |
| Preço público | Conforme catálogo vigente; QUOTE sem preço fechado | P1 sugerido, não cotação confirmada |
| Negociação e piso | Política interna vigente, preservada | P2 e P3 separados no relatório administrativo |
| Repasse | Regras/contratos existentes, preservados | CSV contém percentual de prestador; base e valor monetário não determinados |

Unidades `hora*` mantêm o asterisco original: o anexo não apresenta nota explicativa; a duração mínima e o significado precisam de decisão humana. Nomes contendo “mínimo”, “até”, “por m²” ou “por metro” não autorizam comparar tarifa unitária com total de chamado. V7L001 também possui opções públicas de preço e não pode ser comparado apenas por um valor base.

Nos 145 pares há 66 valores nominais públicos diferentes, 10 iguais e 69 sem preço fechado no ativo. Isso não constitui aumento/redução proposto: como unidade/escopo não estão integralmente validados, **não foram calculadas variações percentuais ou deltas comerciais**. Os valores públicos ficam lado a lado para decisão humana; ausência de preço QUOTE não é zero.

### Conflitos prioritários

- `RP-0001` descreve suporte de TV e tem descrição idêntica a `RP0030`. **Não corresponde a `RP0001`**, que é tomada simples. Os códigos não foram normalizados por retirada de hífens.
- Fonte com instalação e troca de sifão (`RP-0015`) versus dois ativos (`RP0017`, `RP0018`): definir desdobramento sem duplicar cobrança.
- Fonte com guarda-roupas pequeno/médio/grande (`RP-0129` a `RP-0131`) versus item convencional `RP0038`: medidas e limites de complexidade precisam de definição.
- Modelos de ar-condicionado acima de 12.000 BTU, espelho grande, guarda-roupa planejado e ponto elétrico novo não podem herdar preços de escopos menores/prontos.
- Vistoria da fonte versus ativo FIXED aparece em seis relações envolvendo cinco serviços: `RP-0041`, `RP-0117` (dois ativos), `RP-0121`, `RP-0141`, `RP-0241`. São conflitos a resolver, não motivo para converter serviços sujeitos a avaliação em FIXED.
- 95 serviços da fonte exigem vistoria/orçamento mesmo tendo valores numéricos. Os 54 QUOTE e sete FROM ativos também não serão convertidos automaticamente.
- `RP-0113` e `RP-0160` podem sobrepor reparo de estrutura de madeira de telhado sob especialidades diferentes; não foram unidos.
- Engenharia, arquitetura, ART, laudos, automação, energia solar/eólica e SPA exigem escopos/qualificações próprios. Categorias genéricas de reforma, elétrica ou hidráulica não provam cobertura.

As listas completas de correspondências candidatas, novos candidatos, conflitos e ativos sem contraparte estão nos arquivos de revisão acima. Cada decisão está marcada **PENDENTE_REVISAO_HUMANA** e não alimenta a aplicação.

## Proposta de migração, sujeita à aprovação

1. **CSV original e TXT recebidos, conferidos e preservados.** SHA-256, codificação, estrutura, todos os campos, contagem e códigos foram conferidos. Usar o CSV como fonte primária e registrar as duas divergências internas e a omissão de percentual no TXT. Preservar o arquivo bruto e os códigos, inclusive hífens. Não adaptar a fonte para caber no catálogo ativo.
2. **Validar a autoridade comercial das referências.** A legenda da fonte identifica P1 inicial, P2 negociação e P3 piso comercial confidencial; o CSV também informa percentual de prestador, sem base de cálculo explícita. A interpretação da legenda não aprova preços, autorização de negociação ou repasses. Confirmar quem pode autorizar cada referência. Manter origem/versão em cada campo; o percentual é preservado como dado da fonte; o valor de repasse permanece indeterminado, sem derivação de P3 ou base presumida.
3. **Revisar os candidatos por conteúdo já gerados.** Descrição, especialidade, unidade, escopo e modalidade; busca textual pode sugerir candidatos, mas não alterar identidades nem autorizar preço. Campos ausentes e mapeamentos de especialidade exigem revisão. Códigos só servem como identidade dentro de sua fonte/versão.
4. **Manter as projeções separadas já produzidas.** O relatório de revisão contém apenas P1 sugerido e preços públicos vigentes; uma futura projeção de atendimento deverá usar somente preços aprovados. O relatório administrativo local mantém negociação, piso comercial e referências financeiras com permissões restritas, fora do build e das respostas públicas. O CSV informa percentual, sem base ou fórmula para determinar o repasse; o piso comercial não equivale ao piso de remuneração. Uma eventual integração administrativa deverá aplicar RBAC no servidor. Nenhum repasse é derivado de percentuais presumidos.
5. **Aprovar um crosswalk explícito.** Chave composta por fonte/versão/código original; referências para IDs ativos com ambos os códigos preservados. Registrar decisão humana, evidência, diferenças e validade. Desdobramentos/agrupamentos não reutilizam códigos silenciosamente. Não criar alias por remoção de pontuação.
6. **Criar versão candidata inativa.** Valores e novos serviços apenas em staging privado, sem mudar `catalog.js`, seus exports ou o identificador de versão ativo. QUOTE e necessidade de vistoria permanecem restrições. A presença de números na fonte não converte QUOTE/FROM em FIXED. Preço de visita/diagnóstico não é preço da execução.
7. **Separar aprovação financeira.** Analisar referências não muda comissão, margem, piso, tier, repasse, impostos, descontos ou critérios vigentes. Divergências financeiras seguem decisão específica do responsável; nenhum percentual da fonte se torna regra executável por esta reconciliação.
8. **Preservar compromissos existentes.** Não reescrever códigos, versões, preços, hashes, snapshots, aceites ou documentos anteriores. Orçamentos aceitos são imutáveis. Ordens abertas permanecem na versão de origem; eventual nova proposta deve ser explícita, versionada e novamente aceita, sem substituir o snapshot original. Regras/qualificações de agenda continuam vinculadas à identidade aprovada e não são copiadas por semelhança de código.
9. **Testar em desenvolvimento isolado.** Migração somente aditiva e idempotente, backup consistente, comparação de hashes, rollback sem exclusão de dados, preços públicos por allowlist e testes negativos para todo dado interno. Ensaiar conflitos de unidade/modalidade, códigos semelhantes e preservação de pedidos de versões diferentes.
10. **Apresentar o diff para autorização específica.** Lista fechada de novos serviços/crosswalk/preços públicos, decisões pendentes e impacto operacional. Ativação, commit, push, merge ou publicação só após nova autorização. Nenhuma dessas operações faz parte desta proposta.

## Bloqueio técnico identificado para uma migração futura

A preparação de proposta em `server/schedule-service.js` consulta `getServiceByCode(order.serviceId)` no catálogo vigente e usa `CATALOG_VERSION`. Embora nenhuma tabela tenha sido alterada agora, trocar o catálogo sem tratar essa resolução poderia usar referência atual para uma ordem antiga. **Antes de qualquer ativação**, a resolução deverá respeitar o snapshot/versão da ordem e os orçamentos/contratos anteriores. Ordens legadas sem evidência suficiente deverão ir à revisão humana, sem fallback silencioso para novos preços. Essa correção não deve modificar valores ou snapshots já persistidos.

Esse é um requisito da proposta de migração, ainda não executada; não há banco de produção conectado nesta revisão. Os testes existentes da agenda e as alterações da entrega anterior permanecem separados deste estudo de catálogo.

## Validação desta revisão

- Parser: 242 linhas completas, códigos preservados, ausência de duplicatas/lacunas e valores válidos; nenhuma instrução do anexo executada.
- Validação dos artefatos: 242 registros da fonte, 111 ativos, 145 relações, somas das classificações, identidades distintas, marcações de vistoria/QUOTE, ausência de aprovação e separação dos campos financeiros internos.
- Hashes dos catálogos e da autoridade contratual iguais à base anterior. Os serviços de agenda/pedido receberam correções locais de versão/concorrência, descritas em `docs/agenda-review-status.md`. Não houve acesso nem escrita em dados reais de pedidos, orçamentos ou contratos.
- Build Web aprovado; nenhum relatório, fonte ou diretório privado entrou em `dist/`.
- Suíte anterior: 269 testes aprovados. Resultado atualizado: **284 aprovados, zero falhas e zero ignorados**, detalhado em `docs/agenda-review-status.md`.
- HEAD permanece `b297c27`; as correções e os artefatos permanecem apenas no diretório de trabalho; nada foi staged ou enviado. Sem commit, push, merge, atualização da PR ou publicação.

## Pendências para sua revisão

1. Validar as candidaturas e os 12 conflitos explícitos de escopo; nenhuma equivalência foi aprovada.
2. Confirmar unidades, quantidades, mínimos de chamado, escopo técnico, materiais e especialidade/habilitação de cada item a aprovar.
3. Decidir desdobramentos, pacotes e possíveis sobreposições; revisar os 110 candidatos sem contraparte direta e preservar os 24 ativos sem contraparte identificada.
4. Aprovar separadamente referências públicas e políticas financeiras; P2/P3 e o percentual da fonte permanecem segregados; o CSV não define a base de cálculo do repasse.
5. Exigir resolução por versão/snapshot e testes de preservação antes de qualquer ativação futura.
6. Autorizar expressamente qualquer etapa posterior de implementação, commit, push ou publicação. Nada disso foi executado neste complemento.

**Nenhuma correspondência, preço ou migração está aprovada por este documento.** Exemplos das cinco categorias, decisões dos 12 conflitos, andamento das cinco correções e avisos ainda não identificados estão em [agenda-review-status.md](agenda-review-status.md).
