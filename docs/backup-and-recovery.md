# Backup e recuperação do datastore

Produção usa Redis/KV compatível com a API REST Upstash (`KV_REST_API_URL` e `KV_REST_API_TOKEN`). Pedidos, cadastros, aceites, trilhas e arquivos privados são chaves do datastore; segredos do ambiente não entram no backup.

## Exportação operacional

Use credencial read-only quando o provedor permitir, diretório criptografado e namespace explícito:

```sh
node scripts/backup-datastore.js /cofre/backup-AAAA-MM-DD.json
```

Por padrão, o export cobre exatamente as chaves reais `order:*`, `order-idempotency:*`, `orders`, `provider:*`, `providers` e `private-file:*`; uma allowlist alternativa pode ser fornecida em `BACKUP_KEY_PATTERNS`. O arquivo é criado com modo `0600`, nunca sobrescrito, inclui tipo, TTL e checksum SHA-256. O diretório `backups/` é ignorado pelo Git. Transfira o artefato imediatamente a armazenamento criptografado, imutável e com acesso auditado. Política mínima: diário, 30 diários e 12 mensais, respeitando retenção LGPD.

Além do export lógico, habilite os backups nativos/PITR no painel do provedor conforme o plano contratado. Registre responsável, data, região, retenção e evidência do painel.

## Restore seguro e prova trimestral

O utilitário rejeita destinos que não iniciem por `restore-test-` e exige confirmação explícita; ele **não restaura sobre produção**:

```sh
RESTORE_CONFIRM=ISOLATED_RESTORE_ONLY \
RESTORE_TARGET_NAMESPACE=restore-test-2026q3 \
node scripts/restore-datastore.js /cofre/backup-AAAA-MM-DD.json
```

Em uma instância/credencial isolada: escreva registros sentinela; exporte; remova somente os sentinelas de teste; restaure no namespace `restore-test-*`; leia; compare contagem e checksum; documente RPO/RTO; destrua a credencial e o namespace após preservar a evidência. Para desastre real, restaure primeiro em nova instância pelo procedimento oficial do provedor, valide e somente então faça troca controlada do endpoint. Nunca execute `FLUSHDB`, `DEL production:*` ou o script de restore contra o namespace de produção.
