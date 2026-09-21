"use strict";
const {datastoreUnavailable}=require("./order-repository");
class RedisProviderRepository{
  constructor({url=process.env.KV_REST_API_URL,token=process.env.KV_REST_API_TOKEN}={}){if(!url||!token)throw datastoreUnavailable("PROVIDER_REPOSITORY_NOT_CONFIGURED");this.url=url.replace(/\/$/,"");this.token=token;}
  async command(...args){try{const response=await fetch(this.url,{method:"POST",headers:{authorization:`Bearer ${this.token}`,"content-type":"application/json"},body:JSON.stringify(args)});if(!response.ok)throw datastoreUnavailable();return(await response.json()).result;}catch(error){if(error.publicCode==="DATASTORE_UNAVAILABLE")throw error;throw datastoreUnavailable();}}
  async create(provider){const unique=[[`provider:cpf:${provider.cpf}`,provider.providerId],[`provider:email:${provider.email}`,provider.providerId],[`provider:phone:${provider.phone}`,provider.providerId]];for(const [key] of unique)if(await this.command("GET",key))throw Object.assign(new Error("DUPLICATE_PROVIDER_IDENTITY"),{statusCode:409});for(const [key,value] of unique)await this.command("SET",key,value);await this.command("SET",`provider:${provider.providerId}`,JSON.stringify(provider));await this.command("SADD","providers",provider.providerId);return provider;}
  async get(id){const raw=await this.command("GET",`provider:${id}`);return raw?JSON.parse(raw):null;}
  async findByLogin(login){const normalized=String(login||"").trim().toLowerCase(),digits=normalized.replace(/\D/g,"");const id=await this.command("GET",normalized.includes("@")?`provider:email:${normalized}`:`provider:phone:${digits}`);return id?this.get(id):null;}
  async save(provider){await this.command("SET",`provider:${provider.providerId}`,JSON.stringify(provider));return provider;}
  async list(){const ids=await this.command("SMEMBERS","providers")||[];return Promise.all(ids.map(id=>this.get(id)));}
}
module.exports={RedisProviderRepository,productionProviderRepository:()=>new RedisProviderRepository()};
