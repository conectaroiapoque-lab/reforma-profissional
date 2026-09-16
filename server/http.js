"use strict";
function send(res,status,body){if(typeof res.status==='function')return res.status(status).json(body);res.statusCode=status;res.setHeader?.('content-type','application/json');return res.end?.(JSON.stringify(body));}
function method(req,expected){if(req.method!==expected)throw Object.assign(new Error("METHOD_NOT_ALLOWED"),{statusCode:405});}
function wrap(fn){return async(req,res)=>{try{return await fn(req,res)}catch(error){return send(res,error.statusCode||500,{error:error.statusCode?error.message:"INTERNAL_ERROR"})}}}
module.exports={send,method,wrap};
