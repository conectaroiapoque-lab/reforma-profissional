"use strict";
const {reviewHandler}=require("../../server/compliance-service"),repository=require("../../server/production-repository-proxy"),{pathSegments,resolveOperationalPath,routeRequest}=require("../../server/api-path"),{send}=require("../../server/http");
module.exports=async function handler(req,res){const route=resolveOperationalPath("compliance",pathSegments(req));return route?reviewHandler({repository})(routeRequest(req,route),res):send(res,404,{error:"NOT_FOUND"});};
