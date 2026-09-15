"use strict";

const environments=Object.freeze({
  development:Object.freeze({environment:"development",apiBaseUrl:"http://localhost:3000",webBaseUrl:"http://localhost:8000",deepLinkBaseUrl:"http://localhost:8000",loggingLevel:"debug"}),
  staging:Object.freeze({environment:"staging",apiBaseUrl:"https://staging-api.reformaprofissional.com.br",webBaseUrl:"https://staging.reformaprofissional.com.br",deepLinkBaseUrl:"https://staging.reformaprofissional.com.br",loggingLevel:"info"}),
  production:Object.freeze({environment:"production",apiBaseUrl:"https://api.reformaprofissional.com.br",webBaseUrl:"https://www.reformaprofissional.com.br",deepLinkBaseUrl:"https://www.reformaprofissional.com.br",loggingLevel:"warn"})
});

module.exports=Object.freeze({
  appName:"Reforma Profissional",
  iosBundleId:"br.com.reformaprofissional.app", // CONFIGURAÇÃO A CONFIRMAR ANTES DA PUBLICAÇÃO.
  androidApplicationId:"br.com.reformaprofissional.app",
  versionName:"1.0.0",
  versionCode:1,
  iosBuildNumber:"1",
  productionBaseUrl:environments.production.webBaseUrl,
  environments,
  getEnvironment(name=process.env.APP_ENV||"development"){if(!environments[name])throw new Error(`Ambiente inválido: ${name}`);return environments[name];}
});
