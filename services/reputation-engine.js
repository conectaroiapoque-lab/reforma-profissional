"use strict";
const average=values=>values.reduce((a,b)=>a+b,0)/values.length;
function createServiceReview({quality,punctuality,courtesy,cleanliness,result,comment=""}){const scores=[quality,punctuality,courtesy,cleanliness,result];if(scores.some(x=>!Number.isFinite(x)||x<1||x>5))throw new RangeError("Notas devem estar entre 1 e 5.");return{quality,punctuality,courtesy,cleanliness,result,overall:Math.round(average(scores)*10)/10,comment:String(comment).slice(0,1000),createdAt:new Date().toISOString()};}
function providerReputation(p){const jobs=(p.completedJobs||0)+(p.cancelledJobs||0);return{rating:p.rating||0,completedJobs:p.completedJobs||0,cancelledJobs:p.cancelledJobs||0,lateArrivals:p.lateArrivals||0,customerComplaints:p.customerComplaints||0,warrantyReturns:p.warrantyReturns||0,qualityScore:p.qualityScore||0,completionRate:jobs?(p.completedJobs||0)/jobs:0,automaticBlock:false};}
function customerReputation(c){return{completedOrders:c.completedOrders||0,cancellations:c.cancellations||0,paymentIssues:c.paymentIssues||0};}
module.exports={createServiceReview,providerReputation,customerReputation};
