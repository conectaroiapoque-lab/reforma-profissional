"use strict";

const crypto = require("node:crypto");
const { passwordDigest } = require("./auth");

const STATES = new Set(["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"]);
const PROVIDER_STATUSES = Object.freeze(["DRAFT","SUBMITTED","UNDER_REVIEW","DOCUMENTS_REQUIRED","APPROVED","SUSPENDED"]);
const DOCUMENT_STATUSES = Object.freeze(["PENDING","SUBMITTED","UNDER_REVIEW","VALIDATED","REJECTED","EXPIRED"]);
const BACKGROUND_STATUSES = Object.freeze(["PENDENTE","ENVIADO","UNDER_REVIEW","VALIDATED","VALIDATION_PENDING","EXPIRED","DOCUMENT_INVALID"]);
const SPECIALTIES = Object.freeze(["ELETRICISTA","ENCANADOR / BOMBEIRO HIDRÁULICO","PEDREIRO","PINTOR","AR-CONDICIONADO","MARCENEIRO","MONTADOR DE MÓVEIS","GESSEIRO / DRYWALL","VIDRACEIRO","SERRALHEIRO","ENERGIA SOLAR","CASA INTELIGENTE","IMPERMEABILIZAÇÃO","MARIDO DE ALUGUEL","ESQUADRIAS DE ALUMÍNIO","TELHADISTA / CALHEIRO","LIMPEZA PÓS-OBRA / DIARISTA","OUTROS SERVIÇOS DE REFORMA E MANUTENÇÃO"]);
const REQUIRED_DOCUMENTS = Object.freeze(["RG_FRONT","CPF_DOCUMENT","ADDRESS_PROOF","PROFILE_PHOTO","BACKGROUND_CHECK"]);

function digits(value){return String(value||"").replace(/\D/g,"");}
function validCpf(value){const cpf=digits(value);if(!/^\d{11}$/.test(cpf)||/^(\d)\1{10}$/.test(cpf))return false;for(let size=9;size<=10;size++){let sum=0;for(let i=0;i<size;i++)sum+=Number(cpf[i])*(size+1-i);const check=(sum*10)%11%10;if(check!==Number(cpf[size]))return false;}return true;}
function validateCoordinates(location){if(location==null)return null;const latitude=Number(location.latitude),longitude=Number(location.longitude),accuracy=Number(location.accuracy);if(!Number.isFinite(latitude)||latitude < -90||latitude > 90||!Number.isFinite(longitude)||longitude < -180||longitude > 180)throw invalid("INVALID_COORDINATES");return{latitude,longitude,accuracy:Number.isFinite(accuracy)&&accuracy>=0?accuracy:null,timestamp:new Date(location.timestamp||Date.now()).toISOString(),source:"VOLUNTARY_GEOLOCATION"};}
function invalid(code,statusCode=400){return Object.assign(new Error(code),{statusCode});}
function normalizeUnique(value){return String(value||"").trim().toLowerCase();}
function validateRegistration(input){
  if(!String(input.fullName||"").trim()||!String(input.professionalName||"").trim())throw invalid("NAME_REQUIRED");
  if(!validCpf(input.cpf))throw invalid("INVALID_CPF");
  if(!String(input.rg||"").trim())throw invalid("RG_REQUIRED");
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(input.email||"")))throw invalid("INVALID_EMAIL");
  if(digits(input.phone).length<10||digits(input.phone).length>11)throw invalid("INVALID_PHONE");
  if(String(input.password||"").length<10)throw invalid("WEAK_PASSWORD");
  const address=input.address||{};if(!/^\d{8}$/.test(digits(address.postalCode)))throw invalid("INVALID_POSTAL_CODE");
  if(!address.street||!address.number||!address.neighborhood||!address.city)throw invalid("ADDRESS_REQUIRED");
  if(!STATES.has(String(address.state||"").toUpperCase()))throw invalid("INVALID_STATE");
  if(!Array.isArray(input.specialties)||!input.specialties.length||input.specialties.some(item=>!SPECIALTIES.includes(item)))throw invalid("SPECIALTY_REQUIRED_OR_INVALID");
  if(input.contractAccepted!==true)throw invalid("CONTRACT_ACCEPTANCE_REQUIRED");
  const evidenceIds=input.documents||{};for(const type of REQUIRED_DOCUMENTS)if(!evidenceIds[type])throw invalid(`DOCUMENT_REQUIRED_${type}`);
  return true;
}
function privateProjection(provider){const {passwordHash,passwordSalt,uniqueKeys,...safe}=provider;return safe;}
function publicProjection(provider){if(provider.status!=="APPROVED")return null;return{providerId:provider.providerId,professionalName:provider.professionalName,photoEvidenceId:provider.documents?.PROFILE_PHOTO?.status==="VALIDATED"?provider.documents.PROFILE_PHOTO.evidenceId:null,specialties:provider.specialties,verified:provider.documents&&Object.values(provider.documents).every(document=>document.status==="VALIDATED")};}
function eligibility(provider,{serviceCode,category,location}={}){const reasons=[];if(provider.status!=="APPROVED")reasons.push("STATUS_NOT_APPROVED");if(provider.active!==true)reasons.push("INACTIVE");if(provider.suspendedAt)reasons.push("SUSPENDED");if(provider.contract?.status!=="CURRENT")reasons.push("CONTRACT_NOT_CURRENT");if(!provider.documents||Object.values(provider.documents).some(item=>item.status!=="VALIDATED"))reasons.push("DOCUMENTS_NOT_VALID");if(provider.backgroundCheck?.status!=="VALIDATED")reasons.push("BACKGROUND_NOT_VALIDATED");if(provider.availability!=="AVAILABLE")reasons.push("NOT_AVAILABLE");if(category&&!provider.specialties?.includes(category))reasons.push("SPECIALTY_MISMATCH");if(serviceCode&&provider.serviceCodes?.length&&!provider.serviceCodes.includes(serviceCode))reasons.push("SERVICE_MISMATCH");if(location&&!provider.location)reasons.push("LOCATION_UNAVAILABLE");return{eligible:reasons.length===0,reasons};}
function createProvider(input,{now=new Date(),providerId=`PRV-${crypto.randomUUID()}`}={}){validateRegistration(input);const passwordSalt=crypto.randomBytes(16).toString("hex"),documents=Object.fromEntries(Object.entries(input.documents).map(([type,evidenceId])=>[type,{type,evidenceId,status:"SUBMITTED",submittedAt:now.toISOString()}]));return{providerId,fullName:String(input.fullName).trim(),professionalName:String(input.professionalName).trim(),cpf:digits(input.cpf),rg:String(input.rg).trim(),rgIssuer:String(input.rgIssuer||"").trim(),rgState:String(input.rgState||"").toUpperCase(),email:normalizeUnique(input.email),phone:digits(input.phone),address:{postalCode:digits(input.address.postalCode),street:String(input.address.street).trim(),number:String(input.address.number).trim(),complement:String(input.address.complement||"").trim(),neighborhood:String(input.address.neighborhood).trim(),city:String(input.address.city).trim(),state:String(input.address.state).toUpperCase(),reference:String(input.address.reference||"").trim()},location:validateCoordinates(input.location),specialties:[...new Set(input.specialties)],serviceCodes:[...new Set(input.serviceCodes||[])],experienceYears:input.experienceYears==null?null:Number(input.experienceYears),professionalDescription:String(input.professionalDescription||"").trim(),company:input.company||null,documents,backgroundCheck:{documentType:"CRIMINAL_RECORD_CERTIFICATE",issuingAuthority:String(input.backgroundCheck?.issuingAuthority||"").trim(),UF:String(input.backgroundCheck?.UF||"").toUpperCase(),validationCode:String(input.backgroundCheck?.validationCode||"").trim(),issueDate:input.backgroundCheck?.issueDate||null,validUntil:input.backgroundCheck?.validUntil||null,evidenceId:input.documents.BACKGROUND_CHECK,status:"ENVIADO",reviewedBy:null,reviewedAt:null,decision:null,reasonCode:null,appealAvailable:true,nextReviewAt:null,reviewPolicy:"HUMAN_COMPLIANCE_REVIEW"},status:"SUBMITTED",active:true,availability:"OFFLINE",contract:{status:"CURRENT",version:String(input.contractVersion||"provider-service-agreement-v1"),acceptedAt:now.toISOString()},marketingConsent:input.marketingConsent===true,passwordSalt,passwordHash:passwordDigest(input.password,passwordSalt),createdAt:now.toISOString(),updatedAt:now.toISOString()};}

module.exports={STATES,PROVIDER_STATUSES,DOCUMENT_STATUSES,BACKGROUND_STATUSES,SPECIALTIES,REQUIRED_DOCUMENTS,validCpf,validateCoordinates,validateRegistration,createProvider,privateProjection,publicProjection,eligibility,normalizeUnique};
