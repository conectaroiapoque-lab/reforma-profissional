# iOS, iPhone e iPad

O iOS usa o mesmo `dist/`, serviços, catálogo e motores do Web/PWA/Android por meio do Capacitor. Não há segundo produto nem lógica de negócio duplicada. O Bundle ID provisório é lido de `config/app-config.js` e **é configuração a confirmar antes da publicação**.

## Gerar e abrir no macOS

```bash
npm install
npm run build
npx cap add ios              # somente na primeira geração
npx cap sync ios
npx cap open ios
```

O registry estava bloqueado por HTTP 403 no ambiente de preparação; por isso o projeto gerado e pods não são declarados como instalados. Os templates em `ios/App/App` devem ser incorporados após `cap add ios`: mescle as chaves de `Info.plist.template`, adicione `PrivacyInfo.xcprivacy` ao target e habilite **Associated Domains** com o valor de `App.entitlements.template`. Não substitua às cegas o Info.plist gerado.

No Xcode, abra `ios/App/App.xcworkspace`; selecione target **App**, uma Team real e **Signing & Capabilities**. Confira Bundle Identifier, Version `1.0.0`, Build `1` e Deployment Target suportado pelo Capacitor. Não há certificados/profiles no repositório. Em dispositivo/simulador, valide câmera, seleção de fotos, localização *When In Use*, notificações, rotação, teclado, iPhone e iPad. Portrait é prioritário pelo layout, mas landscape não é bloqueado.

As permissões são solicitadas somente no contexto da ação e com consentimento. Não se solicita localização em segundo plano nem rastreamento contínuo. A localização normalizada é uma captura pontual (`IOS_NATIVE`) e reutiliza o geo-engine compartilhado. A mensagem de notificação é referência documental; no iOS o prompt do sistema é controlado pelo sistema operacional.

Para publicar, use **Product > Archive**, depois **Validate App** e **Distribute App > App Store Connect**. O build iOS desta entrega foi **SKIPPED: requer macOS + Xcode**. AppIcon e Splash finais devem vir apenas dos ativos oficiais aprovados; os SVGs existentes são fonte de referência, não arte final automaticamente aprovada para a App Store.
