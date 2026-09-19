"use strict";const {productionRepository}=require("./order-repository");
const repository=new Proxy({}, {get(_target,property){return(...args)=>productionRepository()[property](...args)}});
module.exports=repository;
