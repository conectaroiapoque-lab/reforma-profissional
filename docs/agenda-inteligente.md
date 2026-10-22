# Agenda inteligente — desenvolvimento e revisão

## Diagnóstico e escopo

Repositório: `conectaroiapoque-lab/reforma-profissional`, branch `feat/agenda-inteligente`, base `5795dc25077149acec97c953b3f61aabd363d893`. Nenhum outro projeto foi alterado. Nenhum deploy, merge, envio de WhatsApp ou acesso ao banco de produção foi realizado.

A aplicação pública é `web/index.html` + `web/app.js`, JavaScript puro, distribuída em `dist/` por `scripts/build-web.js`. Os arquivos legados da raiz não são o aplicativo publicado. Há 12 Functions Vercel; as três rotas de agenda reutilizam os catch-alls existentes. O catálogo ativo é V7, **111 serviços**, não 242. Os catálogos históricos e as tabelas financeiras não foram alterados. Node 24.19.0, npm 11.9.0 e Python 3.12.14 foram usados nesta máquina. O repositório não possui lockfile raiz; instalações transitivas continuam sujeitas às faixas já declaradas.

Os dados existentes são armazenados em Redis REST (`order:<id>`, `provider:<id>`, conjuntos `orders` e `providers`). Sessões HMAC SHA-256 já existentes identificam CUSTOMER, PROVIDER e ADMIN. O cadastro profissional possui gates de documentos, contrato, antecedentes e aprovação humana. A agenda reutiliza esses registros e exige habilitação adicional por código de serviço, com evidência, especialidade cadastrada e prazo de validade.

## Fluxo de utilização

1. O CAC acessa `/admin/agenda/` com sua autenticação existente. Consulte a lista de IDs/especialidades em “Cadastros e regras de agenda”.
2. Registre uma regra por código oficial: modalidade VISIT, REMOTE, DIRECT ou HUMAN_REVIEW, duração da visita, margem de deslocamento **por lado**, prazo de aceite e antecedência permitida para cancelamento. Informe referência da regra comercial aprovada e justificativa. **Não há defaults comerciais inventados**; sem regra, não são ofertados horários.
3. Valide a habilitação de cada profissional, com evidência técnica, códigos permitidos, especialidade cadastrada e validade. A autoedição da disponibilidade nunca concede habilitação.
4. Em “Sou Profissional” → painel (`/prestador/painel/`), registre janelas de trabalho, folgas e regiões. As janelas usam horário de Brasília e são convertidas para UTC. Uma linha por período, `AAAA-MM-DDTHH:mm,AAAA-MM-DDTHH:mm`. Não é possível retirar uma janela/região ou bloquear um período com compromisso vigente; solicite reagendamento antes.
5. O cliente utiliza “Solicitar serviço”. Código, localização, urgência, fotografia privada, preferência de data, preferência por visita e disponibilidade de vídeo ficam associados ao pedido. A preferência **não é uma confirmação nem uma reserva**. Vídeos não são enviados por este formulário; o CAC combina um canal privado autorizado quando necessário.
6. O CAC analisa o pedido e registra modalidade, equipe contratada, duração total, situação dos materiais e justificativa. Uma regra HUMAN_REVIEW exige decisão humana por pedido. O profissional já contratado no pedido precisa constar na equipe. Mapeamentos de especialidade não são inferidos por texto ou IA.
7. Cliente/CAC consultam opções reais no acompanhamento. São considerados habilitação, região, janelas, bloqueios, compromissos, deslocamento e equipe. O início é pesquisado em intervalos de 30 minutos. Execuções longas são sugeridas em segmentos de até oito horas por dia; janelas, deslocamento e todos os integrantes devem atender todos os segmentos. A API também aceita períodos personalizados válidos, totalizando a duração aprovada, até 31 períodos.
8. A reserva inicia `PENDING_PROVIDER`. O cliente registra sua concordância ao solicitar; se o CAC solicitar, o cliente ainda precisa confirmar. Todos os profissionais precisam aceitar antes de `CONFIRMED`. Cada resposta revalida disponibilidade e habilitação. Reservas pendentes expiram no prazo configurado e liberam os períodos. Aceites após o início/prazo não confirmam um horário passado.
9. Para visita, o profissional registra início, condições técnicas, quantidade/unidade, materiais, duração, observações e fotografias autorizadas, depois conclui. As fotos usam a API privada existente e são vinculadas por ID; referências de outro proprietário são rejeitadas. A conclusão exige relatório. Uma visita concluída não conclui a ordem de execução.
10. Para avaliação remota, o profissional da equipe registra o relatório no painel sem criar uma visita. A execução exige esse relatório quando o plano é REMOTE, ou uma visita concluída com relatório quando é VISIT.
11. O CAC prepara a proposta: FIXED recupera o valor da tabela oficial; FROM/QUOTE exigem avaliação técnica e valor **explicitamente aprovado por humano** (centavos). FROM não permite um total abaixo do preço público de referência. Não há multiplicação automática por quantidade, negociação interna exposta nem precificação inventada. A proposta exige escopo/condições. O cliente aprova/recusa uma versão identificada do orçamento no acompanhamento. Os fluxos anteriores de orçamento continuam disponíveis.
12. Execução só pode ser reservada após orçamento aprovado, termos aceitos e materiais confirmados. A equipe é a definida no plano. Início e conclusão atualizam a agenda e a OS na **mesma transação**, preservando histórico e exigência de documento fiscal. As rotas antigas de início/conclusão encaminham pedidos geridos pela agenda para as ações novas, evitando bypass de horário.

## Estados, alterações e comunicação

- `PENDING_PROVIDER` → `CONFIRMED` → `IN_PROGRESS` → `COMPLETED`; também `DECLINED`, `CANCELLED` e expiração derivada `EXPIRED`.
- Reagendamento registra solicitante, data e motivo, mantendo a reserva atual. Cliente/CAC consultam novo horário usando o botão de substituição; só após os novos aceites a reserva anterior é cancelada atomicamente. Expiração/recusa da nova opção mantém o compromisso original. Cancelar o original cancela propostas de substituição pendentes.
- Cancelamentos respeitam a antecedência configurada. Alterações tardias exigem CAC; nenhuma multa ou política de reembolso é inventada. Compromissos em execução não são cancelados por esta interface.
- Toda edição exige a versão vigente (`version`); resposta obsoleta recebe 409. Alterações do CAC exigem justificativa e registram responsável, papel e horário. Planos com compromisso vigente precisam de reagendamento/cancelamento antes da alteração.
- O calendário possui visualizações diária, semanal e mensal, filtros por profissional, especialidade, cidade e situação. Lista pendências de orçamento/plano, solicitações de reagendamento, expiração e execução que ultrapassou o período. Uma execução vencida ainda em andamento impede novas reservas para aquele profissional até sua conclusão.
- O assistente pesquisa o catálogo e oferece ferramentas de leitura para consultar agenda, disponibilidade e preparar textos. **Nenhum modelo externo está ativado**. Um modelo futuro só deve receber projeções autorizadas e ferramentas de leitura; não recebe autoridade para confirmar compromissos ou inventar habilitações.

Há 12 modelos: solicitação recebida, profissional consultado, visita confirmada, lembrete de visita, orçamento disponível, orçamento aprovado, execução agendada, lembrete de execução, reagendamento, cancelamento, conclusão e pós-venda. Os textos ficam registrados em uma caixa de saída com `delivery=MANUAL_COPY_ONLY`. O CAC gera/copia e envia manualmente ao destinatário autorizado. Eventos de confirmação/orçamento são validados contra o estado atual. Mensagens históricas podem estar desatualizadas: confira a situação e o destinatário antes de enviar.

A segunda etapa de WhatsApp deve consumir essa caixa de saída por um adaptador server-side: identificador de evento, idempotência, destinatário autorizado, consentimento, janela de conversa, template aprovado, idioma, tentativas e recibos de entrega. Credenciais devem ficar em configuração segura. Nenhum envio automático, grupo, template aprovado, contrato com a Meta ou custo foi presumido. Lembretes são preparados manualmente; não há cron ou envio em background nesta entrega.

## Persistência, concorrência e migração

A migração é aditiva e preguiçosa: a primeira gravação cria `rp:scheduling:v1` (`schemaVersion=1`). O documento contém `profiles` (janelas, bloqueios, regiões e habilitação), `rules`, `plans`, `assessments`, `appointments`, `audit`, `notifications` e `revision`. Pedidos, profissionais e evidências permanecem nos registros existentes. Não há seed de profissionais reais, exclusão, reset ou migração destrutiva.

Cada mutação carrega a revisão, valida regras e executa `EVAL` Lua comparando o documento e as versões completas de **todos os pedidos/profissionais consultados**. Apenas se o snapshot ainda for válido, grava o novo documento e eventuais mudanças de OS. Outro cliente que reservou o horário provoca nova validação e conflito 409. Todos os profissionais e dias estão na mesma operação. Falha de validação não deixa reserva parcial. Falhas Redis não têm fallback em memória no servidor de desenvolvimento real ou nas Functions.

A solução exige Redis com `EVAL` multi-key atômico na mesma base (compatível com o padrão REST já existente). Não foi validada em Redis Cluster com chaves distribuídas entre slots. O documento global é apropriado para o volume inicial, mas serializa gravações e tem limite de proteção de 8 MB; ao atingir o limite, novas mutações falham com 503. Monitorar crescimento, latência e capacidade, e projetar particionamento/arquivamento auditável antes de escalar. Nenhum histórico é apagado automaticamente.

O backup padrão existente agora inclui `rp:scheduling:*`. Faça backup consistente com escritas suspensas ou snapshot atômico do provedor antes da ativação; o exportador por padrões não promete snapshot entre múltiplas chamadas. O rollback de código deve preservar o novo namespace e os registros existentes; não exclua a chave para contornar conflitos. Restauração e arquivamento exigem procedimento operacional revisado.

## Autenticação e LGPD

`GET/POST /api/customer/agenda`, `/api/provider/agenda` e `/api/admin/agenda` reutilizam as sessões assinadas. Exigem papel exato e permissão. Cliente acessa só seus pedidos, profissional só compromissos/equipe atribuídos; somente ADMIN escreve regras e habilitações. A API responde `private, no-store`; o service worker não armazena `/api/` ou administração. As sessões continuam com a validade existente (cliente/profissional até 24h; CAC 15 min); esta entrega não cria recuperação de sessão do cliente.

As projeções da agenda não expõem telefone, endereço completo, CPF, documentos cadastrais, hashes, custos, margens, comissões ou preços mínimos internos. O profissional usa a OS protegida existente para consultar os dados operacionais do atendimento. Fotos exigem propriedade e consentimento e ficam fora do build público. Logs de auditoria registram ação/responsável/motivo; não inclua dados pessoais desnecessários em justificativas. Retenção e direitos LGPD precisam do procedimento de operação da plataforma; não foram criados prazos legais fictícios.

## Executar e configurar

```bash
cd /workspace/reforma-profissional
export PATH="/workspace/.tools/bin:$PATH"
npm install --package-lock=false --no-audit --no-fund
npm run build:web
node scripts/dev-server.js
```

O servidor local na porta 8000 serve **dist** e adapta as Functions reais. Não sirva a raiz como aplicativo de produção. Para dados reais de **desenvolvimento**, configure com segurança `KV_REST_API_URL`, `KV_REST_API_TOKEN`, `AUTH_SESSION_SECRET` (mínimo 32 caracteres) e `AUTH_USERS_JSON` (usuários CAC com hashes no formato já suportado). Não use valores de produção. As variáveis não estavam presentes nesta máquina; nenhuma credencial foi inventada. Confirme `GET /api/health` com 200 antes de afirmar integração com um banco remoto. Sem configuração, a API falha fechada; o build e os testes não dependem dessas credenciais. Autorize somente o domínio do Redis de desenvolvimento quando ele for conhecido.

Para testes:

```bash
export PATH="/workspace/.tools/bin:$PATH"
npm test
python3 test-support/schedule-mobile.py
```

A integração usa `redis-server`/`redis-cli` locais por socket, sem porta TCP, sem persistência e sem dados reais. Defina `REDIS_SERVER`/`REDIS_CLI` se estiverem em outro caminho. Sem os binários, a integração é **explicitamente ignorada**; isso não comprova concorrência. O teste de navegador requer Playwright Python e Chromium (`CHROMIUM_PATH` opcional), bloqueia destinos externos e usa uma fixture isolada na porta 8001. Fixtures e credenciais sintéticas de teste não entram em `dist` nem nos handlers de produção.

O rascunho do ambiente em nuvem salva `install_script`, `start_skill` e a adição de `api.github.com` à lista personalizada de rede, preservando os presets. A instalação foi executada e repetida nesta máquina. A gravação do rascunho não publica o ambiente nem aplica a rede em runtime. Revise/salve nas configurações e publique o **ambiente de desenvolvimento** quando desejar reutilizar o snapshot; isso não é publicação do site. Nenhum deploy do site foi realizado.

## Validação e limitações de entrega

- Base anterior: 245 testes aprovados.
- Suíte atual: **269 testes aprovados, zero falhas e zero ignorados**, incluindo integração em Redis real com disputa simultânea, equipe/dias, revisão de dependências, integridade e atualização atômica da OS.
- Build Web aprovado. As 12 Functions continuam importando sem segredos em build.
- Navegador Chromium: cliente, profissional, aceite pela API de teste, CAC mensal e formulários em 390 e 1280 px, sem overflow horizontal. As telas usam fixture de desenvolvimento; o teste de atomicidade usa Redis real separadamente.
- HTTP local: aplicação, JavaScript da agenda, painel profissional, CAC e termos com 200/conteúdo esperado; agenda anônima com 401 JSON; health com 503 por ausência de credenciais, conforme esperado.
- Catálogos e regras financeiras preservados. Dois testes históricos tiveram apenas a expectativa de versão do cache atualizada para a nova versão PWA.

Ainda exigem configuração/validação externa: conexão Redis REST e login com credenciais reais de desenvolvimento, regras comerciais oficiais, habilitações/equipes efetivas e política operacional de retenção. Não há validação de deploy em Vercel, execução nativa Android/iOS, gateway de pagamentos, envio oficial WhatsApp ou modelo externo de IA. Vídeos são sinalizados ao CAC; upload/transcodificação de vídeo não integra esta entrega.

Custos: nenhuma biblioteca de calendário/IA/WhatsApp paga foi adicionada. Redis REST e hospedagem seguem o provedor atual, com consumo adicional de armazenamento e operações; mapas/roteamento, modelo de IA, mídia de vídeo e API oficial WhatsApp seriam integrações opcionais cobradas pelos respectivos provedores. O deslocamento atual é uma margem conservadora aprovada pelo CAC, não ETA de mapas.

A branch `feat/agenda-inteligente` foi enviada e a [Pull Request #42](https://github.com/conectaroiapoque-lab/reforma-profissional/pull/42) foi criada em rascunho para revisão. A API do GitHub apresentou CONNECT 403 inicialmente, mas a operação de criação da PR foi concluída posteriormente. Nenhum merge ou deploy foi executado. Não faça merge nem deploy sem autorização.

## Arquivos desta entrega

- `server/schedule-repository.js`: estado versionado e transação Redis com verificação de dependências.
- `server/schedule-service.js`: regras, elegibilidade, horários, aceites, relatórios, propostas, transições, auditoria e mensagens.
- `server/schedule-api.js`, `server/schedule-assistant.js`: RBAC, ações permitidas e sugestões determinísticas.
- `api/{admin,customer,provider}/[...path].js`: novas rotas nos catch-alls existentes.
- `server/operations-api.js`: proteção das ações legadas para pedidos geridos pela agenda.
- `server/order-service.js`, `web/app.js`, `web/index.html`: preferências e integração no pedido/acompanhamento.
- `prestador/painel/index.html`, `admin/prestadores/index.html`, `admin/agenda/index.html`: acesso profissional e CAC.
- `public/agenda/{agenda.js,agenda.css,admin.js}`: calendários, filtros, formulários e mensagens responsivos.
- `scripts/{build-web.js,dev-server.js,backup-datastore.js}`, `sw.js`: build, execução local, backup e cache.
- `test/schedule*.test.js`, `test-support/schedule-*`: testes de domínio, API, Redis real e navegador.
- `test/go-live-final.test.js`, `test/whatsapp-links.test.js`: versão esperada do novo cache.
- `README.md`, `docs/agenda-inteligente.md`: instruções e diagnóstico.
