"use strict";
const {financeHandler}=require("../../server/privileged-api");
const {productionRepository}=require("../../server/order-repository");
const repository={list(){return productionRepository().list();}};
module.exports=async function handler(req,res){return financeHandler({repository})(req,res);};
