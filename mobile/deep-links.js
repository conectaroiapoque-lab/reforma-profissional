"use strict";
const app=require("../config/app-config");
const ROUTES=Object.freeze([
  {type:"SERVICE_REQUEST",pattern:/^\/solicitar-servico\/?$/},
  {type:"ORDER_TRACKING",pattern:/^\/pedido\/([A-Za-z0-9_-]+)\/?$/},
  {type:"PROVIDER_OPPORTUNITY",pattern:/^\/oportunidade\/([A-Za-z0-9_-]+)\/?$/},
  {type:"PAYMENT_RESULT",pattern:/^\/pagamento\/(sucesso|pendente|falha)\/?$/}
]);
function platformOf(value){return ["WEB","PWA","ANDROID","IOS"].includes(value)?value:"WEB";}
function handleDeepLink(rawUrl,{platform="WEB"}={}){let url;try{url=new URL(rawUrl,app.productionBaseUrl);}catch{return{matched:false,reason:"INVALID_URL"};}const allowed=new URL(app.productionBaseUrl);if(url.protocol!=="https:"||url.hostname!==allowed.hostname)return{matched:false,reason:"UNTRUSTED_ORIGIN"};for(const route of ROUTES){const match=url.pathname.match(route.pattern);if(match)return{matched:true,type:route.type,id:match[1]||null,platform:platformOf(platform),path:url.pathname};}return{matched:false,reason:"UNSUPPORTED_ROUTE",fallbackUrl:url.href};}
module.exports={ROUTES,handleDeepLink};
