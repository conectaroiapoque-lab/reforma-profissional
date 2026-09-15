# Reforma Profissional

## Canais suportados

- Web / site
- PWA instalável
- Android / Google Play
- iOS (iPhone e iPad) / Apple App Store

Os quatro canais compartilham a mesma aplicação, catálogo e lógica de negócio. Capacitor empacota o build Web em shells nativos; não existem cópias dos motores de pricing, geo, matching, pedidos ou pagamentos. A preparação de loja e TestFlight está em [`docs/ios.md`](docs/ios.md) e [`docs/app-store-release.md`](docs/app-store-release.md).

```bash
npm install
npm run build
npm run sync:android
npm run sync:ios
npm run open:android
npm run open:ios
```

O registry do ambiente de preparação recusou os pacotes Capacitor (HTTP 403). Assim, dependências e configuração estão declaradas, mas a geração/sincronização nativa precisa ser concluída quando o registry estiver disponível. iOS exige macOS e Xcode, Team/assinatura reais, identificadores confirmados, assets oficiais, validação de privacidade e metadata de loja; Android exige Android Studio/SDK e configuração de assinatura da Play. Nenhum segredo de loja integra o frontend.

MVP mobile first de um site/app PWA para solicitar e acompanhar serviços de reforma, manutenção e assistência residencial ou comercial. Feito somente com HTML, CSS e JavaScript puro, sem dependências, banco de dados ou arquivos binários.

## Funcionalidades

- Catálogo clicável de serviços, problemas comuns e obras.
- Solicitação em quatro passos com geolocalização e alternativa de endereço manual.
- Protocolo automático e persistência local via `localStorage`.
- Acompanhamento visual em sete etapas, prestador, horário estimado e mapa placeholder.
- Assistente inteligente simulado para direcionamento do serviço.
- Mensagens prontas para cliente, acompanhamento e prestador via WhatsApp.
- Painel administrativo local para designar prestadores e avançar status.
- Cadastro público do prestador em quatro etapas, aceite versionado e aprovação administrativa.
- Termos separados e legíveis para clientes e prestadores independentes.
- PWA instalável com cache do app shell e experiência offline simples.
- Interface responsiva, sem imagens ou fontes externas obrigatórias.

> Este é um MVP de demonstração. Os dados ficam somente no navegador usado e não são compartilhados entre dispositivos.

## Arquivos

- `index.html`: estrutura e conteúdo acessível das telas.
- `styles.css`: design system, layout mobile first e responsividade.
- `app.js`: fluxo, geolocalização, dados simulados, WhatsApp e administração.
- `provider.js`: regras de cadastro, termos versionados, privacidade de perfis e status de aprovação.
- `manifest.webmanifest`: metadados do PWA e ícones vetoriais instaláveis.
- `icons/`: ícones SVG textuais equivalentes aos tamanhos 192, 512 e 512 maskable; mantêm o PR livre de arquivos binários.
- `sw.js`: cache básico e fallback offline.
- `config/app-config.js`: identidade, versão e ambientes sem segredos.
- `mobile/`: deep links, localização, push, analytics e error reporting compartilhados.
- `ios/`: templates nativos auditáveis; o workspace é gerado pelo Capacitor no macOS.

## Como testar localmente

Não é necessário executar `npm install`. Como service workers e geolocalização exigem um contexto seguro, sirva a pasta em `localhost`:

```bash
python3 -m http.server 8000
```

Acesse `http://localhost:8000`. Teste o catálogo, envie uma solicitação, abra **Acompanhar Serviço** e use **Painel Admin** para designar um prestador e alterar o status. No DevTools, use o modo responsivo e a aba *Application* para verificar manifest, service worker, cache e `localStorage`.

### Ícones e entrega por pull request

Os três ícones do manifest são SVGs textuais versionáveis, sem conteúdo base64. O
formato vetorial permite declarar `sizes: "any"`; há duas opções de uso comum e
uma opção `maskable`, cuja marca respeita a zona segura central. Assim, o pacote
mantém os equivalentes de 192 px, 512 px e 512 px maskable sem anexar PNGs ao PR.

Para criar um PR, inclua normalmente `icons/*.svg`, `manifest.webmanifest` e
`sw.js` no commit. Nenhuma etapa de conversão ou upload binário é necessária, e
os caminhos publicados no manifest não devem ser alterados para `.png`.

## Publicação na Vercel

1. Importe este repositório no painel da Vercel.
2. Selecione a branch `main` e o diretório raiz do projeto.
3. Em **Framework Preset**, escolha **Other**.
4. Deixe **Build Command** vazio e defina **Output Directory** como `.`.
5. Clique em **Deploy**.

Também é possível usar a CLI (`vercel` e depois `vercel --prod`), mas ela é opcional. Todos os caminhos são relativos e compatíveis com hospedagem estática.

## Landing Pages Google Ads

O projeto inclui seis destinos públicos, rápidos e mobile first para campanhas de
Google Ads Search e seus sitelinks:

- `/eletricista-bh/`
- `/bombeiro-hidraulico-bh/`
- `/ar-condicionado-bh/`
- `/pedreiro-bh/`
- `/marido-de-aluguel-bh/`
- `/solicitar-servico/`

As cinco páginas de especialidade têm conteúdo próprio alinhado à intenção de
busca, aos serviços e ao CTA. A página `/solicitar-servico/` funciona como hub
para essas especialidades e para o aplicativo principal. Todas usam metadados
exclusivos, canonical, Open Graph, dados estruturados `Service`, conteúdo de SEO
local para Belo Horizonte e Região Metropolitana e links internos.

Os CTAs abrem o número central no WhatsApp com uma mensagem contextual. O script
compartilhado `landing-pages.js` registra a conversão já configurada no Google Ads
somente em um clique real nesses links; uma indisponibilidade da tag não bloqueia
a abertura do WhatsApp. Não há evento de conversão no carregamento da página.

## Configuração rápida

O telefone fixo para ligações é **(31) 2510-2500**. Os botões de WhatsApp usam o número Business `5531990102500`, configurado na constante `WHATSAPP_NUMBER`, no início de `app.js`, e abrem a conversa com a mensagem: “Olá, vim pelo app Reforma Profissional e quero solicitar um serviço.”

## Próximos passos para produção

### Limites do cadastro de prestadores

- O conteúdo dos documentos selecionados **não é persistido**; somente os nomes dos arquivos são registrados no navegador para demonstrar o fluxo.
- `localStorage` não é armazenamento seguro para documentos, contratos ou dados cadastrais de produção.
- Backend, banco de dados, storage privado, autenticação, permissões, trilha auditável, captura confiável de IP/user agent e assinatura eletrônica ainda precisam ser implementados.
- Os termos e o fluxo configurável de documento fiscal são preliminares e precisam de revisão jurídica, contábil e tributária antes do uso em produção.
- Uma nova versão dos termos deve usar um novo identificador e exigir novo aceite; registros anteriores não devem ser sobrescritos silenciosamente.

1. **Banco de dados:** adotar uma API e banco como PostgreSQL/Supabase para sincronização, auditoria e histórico.
2. **Login e perfis:** autenticar clientes, prestadores e administradores, com permissões e verificação de identidade.
3. **Mapa em tempo real:** integrar Google Maps ou Mapbox, geocodificação, rotas e posição consentida do prestador.
4. **IA real:** enviar texto e fotos para uma API segura no backend, com triagem, limites e revisão humana.
5. **Push:** implementar Web Push com consentimento, chaves VAPID e eventos gerados pelo backend.
6. **Operação:** criar disponibilidade, área de cobertura, preços/orçamentos, agenda, avaliações e canais de suporte.
7. **Segurança e privacidade:** termos jurídicos, LGPD, criptografia, retenção de dados, logs e proteção contra abuso.
8. **PWA completo:** os ícones vetoriais atuais atendem ao manifest sem arquivos binários; atalhos e screenshots podem ser adicionados quando os ativos visuais forem aprovados.

## Arquitetura marketplace on-demand — Fase 1

A evolução incremental para despacho sob demanda está documentada em:

- [Arquitetura e roadmap](docs/architecture.md)
- [Fluxo do marketplace](docs/marketplace-flow.md)
- [Pricing e integridade financeira](docs/pricing.md)
- [Geolocalização, ETA e matching](docs/geo-matching.md)
- [Segurança e LGPD](docs/security.md)
- [Contrato conceitual da API](docs/api-contract.md)

Os módulos locais são contratos e implementações leves para o MVP. Eles não substituem validação server-side, transações, autenticação ou infraestrutura de produção.
