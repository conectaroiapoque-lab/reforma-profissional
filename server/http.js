"use strict";
function send(res,status,body){res.setHeader?.("content-type","application/json; charset=utf-8");if(typeof res.status==="function")return res.status(status).json(body);res.statusCode=status;return res.end?.(JSON.stringify(body));}
function method(req,expected){if(req.method!==expected)throw Object.assign(new Error("METHOD_NOT_ALLOWED"),{statusCode:405});}
function wrap(fn){return async(req,res)=>{try{return await fn(req,res)}catch(error){const status=error.statusCode||500,code=error.statusCode?error.message:"INTERNAL_ERROR";console.error("[http] request failed",{method:req?.method,url:req?.url,statusCode:status,code,stack:error.statusCode?undefined:error.stack});return send(res,status,{ok:false,code,error:status===500?"Não foi possível concluir a operação. Tente novamente.":error.message});}};}
module.exports={send,method,wrap};
