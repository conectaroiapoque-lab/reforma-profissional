# Google Play — checklist de release

- [x] Package ID `br.com.reformaprofissional.app`, nome e versão `1.0.0` (`versionCode 1`).
- [x] `compileSdk` e `targetSdk` 36; `minSdk` 23 preservado.
- [x] Ícone adaptativo e splash estruturados a partir da identidade oficial.
- [ ] Gerar ícone PNG 512×512, feature graphic e screenshots finais a partir da arte oficial.
- [x] Política: `https://www.reformaprofissional.com.br/privacidade/`; termos: `/termos/prestador/`.
- [ ] Preencher Data Safety, classificação de conteúdo, store listing e instruções de acesso com dados reais.
- [ ] Criar assinatura fora do repositório, gerar AAB assinado e substituir `ANDROID_SIGNING_CERT_SHA256_REQUIRED` em `assetlinks.json` pela impressão real (`keytool -list -v -keystore <arquivo> -alias <alias>`).
- [ ] Validar o AAB em SDK Android 36 e Play Console. Nenhuma assinatura, conta ou aprovação foi presumida.
