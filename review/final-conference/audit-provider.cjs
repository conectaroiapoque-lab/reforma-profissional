// Synthetic reproduction of a known legacy defect; not a regression asserting readiness.
const assert=require('node:assert/strict');
const {mutate}=require('../../server/provider-review-service');
(async()=>{
 let state={providerId:'SYNTHETIC-AUDIT',status:'APPROVED',active:true,adminAudit:[]};
 let reads=0,release;const both=new Promise(resolve=>release=resolve);let suspended;const suspension=new Promise(resolve=>suspended=resolve);
 const repository={async getProvider(){const copy=structuredClone(state);if(++reads===2)release();await both;return copy;},async saveProvider(value){if(value.status==='SUSPENDED'){state=structuredClone(value);suspended();}else{await suspension;state=structuredClone(value);}return value;}};
 await Promise.all([mutate(repository,state.providerId,{sub:'AUDITOR-A',role:'ADMIN'},'SUSPEND',{reasonCode:'SYNTHETIC'}),mutate(repository,state.providerId,{sub:'AUDITOR-B',role:'ADMIN'},'ADMIN_NOTE',{note:'Synthetic audit'})]);
 assert.equal(state.status,'APPROVED');assert.equal(state.adminAudit.length,1);assert.equal(state.adminAudit[0].action,'ADMIN_NOTE');
 console.log('REPRODUCED known defect: concurrent legacy ADMIN_NOTE overwrites SUSPEND and its audit event (synthetic repository, real service).');
})().catch(e=>{console.error(e);process.exitCode=1});
