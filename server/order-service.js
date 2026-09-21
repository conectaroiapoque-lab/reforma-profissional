"use strict";
const crypto=require("node:crypto");
const {getServiceByCode,CATALOG_VERSION}=require("../catalog");
const {createCatalogPricingSnapshot}=require("../services/pricing-engine");
const {createOrder}=require("../domain/order-engine");
const {createOrderResponsibilityMatrix}=require("../domain/launch-compliance");
const {recordCustomerTermsAcceptance}=require("./contract-authority");
const allowedMaterialModes=new Set(["NONE","CUSTOMER_SUPPLIED","PARTNER_PURCHASE"]);
const states=new Set(["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"]);
function bad(code){throw Object.assign(new Error(code),{statusCode:400});}
function assertText(value,name,max=500){if(typeof value!=="string"||!value.trim()||value.length>max)bad(`INVALID_${name.toUpperCase()}`);return value.trim();}
function assertLocation(location){if(location==null)return null;if(typeof location!=="object"||location.consent!==true||typeof location.latitude!=="number"||typeof location.longitude!=="number"||!Number.isFinite(location.latitude)||!Number.isFinite(location.longitude)||location.latitude< -90||location.latitude>90||location.longitude< -180||location.longitude>180)bad("INVALID_LOCATION_COORDINATES");return{latitude:location.latitude,longitude:location.longitude,accuracy:Number.isFinite(location.accuracy)&&location.accuracy>=0?location.accuracy:null,capturedAt:location.capturedAt||new Date().toISOString(),source:"ONE_TIME_LOCATION",consent:true};}
function publicOrderView(order){return Object.freeze({orderId:order.orderId,protocol:order.protocol,serviceCode:order.serviceId,serviceName:order.serviceName,category:order.category,pricingMode:order.pricingMode,price:order.pricingMode!=="QUOTE"?{amountCents:order.pricingSnapshot.customerFinalTotalCents,currency:"BRL",isStartingAt:order.pricingMode==="FROM"}:null,status:order.status,scheduledAt:order.scheduledAt,createdAt:order.createdAt,catalogVersion:order.catalogVersion});}
async function createCustomerOrder(input,{repository,idempotencyKey,privateFileStorage}){
 if(!idempotencyKey)bad("IDEMPOTENCY_KEY_REQUIRED");
 const service=getServiceByCode(input?.serviceCode);if(!service)bad("UNKNOWN_OFFICIAL_SERVICE");
 const address=input.address||{},postalCode=assertText(address.postalCode,"postal_code",9),state=assertText(address.state||address.uf,"state",2).toUpperCase();
 if(!/^\d{5}-?\d{3}$/.test(postalCode))bad("INVALID_POSTAL_CODE");if(!states.has(state))bad("INVALID_STATE");
 const sanitized={description:assertText(input.description,"description"),address:{street:assertText(address.street,"street",120),number:assertText(address.number,"number",20),complement:typeof address.complement==="string"?address.complement.slice(0,80):"",neighborhood:assertText(address.neighborhood,"neighborhood",80),city:assertText(address.city,"city",80),postalCode:postalCode.replace(/^(\d{5})(\d{3})$/,"$1-$2"),state,uf:state,reference:typeof address.reference==="string"?address.reference.slice(0,120):""},urgency:["Agora","Hoje","Amanhã","Agendar"].includes(input.urgency)?input.urgency:null,materialMode:allowedMaterialModes.has(input.materialMode)?input.materialMode:"NONE",customer:{name:assertText(input.customer?.name,"customer_name",120),whatsapp:assertText(input.customer?.whatsapp,"customer_phone",30),marketingConsent:input.marketingConsent===true},location:assertLocation(input.location)};
 if(!sanitized.urgency)bad("INVALID_URGENCY");
 const pricingSnapshot=service.pricingMode!=="QUOTE"?createCatalogPricingSnapshot(service.code):null,customerId=`CUS-${crypto.randomUUID()}`,order=createOrder({customerId,serviceId:service.code,category:service.category,description:sanitized.description,latitude:sanitized.location?.latitude,longitude:sanitized.location?.longitude,address:sanitized.address,pricingSnapshot,scheduledAt:input.scheduledAt||null,materialMode:sanitized.materialMode,actor:"CUSTOMER"},`server:${idempotencyKey}`);
 let evidenceId=null;if(input.photo){if(!privateFileStorage)throw Object.assign(new Error("PRIVATE_FILE_STORAGE_REQUIRED"),{statusCode:503});const stored=await privateFileStorage.put({ownerId:customerId,purpose:"ORDER_PROBLEM",originalName:input.photo.originalName,mimeType:input.photo.mimeType,bytes:Buffer.from(input.photo.base64||"","base64")});evidenceId=stored.evidenceId;}
 Object.assign(order,{serviceName:service.name,pricingMode:service.pricingMode,quoteStatus:service.pricingMode==="QUOTE"?"CUSTOMER_REQUEST":null,quoteHistory:service.pricingMode==="QUOTE"?["CUSTOMER_REQUEST"]:[],catalogVersion:CATALOG_VERSION,customer:sanitized.customer,location:sanitized.location,urgency:sanitized.urgency,evidenceId,responsibilityMatrix:createOrderResponsibilityMatrix(order.orderId),termsAcceptance:recordCustomerTermsAcceptance({customerId,orderId:order.orderId,accepted:input.termsAcceptance?.accepted,displayedDocumentVersion:input.termsAcceptance?.displayedDocumentVersion})});
 const saved=await repository.create(order,idempotencyKey);return{order:saved,publicView:publicOrderView(saved)};
}
module.exports={createCustomerOrder,publicOrderView,assertLocation};
