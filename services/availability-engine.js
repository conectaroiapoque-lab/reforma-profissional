"use strict";
const AVAILABILITY_STATES=Object.freeze(["OFFLINE","AVAILABLE","RESERVED","BUSY","UNAVAILABLE"]);
function setAvailability(provider,status,location){if(!AVAILABILITY_STATES.includes(status))throw new Error("Disponibilidade inválida.");if(status==="AVAILABLE"&&(!location||!location.consent))throw new Error("Localização consentida é necessária enquanto disponível.");return{...provider,availabilityStatus:status,location:status==="AVAILABLE"?location:null,availabilityUpdatedAt:new Date().toISOString()};}
const canReceiveOpportunity=p=>p.status==="APROVADO"&&p.availabilityStatus==="AVAILABLE"&&p.documentationValid===true&&p.suspended!==true;
module.exports={AVAILABILITY_STATES,setAvailability,canReceiveOpportunity};
