"use strict";

const ORDER_STATUSES = Object.freeze(["REQUESTED","PRICING","SEARCHING_PROVIDER","OFFERED","PROVIDER_ACCEPTED","PROVIDER_EN_ROUTE","PROVIDER_ARRIVED","SERVICE_STARTED","ADDITIONAL_REVIEW","SERVICE_COMPLETED","CUSTOMER_VALIDATION","PAYMENT_CONFIRMED","PROVIDER_PAYOUT_PENDING","PROVIDER_PAID","CLOSED","CANCELLED","DISPUTED"]);
const transitions = Object.freeze({
  REQUESTED:["PRICING","CANCELLED"], PRICING:["SEARCHING_PROVIDER","CANCELLED"], SEARCHING_PROVIDER:["OFFERED","CANCELLED"],
  OFFERED:["SEARCHING_PROVIDER","PROVIDER_ACCEPTED","CANCELLED"], PROVIDER_ACCEPTED:["PROVIDER_EN_ROUTE","CANCELLED","DISPUTED"],
  PROVIDER_EN_ROUTE:["PROVIDER_ARRIVED","CANCELLED","DISPUTED"], PROVIDER_ARRIVED:["SERVICE_STARTED","CANCELLED","DISPUTED"],
  SERVICE_STARTED:["ADDITIONAL_REVIEW","SERVICE_COMPLETED","DISPUTED"], ADDITIONAL_REVIEW:["SERVICE_STARTED","CANCELLED","DISPUTED"],
  SERVICE_COMPLETED:["CUSTOMER_VALIDATION","DISPUTED"], CUSTOMER_VALIDATION:["PAYMENT_CONFIRMED","DISPUTED"],
  PAYMENT_CONFIRMED:["PROVIDER_PAYOUT_PENDING","DISPUTED"], PROVIDER_PAYOUT_PENDING:["PROVIDER_PAID","DISPUTED"], PROVIDER_PAID:["CLOSED","DISPUTED"], DISPUTED:["CLOSED","CANCELLED"]
});
const timestampFields = { PROVIDER_ACCEPTED:"acceptedAt", PROVIDER_ARRIVED:"providerArrivedAt", SERVICE_STARTED:"startedAt", SERVICE_COMPLETED:"completedAt", CANCELLED:"cancelledAt" };
const ids = new Map();
function useIdempotency(key, operation) { if (!key) throw new TypeError("idempotencyKey é obrigatória."); if (ids.has(key)) return ids.get(key); const result=operation(); ids.set(key,result); return result; }
function createOrder(input, idempotencyKey) { return useIdempotency(idempotencyKey,()=>{ const now=new Date().toISOString(); const orderId=input.orderId||`ORD-${Date.now()}-${Math.random().toString(36).slice(2,8)}`; return { orderId, protocol:input.protocol||orderId, customerId:input.customerId, serviceId:input.serviceId, category:input.category, description:input.description, latitude:input.latitude??null, longitude:input.longitude??null, address:input.address||null, pricingSnapshot:input.pricingSnapshot||null, providerId:null, providerOfferId:null, status:"REQUESTED", scheduledAt:input.scheduledAt||null, createdAt:now, acceptedAt:null, providerArrivedAt:null, startedAt:null, completedAt:null, cancelledAt:null, paymentStatus:"PENDING", providerPaymentStatus:"PENDING", materialMode:input.materialMode||"NONE", materialAmounts:input.materialAmounts||[], auditTrail:[{event:"ORDER_CREATED",from:null,to:"REQUESTED",actor:input.actor||"CUSTOMER",timestamp:now}] }; }); }
function transitionOrderStatus(order,nextStatus,actor) { if (!actor) throw new TypeError("Ator é obrigatório."); if (!ORDER_STATUSES.includes(nextStatus)||!transitions[order.status]?.includes(nextStatus)) throw new Error(`Transição inválida: ${order.status} → ${nextStatus}.`); const timestamp=new Date().toISOString(); return {...order,status:nextStatus,...(timestampFields[nextStatus]?{[timestampFields[nextStatus]]:timestamp}:{}),auditTrail:[...(order.auditTrail||[]),{event:"ORDER_STATUS_CHANGED",from:order.status,to:nextStatus,actor,timestamp}]}; }
function reserveOrderForProvider(order,{providerId,providerOfferId,idempotencyKey}) { return useIdempotency(idempotencyKey,()=>{ if (order.providerId||order.status!=="OFFERED") throw new Error("ORDER_ALREADY_RESERVED"); return transitionOrderStatus({...order,providerId,providerOfferId},"PROVIDER_ACCEPTED",`PROVIDER:${providerId}`); }); }
function resetIdempotencyForTests(){ids.clear();}
module.exports={ORDER_STATUSES,createOrder,transitionOrderStatus,reserveOrderForProvider,useIdempotency,resetIdempotencyForTests};
