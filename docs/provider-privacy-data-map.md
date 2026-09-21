# Mapa de dados — prestador

| Campo/categoria | Finalidade | Armazenamento | Acesso | Retenção | Cliente | Admin | Compliance |
|---|---|---|---|---|---|---|---|
| Nome profissional, especialidades | perfil/matching | provider repository | prestador/operação | ativo + prazo aprovado | sim, após aprovação | sim | sim |
| Nome civil, CPF, RG | identificação/antifraude | provider repository privado | prestador/admin autorizado | configurar | não | sim | sim |
| Telefone/e-mail | autenticação/contato | provider repository privado | prestador/operação autorizada | configurar | não | sim | conforme necessidade |
| Endereço/CEP/coordenadas | região e distância | provider repository privado | prestador/matching | configurar | não | allowlist | conforme necessidade |
| Foto | identificação pública após revisão | storage privado/evidenceId | dono/revisores | configurar | somente aprovada | sim | sim |
| Documentos/licenças | validação | storage privado | dono/revisores RBAC | `PROVIDER_DOCUMENT_RETENTION_DAYS` | não | metadados | sim |
| Antecedentes | revisão humana | storage/repository privado | compliance/security | `BACKGROUND_CHECK_RETENTION_DAYS` | não | status mínimo | sim |
| Empresa/dados fiscais | operação fiscal | repository privado | financeiro/admin autorizado | obrigação aplicável | não | allowlist | conforme necessidade |
| Consentimentos/contrato | prova e preferências | repository auditável | dono/admin/jurídico | obrigação aplicável | não | sim | sim |
| Pagamento/repasse | cobrança e conciliação | gateway/ledger; sem PAN/CVV | financeiro RBAC | obrigação aplicável | não | status | não por padrão |
