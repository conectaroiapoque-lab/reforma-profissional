"use strict";
class ErrorReporter{static capture(error,context={}){return{captured:false,errorName:error?.name||"Error",contextKeys:Object.keys(context)};}}
module.exports={ErrorReporter};
