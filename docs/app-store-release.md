# Release na App Store e TestFlight

## App Store Connect

- [ ] Apple Developer Account e contrato ativo; acesso ao App Store Connect.
- [ ] Confirmar Bundle ID, nome, subtítulo, descrição, palavras-chave e categoria.
- [ ] Informar política de privacidade, URL e e-mail de suporte publicados.
- [ ] Aprovar AppIcon/Splash oficiais e screenshots de iPhone; fornecer screenshots de iPad quando o target o suportar.
- [ ] Preencher classificação etária, App Privacy e Data Collection conforme `app-store-privacy.md`.
- [ ] Explicar uso contextual de localização, câmera, fotos e notificações.
- [ ] Confirmar Team, assinatura, certificados e provisioning profiles reais fora do Git.
- [ ] Substituir `APPLE_TEAM_ID` no AASA publicado e validar Associated Domains.

## Build e distribuição

1. Em macOS, execute `npm install`, `npm run build`, `npx cap sync ios` e `npx cap open ios`.
2. Confira Version, Build, Deployment Target, permissões e target universal iPhone/iPad.
3. Selecione **Any iOS Device (arm64)**, execute **Product > Archive**, **Validate App** e **Distribute App**.
4. Faça upload ao App Store Connect; nunca versione credenciais ou chaves APNs.
5. No TestFlight, crie grupo interno, selecione testers e registre notas de teste. Para teste externo, preencha Beta App Review e aguarde aprovação.
6. Colete feedback sem dados pessoais desnecessários, revise crashes no Organizer/App Store Connect e promova o build aprovado para revisão Apple/release manual.

## Pagamentos e revisão

A plataforma intermedeia **serviços físicos executados fora do dispositivo**. O pagamento da mão de obra usa o fluxo externo existente; Apple In-App Purchase não é integrado como padrão. Antes do envio, confirmar essa interpretação com as políticas vigentes e explicar o modelo nas Review Notes. O motor financeiro, snapshots, ledger, taxas, tributos, materiais e remuneração não são alterados pelo shell mobile.
