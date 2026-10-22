# Comparação de referência: 242 serviços × 111 ativos

**Somente revisão. Nenhum preço, mapeamento ou migração foi aprovado/ativado.** Os preços P1 da fonte são sugestões, não cotações confirmadas. Este relatório contém apenas preço público/referencial P1; negociação, piso comercial e dados financeiros internos estão segregados.

Fonte primária CSV original: `Reforma_Profissional_3_Precos_BH_RMBH_2026_CHATGPT.csv`; SHA-256 `64d903dcbaffe2fa5775ab7fed9bc326139950ec801109cf8d0efec1d08b9475`. O TXT anterior foi conferido contra o CSV: há duas divergências internas em RP-0236 (P2/P3), além da omissão de % Prestador nas 242 linhas. A revisão anterior analisou o TXT, sem realizar conversão do CSV. Consulte source-concordance-report.md para a conferência de todos os campos. Foram verificados 242 códigos únicos, UTF-8, sem duplicatas, lacunas ou campos/valores inválidos na estrutura esperada. Nenhum site de concorrente foi consultado e suas referências não foram validadas.

## Resultado por serviço da fonte

| Classificação | Quantidade |
| --- | ---: |
| Descrição idêntica; candidato, sem equivalência aprovada | 20 |
| Sobreposição, pacote, componente ou desdobramento | 63 |
| Atividade relacionada; conferir escopo/unidade | 37 |
| Novo candidato, sem contraparte direta identificada | 110 |
| Escopo/operação incompatível; não equivalente | 12 |

Total: **242**. Relações analíticas: **145** (um serviço pode ter mais de um candidato). Aprovações: **0**. Todos os 242 serviços exigem revisão antes de implantação.

## Restrições e conflitos

- Os 95 registros com condição “Vistoria / orçamento” continuam dependentes de avaliação, mesmo tendo P1 numérico. Os 147 com “Tabela sujeita ao escopo” não declaram FIXED.
- Os 111 ativos não têm unidade nem especialidade técnica estruturadas. Categoria comercial não é habilitação. Não se calculou percentual/delta de alteração de preço: nenhuma dupla possui equivalência comercial integral validada.
- Valores P1 e preços públicos ativos aparecem lado a lado como referências nominais; igualdade numérica não prova equivalência. Ausência de preço QUOTE não é zero.
- Nenhuma rotina remove hífens para unir identidades. `RP-0001` é suporte de TV e se relaciona por descrição com `RP0030`; `RP0001` é tomada simples e não foi associado a ele.
- V7L001 tem política pública com opções de preço; comparar somente o valor base sem essa política seria incompleto.

### Fonte com vistoria versus candidato ativo FIXED

| Fonte | Candidato ativo | Motivo |
| --- | --- | --- |
| `RP-0041` | `RP0001` | Criação de ponto novo requer circuito/infraestrutura e não é tomada simples em ponto existente. |
| `RP-0117` | `RP0040` | Fonte une móvel e porta; ativo separa regulagem de armário e reparo em porta. |
| `RP-0117` | `RP0044` | Fonte une móvel e porta; ativo separa regulagem de armário e reparo em porta. |
| `RP-0121` | `RP0038` | Projeto/fabricação de guarda-roupa planejado não equivale à montagem de móvel pronto; escopo ativo exclui embutidos complexos. |
| `RP-0141` | `RP0034` | Espelho grande/especial é explicitamente excluído do escopo pequeno/médio do ativo. |
| `RP-0241` | `V7L002` | Faxina pesada exige vistoria/orçamento na fonte e pode exceder diária simples FIXED. Não converter. |

### Sobreposições internas da fonte a revisar

- `RP-0113` e `RP-0160`: reparo de estrutura de madeira de telhado sob especialidades diferentes; possível sobreposição, não duplicação confirmada.
- `RP-0089`, `RP-0090`, `RP-0091`: limpeza/higienização e manutenção preventiva podem conter atividades comuns; definir composição para não cobrar duas vezes.
- `RP-0008` e `RP-0150`: vedação genérica versus vedação de esquadrias; manter contexto/material até decisão humana.
- ART, laudos e projetos de engenharia/arquitetura não devem ser fundidos a visitas de mestre de obra nem a reparos de execução.

## Matriz completa por serviço da fonte

Preços nesta tabela são P1 **sugeridos da fonte**. Modalidade ativa não é alterada. “Novo candidato” indica ausência de contraparte de mesma atividade/escopo identificada nesta análise, não inclusão autorizada. A planilha de pares detalha cada campo e o preço ativo.

| Código fonte | Serviço | Especialidade / unidade | Condição | P1 sugerido | IDs ativos relacionados | Classificação |
| --- | --- | --- | --- | ---: | --- | --- |
| `RP-0001` | Instalação de suporte de TV | Marido de Aluguel / serviço | Tabela sujeita ao escopo | R$ 129,90 | `RP0030` | Descrição idêntica; candidato, sem equivalência aprovada |
| `RP-0002` | Instalação de prateleira / nicho | Marido de Aluguel / serviço | Tabela sujeita ao escopo | R$ 99,90 | `RP0031` | Sobreposição, pacote, componente ou desdobramento |
| `RP-0003` | Instalação de cortina / persiana | Marido de Aluguel / serviço | Tabela sujeita ao escopo | R$ 89,90 | `RP0033` | Atividade relacionada; conferir escopo/unidade |
| `RP-0004` | Instalação de varal de teto | Marido de Aluguel / serviço | Tabela sujeita ao escopo | R$ 119,90 | `RP0032` | Sobreposição, pacote, componente ou desdobramento |
| `RP-0005` | Fixação de quadro (unidade) | Marido de Aluguel / serviço | Tabela sujeita ao escopo | R$ 69,90 | `RP0035` | Atividade relacionada; conferir escopo/unidade |
| `RP-0006` | Instalação de espelho pequeno | Marido de Aluguel / serviço | Tabela sujeita ao escopo | R$ 119,90 | `RP0034` | Sobreposição, pacote, componente ou desdobramento |
| `RP-0007` | Instalação de acessórios de banheiro - até 5 peças | Marido de Aluguel / serviço | Tabela sujeita ao escopo | R$ 159,90 | — | Novo candidato, sem contraparte direta identificada |
| `RP-0008` | Aplicação de silicone / vedação simples | Marido de Aluguel / serviço | Tabela sujeita ao escopo | R$ 129,90 | — | Novo candidato, sem contraparte direta identificada |
| `RP-0009` | Troca de fechadura simples | Marido de Aluguel / serviço | Tabela sujeita ao escopo | R$ 129,90 | `RP0042` | Atividade relacionada; conferir escopo/unidade |
| `RP-0010` | Ajuste de porta / dobradiça | Marido de Aluguel / serviço | Tabela sujeita ao escopo | R$ 149,90 | `RP0041`, `RP0044` | Sobreposição, pacote, componente ou desdobramento |
| `RP-0011` | Pacote 1 hora de pequenos reparos | Marido de Aluguel / serviço | Tabela sujeita ao escopo | R$ 149,90 | — | Novo candidato, sem contraparte direta identificada |
| `RP-0012` | Pacote meio período - até 4 horas | Marido de Aluguel / serviço | Tabela sujeita ao escopo | R$ 349,90 | — | Novo candidato, sem contraparte direta identificada |
| `RP-0013` | Instalação de torneira em ponto existente | Encanador / Bombeiro Hidráulico / serviço | Tabela sujeita ao escopo | R$ 119,90 | `RP0014` | Atividade relacionada; conferir escopo/unidade |
| `RP-0014` | Troca de torneira simples | Encanador / Bombeiro Hidráulico / serviço | Tabela sujeita ao escopo | R$ 99,90 | `RP0015` | Descrição idêntica; candidato, sem equivalência aprovada |
| `RP-0015` | Instalação / troca de sifão | Encanador / Bombeiro Hidráulico / serviço | Tabela sujeita ao escopo | R$ 99,90 | `RP0017`, `RP0018` | Sobreposição, pacote, componente ou desdobramento |
| `RP-0016` | Reparo de vazamento simples aparente | Encanador / Bombeiro Hidráulico / serviço | Tabela sujeita ao escopo | R$ 149,90 | `RP0023` | Sobreposição, pacote, componente ou desdobramento |
| `RP-0017` | Troca de registro | Encanador / Bombeiro Hidráulico / serviço | Tabela sujeita ao escopo | R$ 179,90 | `RP0026` | Descrição idêntica; candidato, sem equivalência aprovada |
| `RP-0018` | Instalação de vaso sanitário | Encanador / Bombeiro Hidráulico / serviço | Tabela sujeita ao escopo | R$ 249,90 | `RP0027` | Descrição idêntica; candidato, sem equivalência aprovada |
| `RP-0019` | Vedação / reaperto de vaso sanitário | Encanador / Bombeiro Hidráulico / serviço | Tabela sujeita ao escopo | R$ 149,90 | `RP0028` | Sobreposição, pacote, componente ou desdobramento |
| `RP-0020` | Troca de mecanismo de descarga | Encanador / Bombeiro Hidráulico / serviço | Tabela sujeita ao escopo | R$ 179,90 | `RP0022` | Descrição idêntica; candidato, sem equivalência aprovada |
| `RP-0021` | Desentupimento simples de pia | Encanador / Bombeiro Hidráulico / serviço | Tabela sujeita ao escopo | R$ 179,90 | `RP0019` | Descrição idêntica; candidato, sem equivalência aprovada |
| `RP-0022` | Desentupimento de vaso sanitário | Encanador / Bombeiro Hidráulico / serviço | Tabela sujeita ao escopo | R$ 229,90 | `RP0020` | Descrição idêntica; candidato, sem equivalência aprovada |
| `RP-0023` | Desentupimento simples de esgoto - a partir de | Encanador / Bombeiro Hidráulico / serviço | Vistoria / orçamento | R$ 299,90 | `V7H003` | Atividade relacionada; conferir escopo/unidade |
| `RP-0024` | Desentupimento completo de esgoto - a partir de | Encanador / Bombeiro Hidráulico / serviço | Vistoria / orçamento | R$ 399,90 | `V7H004` | Atividade relacionada; conferir escopo/unidade |
| `RP-0025` | Instalação de máquina de lavar | Encanador / Bombeiro Hidráulico / serviço | Tabela sujeita ao escopo | R$ 129,90 | `RP0025` | Descrição idêntica; candidato, sem equivalência aprovada |
| `RP-0026` | Instalação de filtro de água | Encanador / Bombeiro Hidráulico / serviço | Tabela sujeita ao escopo | R$ 99,90 | `RP0024` | Descrição idêntica; candidato, sem equivalência aprovada |
| `RP-0027` | Instalação de gabinete de banheiro | Encanador / Bombeiro Hidráulico / serviço | Tabela sujeita ao escopo | R$ 229,90 | `RP0029` | Descrição idêntica; candidato, sem equivalência aprovada |
| `RP-0028` | Criação / adaptação de ponto hidráulico - a partir de | Encanador / Bombeiro Hidráulico / serviço | Vistoria / orçamento | R$ 249,90 | `V7H001` | Sobreposição, pacote, componente ou desdobramento |
| `RP-0029` | Caça-vazamento / diagnóstico sem quebra - a partir de | Encanador / Bombeiro Hidráulico / serviço | Vistoria / orçamento | R$ 399,90 | `RP0023` | Escopo/operação incompatível; não equivalente |
| `RP-0030` | Reparo de vazamento embutido - a partir de | Encanador / Bombeiro Hidráulico / serviço | Vistoria / orçamento | R$ 299,90 | `RP0023` | Escopo/operação incompatível; não equivalente |
| `RP-0031` | Troca de tomada | Eletricista / serviço | Tabela sujeita ao escopo | R$ 89,90 | `RP0002` | Descrição idêntica; candidato, sem equivalência aprovada |
| `RP-0032` | Instalação de tomada em ponto existente | Eletricista / serviço | Tabela sujeita ao escopo | R$ 129,90 | `RP0001` | Atividade relacionada; conferir escopo/unidade |
| `RP-0033` | Troca de interruptor | Eletricista / serviço | Tabela sujeita ao escopo | R$ 89,90 | `RP0004` | Descrição idêntica; candidato, sem equivalência aprovada |
| `RP-0034` | Instalação de interruptor | Eletricista / serviço | Tabela sujeita ao escopo | R$ 119,90 | `RP0003` | Descrição idêntica; candidato, sem equivalência aprovada |
| `RP-0035` | Instalação de luminária simples | Eletricista / serviço | Tabela sujeita ao escopo | R$ 119,90 | `RP0005` | Atividade relacionada; conferir escopo/unidade |
| `RP-0036` | Instalação de lustre / pendente | Eletricista / serviço | Tabela sujeita ao escopo | R$ 149,90 | `RP0005` | Sobreposição, pacote, componente ou desdobramento |
| `RP-0037` | Instalação de chuveiro elétrico | Eletricista / serviço | Tabela sujeita ao escopo | R$ 149,90 | `RP0007` | Descrição idêntica; candidato, sem equivalência aprovada |
| `RP-0038` | Troca de resistência de chuveiro | Eletricista / serviço | Tabela sujeita ao escopo | R$ 99,90 | `RP0008` | Descrição idêntica; candidato, sem equivalência aprovada |
| `RP-0039` | Instalação de ventilador de teto | Eletricista / serviço | Tabela sujeita ao escopo | R$ 179,90 | `RP0009` | Descrição idêntica; candidato, sem equivalência aprovada |
| `RP-0040` | Troca de disjuntor | Eletricista / serviço | Tabela sujeita ao escopo | R$ 129,90 | `RP0011` | Descrição idêntica; candidato, sem equivalência aprovada |
| `RP-0041` | Instalação de ponto elétrico novo - a partir de | Eletricista / serviço | Vistoria / orçamento | R$ 199,90 | `RP0001` | Escopo/operação incompatível; não equivalente |
| `RP-0042` | Revisão de circuito elétrico | Eletricista / serviço | Tabela sujeita ao escopo | R$ 149,90 | `RP0013` | Atividade relacionada; conferir escopo/unidade |
| `RP-0043` | Diagnóstico / reparo de curto-circuito - a partir de | Eletricista / serviço | Vistoria / orçamento | R$ 199,90 | `RP0012` | Atividade relacionada; conferir escopo/unidade |
| `RP-0044` | Passagem / substituição de fiação por ponto - a partir de | Eletricista / serviço | Vistoria / orçamento | R$ 249,90 | — | Novo candidato, sem contraparte direta identificada |
| `RP-0045` | Montagem / revisão de quadro pequeno - a partir de | Eletricista / serviço | Vistoria / orçamento | R$ 399,90 | — | Novo candidato, sem contraparte direta identificada |
| `RP-0046` | Instalação de DR / DPS - mão de obra | Eletricista / serviço | Tabela sujeita ao escopo | R$ 249,90 | — | Novo candidato, sem contraparte direta identificada |
| `RP-0047` | Diária de pedreiro especializado | Pedreiro de Acabamento / Alvenaria / diária | Tabela sujeita ao escopo | R$ 399,90 | — | Novo candidato, sem contraparte direta identificada |
| `RP-0048` | Hora técnica de pedreiro - mínimo 2h | Pedreiro de Acabamento / Alvenaria / hora* | Tabela sujeita ao escopo | R$ 79,90 | — | Novo candidato, sem contraparte direta identificada |
| `RP-0049` | Chapisco - mão de obra por m² | Pedreiro de Acabamento / Alvenaria / m² | Tabela sujeita ao escopo | R$ 24,90 | — | Novo candidato, sem contraparte direta identificada |
| `RP-0050` | Reboco / emboço - mão de obra por m² | Pedreiro de Acabamento / Alvenaria / m² | Tabela sujeita ao escopo | R$ 54,90 | `RP0063` | Escopo/operação incompatível; não equivalente |
| `RP-0051` | Construção de parede de alvenaria - mão de obra por m² | Pedreiro de Acabamento / Alvenaria / m² | Tabela sujeita ao escopo | R$ 69,90 | `RP0070` | Atividade relacionada; conferir escopo/unidade |
| `RP-0052` | Demolição de alvenaria - mão de obra por m² | Pedreiro de Acabamento / Alvenaria / m² | Tabela sujeita ao escopo | R$ 49,90 | `RP0071` | Atividade relacionada; conferir escopo/unidade |
| `RP-0053` | Contrapiso - mão de obra por m² | Pedreiro de Acabamento / Alvenaria / m² | Tabela sujeita ao escopo | R$ 54,90 | `RP0072` | Atividade relacionada; conferir escopo/unidade |
| `RP-0054` | Assentamento de piso cerâmico - mão de obra por m² | Pedreiro de Acabamento / Alvenaria / m² | Tabela sujeita ao escopo | R$ 59,90 | `RP0064` | Sobreposição, pacote, componente ou desdobramento |
| `RP-0055` | Assentamento de porcelanato - mão de obra por m² | Pedreiro de Acabamento / Alvenaria / m² | Tabela sujeita ao escopo | R$ 79,90 | `RP0065` | Atividade relacionada; conferir escopo/unidade |
| `RP-0056` | Revestimento de parede - mão de obra por m² | Pedreiro de Acabamento / Alvenaria / m² | Tabela sujeita ao escopo | R$ 69,90 | `RP0073` | Atividade relacionada; conferir escopo/unidade |
| `RP-0057` | Rejuntamento / renovação de rejunte por m² | Pedreiro de Acabamento / Alvenaria / m² | Tabela sujeita ao escopo | R$ 24,90 | — | Novo candidato, sem contraparte direta identificada |
| `RP-0058` | Pequeno reparo de alvenaria - a partir de | Pedreiro de Acabamento / Alvenaria / serviço | Vistoria / orçamento | R$ 199,90 | — | Novo candidato, sem contraparte direta identificada |
| `RP-0059` | Reforma de banheiro - mão de obra a partir de | Pedreiro de Acabamento / Alvenaria / serviço | Vistoria / orçamento | R$ 1.499,90 | `RP0066` | Atividade relacionada; conferir escopo/unidade |
| `RP-0060` | Reforma de cozinha - mão de obra a partir de | Pedreiro de Acabamento / Alvenaria / serviço | Vistoria / orçamento | R$ 1.299,90 | `RP0067` | Atividade relacionada; conferir escopo/unidade |
| `RP-0061` | Reforma geral - mão de obra a partir de por m² | Pedreiro de Acabamento / Alvenaria / m² | Vistoria / orçamento | R$ 899,90 | `RP0068`, `RP0069`, `RP0089` | Sobreposição, pacote, componente ou desdobramento |
| `RP-0062` | Visita técnica / avaliação de obra | Mestre de Obra / serviço | Tabela sujeita ao escopo | R$ 199,90 | — | Novo candidato, sem contraparte direta identificada |
| `RP-0063` | Acompanhamento / supervisão por hora | Mestre de Obra / hora* | Tabela sujeita ao escopo | R$ 99,90 | — | Novo candidato, sem contraparte direta identificada |
| `RP-0064` | Meio período - até 4h | Mestre de Obra / serviço | Tabela sujeita ao escopo | R$ 299,90 | — | Novo candidato, sem contraparte direta identificada |
| `RP-0065` | Diária - até 8h | Mestre de Obra / diária | Tabela sujeita ao escopo | R$ 499,90 | — | Novo candidato, sem contraparte direta identificada |
| `RP-0066` | Semana de acompanhamento - até 5 dias | Mestre de Obra / semana | Tabela sujeita ao escopo | R$ 2.299,90 | — | Novo candidato, sem contraparte direta identificada |
| `RP-0067` | Gestão mensal de obra - a partir de | Mestre de Obra / mês | Vistoria / orçamento | R$ 7.999,90 | — | Novo candidato, sem contraparte direta identificada |
| `RP-0068` | Visita técnica de engenheiro civil | Engenheiro Civil / Estrutural / serviço | Vistoria / orçamento | R$ 449,90 | — | Novo candidato, sem contraparte direta identificada |
| `RP-0069` | ART para reforma simples - serviço profissional | Engenheiro Civil / Estrutural / serviço | Vistoria / orçamento | R$ 599,90 | — | Novo candidato, sem contraparte direta identificada |
| `RP-0070` | Laudo técnico simples - a partir de | Engenheiro Civil / Estrutural / serviço | Vistoria / orçamento | R$ 999,90 | — | Novo candidato, sem contraparte direta identificada |
| `RP-0071` | Laudo estrutural / patologia - a partir de | Engenheiro Civil / Estrutural / serviço | Vistoria / orçamento | R$ 1.499,90 | — | Novo candidato, sem contraparte direta identificada |
| `RP-0072` | Projeto estrutural - a partir de por m² | Engenheiro Civil / Estrutural / m² | Vistoria / orçamento | R$ 49,90 | — | Novo candidato, sem contraparte direta identificada |
| `RP-0073` | Vistoria cautelar residencial | Engenheiro Civil / Estrutural / serviço | Tabela sujeita ao escopo | R$ 499,90 | — | Novo candidato, sem contraparte direta identificada |
| `RP-0074` | Avaliação de trinca / fissura com parecer - a partir de | Engenheiro Civil / Estrutural / serviço | Vistoria / orçamento | R$ 699,90 | — | Novo candidato, sem contraparte direta identificada |
| `RP-0075` | Acompanhamento técnico de obra por hora | Engenheiro Civil / Estrutural / hora* | Tabela sujeita ao escopo | R$ 249,90 | — | Novo candidato, sem contraparte direta identificada |
| `RP-0076` | Projeto estrutural casa térrea - a partir de | Engenheiro Civil / Estrutural / serviço | Vistoria / orçamento | R$ 1.999,90 | — | Novo candidato, sem contraparte direta identificada |
| `RP-0077` | Consulta inicial / visita técnica | Arquiteto / serviço | Tabela sujeita ao escopo | R$ 249,90 | — | Novo candidato, sem contraparte direta identificada |
| `RP-0078` | Levantamento métrico residencial - a partir de | Arquiteto / serviço | Vistoria / orçamento | R$ 349,90 | — | Novo candidato, sem contraparte direta identificada |
| `RP-0079` | Projeto arquitetônico - por m² | Arquiteto / m² | Vistoria / orçamento | R$ 59,90 | — | Novo candidato, sem contraparte direta identificada |
| `RP-0080` | Projeto de reforma - por m² | Arquiteto / m² | Vistoria / orçamento | R$ 54,90 | — | Novo candidato, sem contraparte direta identificada |
| `RP-0081` | Projeto de interiores / decoração - por m² | Arquiteto / m² | Vistoria / orçamento | R$ 59,90 | — | Novo candidato, sem contraparte direta identificada |
| `RP-0082` | Renderização 3D - por ambiente | Arquiteto / serviço | Tabela sujeita ao escopo | R$ 299,90 | — | Novo candidato, sem contraparte direta identificada |
| `RP-0083` | Acompanhamento de obra por hora | Arquiteto / hora* | Tabela sujeita ao escopo | R$ 149,90 | — | Novo candidato, sem contraparte direta identificada |
| `RP-0084` | Visita de acompanhamento de obra | Arquiteto / serviço | Tabela sujeita ao escopo | R$ 249,90 | — | Novo candidato, sem contraparte direta identificada |
| `RP-0085` | Projeto residencial completo - mínimo a partir de | Arquiteto / serviço | Vistoria / orçamento | R$ 2.699,90 | — | Novo candidato, sem contraparte direta identificada |
| `RP-0086` | Instalação split até 12.000 BTU - ponto preparado | Ar-Condicionado - Instalação / Manutenção / Reparo / serviço | Tabela sujeita ao escopo | R$ 499,90 | `RP0046` | Atividade relacionada; conferir escopo/unidade |
| `RP-0087` | Instalação split 18.000 a 24.000 BTU - ponto preparado | Ar-Condicionado - Instalação / Manutenção / Reparo / serviço | Tabela sujeita ao escopo | R$ 599,90 | `RP0046` | Escopo/operação incompatível; não equivalente |
| `RP-0088` | Instalação split 30.000 BTU - ponto preparado | Ar-Condicionado - Instalação / Manutenção / Reparo / serviço | Tabela sujeita ao escopo | R$ 749,90 | `RP0046` | Escopo/operação incompatível; não equivalente |
| `RP-0089` | Limpeza / higienização completa | Ar-Condicionado - Instalação / Manutenção / Reparo / serviço | Tabela sujeita ao escopo | R$ 199,90 | `RP0047`, `V7C001`, `V7C002` | Sobreposição, pacote, componente ou desdobramento |
| `RP-0090` | Higienização profunda com desmontagem parcial | Ar-Condicionado - Instalação / Manutenção / Reparo / serviço | Tabela sujeita ao escopo | R$ 249,90 | `RP0047` | Sobreposição, pacote, componente ou desdobramento |
| `RP-0091` | Manutenção preventiva | Ar-Condicionado - Instalação / Manutenção / Reparo / serviço | Tabela sujeita ao escopo | R$ 249,90 | `RP0048` | Sobreposição, pacote, componente ou desdobramento |
| `RP-0092` | Diagnóstico / manutenção corretiva - a partir de | Ar-Condicionado - Instalação / Manutenção / Reparo / serviço | Vistoria / orçamento | R$ 249,90 | `RP0048`, `V7C005`, `V7C003`, `V7C004` | Sobreposição, pacote, componente ou desdobramento |
| `RP-0093` | Carga / complemento de gás - a partir de | Ar-Condicionado - Instalação / Manutenção / Reparo / serviço | Vistoria / orçamento | R$ 329,90 | `RP0049` | Atividade relacionada; conferir escopo/unidade |
| `RP-0094` | Linha frigorígena de cobre - mão de obra por metro | Ar-Condicionado - Instalação / Manutenção / Reparo / m linear | Tabela sujeita ao escopo | R$ 129,90 | `V7C006` | Atividade relacionada; conferir escopo/unidade |
| `RP-0095` | Desinstalação de split | Ar-Condicionado - Instalação / Manutenção / Reparo / serviço | Tabela sujeita ao escopo | R$ 249,90 | — | Novo candidato, sem contraparte direta identificada |
| `RP-0096` | Reinstalação em ponto preparado | Ar-Condicionado - Instalação / Manutenção / Reparo / serviço | Tabela sujeita ao escopo | R$ 449,90 | `RP0046` | Escopo/operação incompatível; não equivalente |
| `RP-0097` | Correção de dreno / vazamento - a partir de | Ar-Condicionado - Instalação / Manutenção / Reparo / serviço | Vistoria / orçamento | R$ 199,90 | `RP0048` | Sobreposição, pacote, componente ou desdobramento |
| `RP-0098` | Parede drywall simples - mão de obra por m² | Gesseiro / Drywall / m² | Tabela sujeita ao escopo | R$ 64,90 | `RP0075` | Atividade relacionada; conferir escopo/unidade |
| `RP-0099` | Forro drywall - mão de obra por m² | Gesseiro / Drywall / m² | Tabela sujeita ao escopo | R$ 69,90 | `RP0076` | Sobreposição, pacote, componente ou desdobramento |
| `RP-0100` | Forro de gesso liso - mão de obra por m² | Gesseiro / Drywall / m² | Tabela sujeita ao escopo | R$ 54,90 | `RP0076` | Atividade relacionada; conferir escopo/unidade |
| `RP-0101` | Sanca de gesso - mão de obra por metro linear | Gesseiro / Drywall / m linear | Tabela sujeita ao escopo | R$ 54,90 | `RP0077` | Atividade relacionada; conferir escopo/unidade |
| `RP-0102` | Moldura de gesso - mão de obra por metro linear | Gesseiro / Drywall / m linear | Tabela sujeita ao escopo | R$ 39,90 | — | Novo candidato, sem contraparte direta identificada |
| `RP-0103` | Reparo localizado em gesso / drywall - a partir de | Gesseiro / Drywall / serviço | Vistoria / orçamento | R$ 149,90 | `RP0075`, `RP0076` | Escopo/operação incompatível; não equivalente |
| `RP-0104` | Nicho em drywall - mão de obra a partir de | Gesseiro / Drywall / serviço | Vistoria / orçamento | R$ 249,90 | — | Novo candidato, sem contraparte direta identificada |
| `RP-0105` | Parede drywall acústica - mão de obra por m² | Gesseiro / Drywall / m² | Tabela sujeita ao escopo | R$ 89,90 | `RP0075` | Sobreposição, pacote, componente ou desdobramento |
| `RP-0106` | Reforço para vão / porta em drywall - a partir de | Gesseiro / Drywall / serviço | Vistoria / orçamento | R$ 299,90 | — | Novo candidato, sem contraparte direta identificada |
| `RP-0107` | Visita técnica de carpintaria | Carpinteiro / serviço | Tabela sujeita ao escopo | R$ 179,90 | — | Novo candidato, sem contraparte direta identificada |
| `RP-0108` | Instalação de porta de madeira - mão de obra | Carpinteiro / serviço | Tabela sujeita ao escopo | R$ 299,90 | `RP0045` | Atividade relacionada; conferir escopo/unidade |
| `RP-0109` | Ajuste / desempeno de porta de madeira | Carpinteiro / serviço | Tabela sujeita ao escopo | R$ 149,90 | `RP0044` | Sobreposição, pacote, componente ou desdobramento |
| `RP-0110` | Pergolado de madeira - mão de obra por m² | Carpinteiro / m² | Tabela sujeita ao escopo | R$ 199,90 | — | Novo candidato, sem contraparte direta identificada |
| `RP-0111` | Deck de madeira - mão de obra por m² | Carpinteiro / m² | Tabela sujeita ao escopo | R$ 149,90 | — | Novo candidato, sem contraparte direta identificada |
| `RP-0112` | Estrutura de madeira para telhado - mão de obra por m² | Carpinteiro / m² | Vistoria / orçamento | R$ 119,90 | `RP0082` | Sobreposição, pacote, componente ou desdobramento |
| `RP-0113` | Reparo de estrutura de madeira de telhado - a partir de | Carpinteiro / serviço | Vistoria / orçamento | R$ 399,90 | `RP0078` | Sobreposição, pacote, componente ou desdobramento |
| `RP-0114` | Reparo de escada / guarda-corpo de madeira - a partir de | Carpinteiro / serviço | Vistoria / orçamento | R$ 299,90 | — | Novo candidato, sem contraparte direta identificada |
| `RP-0115` | Diária de carpinteiro especializado | Carpinteiro / diária | Tabela sujeita ao escopo | R$ 449,90 | — | Novo candidato, sem contraparte direta identificada |
| `RP-0116` | Diária de marceneiro especializado | Marceneiro / diária | Tabela sujeita ao escopo | R$ 429,90 | — | Novo candidato, sem contraparte direta identificada |
| `RP-0117` | Reparo simples em móvel / porta - a partir de | Marceneiro / serviço | Vistoria / orçamento | R$ 179,90 | `RP0040`, `RP0044` | Sobreposição, pacote, componente ou desdobramento |
| `RP-0118` | Troca / regulagem de dobradiça ou corrediça | Marceneiro / serviço | Tabela sujeita ao escopo | R$ 129,90 | `RP0041`, `RP0040` | Sobreposição, pacote, componente ou desdobramento |
| `RP-0119` | Regulagem de portas / gavetas de armário | Marceneiro / serviço | Tabela sujeita ao escopo | R$ 149,90 | `RP0040` | Atividade relacionada; conferir escopo/unidade |
| `RP-0120` | Armário de pia sob medida - mão de obra/projeto a partir de | Marceneiro / serviço | Vistoria / orçamento | R$ 799,90 | — | Novo candidato, sem contraparte direta identificada |
| `RP-0121` | Guarda-roupa planejado - mão de obra/projeto a partir de | Marceneiro / serviço | Vistoria / orçamento | R$ 1.499,90 | `RP0038` | Escopo/operação incompatível; não equivalente |
| `RP-0122` | Cozinha planejada - mão de obra/projeto a partir de | Marceneiro / serviço | Vistoria / orçamento | R$ 2.499,90 | — | Novo candidato, sem contraparte direta identificada |
| `RP-0123` | Painel de TV sob medida - mão de obra/projeto a partir de | Marceneiro / serviço | Vistoria / orçamento | R$ 999,90 | — | Novo candidato, sem contraparte direta identificada |
| `RP-0124` | Laqueamento / revitalização - mão de obra por peça a partir de | Marceneiro / serviço | Vistoria / orçamento | R$ 299,90 | `V7P002` | Atividade relacionada; conferir escopo/unidade |
| `RP-0125` | Montagem de móvel pequeno | Montador de Móveis / serviço | Tabela sujeita ao escopo | R$ 119,90 | `RP0037` | Descrição idêntica; candidato, sem equivalência aprovada |
| `RP-0126` | Montagem de mesa | Montador de Móveis / serviço | Tabela sujeita ao escopo | R$ 139,90 | `RP0036` | Descrição idêntica; candidato, sem equivalência aprovada |
| `RP-0127` | Montagem de cômoda | Montador de Móveis / serviço | Tabela sujeita ao escopo | R$ 139,90 | `RP0039` | Descrição idêntica; candidato, sem equivalência aprovada |
| `RP-0128` | Montagem de cama / berço | Montador de Móveis / serviço | Tabela sujeita ao escopo | R$ 139,90 | `RP0037` | Sobreposição, pacote, componente ou desdobramento |
| `RP-0129` | Montagem de guarda-roupa pequeno | Montador de Móveis / serviço | Tabela sujeita ao escopo | R$ 169,90 | `RP0038` | Sobreposição, pacote, componente ou desdobramento |
| `RP-0130` | Montagem de guarda-roupa médio | Montador de Móveis / serviço | Tabela sujeita ao escopo | R$ 199,90 | `RP0038` | Sobreposição, pacote, componente ou desdobramento |
| `RP-0131` | Montagem de guarda-roupa grande | Montador de Móveis / serviço | Tabela sujeita ao escopo | R$ 249,90 | `RP0038` | Sobreposição, pacote, componente ou desdobramento |
| `RP-0132` | Montagem de rack / painel / estante | Montador de Móveis / serviço | Tabela sujeita ao escopo | R$ 179,90 | `RP0037` | Sobreposição, pacote, componente ou desdobramento |
| `RP-0133` | Montagem e fixação de armário de parede | Montador de Móveis / serviço | Tabela sujeita ao escopo | R$ 249,90 | — | Novo candidato, sem contraparte direta identificada |
| `RP-0134` | Desmontagem de guarda-roupa | Montador de Móveis / serviço | Tabela sujeita ao escopo | R$ 119,90 | `RP0038` | Escopo/operação incompatível; não equivalente |
| `RP-0135` | Pacote montagem - até 4 horas | Montador de Móveis / serviço | Tabela sujeita ao escopo | R$ 299,90 | — | Novo candidato, sem contraparte direta identificada |
| `RP-0136` | Visita / medição técnica | Vidraceiro / serviço | Tabela sujeita ao escopo | R$ 149,90 | — | Novo candidato, sem contraparte direta identificada |
| `RP-0137` | Regulagem / troca de roldanas de box - a partir de | Vidraceiro / serviço | Vistoria / orçamento | R$ 169,90 | `RP0085` | Sobreposição, pacote, componente ou desdobramento |
| `RP-0138` | Instalação de box - mão de obra, material à parte | Vidraceiro / serviço | Tabela sujeita ao escopo | R$ 249,90 | `RP0086` | Atividade relacionada; conferir escopo/unidade |
| `RP-0139` | Troca de vidro comum de janela - mão de obra, vidro à parte | Vidraceiro / serviço | Tabela sujeita ao escopo | R$ 129,90 | `RP0085` | Sobreposição, pacote, componente ou desdobramento |
| `RP-0140` | Instalação de espelho até 1 m² - mão de obra | Vidraceiro / serviço | Tabela sujeita ao escopo | R$ 149,90 | `RP0034` | Sobreposição, pacote, componente ou desdobramento |
| `RP-0141` | Instalação de espelho grande - mão de obra a partir de | Vidraceiro / serviço | Vistoria / orçamento | R$ 229,90 | `RP0034` | Escopo/operação incompatível; não equivalente |
| `RP-0142` | Instalação de porta de vidro - mão de obra | Vidraceiro / serviço | Tabela sujeita ao escopo | R$ 299,90 | `RP0085` | Sobreposição, pacote, componente ou desdobramento |
| `RP-0143` | Instalação de guarda-corpo de vidro - mão de obra por metro | Vidraceiro / m linear | Tabela sujeita ao escopo | R$ 249,90 | `RP0085` | Sobreposição, pacote, componente ou desdobramento |
| `RP-0144` | Reparo emergencial de vidro / fechamento provisório - a partir de | Vidraceiro / serviço | Vistoria / orçamento | R$ 249,90 | `RP0085` | Sobreposição, pacote, componente ou desdobramento |
| `RP-0145` | Instalação de janela de alumínio - mão de obra | Instalador de Esquadrias de Alumínio / serviço | Tabela sujeita ao escopo | R$ 299,90 | `V7M001` | Sobreposição, pacote, componente ou desdobramento |
| `RP-0146` | Instalação de porta de alumínio - mão de obra | Instalador de Esquadrias de Alumínio / serviço | Tabela sujeita ao escopo | R$ 399,90 | `V7M001` | Sobreposição, pacote, componente ou desdobramento |
| `RP-0147` | Instalação de porta de correr - mão de obra | Instalador de Esquadrias de Alumínio / serviço | Tabela sujeita ao escopo | R$ 449,90 | `V7M001` | Sobreposição, pacote, componente ou desdobramento |
| `RP-0148` | Regulagem / troca de roldanas de esquadria | Instalador de Esquadrias de Alumínio / serviço | Tabela sujeita ao escopo | R$ 169,90 | — | Novo candidato, sem contraparte direta identificada |
| `RP-0149` | Troca de fecho / puxador - mão de obra | Instalador de Esquadrias de Alumínio / serviço | Tabela sujeita ao escopo | R$ 149,90 | — | Novo candidato, sem contraparte direta identificada |
| `RP-0150` | Vedação com silicone / borracha | Instalador de Esquadrias de Alumínio / serviço | Tabela sujeita ao escopo | R$ 129,90 | — | Novo candidato, sem contraparte direta identificada |
| `RP-0151` | Instalação de tela mosquiteira - mão de obra | Instalador de Esquadrias de Alumínio / serviço | Tabela sujeita ao escopo | R$ 149,90 | — | Novo candidato, sem contraparte direta identificada |
| `RP-0152` | Projeto grande de esquadrias - mão de obra por m² a partir de | Instalador de Esquadrias de Alumínio / m² | Vistoria / orçamento | R$ 199,90 | `V7M001` | Sobreposição, pacote, componente ou desdobramento |
| `RP-0153` | Visita técnica em telhado | Telhadeiro / Telhadista / Telhado Retrátil / serviço | Vistoria / orçamento | R$ 199,90 | — | Novo candidato, sem contraparte direta identificada |
| `RP-0154` | Reparo localizado de goteira - a partir de | Telhadeiro / Telhadista / Telhado Retrátil / serviço | Vistoria / orçamento | R$ 399,90 | `RP0078` | Atividade relacionada; conferir escopo/unidade |
| `RP-0155` | Troca de telhas - mão de obra por m² | Telhadeiro / Telhadista / Telhado Retrátil / m² | Tabela sujeita ao escopo | R$ 74,90 | `RP0079` | Atividade relacionada; conferir escopo/unidade |
| `RP-0156` | Construção / reforma de telhado - mão de obra por m² | Telhadeiro / Telhadista / Telhado Retrátil / m² | Vistoria / orçamento | R$ 119,90 | `RP0082` | Atividade relacionada; conferir escopo/unidade |
| `RP-0157` | Instalação de calha - mão de obra por metro linear | Telhadeiro / Telhadista / Telhado Retrátil / m linear | Tabela sujeita ao escopo | R$ 69,90 | `RP0080` | Atividade relacionada; conferir escopo/unidade |
| `RP-0158` | Limpeza de calha por metro linear - mínimo R$199,90 | Telhadeiro / Telhadista / Telhado Retrátil / m linear | Tabela sujeita ao escopo | R$ 19,90 | `RP0081` | Atividade relacionada; conferir escopo/unidade |
| `RP-0159` | Instalação / troca de rufo - mão de obra por metro linear | Telhadeiro / Telhadista / Telhado Retrátil / m linear | Tabela sujeita ao escopo | R$ 89,90 | — | Novo candidato, sem contraparte direta identificada |
| `RP-0160` | Reparo de estrutura de madeira do telhado - a partir de | Telhadeiro / Telhadista / Telhado Retrátil / serviço | Vistoria / orçamento | R$ 399,90 | `RP0078` | Sobreposição, pacote, componente ou desdobramento |
| `RP-0161` | Cobertura / telhado retrátil - mão de obra por m² a partir de | Telhadeiro / Telhadista / Telhado Retrátil / m² | Vistoria / orçamento | R$ 249,90 | `V7M002` | Atividade relacionada; conferir escopo/unidade |
| `RP-0162` | Manutenção de motor / mecanismo retrátil - a partir de | Telhadeiro / Telhadista / Telhado Retrátil / serviço | Vistoria / orçamento | R$ 349,90 | `V7M002` | Escopo/operação incompatível; não equivalente |
| `RP-0163` | Solda pontual / reparo pequeno - a partir de | Serralheiro / serviço | Vistoria / orçamento | R$ 179,90 | `RP0083` | Sobreposição, pacote, componente ou desdobramento |
| `RP-0164` | Conserto de portão manual - a partir de | Serralheiro / serviço | Vistoria / orçamento | R$ 229,90 | `RP0083` | Sobreposição, pacote, componente ou desdobramento |
| `RP-0165` | Instalação de portão - mão de obra a partir de | Serralheiro / serviço | Vistoria / orçamento | R$ 499,90 | `RP0084` | Atividade relacionada; conferir escopo/unidade |
| `RP-0166` | Instalação de motor de portão - mão de obra | Serralheiro / serviço | Tabela sujeita ao escopo | R$ 449,90 | `RP0083` | Sobreposição, pacote, componente ou desdobramento |
| `RP-0167` | Instalação de grade de janela - mão de obra por m² | Serralheiro / m² | Tabela sujeita ao escopo | R$ 129,90 | `RP0083` | Sobreposição, pacote, componente ou desdobramento |
| `RP-0168` | Instalação de corrimão - mão de obra por metro | Serralheiro / m linear | Tabela sujeita ao escopo | R$ 129,90 | `RP0083` | Sobreposição, pacote, componente ou desdobramento |
| `RP-0169` | Instalação de guarda-corpo metálico - mão de obra por metro | Serralheiro / m linear | Tabela sujeita ao escopo | R$ 149,90 | `RP0083` | Sobreposição, pacote, componente ou desdobramento |
| `RP-0170` | Estrutura metálica para telhado - mão de obra por m² | Serralheiro / m² | Vistoria / orçamento | R$ 179,90 | `RP0083` | Sobreposição, pacote, componente ou desdobramento |
| `RP-0171` | Instalação de portão social - mão de obra a partir de | Serralheiro / serviço | Vistoria / orçamento | R$ 499,90 | `RP0084` | Sobreposição, pacote, componente ou desdobramento |
| `RP-0172` | Troca de roldana / dobradiça de portão - a partir de | Serralheiro / serviço | Vistoria / orçamento | R$ 199,90 | `RP0083` | Sobreposição, pacote, componente ou desdobramento |
| `RP-0173` | Instalação de câmera Wi-Fi unitária | Instalador de Casa Inteligente / Automação Residencial / serviço | Tabela sujeita ao escopo | R$ 149,90 | — | Novo candidato, sem contraparte direta identificada |
| `RP-0174` | Instalação de câmera cabeada unitária - mão de obra | Instalador de Casa Inteligente / Automação Residencial / serviço | Tabela sujeita ao escopo | R$ 199,90 | — | Novo candidato, sem contraparte direta identificada |
| `RP-0175` | CFTV 4 câmeras - mão de obra/configuração a partir de | Instalador de Casa Inteligente / Automação Residencial / serviço | Vistoria / orçamento | R$ 699,90 | — | Novo candidato, sem contraparte direta identificada |
| `RP-0176` | Instalação de interruptor inteligente | Instalador de Casa Inteligente / Automação Residencial / serviço | Tabela sujeita ao escopo | R$ 119,90 | — | Novo candidato, sem contraparte direta identificada |
| `RP-0177` | Instalação de lâmpada / relé inteligente | Instalador de Casa Inteligente / Automação Residencial / serviço | Tabela sujeita ao escopo | R$ 89,90 | — | Novo candidato, sem contraparte direta identificada |
| `RP-0178` | Instalação de fechadura digital - a partir de | Instalador de Casa Inteligente / Automação Residencial / serviço | Vistoria / orçamento | R$ 249,90 | — | Novo candidato, sem contraparte direta identificada |
| `RP-0179` | Instalação de fechadura elétrica | Instalador de Casa Inteligente / Automação Residencial / serviço | Tabela sujeita ao escopo | R$ 159,90 | — | Novo candidato, sem contraparte direta identificada |
| `RP-0180` | Instalação de interfone | Instalador de Casa Inteligente / Automação Residencial / serviço | Tabela sujeita ao escopo | R$ 179,90 | — | Novo candidato, sem contraparte direta identificada |
| `RP-0181` | Instalação de vídeo porteiro - a partir de | Instalador de Casa Inteligente / Automação Residencial / serviço | Vistoria / orçamento | R$ 349,90 | — | Novo candidato, sem contraparte direta identificada |
| `RP-0182` | Instalação de sensor de porta / janela | Instalador de Casa Inteligente / Automação Residencial / serviço | Tabela sujeita ao escopo | R$ 99,90 | — | Novo candidato, sem contraparte direta identificada |
| `RP-0183` | Instalação de sensor de presença inteligente | Instalador de Casa Inteligente / Automação Residencial / serviço | Tabela sujeita ao escopo | R$ 119,90 | — | Novo candidato, sem contraparte direta identificada |
| `RP-0184` | Configuração de hub / assistente de automação | Instalador de Casa Inteligente / Automação Residencial / serviço | Tabela sujeita ao escopo | R$ 249,90 | — | Novo candidato, sem contraparte direta identificada |
| `RP-0185` | Projeto de automação residencial - 4 ambientes a partir de | Instalador de Casa Inteligente / Automação Residencial / serviço | Vistoria / orçamento | R$ 999,90 | — | Novo candidato, sem contraparte direta identificada |
| `RP-0186` | Visita técnica fotovoltaica | Instalador de Energia Fotovoltaica / Eólica / serviço | Tabela sujeita ao escopo | R$ 149,90 | — | Novo candidato, sem contraparte direta identificada |
| `RP-0187` | Dimensionamento / projeto fotovoltaico residencial - a partir de | Instalador de Energia Fotovoltaica / Eólica / serviço | Vistoria / orçamento | R$ 299,90 | — | Novo candidato, sem contraparte direta identificada |
| `RP-0188` | Instalação fotovoltaica - mão de obra por kWp a partir de | Instalador de Energia Fotovoltaica / Eólica / kWp | Vistoria / orçamento | R$ 599,90 | — | Novo candidato, sem contraparte direta identificada |
| `RP-0189` | Diagnóstico de sistema fotovoltaico - a partir de | Instalador de Energia Fotovoltaica / Eólica / serviço | Vistoria / orçamento | R$ 399,90 | — | Novo candidato, sem contraparte direta identificada |
| `RP-0190` | Manutenção preventiva fotovoltaica - a partir de | Instalador de Energia Fotovoltaica / Eólica / serviço | Vistoria / orçamento | R$ 449,90 | — | Novo candidato, sem contraparte direta identificada |
| `RP-0191` | Limpeza de painéis solares - até 12 módulos | Instalador de Energia Fotovoltaica / Eólica / serviço | Vistoria / orçamento | R$ 349,90 | — | Novo candidato, sem contraparte direta identificada |
| `RP-0192` | Limpeza de painéis solares - 13 a 30 módulos | Instalador de Energia Fotovoltaica / Eólica / serviço | Vistoria / orçamento | R$ 599,90 | — | Novo candidato, sem contraparte direta identificada |
| `RP-0193` | Troca / reinstalação de inversor - mão de obra | Instalador de Energia Fotovoltaica / Eólica / serviço | Tabela sujeita ao escopo | R$ 399,90 | — | Novo candidato, sem contraparte direta identificada |
| `RP-0194` | Manutenção de stringbox / conexões - a partir de | Instalador de Energia Fotovoltaica / Eólica / serviço | Vistoria / orçamento | R$ 299,90 | — | Novo candidato, sem contraparte direta identificada |
| `RP-0195` | Visita / projeto de microgeração eólica | Instalador de Energia Fotovoltaica / Eólica / serviço | Vistoria / orçamento | R$ 249,90 | — | Novo candidato, sem contraparte direta identificada |
| `RP-0196` | Instalação de microgerador eólico - mão de obra a partir de | Instalador de Energia Fotovoltaica / Eólica / serviço | Vistoria / orçamento | R$ 1.499,90 | — | Novo candidato, sem contraparte direta identificada |
| `RP-0197` | Manutenção de microgerador eólico - a partir de | Instalador de Energia Fotovoltaica / Eólica / serviço | Vistoria / orçamento | R$ 599,90 | — | Novo candidato, sem contraparte direta identificada |
| `RP-0198` | Visita técnica para aquecimento solar | Instalador de Aquecedor de Água Solar / serviço | Vistoria / orçamento | R$ 149,90 | — | Novo candidato, sem contraparte direta identificada |
| `RP-0199` | Instalação de aquecedor solar de água - mão de obra a partir de | Instalador de Aquecedor de Água Solar / serviço | Vistoria / orçamento | R$ 799,90 | — | Novo candidato, sem contraparte direta identificada |
| `RP-0200` | Manutenção preventiva do sistema solar | Instalador de Aquecedor de Água Solar / serviço | Vistoria / orçamento | R$ 299,90 | — | Novo candidato, sem contraparte direta identificada |
| `RP-0201` | Limpeza de coletores / reservatório térmico - a partir de | Instalador de Aquecedor de Água Solar / serviço | Vistoria / orçamento | R$ 349,90 | — | Novo candidato, sem contraparte direta identificada |
| `RP-0202` | Reparo de vazamento em circuito solar - a partir de | Instalador de Aquecedor de Água Solar / serviço | Vistoria / orçamento | R$ 249,90 | — | Novo candidato, sem contraparte direta identificada |
| `RP-0203` | Troca de coletor solar - mão de obra por unidade | Instalador de Aquecedor de Água Solar / serviço | Vistoria / orçamento | R$ 399,90 | — | Novo candidato, sem contraparte direta identificada |
| `RP-0204` | Troca / instalação de bomba de circulação - mão de obra | Instalador de Aquecedor de Água Solar / serviço | Tabela sujeita ao escopo | R$ 349,90 | — | Novo candidato, sem contraparte direta identificada |
| `RP-0205` | Troca / instalação de controlador - mão de obra | Instalador de Aquecedor de Água Solar / serviço | Tabela sujeita ao escopo | R$ 249,90 | — | Novo candidato, sem contraparte direta identificada |
| `RP-0206` | Visita técnica / diagnóstico de gás | Técnico de Gás - Instalação / Manutenção / Reparo / serviço | Tabela sujeita ao escopo | R$ 179,90 | — | Novo candidato, sem contraparte direta identificada |
| `RP-0207` | Instalação de aquecedor a gás em ponto preparado | Técnico de Gás - Instalação / Manutenção / Reparo / serviço | Tabela sujeita ao escopo | R$ 349,90 | — | Novo candidato, sem contraparte direta identificada |
| `RP-0208` | Manutenção preventiva de aquecedor a gás | Técnico de Gás - Instalação / Manutenção / Reparo / serviço | Tabela sujeita ao escopo | R$ 299,90 | — | Novo candidato, sem contraparte direta identificada |
| `RP-0209` | Descalcificação / limpeza do trocador - a partir de | Técnico de Gás - Instalação / Manutenção / Reparo / serviço | Vistoria / orçamento | R$ 399,90 | — | Novo candidato, sem contraparte direta identificada |
| `RP-0210` | Conversão GN / GLP e regulagem - a partir de | Técnico de Gás - Instalação / Manutenção / Reparo / serviço | Vistoria / orçamento | R$ 399,90 | — | Novo candidato, sem contraparte direta identificada |
| `RP-0211` | Reinstalação / troca de aquecedor no mesmo ponto | Técnico de Gás - Instalação / Manutenção / Reparo / serviço | Tabela sujeita ao escopo | R$ 349,90 | — | Novo candidato, sem contraparte direta identificada |
| `RP-0212` | Teste de estanqueidade / detecção de vazamento - a partir de | Técnico de Gás - Instalação / Manutenção / Reparo / serviço | Vistoria / orçamento | R$ 249,90 | — | Novo candidato, sem contraparte direta identificada |
| `RP-0213` | Criação / adequação de ponto de gás - mão de obra a partir de | Técnico de Gás - Instalação / Manutenção / Reparo / serviço | Vistoria / orçamento | R$ 299,90 | — | Novo candidato, sem contraparte direta identificada |
| `RP-0214` | Tubulação de gás - mão de obra por metro a partir de | Técnico de Gás - Instalação / Manutenção / Reparo / m linear | Vistoria / orçamento | R$ 99,90 | — | Novo candidato, sem contraparte direta identificada |
| `RP-0215` | Ligação de fogão / cooktop a gás em ponto existente | Técnico de Gás - Instalação / Manutenção / Reparo / serviço | Tabela sujeita ao escopo | R$ 129,90 | `RP0051`, `V7H006` | Sobreposição, pacote, componente ou desdobramento |
| `RP-0216` | Visita técnica / diagnóstico de SPA ou hidromassagem | Instalador / Manutenção de Banheira de Hidromassagem e SPA / serviço | Vistoria / orçamento | R$ 249,90 | — | Novo candidato, sem contraparte direta identificada |
| `RP-0217` | Manutenção preventiva de hidromassagem / SPA | Instalador / Manutenção de Banheira de Hidromassagem e SPA / serviço | Vistoria / orçamento | R$ 399,90 | — | Novo candidato, sem contraparte direta identificada |
| `RP-0218` | Reparo / troca de bomba - mão de obra a partir de | Instalador / Manutenção de Banheira de Hidromassagem e SPA / serviço | Vistoria / orçamento | R$ 449,90 | — | Novo candidato, sem contraparte direta identificada |
| `RP-0219` | Reparo de aquecedor de SPA - mão de obra a partir de | Instalador / Manutenção de Banheira de Hidromassagem e SPA / serviço | Vistoria / orçamento | R$ 399,90 | — | Novo candidato, sem contraparte direta identificada |
| `RP-0220` | Instalação de banheira de hidromassagem - mão de obra a partir de | Instalador / Manutenção de Banheira de Hidromassagem e SPA / serviço | Vistoria / orçamento | R$ 1.499,90 | — | Novo candidato, sem contraparte direta identificada |
| `RP-0221` | Instalação de SPA - mão de obra a partir de | Instalador / Manutenção de Banheira de Hidromassagem e SPA / serviço | Vistoria / orçamento | R$ 1.999,90 | — | Novo candidato, sem contraparte direta identificada |
| `RP-0222` | Reparo de jatos / tubulação interna - a partir de | Instalador / Manutenção de Banheira de Hidromassagem e SPA / serviço | Vistoria / orçamento | R$ 349,90 | — | Novo candidato, sem contraparte direta identificada |
| `RP-0223` | Caça-vazamento em banheira / SPA - a partir de | Instalador / Manutenção de Banheira de Hidromassagem e SPA / serviço | Vistoria / orçamento | R$ 399,90 | — | Novo candidato, sem contraparte direta identificada |
| `RP-0224` | Visita técnica de impermeabilização | Impermeabilizador / serviço | Tabela sujeita ao escopo | R$ 199,90 | — | Novo candidato, sem contraparte direta identificada |
| `RP-0225` | Impermeabilização de piso de banheiro - mão de obra por m² | Impermeabilizador / m² | Tabela sujeita ao escopo | R$ 119,90 | `RP0062` | Sobreposição, pacote, componente ou desdobramento |
| `RP-0226` | Impermeabilização de paredes de box - mão de obra por m² | Impermeabilizador / m² | Tabela sujeita ao escopo | R$ 129,90 | `RP0062` | Sobreposição, pacote, componente ou desdobramento |
| `RP-0227` | Impermeabilização de laje - mão de obra por m² | Impermeabilizador / m² | Tabela sujeita ao escopo | R$ 109,90 | `RP0062` | Sobreposição, pacote, componente ou desdobramento |
| `RP-0228` | Impermeabilização de varanda / terraço - mão de obra por m² | Impermeabilizador / m² | Tabela sujeita ao escopo | R$ 119,90 | `RP0062` | Sobreposição, pacote, componente ou desdobramento |
| `RP-0229` | Correção de infiltração em parede - mão de obra por m² a partir de | Impermeabilizador / m² | Vistoria / orçamento | R$ 99,90 | `RP0061` | Atividade relacionada; conferir escopo/unidade |
| `RP-0230` | Impermeabilização de fundação - mão de obra por m² | Impermeabilizador / m² | Tabela sujeita ao escopo | R$ 129,90 | `RP0062` | Sobreposição, pacote, componente ou desdobramento |
| `RP-0231` | Impermeabilização de caixa d'água / reservatório - mão de obra por m² | Impermeabilizador / m² | Tabela sujeita ao escopo | R$ 139,90 | `RP0062` | Sobreposição, pacote, componente ou desdobramento |
| `RP-0232` | Reparo localizado de impermeabilização - a partir de | Impermeabilizador / serviço | Vistoria / orçamento | R$ 349,90 | `RP0062` | Sobreposição, pacote, componente ou desdobramento |
| `RP-0233` | Limpeza pós-obra até 50 m² - a partir de | Limpeza Pós-Obra / serviço | Vistoria / orçamento | R$ 449,90 | `V7L003` | Sobreposição, pacote, componente ou desdobramento |
| `RP-0234` | Limpeza pós-obra de 51 a 100 m² - a partir de | Limpeza Pós-Obra / serviço | Vistoria / orçamento | R$ 699,90 | `V7L003` | Sobreposição, pacote, componente ou desdobramento |
| `RP-0235` | Limpeza pós-obra acima de 100 m² - por m², mínimo R$399,90 | Limpeza Pós-Obra / m² | Tabela sujeita ao escopo | R$ 12,90 | `V7L003` | Sobreposição, pacote, componente ou desdobramento |
| `RP-0236` | Limpeza pós-obra pesada - por m², mínimo R$499,90 | Limpeza Pós-Obra / m² | Tabela sujeita ao escopo | R$ 16,90 | `V7L003` | Sobreposição, pacote, componente ou desdobramento |
| `RP-0237` | Limpeza técnica de vidros pós-obra - por m², mínimo R$199,90 | Limpeza Pós-Obra / m² | Tabela sujeita ao escopo | R$ 9,90 | `V7L003` | Sobreposição, pacote, componente ou desdobramento |
| `RP-0238` | Diarista - até 4 horas | Diarista / serviço | Tabela sujeita ao escopo | R$ 169,90 | `V7L001` | Atividade relacionada; conferir escopo/unidade |
| `RP-0239` | Diarista - até 6 horas | Diarista / serviço | Tabela sujeita ao escopo | R$ 219,90 | `V7L002` | Sobreposição, pacote, componente ou desdobramento |
| `RP-0240` | Diarista - diária até 8 horas | Diarista / diária | Tabela sujeita ao escopo | R$ 249,90 | `V7L002` | Atividade relacionada; conferir escopo/unidade |
| `RP-0241` | Faxina pesada - diária a partir de | Diarista / diária | Vistoria / orçamento | R$ 299,90 | `V7L002` | Sobreposição, pacote, componente ou desdobramento |
| `RP-0242` | Passar roupas - adicional até 2 horas | Diarista / serviço | Tabela sujeita ao escopo | R$ 69,90 | — | Novo candidato, sem contraparte direta identificada |

## Referências públicas por par — sem comparação comercial aprovada

| Fonte | Ativo | Descrição ativa | Modo ativo | P1 sugerido fonte | Preço público ativo | Diferença/decisão de escopo |
| --- | --- | --- | --- | ---: | ---: | --- |
| `RP-0001` | `RP0030` | Instalação de suporte de TV | FIXED | R$ 129,90 | R$ 159,90 | Mesma descrição; confirmar modelo do suporte, parede, tamanho da TV, fornecimento e qualificação. |
| `RP-0002` | `RP0031` | Instalação de prateleira | FIXED | R$ 99,90 | R$ 119,90 | Fonte agrega prateleira e nicho; ativo informa prateleira. |
| `RP-0003` | `RP0033` | Instalação de cortina ou persiana | FIXED | R$ 89,90 | R$ 139,90 | Mesma atividade com alternativa cortina/persiana; confirmar dimensões e fixação. |
| `RP-0004` | `RP0032` | Instalação de varal | FIXED | R$ 119,90 | R$ 119,90 | Fonte especifica varal de teto; ativo usa varal genérico. |
| `RP-0005` | `RP0035` | Fixação de quadro | FIXED | R$ 69,90 | R$ 79,90 | Fonte explicita unidade no nome; ativo não estrutura unidade. |
| `RP-0006` | `RP0034` | Instalação de espelho | FIXED | R$ 119,90 | R$ 139,90 | Fonte limita espelho pequeno; ativo requer validar tamanho e parede. |
| `RP-0009` | `RP0042` | Troca de fechadura | FIXED | R$ 129,90 | R$ 149,90 | Confirmar fechadura simples/convencional e ferragens fornecidas. |
| `RP-0010` | `RP0041` | Troca de dobradiça | FIXED | R$ 149,90 | R$ 129,90 | Ajuste de porta/dobradiça não equivale automaticamente à troca de ferragem ou reparo de madeira. |
| `RP-0010` | `RP0044` | Reparo em porta de madeira | FIXED | R$ 149,90 | R$ 249,90 | Ajuste de porta/dobradiça não equivale automaticamente à troca de ferragem ou reparo de madeira. |
| `RP-0013` | `RP0014` | Instalação simples de torneira em ponto existente | FIXED | R$ 119,90 | R$ 149,90 | Ambos citam ponto existente; validar modelo, conexão e exclusões. |
| `RP-0014` | `RP0015` | Troca de torneira simples | FIXED | R$ 99,90 | R$ 99,90 | Mesma descrição; escopo e unidade ainda exigem revisão. |
| `RP-0015` | `RP0017` | Instalação de sifão | FIXED | R$ 99,90 | R$ 119,90 | Fonte une instalação e troca; ativo mantém operações separadas. |
| `RP-0015` | `RP0018` | Troca de sifão | FIXED | R$ 99,90 | R$ 109,90 | Fonte une instalação e troca; ativo mantém operações separadas. |
| `RP-0016` | `RP0023` | Reparo de vazamento interno simples | FROM | R$ 149,90 | R$ 199,90 | Fonte limita vazamento aparente; ativo menciona vazamento interno com escopo visível/acessível. Não presumir equivalência. |
| `RP-0017` | `RP0026` | Troca de registro | FIXED | R$ 179,90 | R$ 179,90 | Mesma descrição; ativo exclui quebra de parede/revestimento do escopo simples. |
| `RP-0018` | `RP0027` | Instalação de vaso sanitário | FIXED | R$ 249,90 | R$ 319,90 | Mesma descrição; confirmar vaso/acessórios e pontos existentes. |
| `RP-0019` | `RP0028` | Vedação de vaso sanitário | FIXED | R$ 149,90 | R$ 179,90 | Fonte agrega vedação e reaperto; ativo descreve vedação. |
| `RP-0020` | `RP0022` | Troca de mecanismo de descarga | FIXED | R$ 179,90 | R$ 189,90 | Mesma descrição; mecanismo fornecido pelo cliente no escopo ativo. |
| `RP-0021` | `RP0019` | Desentupimento simples de pia | FIXED | R$ 179,90 | R$ 199,90 | Mesma descrição; conferir exclusão de máquina especializada/coluna de esgoto. |
| `RP-0022` | `RP0020` | Desentupimento de vaso sanitário | FIXED | R$ 229,90 | R$ 229,90 | Mesma descrição; validar limites de obstrução e rede/coluna. |
| `RP-0023` | `V7H003` | Desentupimento simples de esgoto | FROM | R$ 299,90 | R$ 249,90 | Fonte exige vistoria/orçamento; ativo FROM não autoriza transformar em preço fechado. |
| `RP-0024` | `V7H004` | Desentupimento completo de esgoto | QUOTE | R$ 399,90 | Sem preço fechado | Execução completa de esgoto; orçamento permanece obrigatório. |
| `RP-0025` | `RP0025` | Instalação de máquina de lavar | FIXED | R$ 129,90 | R$ 159,90 | Mesma descrição; pontos elétrico/hidráulico preparados precisam ser confirmados. |
| `RP-0026` | `RP0024` | Instalação de filtro de água | FIXED | R$ 99,90 | R$ 119,90 | Mesma descrição; definir tipo de filtro e conexões. |
| `RP-0027` | `RP0029` | Instalação de gabinete de banheiro | FIXED | R$ 229,90 | R$ 249,90 | Mesma descrição; ativo pressupõe gabinete pronto e ponto existente. |
| `RP-0028` | `V7H001` | Instalação de torneira com criação/adaptação hidráulica | FROM | R$ 249,90 | R$ 199,90 | Fonte trata ponto hidráulico genérico; ativo vincula adaptação à instalação de torneira. |
| `RP-0029` | `RP0023` | Reparo de vazamento interno simples | FROM | R$ 399,90 | R$ 199,90 | Diagnóstico/caça-vazamento é excluído do reparo simples no escopo ativo. Não é equivalência; demanda item próprio. |
| `RP-0030` | `RP0023` | Reparo de vazamento interno simples | FROM | R$ 299,90 | R$ 199,90 | Vazamento embutido é excluído do reparo visível/acessível do ativo. Não unificar. |
| `RP-0031` | `RP0002` | Troca de tomada | FIXED | R$ 89,90 | R$ 109,90 | Mesma descrição; não usar o sufixo numérico do código como identidade. |
| `RP-0032` | `RP0001` | Instalação de tomada simples | FIXED | R$ 129,90 | R$ 149,90 | Instalação em ponto existente versus tomada simples; conferir escopo elétrico. |
| `RP-0033` | `RP0004` | Troca de interruptor | FIXED | R$ 89,90 | R$ 99,90 | Mesma descrição; validar unidade/escopo. |
| `RP-0034` | `RP0003` | Instalação de interruptor | FIXED | R$ 119,90 | R$ 139,90 | Mesma descrição; validar ponto preparado e conexões. |
| `RP-0035` | `RP0005` | Instalação de luminária | FIXED | R$ 119,90 | R$ 149,90 | Fonte limita luminária simples; verificar peso, altura e infraestrutura. |
| `RP-0036` | `RP0005` | Instalação de luminária | FIXED | R$ 149,90 | R$ 149,90 | Lustre/pendente não deve herdar preço de luminária simples sem avaliação de peso, altura e fixação. |
| `RP-0037` | `RP0007` | Instalação de chuveiro elétrico | FIXED | R$ 149,90 | R$ 139,90 | Mesma descrição; validar potência, circuito e ponto preparado. |
| `RP-0038` | `RP0008` | Troca de resistência de chuveiro | FIXED | R$ 99,90 | R$ 99,90 | Mesma descrição; definir resistência/material e compatibilidade. |
| `RP-0039` | `RP0009` | Instalação de ventilador de teto | FIXED | R$ 179,90 | R$ 179,90 | Mesma descrição; validar suporte, elétrica e altura. |
| `RP-0040` | `RP0011` | Troca de disjuntor | FIXED | R$ 129,90 | R$ 179,90 | Mesma descrição; não confundir troca com instalação de novo circuito. |
| `RP-0041` | `RP0001` | Instalação de tomada simples | FIXED | R$ 199,90 | R$ 149,90 | Criação de ponto novo requer circuito/infraestrutura e não é tomada simples em ponto existente. |
| `RP-0042` | `RP0013` | Revisão elétrica de circuito | FIXED | R$ 149,90 | R$ 179,90 | Revisão de circuito; ativo distingue diagnóstico básico e correções adicionais. |
| `RP-0043` | `RP0012` | Reparo em curto-circuito | QUOTE | R$ 199,90 | Sem preço fechado | Diagnóstico/reparo de curto-circuito depende de avaliação; preservar QUOTE. |
| `RP-0050` | `RP0063` | Reparo de reboco | QUOTE | R$ 54,90 | Sem preço fechado | Execução de reboco/emboço por área não equivale ao reparo de reboco ativo. |
| `RP-0051` | `RP0070` | Construção de parede de alvenaria | QUOTE | R$ 69,90 | Sem preço fechado | Construção de alvenaria por área; não substituir orçamento por preço fixo por m². |
| `RP-0052` | `RP0071` | Demolição de parede | QUOTE | R$ 49,90 | Sem preço fechado | Demolição: avaliar natureza estrutural, retirada e segurança; preservar orçamento. |
| `RP-0053` | `RP0072` | Execução de contrapiso | QUOTE | R$ 54,90 | Sem preço fechado | Contrapiso por m²; metragem, espessura e preparação pendentes. |
| `RP-0054` | `RP0064` | Assentamento de piso | QUOTE | R$ 59,90 | Sem preço fechado | Fonte é cerâmica; ativo piso genérico. Unidade, preparo e tipo de peça exigem revisão. |
| `RP-0055` | `RP0065` | Assentamento de porcelanato | QUOTE | R$ 79,90 | Sem preço fechado | Porcelanato por m²; preservar QUOTE e avaliar dimensões, paginação e preparo. |
| `RP-0056` | `RP0073` | Instalação de revestimento | QUOTE | R$ 69,90 | Sem preço fechado | Revestimento de parede versus revestimento genérico; validar superfície e quantidade. |
| `RP-0059` | `RP0066` | Reforma de banheiro | QUOTE | R$ 1.499,90 | Sem preço fechado | Reforma de banheiro; fonte é mão de obra referencial, sem escopo fechado. |
| `RP-0060` | `RP0067` | Reforma de cozinha | QUOTE | R$ 1.299,90 | Sem preço fechado | Reforma de cozinha; não fechar preço sem projeto e quantidades. |
| `RP-0061` | `RP0068` | Reforma de apartamento | QUOTE | R$ 899,90 | Sem preço fechado | Fonte reforma geral por m²; ativo separa apartamento, casa e projeto sob medida. Possível agrupamento/desdobramento. |
| `RP-0061` | `RP0069` | Reforma de casa | QUOTE | R$ 899,90 | Sem preço fechado | Fonte reforma geral por m²; ativo separa apartamento, casa e projeto sob medida. Possível agrupamento/desdobramento. |
| `RP-0061` | `RP0089` | Reforma geral sob medida | QUOTE | R$ 899,90 | Sem preço fechado | Fonte reforma geral por m²; ativo separa apartamento, casa e projeto sob medida. Possível agrupamento/desdobramento. |
| `RP-0086` | `RP0046` | Instalação de ar-condicionado split | FIXED | R$ 499,90 | R$ 699,90 | Até 12.000 BTU em ponto preparado coincide com limite descrito no ativo; infraestrutura deve ser conferida. |
| `RP-0087` | `RP0046` | Instalação de ar-condicionado split | FIXED | R$ 599,90 | R$ 699,90 | 18.000–24.000 BTU supera limite 9.000/12.000 BTU do escopo ativo. Não herdar preço fixo. |
| `RP-0088` | `RP0046` | Instalação de ar-condicionado split | FIXED | R$ 749,90 | R$ 699,90 | 30.000 BTU supera limite do escopo ativo. Requer item/avaliação específicos. |
| `RP-0089` | `RP0047` | Limpeza completa de ar-condicionado | FROM | R$ 199,90 | R$ 249,90 | Limpeza completa não equivale a limpeza isolada de evaporadora/condensadora. Evitar duplicação de itens e cobrança. |
| `RP-0089` | `V7C001` | Limpeza evaporadora | FROM | R$ 199,90 | R$ 149,90 | Limpeza completa não equivale a limpeza isolada de evaporadora/condensadora. Evitar duplicação de itens e cobrança. |
| `RP-0089` | `V7C002` | Limpeza condensadora | FROM | R$ 199,90 | R$ 149,90 | Limpeza completa não equivale a limpeza isolada de evaporadora/condensadora. Evitar duplicação de itens e cobrança. |
| `RP-0090` | `RP0047` | Limpeza completa de ar-condicionado | FROM | R$ 249,90 | R$ 249,90 | Desmontagem parcial/profundidade podem ampliar escopo da limpeza atual. |
| `RP-0091` | `RP0048` | Manutenção completa de ar-condicionado | QUOTE | R$ 249,90 | Sem preço fechado | Preventiva não equivale automaticamente a manutenção completa; confirmar atividades incluídas. |
| `RP-0092` | `RP0048` | Manutenção completa de ar-condicionado | QUOTE | R$ 249,90 | Sem preço fechado | Diagnóstico/corretiva versus manutenção completa ou de componentes; equipe deve avaliar divisão de escopo. |
| `RP-0092` | `V7C005` | Manutenção corretiva | QUOTE | R$ 249,90 | Sem preço fechado | Diagnóstico/corretiva versus manutenção completa ou de componentes; equipe deve avaliar divisão de escopo. |
| `RP-0092` | `V7C003` | Manutenção evaporadora | QUOTE | R$ 249,90 | Sem preço fechado | Diagnóstico/corretiva versus manutenção completa ou de componentes; equipe deve avaliar divisão de escopo. |
| `RP-0092` | `V7C004` | Manutenção condensadora | QUOTE | R$ 249,90 | Sem preço fechado | Diagnóstico/corretiva versus manutenção completa ou de componentes; equipe deve avaliar divisão de escopo. |
| `RP-0093` | `RP0049` | Carga de gás de ar-condicionado | QUOTE | R$ 329,90 | Sem preço fechado | Carga/complemento depende de diagnóstico, refrigerante, capacidade e reparo de vazamentos. |
| `RP-0094` | `V7C006` | Infraestrutura / linha frigorígena de cobre | QUOTE | R$ 129,90 | Sem preço fechado | Metro linear de linha de cobre versus infraestrutura sem unidade explícita; manter QUOTE. |
| `RP-0096` | `RP0046` | Instalação de ar-condicionado split | FIXED | R$ 449,90 | R$ 699,90 | Reinstalação pode incluir remoção/reaproveitamento; não é automaticamente instalação padrão nova. |
| `RP-0097` | `RP0048` | Manutenção completa de ar-condicionado | QUOTE | R$ 199,90 | Sem preço fechado | Reparo de dreno pode ser componente de manutenção; não igualar serviço completo e parte isolada. |
| `RP-0098` | `RP0075` | Instalação de drywall | QUOTE | R$ 64,90 | Sem preço fechado | Parede simples em drywall por área; ativo não especifica sistema/acabamento. |
| `RP-0099` | `RP0076` | Forro de gesso | QUOTE | R$ 69,90 | Sem preço fechado | Forro de drywall versus gesso genérico; validar sistema, estrutura e acabamento. |
| `RP-0100` | `RP0076` | Forro de gesso | QUOTE | R$ 54,90 | Sem preço fechado | Forro de gesso liso por área; não retirar avaliação de altura, estrutura e condições. |
| `RP-0101` | `RP0077` | Sanca de gesso | QUOTE | R$ 54,90 | Sem preço fechado | Sanca por metro linear; tipo de sanca e metragem não estruturados no ativo. |
| `RP-0103` | `RP0075` | Instalação de drywall | QUOTE | R$ 149,90 | Sem preço fechado | Reparo localizado não equivale à instalação de parede/forro. Criar item próprio se aprovado. |
| `RP-0103` | `RP0076` | Forro de gesso | QUOTE | R$ 149,90 | Sem preço fechado | Reparo localizado não equivale à instalação de parede/forro. Criar item próprio se aprovado. |
| `RP-0105` | `RP0075` | Instalação de drywall | QUOTE | R$ 89,90 | Sem preço fechado | Sistema acústico pode exigir projeto, isolantes e estrutura específicos; não herdar escopo simples. |
| `RP-0108` | `RP0045` | Instalação de porta | FIXED | R$ 299,90 | R$ 449,90 | Fonte especifica madeira; ativo porta interna convencional. Vão, marco, ferragens e materiais precisam coincidir. |
| `RP-0109` | `RP0044` | Reparo em porta de madeira | FIXED | R$ 149,90 | R$ 249,90 | Ajuste/desempeno pode exceder reparo simples acessível; requer avaliação. |
| `RP-0112` | `RP0082` | Construção de telhado | QUOTE | R$ 119,90 | Sem preço fechado | Estrutura de madeira é parte de telhado completo; impedir equivalência e dupla cobrança automáticas. |
| `RP-0113` | `RP0078` | Reparo em telhado | QUOTE | R$ 399,90 | Sem preço fechado | Reparo estrutural de madeira é especialização de reparo em telhado, não escopo genérico garantido. |
| `RP-0117` | `RP0040` | Regulagem de porta de armário | FIXED | R$ 179,90 | R$ 119,90 | Fonte une móvel e porta; ativo separa regulagem de armário e reparo em porta. |
| `RP-0117` | `RP0044` | Reparo em porta de madeira | FIXED | R$ 179,90 | R$ 249,90 | Fonte une móvel e porta; ativo separa regulagem de armário e reparo em porta. |
| `RP-0118` | `RP0041` | Troca de dobradiça | FIXED | R$ 129,90 | R$ 129,90 | Troca/regulagem de dobradiça/corrediça contém operações distintas; não escolher um único item automaticamente. |
| `RP-0118` | `RP0040` | Regulagem de porta de armário | FIXED | R$ 129,90 | R$ 119,90 | Troca/regulagem de dobradiça/corrediça contém operações distintas; não escolher um único item automaticamente. |
| `RP-0119` | `RP0040` | Regulagem de porta de armário | FIXED | R$ 149,90 | R$ 119,90 | Fonte inclui gavetas além de portas; validar quantidade e ferragens. |
| `RP-0121` | `RP0038` | Montagem de guarda-roupa | FIXED | R$ 1.499,90 | R$ 279,90 | Projeto/fabricação de guarda-roupa planejado não equivale à montagem de móvel pronto; escopo ativo exclui embutidos complexos. |
| `RP-0124` | `V7P002` | Laqueamento | QUOTE | R$ 299,90 | Sem preço fechado | Laqueamento/revitalização por peça; definir se revitalização é mesmo processo e preservar orçamento. |
| `RP-0125` | `RP0037` | Montagem de móvel pequeno | FIXED | R$ 119,90 | R$ 149,90 | Mesma descrição; definir porte, modelo e peças. |
| `RP-0126` | `RP0036` | Montagem de mesa | FIXED | R$ 139,90 | R$ 149,90 | Mesma descrição; quantidade de cadeiras/peças não está estruturada no ativo. |
| `RP-0127` | `RP0039` | Montagem de cômoda | FIXED | R$ 139,90 | R$ 179,90 | Mesma descrição; modelo e complexidade pendentes. |
| `RP-0128` | `RP0037` | Montagem de móvel pequeno | FIXED | R$ 139,90 | R$ 149,90 | Cama/berço não são automaticamente móvel pequeno; segurança e porte exigem item específico ou confirmação humana. |
| `RP-0129` | `RP0038` | Montagem de guarda-roupa | FIXED | R$ 169,90 | R$ 279,90 | Fonte separa pequeno/médio/grande; ativo usa guarda-roupa convencional sem medida estruturada. |
| `RP-0130` | `RP0038` | Montagem de guarda-roupa | FIXED | R$ 199,90 | R$ 279,90 | Conferir porte, portas e complexidade antes de mapear tamanho médio ao item genérico. |
| `RP-0131` | `RP0038` | Montagem de guarda-roupa | FIXED | R$ 249,90 | R$ 279,90 | Porte grande pode exceder escopo convencional e exigir orçamento adicional; nunca substituir preço automaticamente. |
| `RP-0132` | `RP0037` | Montagem de móvel pequeno | FIXED | R$ 179,90 | R$ 149,90 | Rack/painel/estante podem ter porte/fixação fora de móvel pequeno; não presumir cobertura. |
| `RP-0134` | `RP0038` | Montagem de guarda-roupa | FIXED | R$ 119,90 | R$ 279,90 | Desmontagem é operação distinta e está fora da montagem convencional; não equivalência. |
| `RP-0137` | `RP0085` | Serviço de vidraçaria | QUOTE | R$ 169,90 | Sem preço fechado | Reparo em roldanas de box é especialização da categoria genérica vidraçaria; novo item pode ser necessário. |
| `RP-0138` | `RP0086` | Instalação de box | QUOTE | R$ 249,90 | Sem preço fechado | Instalação de box com material à parte; confirmar dimensões, vidro, kit e responsabilidade. |
| `RP-0139` | `RP0085` | Serviço de vidraçaria | QUOTE | R$ 129,90 | Sem preço fechado | Troca de vidro de janela é item específico, não orçamento fechado de toda vidraçaria. |
| `RP-0140` | `RP0034` | Instalação de espelho | FIXED | R$ 149,90 | R$ 139,90 | Limite até 1 m² e especialidade vidraceiro precisam de aprovação; espelho genérico não prova equivalência. |
| `RP-0141` | `RP0034` | Instalação de espelho | FIXED | R$ 229,90 | R$ 139,90 | Espelho grande/especial é explicitamente excluído do escopo pequeno/médio do ativo. |
| `RP-0142` | `RP0085` | Serviço de vidraçaria | QUOTE | R$ 299,90 | Sem preço fechado | Instalação de porta de vidro é especialização, sem equivalência automática à vidraçaria genérica. |
| `RP-0143` | `RP0085` | Serviço de vidraçaria | QUOTE | R$ 249,90 | Sem preço fechado | Guarda-corpo de vidro por metro exige projeto, segurança e unidade específicos. |
| `RP-0144` | `RP0085` | Serviço de vidraçaria | QUOTE | R$ 249,90 | Sem preço fechado | Fechamento provisório/emergencial é escopo próprio dentro de vidraçaria. |
| `RP-0145` | `V7M001` | Instalação de esquadria de alumínio | QUOTE | R$ 299,90 | Sem preço fechado | Janela de alumínio especializa esquadria genérica; medida e sistema pendentes. |
| `RP-0146` | `V7M001` | Instalação de esquadria de alumínio | QUOTE | R$ 399,90 | Sem preço fechado | Porta de alumínio não é a mesma unidade/escopo de qualquer esquadria. |
| `RP-0147` | `V7M001` | Instalação de esquadria de alumínio | QUOTE | R$ 449,90 | Sem preço fechado | Porta de correr requer confirmar material, roldanas, trilhos e dimensões. |
| `RP-0152` | `V7M001` | Instalação de esquadria de alumínio | QUOTE | R$ 199,90 | Sem preço fechado | Projeto grande por m² pode agregar múltiplas esquadrias; não somar ou substituir itens sem escopo. |
| `RP-0154` | `RP0078` | Reparo em telhado | QUOTE | R$ 399,90 | Sem preço fechado | Goteira localizada versus reparo de telhado genérico; identificar causa/altura/estrutura. |
| `RP-0155` | `RP0079` | Troca de telhas | QUOTE | R$ 74,90 | Sem preço fechado | Troca de telhas por área; material, acesso e extensão precisam coincidir. |
| `RP-0156` | `RP0082` | Construção de telhado | QUOTE | R$ 119,90 | Sem preço fechado | Construção/reforma por área versus construção genérica; orçamento obrigatório. |
| `RP-0157` | `RP0080` | Instalação de calha | QUOTE | R$ 69,90 | Sem preço fechado | Calha por metro linear; ativo não tem unidade estruturada. |
| `RP-0158` | `RP0081` | Limpeza de calha | QUOTE | R$ 19,90 | Sem preço fechado | Preço por metro mais mínimo de chamado descrito na fonte; não comparar preço unitário a chamado total. |
| `RP-0160` | `RP0078` | Reparo em telhado | QUOTE | R$ 399,90 | Sem preço fechado | Possível sobreposição com RP-0113; especialidade e escopo precisam de decisão humana. |
| `RP-0161` | `V7M002` | Instalação de telhado retrátil | QUOTE | R$ 249,90 | Sem preço fechado | Cobertura/telhado retrátil por área, mediante vistoria/orçamento. |
| `RP-0162` | `V7M002` | Instalação de telhado retrátil | QUOTE | R$ 349,90 | Sem preço fechado | Manutenção de motor/mecanismo não equivale à instalação do telhado retrátil. |
| `RP-0163` | `RP0083` | Serviço de serralheria | QUOTE | R$ 179,90 | Sem preço fechado | Solda pontual é especialização do orçamento genérico de serralheria; sem equivalência de preço. |
| `RP-0164` | `RP0083` | Serviço de serralheria | QUOTE | R$ 229,90 | Sem preço fechado | Conserto de portão não equivale à instalação; apenas relação com serviço genérico de serralheria. |
| `RP-0165` | `RP0084` | Instalação de portão | QUOTE | R$ 499,90 | Sem preço fechado | Instalação de portão, com tipo, medidas e infraestrutura a avaliar. |
| `RP-0166` | `RP0083` | Serviço de serralheria | QUOTE | R$ 449,90 | Sem preço fechado | Motor é componente específico; verificar habilitação e não usar preço de portão completo. |
| `RP-0167` | `RP0083` | Serviço de serralheria | QUOTE | R$ 129,90 | Sem preço fechado | Grade de janela por área é especialização; especificar material, medidas e fixação. |
| `RP-0168` | `RP0083` | Serviço de serralheria | QUOTE | R$ 129,90 | Sem preço fechado | Corrimão por metro é item próprio; altura e normas exigem avaliação. |
| `RP-0169` | `RP0083` | Serviço de serralheria | QUOTE | R$ 149,90 | Sem preço fechado | Guarda-corpo metálico por metro requer definição e responsabilidade técnica. |
| `RP-0170` | `RP0083` | Serviço de serralheria | QUOTE | R$ 179,90 | Sem preço fechado | Estrutura metálica é serviço com projeto/responsabilidade específicos; serralheria genérica não fornece preço equivalente. |
| `RP-0171` | `RP0084` | Instalação de portão | QUOTE | R$ 499,90 | Sem preço fechado | Fonte limita portão social; ativo genérico pode exigir desdobramento por tipo. |
| `RP-0172` | `RP0083` | Serviço de serralheria | QUOTE | R$ 199,90 | Sem preço fechado | Roldana/dobradiça é reparo de componente, não instalação de portão completo. |
| `RP-0215` | `RP0051` | Instalação de cooktop | FIXED | R$ 129,90 | R$ 219,90 | Fonte inclui fogão/cooktop a gás em ponto existente; ativo cooktop não prova habilitação de gás e registro/mangueira GLP não é toda ligação. Avaliar separadamente. |
| `RP-0215` | `V7H006` | Instalação de registro e mangueira GLP | QUOTE | R$ 129,90 | Sem preço fechado | Fonte inclui fogão/cooktop a gás em ponto existente; ativo cooktop não prova habilitação de gás e registro/mangueira GLP não é toda ligação. Avaliar separadamente. |
| `RP-0225` | `RP0062` | Impermeabilização de área | QUOTE | R$ 119,90 | Sem preço fechado | Piso de banheiro é recorte específico de impermeabilização; método, preparo e unidade pendentes. |
| `RP-0226` | `RP0062` | Impermeabilização de área | QUOTE | R$ 129,90 | Sem preço fechado | Parede de box é recorte específico, sem preço equivalente ao serviço genérico. |
| `RP-0227` | `RP0062` | Impermeabilização de área | QUOTE | R$ 109,90 | Sem preço fechado | Laje exige método/preparo/área e não é automaticamente qualquer impermeabilização. |
| `RP-0228` | `RP0062` | Impermeabilização de área | QUOTE | R$ 119,90 | Sem preço fechado | Varanda/terraço precisa de escopo técnico e condições de superfície. |
| `RP-0229` | `RP0061` | Correção de infiltração | QUOTE | R$ 99,90 | Sem preço fechado | Correção de infiltração em parede por área; causa e solução precisam de diagnóstico. |
| `RP-0230` | `RP0062` | Impermeabilização de área | QUOTE | R$ 129,90 | Sem preço fechado | Fundação envolve etapa e técnica próprias; orçamento genérico não prova equivalência. |
| `RP-0231` | `RP0062` | Impermeabilização de área | QUOTE | R$ 139,90 | Sem preço fechado | Reservatório exige método compatível com uso da água e escopo próprio. |
| `RP-0232` | `RP0062` | Impermeabilização de área | QUOTE | R$ 349,90 | Sem preço fechado | Reparo localizado versus aplicação completa; não igualar quantidade/escopo. |
| `RP-0233` | `V7L003` | Limpeza pós-obra | FROM | R$ 449,90 | R$ 299,90 | Faixa até 50 m²; confirmar nível de sujeira, superfícies e equipe. |
| `RP-0234` | `V7L003` | Limpeza pós-obra | FROM | R$ 699,90 | R$ 299,90 | Faixa 51–100 m²; não substituir preço genérico sem regra por metragem. |
| `RP-0235` | `V7L003` | Limpeza pós-obra | FROM | R$ 12,90 | R$ 299,90 | Preço por m² com mínimo de chamado não é igual a preço total. Confirmar fórmula antes de comparar. |
| `RP-0236` | `V7L003` | Limpeza pós-obra | FROM | R$ 16,90 | R$ 299,90 | Limpeza pesada por área/mínimo difere da limpeza genérica; manter avaliação. |
| `RP-0237` | `V7L003` | Limpeza pós-obra | FROM | R$ 9,90 | R$ 299,90 | Limpeza técnica de vidros é parte/especialização da pós-obra; não tratar como serviço completo. |
| `RP-0238` | `V7L001` | Diarista até 4h | FIXED | R$ 169,90 | R$ 179,90 | Ambos citam até 4h; política pública de opções do ativo exige revisão específica. |
| `RP-0239` | `V7L002` | Diarista diária | FIXED | R$ 219,90 | R$ 249,90 | Pacote de 6h não equivale automaticamente a diária; duração ativa não está estruturada. |
| `RP-0240` | `V7L002` | Diarista diária | FIXED | R$ 249,90 | R$ 249,90 | Diária até 8h na fonte versus diária sem duração estruturada no ativo. |
| `RP-0241` | `V7L002` | Diarista diária | FIXED | R$ 299,90 | R$ 249,90 | Faxina pesada exige vistoria/orçamento na fonte e pode exceder diária simples FIXED. Não converter. |

## Ativos sem contraparte identificada

Preservar todos: ausência na fonte não autoriza remoção/desativação. Nos demais ativos, uma relação de escopo também não significa cobertura aprovada.

| Código ativo | Serviço | Modo |
| --- | --- | --- |
| `RP0006` | Troca de luminária | FIXED |
| `RP0010` | Instalação de disjuntor | FIXED |
| `RP0016` | Reparo de torneira pingando | FIXED |
| `RP0021` | Reparo em descarga | FIXED |
| `RP0043` | Instalação de fechadura | FIXED |
| `RP0050` | Instalação de coifa | FIXED |
| `RP0052` | Instalação de forno elétrico | QUOTE |
| `RP0053` | Instalação de depurador | FIXED |
| `RP0054` | Pintura de parede interna | QUOTE |
| `RP0055` | Pintura de teto | QUOTE |
| `RP0056` | Pintura de porta | FIXED |
| `RP0057` | Pintura de grade | QUOTE |
| `RP0058` | Pintura residencial completa | QUOTE |
| `RP0059` | Pintura externa | QUOTE |
| `RP0060` | Aplicação de textura | QUOTE |
| `RP0074` | Reparo estrutural | QUOTE |
| `RP0087` | Paisagismo | QUOTE |
| `RP0088` | Poda de árvore | QUOTE |
| `V7H002` | Desentupimento completo de pia | QUOTE |
| `V7H005` | Reparo de vazamento externo completo | QUOTE |
| `V7C007` | Pacote simples — 1 unidade | QUOTE |
| `V7C008` | Pacote duplo — 2 unidades | QUOTE |
| `V7C009` | Pacote triplo — 3 unidades | QUOTE |
| `V7P001` | Pintura simples | QUOTE |

## Artefatos e segregação

- `comparison-source-242.csv`: todas as linhas da fonte, candidatos e pendências.
- `comparison-pairs.csv`: descrição, especialidade/categoria, unidade, escopo, modalidade, preços públicos e riscos por relação.
- `new-service-candidates.csv`: lista completa dos candidatos sem contraparte direta.
- `active-111-coverage.csv`: todos os ativos, inclusive sem contraparte, para preservação.
- `conflicts-and-decisions.csv`: conflitos e decisões pendentes.
- `private/comparison-internal.json`: referência administrativa confidencial, fora do build; não encaminhar a clientes nem publicar. O CSV contém percentual de prestador; ele está registrado como dado da fonte no relatório privado, separado de P3, sem base de cálculo presumida nem valor de repasse calculado.

Consulte a proposta de migração em `docs/catalog-reconciliation-pending.md`. Todos os artefatos permanecem locais, sem commit/push.
