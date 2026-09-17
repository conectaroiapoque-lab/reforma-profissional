"use strict";
const {createCustomerOrder}=require("../server/order-service");const {productionRepository}=require("../server/order-repository");const {send,method,wrap}=require("../server/http");
function parseJsonRequest(req){const contentType=String(req.headers?.["content-type"]||"").toLowerCase();if(!contentType.startsWith("application/json"))throw Object.assign(new Error("CONTENT_TYPE_MUST_BE_APPLICATION_JSON"),{statusCode:415});if(req.body&&typeof req.body==="object")return req.body;if(typeof req.body!=="string")throw Object.assign(new Error("INVALID_JSON_BODY"),{statusCode:400});try{return JSON.parse(req.body)}catch{throw Object.assign(new Error("INVALID_JSON_BODY"),{statusCode:400});}}
function createHandler({repository=productionRepository()}={}){return wrap(async(req,res)=>{method(req,"POST");const key=req.headers?.["idempotency-key"];const result=await createCustomerOrder(parseJsonRequest(req),{repository,idempotencyKey:key});return send(res,201,result.publicView);});}
async function handler(req,res){return createHandler()(req,res);}
module.exports=handler;module.exports.createHandler=createHandler;module.exports.parseJsonRequest=parseJsonRequest;
