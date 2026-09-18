"use strict";
const FLOW=Object.freeze(["CUSTOMER_REQUEST","PROVIDER_ANALYSIS","PROVIDER_QUOTE_SUBMITTED","PLATFORM_REVIEW","QUOTE_APPROVED","CUSTOMER_QUOTE_SENT","CUSTOMER_APPROVED","PROVIDER_AUTHORIZED","SERVICE_STARTED"]);
function advanceQuote(current,next,actor){const index=FLOW.indexOf(current);if(index<0||FLOW[index+1]!==next)throw new Error("INVALID_QUOTE_TRANSITION");if(next==="QUOTE_APPROVED"&&actor!=="PLATFORM")throw new Error("PLATFORM_REVIEW_REQUIRED");if(next==="SERVICE_STARTED"&&current!=="PROVIDER_AUTHORIZED")throw new Error("PROVIDER_NOT_AUTHORIZED");return next;}
module.exports=Object.freeze({FLOW,advanceQuote});
