"use strict";
const crypto=require("node:crypto");
function send(res,status,body){res.setHeader?.("content-type","application/json; charset=utf-8");if(typeof res.status==="function")return res.status(status).json(body);res.statusCode=status;return res.end?.(JSON.stringify(body));}
function method(req,expected){if(req.method!==expected)throw Object.assign(new Error("METHOD_NOT_ALLOWED"),{statusCode:405});}
function requestId(req){const supplied=String(req?.headers?.["x-request-id"]||"");return /^[a-zA-Z0-9._:-]{1,100}$/.test(supplied)?supplied:crypto.randomUUID();}
function wrap(fn){return async(req,res)=>{const id=requestId(req);res.setHeader?.("x-request-id",id);try{return await fn(req,res)}catch(error){const status=Number.isInteger(error.statusCode)?error.statusCode:500,code=error.publicCode||(error.statusCode?error.message:"INTERNAL_ERROR"),message=error.publicMessage||(status>=500?"Não foi possível concluir a operação. Tente novamente.":error.message);console.error("[http] request failed",{requestId:id,statusCode:status,errorCode:code});return send(res,status,{ok:false,code,error:message});}};}
module.exports={send,method,wrap};
