# Checklist humano — cadastro, mobile e administração

Executar em ambiente Preview com credenciais de teste autorizadas e storage privado configurado. Não usar documentos reais.

## Android — cadastro e câmera
- [ ] Abrir `/prestador/cadastro/` em 320, 360, 390, 412 e 430 px.
- [ ] Percorrer todas as etapas sem overflow e confirmar botões acessíveis.
- [ ] Capturar foto de perfil com câmera frontal e também selecionar da galeria.
- [ ] Capturar RG/comprovante com câmera traseira e também selecionar arquivo/PDF.
- [ ] Confirmar rejeição amigável de HEIC, tipo inválido e arquivo acima do limite.

## CEP, endereço e GPS
- [ ] Informar CEP válido e confirmar “Endereço localizado”, mantendo número/complemento editáveis.
- [ ] Simular indisponibilidade do provider de CEP e concluir pelo endereço manual.
- [ ] Autorizar GPS, revisar o endereço aproximado e editar os campos.
- [ ] Negar GPS e concluir normalmente pelo CEP ou endereço manual.
- [ ] Repetir CEP e GPS no fluxo do cliente.

## Painel do prestador
- [ ] Entrar com credencial de prestador e confirmar que somente o próprio cadastro aparece.
- [ ] Conferir status e correção solicitada.
- [ ] Reenviar documento e confirmar status `RESUBMITTED`, sem expor o documento antigo.

## Painel administrativo
- [ ] Entrar em `/admin/prestadores/` como ADMIN e filtrar todos os status.
- [ ] Conferir CPF/RG mascarados e abrir documento por endpoint autenticado, nunca por base64 no HTML.
- [ ] Iniciar análise, validar/rejeitar documento, exigir motivo, solicitar correção e registrar observação.
- [ ] Aprovar somente após documentos e antecedentes válidos; suspender e reativar.
- [ ] Como ADMIN_COMPLIANCE/ADMIN_SECURITY, revisar antecedentes pela API autorizada.
- [ ] Confirmar que FINANCE, ATTENDANT, CUSTOMER e PROVIDER não autorizado recebem 403.
