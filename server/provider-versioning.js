"use strict";
const stale=()=>Object.assign(new Error('STALE_PROVIDER'),{statusCode:409});
const CAS=`local raw=redis.call('GET',KEYS[1]);local version=0;if raw then version=cjson.decode(raw).version or 0 end;if version~=tonumber(ARGV[1]) then return 0 end;redis.call('SET',KEYS[1],ARGV[2]);redis.call('SADD','providers',ARGV[3]);return 1`;
async function saveRedis(provider){const next={...provider,version:(provider.version||0)+1};if(await this.command('EVAL',CAS,1,`provider:${provider.providerId}`,provider.version||0,JSON.stringify(next),provider.providerId)!==1)throw stale();return next;}
function saveMemory(provider){const old=this.providers.get(provider.providerId);if((old?.version||0)!==(provider.version||0))throw stale();const next={...provider,version:(provider.version||0)+1};this.providers.set(provider.providerId,structuredClone(next));return structuredClone(next);}
module.exports={saveRedis,saveMemory,stale};
