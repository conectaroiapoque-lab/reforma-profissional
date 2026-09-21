"use strict";
const allowed=Object.freeze({
  admin:Object.freeze({provider:new Set(["approve","review","start-review","validate-document","reject-document","request-correction","suspend","reactivate","note"]),order:new Set(["assign-provider","approve-quote","authorize-service","review-change-order"])}),
  provider:new Set(["accept","decline","arrive","start","complete","quote","fiscal-document","change-order"]),
  customer:new Set(["quote-decision","change-order-decision"])
});
function pathSegments(request){
  const value=request.query?.path;
  if(Array.isArray(value))return value.filter(Boolean);
  if(typeof value==="string")return value.split("/").filter(Boolean);
  return[];
}
function resolveOperationalPath(scope,segments){
  const [resource,id,action,...extra]=segments;
  if(extra.length)return null;
  if(scope==="admin"){
    if(!id&&["orders","providers"].includes(resource))return{route:resource};
    if(resource==="provider"&&id&&!action)return{route:"provider",id};
    if(id&&allowed.admin[resource]?.has(action))return{id,action};
  }
  if(scope==="provider"){
    if(!id&&["profile","opportunities","orders","background-check"].includes(resource))return{route:resource};
    if(resource==="documents"&&id&&!action)return{route:"documents",id};
    if(resource==="orders"&&id&&allowed.provider.has(action))return{id,action};
  }
  if(scope==="customer"&&resource==="orders"&&id&&(!action||allowed.customer.has(action)))return{id,action};
  if(scope==="finance"){
    if(resource==="orders"&&!id)return{route:"orders"};
    if(resource==="order"&&id&&action==="review-fiscal-document")return{id,action};
  }
  if(scope==="compliance"&&resource==="provider"&&id&&action==="background-check")return{id,action};
  return null;
}
function routeRequest(request,resolved){Object.assign(request,resolved);return request;}
module.exports={pathSegments,resolveOperationalPath,routeRequest};
