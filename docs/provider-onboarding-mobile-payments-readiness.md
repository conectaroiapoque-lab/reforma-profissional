# Readiness — onboarding, mobile e pagamentos

Base: `9fbaefb283ea338df490514aeb9bd4e2b95dcb79`. Cadastro mobile-first, login/painel via API, validação de CPF/endereço/coordenadas, uploads privados e projeções allowlist foram preparados. Documentos e antecedentes permanecem sujeitos a revisão humana; não há tracking contínuo. Distância de matching é **distância aproximada em linha geodésica**, não rodoviária.

Android está configurado para API 36, mas AAB e Digital Asset Links dependem de SDK/assinatura reais. iOS depende de Mac/Xcode/signing e AppIcon final. Google reverse geocode depende de `GOOGLE_MAPS_GEOCODING_API_KEY`. Mercado Pago permanece fail closed e depende das credenciais existentes; split não foi ativado. Storage de produção deve usar adapter privado (Redis atual ou, mediante configuração explícita, Vercel Blob Private, S3 private ou Cloudflare R2 private). Revisão jurídica externa continua necessária.
