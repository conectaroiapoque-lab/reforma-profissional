"use strict";
const DEFAULT_DISPATCH_CONFIG=Object.freeze({offerTimeoutSeconds:45,waveSize:[3,5,5,5],initialRadiusKm:10,maxRadiusKm:30,maxWaves:4});
function createDispatchWaves(matches,config={}){const c={...DEFAULT_DISPATCH_CONFIG,...config};let offset=0;return Array.from({length:c.maxWaves},(_,i)=>{const size=c.waveSize[i]||c.waveSize.at(-1);const providers=matches.slice(offset,offset+size);offset+=size;return{wave:i+1,providers,radiusKm:i<2?c.initialRadiusKm:Math.min(c.maxRadiusKm,c.initialRadiusKm*(i+1)),offerTimeoutSeconds:c.offerTimeoutSeconds,suggestBonus:i===3};});}
module.exports={DEFAULT_DISPATCH_CONFIG,createDispatchWaves};
