# Correção do Vercel Preview — PR #27

## Causa confirmada

A alteração anterior materializou cada ação operacional como um arquivo separado dentro de `api/**`. O deployment passou a conter **33 Vercel Functions**, acima do limite de **12 Functions por deployment no plano Hobby** usado pelo Preview. O build web em si estava válido; a falha acontecia na etapa de montagem do deployment serverless.

Não houve evidência de dependência ausente, import relativo inválido, inicialização de Redis durante import ou sintaxe inválida do `vercel.json`. A regra canônica permanece no formato suportado: `source: /:path*`, condição `has` do tipo `host` e destino HTTPS absoluto.

## Correção aplicada

As rotas operacionais foram consolidadas em cinco Functions catch-all:

- `api/admin/[...path].js`;
- `api/provider/[...path].js`;
- `api/customer/[...path].js`;
- `api/finance/[...path].js`;
- `api/compliance/[...path].js`.

Os mesmos caminhos públicos são despachados server-side para os handlers já aprovados. Somadas às seis Functions independentes existentes, o deployment agora contém **11 Functions**. Nenhum catálogo, preço, contrato, regra comercial, layout ou fluxo operacional foi alterado.

## Garantias

O teste `test/vercel-functions.test.js` remove todas as variáveis privadas e faz `require()` de cada arquivo JavaScript sob `api/**`. Isso comprova que Redis, autenticação, Mercado Pago e storage privado continuam lazy no import. A ausência de configuração permanece fail-closed somente quando a operação correspondente é invocada.

O mesmo teste fixa o teto em 11 Functions, verifica o despacho de todos os caminhos operacionais e preserva build, `outputDirectory`, CSP, HSTS e redirect canônico HTTPS.
