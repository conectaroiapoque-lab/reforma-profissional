"use strict";
const NOTIFICATION_EVENTS=Object.freeze(["NEW_ORDER","NEW_PROVIDER_OFFER","OFFER_EXPIRING","PROVIDER_ACCEPTED","PROVIDER_EN_ROUTE","PROVIDER_ARRIVED","SERVICE_STARTED","ADDITIONAL_QUOTE","SERVICE_COMPLETED","PAYMENT_CONFIRMED","PAYOUT_RELEASED"]);
class UiCommunicationProvider{constructor(handler=()=>{}){this.handler=handler;}sendMessage(message){return this.handler(message);}sendNotification(notification){return this.handler(notification);}maskContact(){return"Contato protegido";}}
function notify(provider,event,payload={}){if(!NOTIFICATION_EVENTS.includes(event))throw new Error("Evento de notificação inválido.");return provider.sendNotification({event,payload,timestamp:new Date().toISOString()});}
module.exports={NOTIFICATION_EVENTS,UiCommunicationProvider,notify};
