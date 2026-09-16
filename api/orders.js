"use strict";
const {createCustomerOrder}=require("../server/order-service");const {productionRepository}=require("../server/order-repository");const {send,method,wrap}=require("../server/http");
function createHandler({repository=productionRepository()}={}){return wrap(async(req,res)=>{method(req,"POST");const key=req.headers?.["idempotency-key"];const result=await createCustomerOrder(req.body,{repository,idempotencyKey:key});return send(res,201,result.publicView);});}
module.exports=(req,res)=>createHandler()(req,res);module.exports.createHandler=createHandler;
