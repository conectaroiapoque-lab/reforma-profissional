# Integração NFS-e — desenho DRAFT

`legalReviewRequired = true` · `accountingReviewRequired = true`

1. Resolver emissor, tomador, município, regime e modelo fiscal da OS.
2. Solicitar emissão no adaptador municipal/nacional; nunca guardar credencial gov.br.
3. Persistir protocolo idempotente, número, código de verificação e resposta minimizada.
4. Validar autenticidade, valor, participantes e cancelamento por processo assíncrono.
5. Converter indisponibilidade externa em `TAX_SYSTEM_UNAVAILABLE` e fila humana.
6. Registrar auditoria sem expor documento ou perfil tributário às visões indevidas.

MEI e demais PJ/PF não compartilham regra por conveniência. A exigência candidata para ME/EPP em 2026-11-01 permanece inativa até validação da fonte oficial e da contabilidade.
