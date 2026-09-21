"use strict";
(function exposePostalCode(root){
  const digits=value=>String(value||"").replace(/\D/g,"");
  async function lookup(value,{fetchImpl=fetch}={}){const postalCode=digits(value);if(postalCode.length!==8)return null;const response=await fetchImpl(`/api/geocode/reverse?postalCode=${encodeURIComponent(postalCode)}`,{headers:{accept:"application/json"},cache:"no-store"});if(!response.ok)return null;return response.json();}
  function apply(form,address,{streetField="street"}={}){for(const [source,target] of Object.entries({street:streetField,neighborhood:"neighborhood",city:"city",state:"state",postalCode:"postalCode"}))if(address?.[source]&&form.elements[target])form.elements[target].value=address[source];}
  root.PostalCodeLookup=Object.freeze({digits,lookup,apply});
})(globalThis);
