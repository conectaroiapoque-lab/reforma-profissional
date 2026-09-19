"use strict";
const crypto=require("node:crypto"),fs=require("node:fs"),path=require("node:path");
const definitions=Object.freeze({
  CLIENT_TERMS:Object.freeze({version:"customer-service-terms-v1",effectiveDate:"2026-09-21",relativePath:"docs/customer-service-terms-v1.md"}),
  PROVIDER_AGREEMENT:Object.freeze({version:"provider-service-agreement-v1",effectiveDate:"2026-09-21",relativePath:"docs/provider-service-agreement-v1.md"})
});
function resolveLegalDocument(documentType,{root=path.resolve(__dirname,"..")}={}){const definition=definitions[documentType];if(!definition)throw Object.assign(new Error("UNKNOWN_LEGAL_DOCUMENT"),{statusCode:400});const documentPath=path.join(root,definition.relativePath),content=fs.readFileSync(documentPath);return Object.freeze({documentType,version:definition.version,effectiveDate:definition.effectiveDate,officialHash:crypto.createHash("sha256").update(content).digest("hex"),documentPath});}
module.exports=Object.freeze({DOCUMENT_TYPES:Object.freeze(Object.keys(definitions)),resolveLegalDocument});
