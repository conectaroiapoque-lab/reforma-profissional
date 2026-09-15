"use strict";
function logEvent({event,orderId=null,providerId=null,timestamp=new Date().toISOString(),metadata={}}){if(!event)throw new TypeError("Evento obrigatório.");const safeMetadata=Object.fromEntries(Object.entries(metadata).filter(([key])=>!/(name|email|phone|whatsapp|address|cpf|cnpj|pix)/i.test(key)));const record={event,orderId,providerId,timestamp,metadata:safeMetadata};if(typeof console!=="undefined")console.info(JSON.stringify(record));return record;}
module.exports={logEvent};
