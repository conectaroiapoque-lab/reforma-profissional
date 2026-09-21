# Checklist de ambiente de produção — `/api/orders`

Este checklist foi levantado diretamente das dependências executadas pelo endpoint. O endpoint não usa variáveis de catálogo, preço, geolocalização, anúncios ou domínio.

| Variável | Obrigatória? | Usada por | Efeito se ausente | Como validar |
| --- | --- | --- | --- | --- |
| `AUTH_SESSION_SECRET` | Sim | `server/auth.js`, para assinar `orderAccessToken` após criar a solicitação | A requisição para antes de gravar o pedido e responde `500`, JSON, com `PRODUCTION_CONFIGURATION_ERROR`. O valor precisa ter ao menos 32 caracteres. | No ambiente da Function, confirmar que existe e tem pelo menos 32 caracteres; fazer um POST válido e confirmar `201` e a presença de `orderAccessToken`. Nunca imprimir o valor. |
| `KV_REST_API_URL` | Sim | `server/order-repository.js`, `server/rate-limit.js` e, quando há foto, `server/private-file-storage.js` | A requisição não usa fallback em memória e responde `503`, JSON, com `DATASTORE_UNAVAILABLE`. | Executar `GET /api/health`; deve responder `200` com `{"ok":true,"datastore":"available"}`. Nunca registrar ou retornar a URL. |
| `KV_REST_API_TOKEN` | Sim | `server/order-repository.js`, `server/rate-limit.js` e, quando há foto, `server/private-file-storage.js` | A requisição não usa fallback em memória e responde `503`, JSON, com `DATASTORE_UNAVAILABLE`. | Executar `GET /api/health`; deve responder `200` com `{"ok":true,"datastore":"available"}`. Nunca registrar ou retornar o token. |
| `PRIVATE_UPLOAD_MAX_BYTES` | Não | `server/private-file-storage.js`, limite de anexos | Sem a variável, aplica o padrão seguro de 8.000.000 bytes. Um valor inválido pode impedir uploads. | Se configurada, confirmar que é um número positivo e testar um anexo abaixo e outro acima do limite. |

## Verificação segura

1. Configure as três variáveis obrigatórias nos ambientes **Production** e **Preview** da Vercel.
2. Faça novo deploy, pois alterações de ambiente não modificam Functions já implantadas.
3. Consulte `GET /api/health`. A resposta expõe somente a disponibilidade, nunca URL ou token.
4. Envie um `POST /api/orders` válido com `Content-Type: application/json` e `Idempotency-Key` único.
5. Repita o POST com a mesma chave e confirme o mesmo `orderId` e protocolo.

Toda resposta de `/api/orders`, inclusive erros de configuração e indisponibilidade, deve usar `Content-Type: application/json; charset=utf-8`.
