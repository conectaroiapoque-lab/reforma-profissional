# Validação manual do domínio de produção

**Classificação nesta revisão:** `EXTERNAL_VALIDATION_REQUIRED`. A configuração versionada foi auditada, mas DNS, certificado e o deployment associado precisam ser conferidos pelo proprietário no projeto Vercel.

## Pré-condições

1. No painel Vercel, confirme que `reformaprofissional.com.br` e `www.reformaprofissional.com.br` pertencem ao deployment de produção desta branch após merge autorizado.
2. Confirme que o apex é o domínio primário e que a emissão do certificado aparece como válida.
3. Execute os passos abaixo em janela anônima, sem ignorar avisos TLS, e guarde capturas com data/hora e o deployment SHA.

## Checklist exato

1. **Abrir domínio:** abra `https://reformaprofissional.com.br/` e confirme HTTP 200 e a aplicação correta.
2. **Validar cadeado HTTPS:** inspecione o certificado no cadeado; valide nome, cadeia, validade e ausência de aviso.
3. **Testar www:** abra `https://www.reformaprofissional.com.br/`; confirme redirect permanente para o apex em HTTPS, preservando o caminho.
4. **Testar sem www:** abra diretamente o apex e confirme que não há loop nem downgrade para HTTP.
5. **Testar `/api/orders`:** envie `GET https://reformaprofissional.com.br/api/orders`; o esperado é 405 JSON, provando que a Function existe sem criar pedido. Depois faça um POST de homologação válido com `Content-Type: application/json` e `Idempotency-Key`, confirmando resposta 201 uma única vez.
6. **Testar `/termos/cliente`:** confirme HTTP 200, conteúdo correto, responsividade e aceite inicialmente desabilitado.
7. **Testar `/termos/prestador`:** confirme HTTP 200, conteúdo correto, responsividade e aceite inicialmente desabilitado.
8. **Testar PWA:** em DevTools > Application, valide manifest, ícones e service worker; confirme que `/api/` não entra no Cache Storage.
9. **Verificar console:** recarregue cada rota e confirme ausência de erros, mixed content, CSP e falhas de service worker.
10. **Verificar rede:** marque Preserve log, confirme HTTPS em todos os requests, HSTS e demais headers, ausência de redirects para HTTP, APIs `no-store` e nenhum 404/5xx inesperado.

Registre PASS/FAIL por item. Qualquer falha de TLS, redirect, Function ou mixed content mantém H-01 aberto.
