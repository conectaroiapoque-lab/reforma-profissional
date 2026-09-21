# Google Maps — produção

A única API obrigatória nesta versão é **Geocoding API**, consumida exclusivamente pelo servidor em `server/geocoding-provider.js`. Configure `GOOGLE_MAPS_GEOCODING_API_KEY` no cofre do ambiente, nunca no bundle ou no Git. Restrinja a chave à Geocoding API e às origens/infra de produção admitidas pelo Google Cloud. Sem chave, o endpoint falha de forma controlada e o usuário continua pelo CEP/endereço manual.

Places API e Maps JavaScript API **não são usadas** e não devem ser ativadas. Se autocomplete/mapa for aprovado no futuro, use uma chave distinta (`GOOGLE_MAPS_BROWSER_API_KEY`) restrita à API necessária e aos referers `https://reformaprofissional.com.br/*` e `https://www.reformaprofissional.com.br/*`.
