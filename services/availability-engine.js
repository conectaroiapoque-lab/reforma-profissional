"use strict";
const AVAILABILITY_STATES=Object.freeze(["OFFLINE","AVAILABLE","RESERVED","BUSY","UNAVAILABLE"]);
function setAvailability(provider,status,location){if(!AVAILABILITY_STATES.includes(status))throw new Error("Disponibilidade inválida.");if(status==="AVAILABLE"&&(!location||!location.consent))throw new Error("Localização consentida é necessária enquanto disponível.");return{...provider,availabilityStatus:status,location:status==="AVAILABLE"?location:null,availabilityUpdatedAt:new Date().toISOString()};}
const canReceiveOpportunity=p=>{
  if(p.status==="APROVADO")return p.availabilityStatus==="AVAILABLE"&&p.documentationValid===true&&p.suspended!==true;
  if(p.status!=="APPROVED"||p.active!==true||p.suspendedAt)return false;
  const available=(p.availability||p.availabilityStatus)==="AVAILABLE",documents=Object.values(p.documents||{});
  return available&&p.contract?.status==="CURRENT"&&documents.length>0&&documents.every(document=>document.status==="VALIDATED")&&p.backgroundCheck?.status==="VALIDATED";
};
module.exports={AVAILABILITY_STATES,setAvailability,canReceiveOpportunity};
