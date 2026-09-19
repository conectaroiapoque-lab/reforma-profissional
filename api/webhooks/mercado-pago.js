"use strict";
const {processWebhook}=require("../../server/mercado-pago-webhook"),{send,method,wrap}=require("../../server/http");
function createHandler({repository,secret}={}){return wrap(async(req,res)=>{method(req,"POST");if(!repository)throw Object.assign(new Error("WEBHOOK_STORE_NOT_CONFIGURED"),{statusCode:503});const body=typeof req.body==="string"?JSON.parse(req.body):req.body||{},result=await processWebhook({headers:req.headers||{},body,repository,secret});return send(res,200,{accepted:true,duplicate:result.duplicate===true});});}
module.exports=createHandler();module.exports.createHandler=createHandler;
