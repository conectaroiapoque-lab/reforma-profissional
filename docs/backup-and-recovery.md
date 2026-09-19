# Backup e recuperação

## Escopo persistido
Pedidos, aceites, trilhas de estado, cadastros, metadados e conteúdo privado são persistidos no datastore Redis/KV configurado por `KV_REST_API_URL` e `KV_REST_API_TOKEN`. Arquivos privados usam chaves `private-file:*`; não são publicados no build. Segredos de sessão e do Mercado Pago pertencem ao cofre do ambiente e não ao backup da aplicação.

## Política necessária para produção

- **Frequência:** snapshot diário e exportação incremental conforme capacidade do provedor.
- **Retenção:** 30 snapshots diários e 12 mensais, sujeitos à política LGPD e obrigação legal aplicável.
- **Responsável:** deve ser formalmente designado pelo proprietário da operação antes do go-live.
- **Restauração:** criar instância isolada, restaurar o snapshot, validar contagens e amostras por prefixo, rotacionar credenciais e só então alterar o endpoint da aplicação.
- **Teste:** restore trimestral em ambiente isolado, com data, responsável, RPO/RTO observado e evidência no registro operacional.

## Bloqueador operacional

O repositório não comprova que snapshots, retenção, responsável e teste de restore estejam ativados no provedor. O responsável pela infraestrutura deve habilitá-los e executar um restore antes de declarar `BACKUP: PRONTO`. A aplicação falha fechada se o datastore não estiver configurado; isso não substitui backup.
