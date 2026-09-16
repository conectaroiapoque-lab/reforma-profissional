"use strict";
const {adminHandler}=require("../../server/privileged-api");
const {productionRepository}=require("../../server/order-repository");
const repository={list(){return productionRepository().list();}};
module.exports=async function handler(req,res){return adminHandler({repository})(req,res);};
