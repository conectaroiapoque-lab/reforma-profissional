const {readFileSync}=require("node:fs");
const {join}=require("node:path");
const {runInNewContext}=require("node:vm");
const test=require("node:test");
const assert=require("node:assert/strict");

const appSource=readFileSync(join(__dirname,"../app.js"),"utf8");
const functionSource=appSource.match(/function trackWhatsappConversion\(\)\{[\s\S]*?\n\}/)?.[0];

function loadTracker(window){
  assert.ok(functionSource,"função de conversão deve existir");
  return runInNewContext(`(()=>{${functionSource};return trackWhatsappConversion;})()`,{window});
}

test("envia somente o evento de conversão oficial, sem PII ou valor",()=>{
  const calls=[];
  const track=loadTracker({gtag:(...args)=>calls.push(args)});

  track();

  assert.deepEqual(JSON.parse(JSON.stringify(calls)),[["event","conversion",{
    send_to:["AW-17424041657","Rb7QCI780u4cELmNt_RA"].join("/")
  }]]);
});

test("não falha quando a Google Tag ainda não está disponível",()=>{
  const track=loadTracker({});
  assert.doesNotThrow(()=>track());
});

test("restringe o disparo ao clique em .whatsapp-general",()=>{
  assert.match(appSource,/if\(event\.target\.closest\("\.whatsapp-general"\)\)trackWhatsappConversion\(\);/);
  assert.doesNotMatch(appSource,/closest\("#(?:success|provider)-whatsapp"\).*trackWhatsappConversion/);
  assert.equal((appSource.match(/trackWhatsappConversion\(\);/g)||[]).length,1);
});
