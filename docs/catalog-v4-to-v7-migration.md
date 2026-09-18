# Migração explícita V4 → V7 Launch

- origem preservada: `catalog-v4.js`, `RMBH-2026-09-v4`, vigência 15/09/2026;
- destino ativo: `catalog.js`, `RMBH-2026-09-v7-launch`, vigência 21/09/2026;
- rollback: restaurar o entrypoint público e o import do servidor para `catalog-v4.js`, rebuildar e executar a suíte;
- `FIXED`: valores inteiros comercialmente aplicáveis foram reduzidos em R$ 0,10, nunca aumentados;
- `FROM`: continua mínimo e exibe “A partir de”; `QUOTE`: continua sem valor;
- decisões explicitamente aprovadas da V6 foram incorporadas; a V6 permanece `DRAFT`.

A migração deve ser registrada no deploy e nunca reescrever snapshots de OS anteriores.
