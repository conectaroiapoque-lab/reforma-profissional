"use strict";
const {authorize}=require("./auth");const {adminFinancialView,financeFinancialView}=require("../domain/financial-engine");const {send,method,wrap}=require("./http");
function adminHandler({repository,secretValue}={}){return wrap(async(req,res)=>{method(req,"GET");authorize(req,"ADMIN_READ",{secretValue});const orders=await repository.list();return send(res,200,{orders:orders.map(o=>({orderId:o.orderId,protocol:o.protocol,status:o.status,financial:o.pricingSnapshot?adminFinancialView(o.pricingSnapshot):null}))});});}
function financeHandler({repository,secretValue}={}){return wrap(async(req,res)=>{method(req,"GET");authorize(req,"FINANCE_READ",{secretValue});const orders=await repository.list();return send(res,200,{orders:orders.map(o=>({orderId:o.orderId,status:o.status,financial:o.pricingSnapshot?financeFinancialView(o.pricingSnapshot):null}))});});}
module.exports={adminHandler,financeHandler};
