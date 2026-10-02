# Acesso interno — cadastro e análise de prestadores

## URL e autenticação

A área interna fica em `/admin/prestadores/`. O HTML de entrada pode ser carregado, mas nenhum dado de prestador é fornecido sem uma sessão server-side válida. O login usa `AUTH_USERS_JSON`; a assinatura e expiração da sessão usam `AUTH_SESSION_SECRET` (mínimo de 32 caracteres). Nunca publique essas variáveis no frontend.

`AUTH_USERS_JSON` deve ser um array de usuários com `username`, `subjectId`, `role`, `salt` e `passwordHash`. Gere salt e hash fora do repositório usando a função `passwordDigest` de `server/auth.js`; não registre senha, salt ou hash em documentação, logs ou código. Reinicie a implantação após configurar a variável.

## Papéis e menor privilégio

- **ADMIN:** consulta cadastros, revisa documentos operacionais, solicita correções, registra observações e toma as decisões finais de aprovação, suspensão e reativação. Pode revelar CPF/RG para conferência; essa ação gera auditoria.
- **REGISTRATION_REVIEWER (ASSESSOR DE CADASTRO):** lista e abre cadastros, revisa documentos operacionais, solicita correções e registra observações. Não acessa financeiro, catálogo, preços, decisões finais nem dados fora do cadastro.
- **ADMIN_COMPLIANCE / ADMIN_SECURITY:** acessam e analisam o documento bruto de antecedentes pelos endpoints próprios. ADMIN comum e REGISTRATION_REVIEWER veem apenas o status.
- **FINANCE e demais papéis:** não têm acesso aos cadastros nem aos antecedentes.

## Revogação

Remova o usuário de `AUTH_USERS_JSON`, aplique a configuração e reinicie a implantação. Sessões já emitidas expiram em até 15 minutos; para revogação emergencial, também rotacione `AUTH_SESSION_SECRET`, o que invalida todas as sessões.

## Auditoria

Ações de análise, validação, rejeição, correção, observação, decisão administrativa e revelação de dados sensíveis são vinculadas ao usuário, papel, prestador e data/hora no histórico administrativo. Motivos e orientações podem ser registrados, mas o conteúdo de arquivos privados e os valores integrais de CPF/RG nunca devem entrar no log. Consulte o detalhe do cadastro e a trilha persistida no repositório de prestadores.


## Fluxo de envio resiliente

O cadastro público usa três fases autenticadas por token temporário: `POST /api/provider/register/start`, um `POST /api/provider/register/{providerId}/document` para cada arquivo e `POST /api/provider/register/{providerId}/finalize`. Todas exigem chave de idempotência. Um cadastro iniciado permanece `DRAFT` por até 24 horas para retentativas e só passa a `SUBMITTED` depois da validação de todos os documentos obrigatórios. Arquivos são limitados a 3 MB nesse fluxo para que, mesmo codificados para transporte, cada requisição permaneça abaixo do limite seguro da Function. Nunca registre conteúdo, Base64 ou token nos logs.
