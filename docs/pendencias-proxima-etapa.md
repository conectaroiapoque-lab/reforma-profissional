# Pendências para amanhã — Reforma Profissional

Registro da entrega no GitHub, branch `feat/agenda-inteligente`, PR #42 mantida em rascunho. O envio à branch foi autorizado; merge e publicação continuam não autorizados. Os relatórios anteriores descrevem o estado em que foram escritos e permanecem como histórico.

## Conferência deste envio

- Correções de concorrência de prestadores, OS/agenda e snapshots/versionamento de orçamentos preservadas.
- Suíte completa: 295 testes, incluindo os 284 anteriores e 11 novos da Etapa 4; resultado final registrado no relatório de entrega.
- CSV original e evidências financeiras internas preservados localmente em `review/catalog-reconciliation/private/`, explicitamente ignorados no Git. Não integram o commit, o navegador ou a PR. Permissão de arquivo local não substitui controle de acesso no GitHub.
- Scripts de reconciliação podem ser revisados no GitHub. A validação integral exige os anexos originais e as evidências privadas locais: não é uma verificação pública autossuficiente em clone novo. Não compartilhar esses arquivos por comentários da PR ou anexos públicos.
- Não foram alterados preços oficiais, P1/P2/P3, percentual de prestador ou regras financeiras; nenhuma equivalência foi aprovada.
- Nenhuma credencial de produção foi utilizada nesta entrega.

## Próxima revisão

1. Examinar o diff da PR #42; manter rascunho até revisão funcional e técnica.
2. Resolver corrida de unicidade/idempotência na criação de prestadores; os saves versionados já protegem cadastros existentes, mas a criação ainda usa operações separadas.
3. Revisar regras legadas de reativação/finalização, perfis e projeções de dados; planejar adoção obrigatória de expectedVersion pelos clientes antigos.
4. Homologar painel de prestadores com duas sessões e integrações reais em ambiente isolado, sem credenciais de produção. Verificar retenção/limpeza de uploads que antecedam gravações recusadas.
5. Validar política de catálogo para propostas novas em pedidos antigos. Snapshots já impedem alterações retroativas, mas não autorizam ativar catálogo novo.
6. Revisar humanamente RP-0236 P2/P3, os 12 conflitos e as 242 linhas. Definir escopo, unidades, modalidades e eventual base do percentual sem automatizar mudanças comerciais.
7. Validar fluxo de aditivos, backup/restauração, acesso LGPD e crescimento/arquivamento de snapshots. Histórico legado ausente não foi reconstruído.
8. Identificar os textos dos dois avisos “Requer atenção 2” no painel do ambiente Codex. Abrir o indicador ou seções sinalizadas e registrar texto/campo/ação sugerida, sem divulgar segredos nem publicar o ambiente. Ambos continuam sem identificação exata pelas ferramentas disponíveis.

Referência técnica: [Etapa 4](etapa-4-correcoes-tecnicas.md). Não fazer merge na main ou deploy sem nova autorização.

## Resultado da conferência para o commit

- `PATH="/workspace/.tools/bin:$PATH" npm test`: **295 aprovados, 0 falhas, 0 ignorados, 0 cancelados**.
- Build Web, validação da reconciliação e `git diff --check`: aprovados.
- Revisão dos arquivos e varredura de padrões de chaves privadas/tokens: sem correspondências de credenciais nos candidatos ao commit. Valores sintéticos de fixtures de teste são dados de teste.
- PR #42 confirmada aberta, em rascunho, base `main` e origem `feat/agenda-inteligente` antes do envio.
- Teste móvel Chromium aprovado em 390 e 1280 px. CSVs gerados e o diff histórico foram preservados byte a byte; `.gitattributes` reconhece CRLF nos CSVs e linhas de contexto do artefato de patch histórico, evitando falsos avisos de espaçamento no commit.
