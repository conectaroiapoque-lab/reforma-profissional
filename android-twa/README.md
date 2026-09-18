# Android / Google Play

O package reservado é `br.com.reformaprofissional.app`, versão `1.0.0` (`versionCode` 1). O PWA HTTPS pode ser empacotado por TWA após confirmar domínio. `public/.well-known/assetlinks.json` contém placeholder deliberado para o SHA-256 da assinatura: substitua pelo certificado real da conta, valide Digital Asset Links, gere splash/assets e então produza AAB assinado. Não há assinatura de produção inventada no repositório. Alternativamente, `npm run sync:android` gera/sincroniza o wrapper Capacitor quando Android SDK/JDK estiverem disponíveis.
