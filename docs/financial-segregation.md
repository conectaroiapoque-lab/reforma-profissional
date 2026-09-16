# Segregação financeira

O catálogo público e as projeções por papel são listas de permissão, não filtros de bloqueio. O catálogo interno nunca é publicado em `globalThis`.

- **Cliente:** identificação e escopo, preço de mão de obra, venda de material, descontos, cashback utilizado e total final. Nunca recebe repasse, tributos, custos ou margem.
- **Prestador:** identificação/escopo, estimativas de deslocamento e duração, piso/repasse final e bônus. Nunca recebe preço do cliente ou margem.
- **Atendente:** por padrão, preço, total, modo e escopo. `CAN_VIEW_PROVIDER_PAYOUT` libera somente repasses; `CAN_VIEW_PLATFORM_MARGIN` libera a composição interna.
- **Admin:** preços, tier e repasses, receita da plataforma, perfil e estimativa tributária, custos variáveis, margem e estado econômico.
- **Financeiro:** composição necessária a conciliação, tributação, repasse e margem, sem dados pessoais desnecessários.

Snapshots são profundamente congelados, têm representação determinística e SHA-256 para detecção futura de alteração. O hash não substitui persistência segura no backend. O repositório atual é append-only; interfaces permitem futura implementação PostgreSQL/Supabase.
