# Arquitetura marketplace on-demand

## Escopo da Fase 1

O MVP continua estático, sem simular segurança de produção. A evolução é incremental e mantém cadastro, pagamentos demonstrativos, garantia, cashback, WhatsApp, Google Ads e PWA existentes.

- `domain/order-engine.js`: agregado `Order`, máquina de estados, auditoria, reserva e idempotência local.
- `services/`: pricing, geo/ETA, disponibilidade, matching, ondas de despacho, equilíbrio de mercado, reputação, fraude, ledger, notificações, eventos/filas, auditoria e métricas.
- `repositories/interfaces.js`: portas assíncronas para persistência futura.
- `adapters/gestao-click-adapter.js`: mapeamentos e CSV, sem inventar endpoints.

O event bus e a fila são somente em memória. Valores e estados no navegador podem ser adulterados; em produção, preço, repasse, margem, pagamento e status serão recalculados e validados no servidor.

## Eventos de domínio

`ORDER_CREATED`, `PRICING_COMPLETED`, `MATCH_STARTED`, `PROVIDER_OFFERED`, `PROVIDER_ACCEPTED`, `PROVIDER_EN_ROUTE`, `SERVICE_STARTED`, `SERVICE_COMPLETED`, `CUSTOMER_PAID` e `PROVIDER_PAID` formam o vocabulário inicial. Filas lógicas: `matching`, `notifications`, `payments`, `audit` e `analytics`.

## Fases futuras

**Fase 2:** Node.js/TypeScript, REST, PostgreSQL/PostGIS, Redis, BullMQ ou SQS, autenticação segura, storage privado, realtime, Push Web, provedor de mapas e antifraude aprofundado.

**Fase 3:** previsão de demanda baseada em histórico, heatmaps, recomendação histórica de preços, roteirização avançada e machine learning somente após dados, governança e validação.
