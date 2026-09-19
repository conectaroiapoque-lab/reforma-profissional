"use strict";
const {adminHandler}=require("../../server/operations-api"),repository=require("../../server/production-repository-proxy"),{pathSegments,resolveOperationalPath,routeRequest}=require("../../server/api-path"),{send}=require("../../server/http");
module.exports=async function handler(req,res){const route=resolveOperationalPath("admin",pathSegments(req));return route?adminHandler({repository})(routeRequest(req,route),res):send(res,404,{error:"NOT_FOUND"});};
