"use strict";
const {productionRepository}=require("../server/order-repository");
const {send,method,wrap}=require("../server/http");

const handler=wrap(async(req,res)=>{
  method(req,"GET");
  try{
    await productionRepository().command("PING");
    return send(res,200,{ok:true,datastore:"available"});
  }catch{
    return send(res,503,{ok:false,datastore:"unavailable"});
  }
});

module.exports=handler;
