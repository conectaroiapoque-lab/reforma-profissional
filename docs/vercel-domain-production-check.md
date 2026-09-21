# Auditoria de domínio/Vercel — incidente CSS

**Data da auditoria:** 19/09/2026  
**Domínio canônico oficial:** `https://www.reformaprofissional.com.br` (`www`)
**Checkout auditado:** `fa1e6d7` — merge commit da PR #31  
**Resultado externo deste ambiente:** `NOT_TESTABLE` — o proxy recusou HTTPS com `403` antes de alcançar os hosts e o resolvedor DNS configurado recusou/expirou as consultas. Esses `403` não são respostas dos sites e não provam falha na Vercel.

## Evidência versionada

- `vercel.json` não contém redirect de host. Vercel Domains é a única autoridade do redirect permanente `apex → www`, evitando uma regra contraditória `www → apex` e o consequente ciclo.
- O projeto esperado na Vercel é **`reforma-profissional`**, ligado ao repositório GitHub **`conectaroiapoque-lab/reforma-profissional`**, Production Branch **`main`**, Root Directory na raiz, Framework Preset **Other**, Build Command **`npm run build:web`** e Output Directory **`dist`**.
- O build injeta no HTML `<meta name="rp-release" content="<short-sha>">`. Na Vercel, a fonte é `VERCEL_GIT_COMMIT_SHA`; localmente, o fallback é `git rev-parse HEAD`. Assim, os dois hosts só podem ser considerados no mesmo release quando terminarem em `www` e exibirem o mesmo marcador.
- O service worker é publicado em `/sw.js`, registrado com URL raiz e, portanto, escopo padrão `/`. `www` e apex são origens distintas: cada uma possui registros, Cache Storage e dados próprios. Um redirect de rede não remove automaticamente um worker antigo já instalado na outra origem.

## Validação no painel Vercel (não confundir Preview com Production)

1. Abra **Vercel → projeto `reforma-profissional` → Settings → Git**.
2. Confirme o repositório `conectaroiapoque-lab/reforma-profissional` e Production Branch `main`.
3. Em **Settings → Build and Deployment**, confirme Root Directory raiz, `npm run build:web` e `dist`. Remova overrides divergentes no painel somente após registrar uma captura da configuração anterior.
4. Em **Deployments**, filtre **Environment = Production**. Confirme que o deployment atual foi criado do commit de merge da PR #31 (`fa1e6d7` na auditoria) ou de um descendente de `main`. Um Preview verde não comprova isso.
5. Abra esse deployment e confira **Domains/Aliases**. Os dois domínios devem pertencer a este mesmo projeto; `www` deve ser o domínio canônico de produção e o apex deve redirecionar uma única vez para ele. Se um domínio estiver em outro projeto, remova-o do projeto antigo e associe-o a este projeto pelo painel, sem promover Preview.
6. Em **Settings → Domains**, use **Refresh/Verify** para ambos. Registre os valores que a própria Vercel indicar antes de mudar DNS.
7. Consulte o HTML de produção e procure `meta[name="rp-release"]`. Compare o SHA curto com o commit do deployment Production. Ausência do meta significa que produção ainda não recebeu o build que contém o marcador.

## Validação DNS no Registro.br

Não alterar DNS automaticamente. No editor da zona, comparar os valores atuais com os valores exibidos em **Vercel → Domains** para este projeto:

- **Apex (`@`)**: deve usar exatamente o registro recomendado pela Vercel para o domínio apex (normalmente um registro `A`/ALIAS indicado no painel), sem registros `A`/`AAAA` conflitantes de Hostinger, hospedagem antiga ou outro projeto.
- **`www`**: deve usar exatamente o CNAME recomendado pela Vercel, sem `A`, `AAAA`, URL forwarding ou CNAME concorrente. Ele é o destino canônico; o redirect `apex → www` é gerenciado somente por Vercel Domains, nunca por uma regra inversa no `vercel.json`.
- Verifique a zona autoritativa (nameservers do Registro.br). Editar uma zona da Hostinger que já não é autoritativa — ou o inverso — não muda a resolução pública.
- Depois da correção manual, aguarde o TTL, execute consultas contra ao menos dois resolvedores públicos e confirme que ambos chegam à Vercel. DNS sozinho não identifica o projeto: a associação dos domínios no painel também precisa estar correta.

Comandos sugeridos:

```sh
dig +short NS reformaprofissional.com.br
dig +noall +answer reformaprofissional.com.br A AAAA
dig +noall +answer www.reformaprofissional.com.br CNAME A AAAA
```

## Comparação HTTP e de assets

Execute fora de uma rede que intercepte os hosts. Primeiro salve cabeçalhos e HTML sem seguir redirect; depois siga a cadeia:

```sh
for host in reformaprofissional.com.br www.reformaprofissional.com.br; do
  curl -sS -D "headers-$host.txt" -o "index-$host.html" "https://$host/"
  curl -sS -L -D "chain-$host.txt" -o "final-$host.html" "https://$host/"
done
```

O apex deve responder um único `301` ou `308` cujo `Location` preserve o caminho e a query e termine em `www`; `www` deve responder `200 text/html` sem redirect. Compare status, cadeia, `ETag`, `Cache-Control`, `Age`, HTML final, meta `rp-release` e URLs versionadas do CSS/JS. HTMLs finais e release devem coincidir; ETags podem variar por compressão/CDN e não são prova isolada.

Audite cada artefato **sem seguir redirect** em cada host, registrando `HTTP`, `Content-Type`, `Content-Length`, `ETag`, `Cache-Control`, `Age` e `Location`:

```sh
for host in reformaprofissional.com.br www.reformaprofissional.com.br; do
  for path in '/styles.css?v=7' '/app.js?v=13' '/sw.js' '/manifest.webmanifest' '/assets/brand/reforma-profissional-logo.svg'; do
    printf '\n=== https://%s%s ===\n' "$host" "$path"
    curl -sS -o /dev/null -D - "https://$host$path"
  done
done
```

No `www`, CSS deve ser `200` e `text/css`; JS deve ser `200` e MIME JavaScript (`text/javascript` ou `application/javascript`). SW, manifest e SVG devem ser `200` com MIME correspondente, nunca `text/html`. No apex, é esperado o redirect único para o mesmo path/query em `www`; seguindo-o, o resultado deve cumprir os mesmos requisitos. Se HTML e asset exibirem releases/origens incompatíveis, purgue/reimplante somente após identificar qual alias atende o deployment incorreto.

## Service worker e teste humano sem cache

Faça o procedimento separadamente em **cada origem** (`https://www...` e `https://...`):

1. Chrome → F12 → **Application → Service Workers → Unregister**.
2. **Application → Storage → Clear site data**.
3. Feche todas as abas daquela origem.
4. Abra primeiro `https://www.reformaprofissional.com.br/`, mantenha **Disable cache** ativo no Network e recarregue.
5. Confirme que `/sw.js` responde `200` JavaScript, que o registro mostra scope `https://www.reformaprofissional.com.br/` e que CSS/JS não retornam HTML.
6. Abra o apex; ele deve redirecionar imediatamente para `www` sem instalar um novo worker no apex.

## Matriz do incidente

| Item | Resultado em 19/09/2026 |
|---|---|
| Main SHA | `fa1e6d7` no checkout fornecido |
| PR #31 | `MERGED` no histórico local (`fa1e6d7`) |
| Apex release | `não verificável` externamente neste ambiente |
| WWW release | `não verificável` externamente neste ambiente |
| Mesmo deployment | `NOT_TESTABLE` |
| Redirect | `NOT_TESTABLE` externamente; configuração versionada coerente |
| CSS apex / www | `NOT_TESTABLE` |
| Service worker apex / www | `NOT_TESTABLE`; isolamento por origem exige limpeza dupla |
| Projeto Vercel correto | `NOT_TESTABLE` sem acesso ao painel |
| DNS | `EXTERNAL_VALIDATION_REQUIRED` |

**Causa mais provável, ainda não comprovada:** alias/domínio de produção associado a deployment ou projeto anterior, possivelmente agravado por service worker/cache separado por origem. O repositório já contém URLs raiz versionadas e validação de MIME; portanto não se deve editar novamente `styles.css` ou `sw.js` antes de obter o release marker e os cabeçalhos reais.

**Ação manual necessária:** executar as verificações de painel, DNS, HTTP e limpeza por origem acima; reassociar os aliases ao deployment Production correto e redeployar `main` apenas se o SHA servido divergir. Não promover Preview nem modificar catálogo, preços, contratos, identidade, geolocalização, APIs ou regras comerciais.
