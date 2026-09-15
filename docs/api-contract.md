# Contrato conceitual da API

Não existe servidor neste MVP. O contrato futuro usa JSON, autenticação/RBAC, `Idempotency-Key` nos comandos críticos, timestamps ISO 8601 e valores monetários em centavos.

| Método e rota | Propósito | Resultado principal |
|---|---|---|
| `POST /orders` | Criar OS | `201 Order` ou repetição idempotente |
| `GET /orders/:id` | Consultar visão autorizada | `200 OrderView` minimizada por papel |
| `POST /orders/:id/offers` | Abrir onda | `202 ProviderOffer[]` |
| `POST /offers/:id/accept` | Reservar atomicamente | `200 Order`, `409` se já reservada |
| `POST /offers/:id/decline` | Recusar sem punição isolada | `204` |
| `POST /providers/:id/location` | Atualizar posição consentida | `204` |
| `POST /providers/:id/availability` | Alterar disponibilidade | `200 ProviderAvailability` |
| `POST /orders/:id/start` | Iniciar execução | `200 Order` |
| `POST /orders/:id/complete` | Concluir execução | `200 Order` |
| `POST /orders/:id/additional` | Registrar adicional | `202 AdditionalReview` |
| `POST /payments` | Confirmar cobrança via gateway | `202 Payment` |
| `POST /payouts` | Liberar repasse autorizado | `202 Payout` |

O servidor recalcula pricing e ledger, ignora valores/status financeiros enviados como autoridade pelo cliente, valida transições e grava auditoria append-only. Webhooks devem verificar assinatura e também ser idempotentes.
