# Segurança, privacidade e operação

Princípios para produção: RBAC, menor privilégio, validação server-side, rate limiting, CSRF quando aplicável, proteção XSS, sanitização, idempotência, trilha de auditoria, expiração de token e gestão externa de segredos. Nenhum segredo deve existir no frontend.

A LGPD orienta finalidade, consentimento e minimização. A política local retém a última posição disponível do prestador por no máximo 24 horas e a localização vinculada à OS por 90 dias, sujeita à base legal e revisão; não há tracking infinito nem exposição entre prestadores.

Logs estruturados excluem chaves reconhecíveis de nome, contato, endereço, documentos e Pix. O antifraude combina sinais e retorna revisão/alto risco, mas nunca bloqueia automaticamente por um único sinal nem utiliza atributos protegidos.

Limitações: `localStorage`, idempotência em memória e controles client-side não protegem contra adulteração, concorrência entre dispositivos ou acesso físico. Produção exige autenticação, autorização, banco transacional, criptografia, storage privado, monitoramento e validação integral no servidor.
