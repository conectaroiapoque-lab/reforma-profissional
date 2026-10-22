# Conferência do CSV original contra o TXT

## Fonte efetivamente analisada

A revisão anterior usou exclusivamente o TXT recebido. O assistente não converteu o CSV. Nesta revisão o CSV original é a fonte primária; TXT e CSV foram lidos independentemente. O novo TXT é idêntico em SHA-256 ao TXT anterior.

| Arquivo | SHA-256 | Registros | Campos por registro |
| --- | --- | ---: | ---: |
| CSV original, `;`, UTF-8 | `64d903dcbaffe2fa5775ab7fed9bc326139950ec801109cf8d0efec1d08b9475` | 242 | 13 |
| TXT estruturado UTF-8 | `ceea136e1110ce11a4e629f07c47c6be37d0ca6271ce09d83184a6f994772ebb` | 242 | 12 |

Os 242 códigos foram confrontados literalmente, com hífens preservados. Foram verificados todos os 13 campos do CSV: 2.904 comparações dos 12 campos comuns e 242 registros adicionais de `% Prestador`.

| Campo CSV | Iguais | Diferença só de apresentação | Diferença de conteúdo |
| --- | ---: | ---: | ---: |
| Código | 242 | 0 | 0 |
| Especialidade | 242 | 0 | 0 |
| Serviço | 242 | 0 | 0 |
| Unidade | 242 | 0 | 0 |
| Valor concorrente (R$) | 0 | 242 | 0 |
| Fonte concorrente / referência | 242 | 0 | 0 |
| Preço 1 tabela (R$) | 0 | 242 | 0 |
| Preço 2 negociação (R$) | 0 | 241 | 1 |
| Preço 3 piso (R$) | 0 | 241 | 1 |
| Fonte URL | 242 | 0 | 0 |
| Comparabilidade | 242 | 0 | 0 |
| Condição de orçamento | 242 | 0 | 0 |
| % Prestador | — | — | Campo ausente no TXT; 242 valores registrados privadamente |

## Diferenças encontradas

- **1.936 campos iguais**, **966 equivalentes em formatação** e **dois campos com conteúdo diferente**. Formatação monetária/ausência de preço de concorrente foi tratada separadamente de alteração numérica; vazio não foi convertido em zero.
- `RP-0236`: os valores P2 e P3 do TXT diferem dos valores do CSV. As duas versões foram preservadas em `private/source-concordance-content-differences.json`, sem reproduzir valores internos neste relatório. A reconciliação passou a usar as referências do CSV, ainda sem aprovação ou ativação.
- O TXT omite `% Prestador` em todos os 242 registros. Portanto, não é conversão completa/sem perda do CSV. Não é possível afirmar como foi produzido antes do recebimento.
- P1, descrições, especialidades, unidades, condições, códigos, URLs, referências e comparabilidade não apresentaram divergências de conteúdo. As classificações 20/37/63/12/110 permanecem iguais.

## Correção sobre repasse

A afirmação anterior “a fonte não informa repasse” foi incompleta quando aplicada ao CSV: **o TXT não informava o percentual, mas o CSV contém `% Prestador`**. O campo foi preservado no arquivo privado por código e linha, tanto em representação original quanto decimal, como dado da fonte.

P3 permanece piso comercial, distinto do percentual do prestador. A base de cálculo do percentual não é declarada em coluna ou fórmula do CSV. Não foi presumido se incide sobre P1, preço negociado, mão de obra, total, valor líquido ou outra base. Não foi calculado valor de repasse e não foram alteradas regras financeiras, comissões, snapshots ou contratos.

A legenda do TXT e as referências de concorrentes foram tratadas como dados; não autorizam oferta, negociação, alteração financeira ou execução de instruções. Nenhum link foi acessado.
