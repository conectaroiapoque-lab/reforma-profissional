# Reforma Profissional

MVP mobile first de um site/app PWA para solicitar e acompanhar serviços de reforma, manutenção e assistência residencial ou comercial. Feito somente com HTML, CSS e JavaScript puro, sem dependências, banco de dados ou arquivos binários.

## Funcionalidades

- Catálogo clicável de serviços, problemas comuns e obras.
- Solicitação em quatro passos com geolocalização e alternativa de endereço manual.
- Protocolo automático e persistência local via `localStorage`.
- Acompanhamento visual em sete etapas, prestador, horário estimado e mapa placeholder.
- Assistente inteligente simulado para direcionamento do serviço.
- Mensagens prontas para cliente, acompanhamento e prestador via WhatsApp.
- Painel administrativo local para designar prestadores e avançar status.
- PWA instalável com cache do app shell e experiência offline simples.
- Interface responsiva, sem imagens ou fontes externas obrigatórias.

> Este é um MVP de demonstração. Os dados ficam somente no navegador usado e não são compartilhados entre dispositivos.

## Arquivos

- `index.html`: estrutura e conteúdo acessível das telas.
- `styles.css`: design system, layout mobile first e responsividade.
- `app.js`: fluxo, geolocalização, dados simulados, WhatsApp e administração.
- `manifest.webmanifest`: metadados do PWA, sem ícones binários nesta versão.
- `sw.js`: cache básico e fallback offline.

## Como testar localmente

Não é necessário executar `npm install`. Como service workers e geolocalização exigem um contexto seguro, sirva a pasta em `localhost`:

```bash
python3 -m http.server 8000
```

Acesse `http://localhost:8000`. Teste o catálogo, envie uma solicitação, abra **Acompanhar Serviço** e use **Painel Admin** para designar um prestador e alterar o status. No DevTools, use o modo responsivo e a aba *Application* para verificar manifest, service worker, cache e `localStorage`.

## Publicação na Vercel

1. Importe este repositório no painel da Vercel.
2. Selecione a branch `main` e o diretório raiz do projeto.
3. Em **Framework Preset**, escolha **Other**.
4. Deixe **Build Command** vazio e defina **Output Directory** como `.`.
5. Clique em **Deploy**.

Também é possível usar a CLI (`vercel` e depois `vercel --prod`), mas ela é opcional. Todos os caminhos são relativos e compatíveis com hospedagem estática.

## Configuração rápida

O número central do WhatsApp está na constante `WHATSAPP_NUMBER`, no início de `app.js`. Altere-o mantendo o código do país e DDD, somente com números.

## Próximos passos para produção

1. **Banco de dados:** adotar uma API e banco como PostgreSQL/Supabase para sincronização, auditoria e histórico.
2. **Login e perfis:** autenticar clientes, prestadores e administradores, com permissões e verificação de identidade.
3. **Mapa em tempo real:** integrar Google Maps ou Mapbox, geocodificação, rotas e posição consentida do prestador.
4. **IA real:** enviar texto e fotos para uma API segura no backend, com triagem, limites e revisão humana.
5. **Push:** implementar Web Push com consentimento, chaves VAPID e eventos gerados pelo backend.
6. **Operação:** criar disponibilidade, área de cobertura, preços/orçamentos, agenda, avaliações e canais de suporte.
7. **Segurança e privacidade:** termos jurídicos, LGPD, criptografia, retenção de dados, logs e proteção contra abuso.
8. **PWA completo:** adicionar ícones próprios em múltiplos tamanhos, atalhos e screenshots quando os ativos visuais forem aprovados.

