"use strict";
const {isDeepStrictEqual:equal}=require('node:util');
const fail=code=>{throw Object.assign(new Error(code),{statusCode:409})};
const content=q=>q&&Object.fromEntries(Object.entries(q).filter(([k])=>!['customerDecision','reviewedAt','reviewedBy'].includes(k)));
function preserve(previous,next){
 const history=previous.quoteSnapshots||[];
 if(!equal(next.quoteSnapshots||[],history))fail('IMMUTABLE_QUOTE_HISTORY');
 if(previous.quote&&next.quote?.quoteId===previous.quote.quoteId&&!equal(content(previous.quote),content(next.quote)))fail('IMMUTABLE_QUOTE_CONTENT');
 const approved=previous.quote&&(previous.quote.customerDecision?.decision==='APPROVE'||['CUSTOMER_APPROVED','PROVIDER_AUTHORIZED','SERVICE_STARTED','SERVICE_COMPLETED'].includes(previous.quoteStatus));
 if(approved&&!equal(previous.quote,next.quote))fail('APPROVED_QUOTE_IMMUTABLE_USE_ADDENDUM');
 if(approved&&!equal(previous.pricingSnapshot,next.pricingSnapshot))fail('APPROVED_PRICING_SNAPSHOT_IMMUTABLE');
 const snapshots=structuredClone(history);
 function append(order,legacy=false){
  if(!order.quote)return;
  const last=snapshots.at(-1);
  if(last&&equal(last.quote,order.quote)&&last.status===order.quoteStatus)return;
  const ids=[...new Set(snapshots.map(s=>s.quoteId))];if(!ids.includes(order.quote.quoteId))ids.push(order.quote.quoteId);
  snapshots.push({quoteId:order.quote.quoteId,version:ids.indexOf(order.quote.quoteId)+1,eventVersion:snapshots.length+1,origin:legacy?'LEGACY_CAPTURE':'APPLICATION',recordedAt:new Date().toISOString(),actor:order.quote.customerDecision?.customerId||order.quote.reviewedBy||order.auditTrail?.at(-1)?.actor||null,serviceCode:order.quote.serviceCode||order.serviceId,serviceName:order.serviceName||null,catalogVersion:order.quote.catalogVersion||order.catalogVersion||null,description:order.quote.description||null,scope:order.quote.scope||order.quote.description||null,quantity:order.quote.quantity??null,unit:order.quote.unit??null,commercialConditions:structuredClone(order.quote.commercialConditions||order.termsAcceptance||null),pricingSnapshot:structuredClone(order.pricingSnapshot||null),quote:structuredClone(order.quote),status:order.quoteStatus||null,approval:structuredClone(order.quote.customerDecision||null),changeOrder:structuredClone(order.changeOrder||null)});
 }
 if(previous.quote&&!snapshots.length)append(previous,true);
 append(next);
 // Additional agreements have their own immutable lifecycle snapshots.
 const additions=previous.addendumSnapshots||[];
 if(!equal(next.addendumSnapshots||[],additions))fail('IMMUTABLE_ADDENDUM_HISTORY');
 if(previous.changeOrder?.status==='APPLIED'&&next.changeOrder?.changeOrderId===previous.changeOrder.changeOrderId&&!equal(previous.changeOrder,next.changeOrder))fail('APPROVED_ADDENDUM_IMMUTABLE');
 next.addendumSnapshots=structuredClone(additions);
 if(previous.changeOrder&&!additions.length)next.addendumSnapshots.push({version:1,origin:'LEGACY_CAPTURE',recordedAt:new Date().toISOString(),changeOrder:structuredClone(previous.changeOrder)});
 if(next.changeOrder&&!equal(previous.changeOrder,next.changeOrder))next.addendumSnapshots.push({version:next.addendumSnapshots.length+1,recordedAt:new Date().toISOString(),changeOrder:structuredClone(next.changeOrder)});
 next.quoteSnapshots=snapshots;return next;
}
module.exports={preserve};
