"use strict";
const {NOTIFICATION_EVENTS}=require("../services/notification-engine");
class PushAdapter{constructor(channel){if(!["WEB_PUSH","ANDROID_PUSH","IOS_PUSH"].includes(channel))throw new Error("Canal push inválido.");this.channel=channel;}async requestPermission(){throw new Error("Adapter push ainda não configurado.");}async register(){throw new Error("Adapter push ainda não configurado.");}async deliver(){throw new Error("Entrega push pertence ao backend.");}}
function createPushAdapter(platform){return new PushAdapter({web:"WEB_PUSH",android:"ANDROID_PUSH",ios:"IOS_PUSH"}[platform]);}
function validatePushEvent(event){if(!NOTIFICATION_EVENTS.includes(event))throw new Error("Evento push inválido.");return event;}
module.exports={PushAdapter,createPushAdapter,validatePushEvent,NOTIFICATION_EVENTS};
