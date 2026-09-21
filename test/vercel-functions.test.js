"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,".."),apiRoot=path.join(root,"api"),privateNames=["AUTH_SESSION_SECRET","KV_REST_API_URL","KV_REST_API_TOKEN","MERCADO_PAGO_ACCESS_TOKEN","MERCADO_PAGO_PUBLIC_KEY","MERCADO_PAGO_WEBHOOK_SECRET"];
function filesUnder(directory){return fs.readdirSync(directory,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?filesUnder(path.join(directory,entry.name)):[path.join(directory,entry.name)]).filter(file=>file.endsWith(".js"));}

test("every Vercel Function imports without private runtime environment",()=>{
  const saved=Object.fromEntries(privateNames.map(name=>[name,process.env[name]]));
  for(const name of privateNames)delete process.env[name];
  try{
    const files=filesUnder(apiRoot).sort();
    assert.equal(files.length,12,"keep the deployment within the Vercel function limit");
    for(const file of files){
      assert.doesNotThrow(()=>require(file),path.relative(root,file));
      assert.equal(typeof require(file),"function",path.relative(root,file));
    }
  }finally{
    for(const [name,value] of Object.entries(saved))value===undefined?delete process.env[name]:process.env[name]=value;
  }
});

test("catch-all Functions preserve every approved operational URL",()=>{
  const {resolveOperationalPath}=require("../server/api-path");
  const expected={
    admin:["orders","providers","provider/:id","provider/:id/approve","provider/:id/review","order/:id/assign-provider","order/:id/approve-quote","order/:id/authorize-service","order/:id/review-change-order"],
    provider:["profile","opportunities","orders","orders/:id/accept","orders/:id/decline","orders/:id/arrive","orders/:id/start","orders/:id/complete","orders/:id/quote","orders/:id/fiscal-document","orders/:id/change-order","background-check"],
    customer:["orders/:id","orders/:id/quote-decision","orders/:id/change-order-decision"],
    finance:["orders","order/:id/review-fiscal-document"],
    compliance:["provider/:id/background-check"]
  };
  for(const [scope,routes] of Object.entries(expected))for(const route of routes){const segments=route.replaceAll(":id","ORD-1").split("/");assert.ok(resolveOperationalPath(scope,segments),`${scope}/${route}`);}
  assert.equal(resolveOperationalPath("provider",["orders","ORD-1","forged-action"]),null);
});

test("vercel configuration delegates the canonical apex-to-www redirect to Vercel Domains",()=>{
  const config=JSON.parse(fs.readFileSync(path.join(root,"vercel.json"),"utf8"));
  assert.equal(config.buildCommand,"npm run build:web");
  assert.equal(config.outputDirectory,"dist");
  assert.equal(config.framework,null);
  assert.equal("redirects" in config,false,"host redirects must be managed exclusively by Vercel Domains");
  const serialized=JSON.stringify(config);
  assert.doesNotMatch(serialized,/https:\/\/reformaprofissional\.com\.br/);
  assert.doesNotMatch(serialized,/www\.reformaprofissional\.com\.br/);
  const headers=JSON.stringify(config.headers);
  assert.match(headers,/Strict-Transport-Security/);
  assert.match(headers,/Content-Security-Policy/);
});
