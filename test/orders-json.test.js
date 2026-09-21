"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { parseJsonRequest } = require("../api/orders");
test("API rejeita content-type não JSON com erro amigável", () => assert.throws(() => parseJsonRequest({ headers: { "content-type": "text/plain" }, body: "{}" }), error => error.statusCode === 415));
test("API aceita JSON já processado ou texto válido", () => { assert.deepEqual(parseJsonRequest({ headers: { "content-type": "application/json; charset=utf-8" }, body: '{"ok":true}' }), { ok: true }); assert.deepEqual(parseJsonRequest({ headers: { "content-type": "application/json" }, body: { ok: true } }), { ok: true }); });
test("API converte JSON inválido em 400 sem expor parser", () => assert.throws(() => parseJsonRequest({ headers: { "content-type": "application/json" }, body: "<html>" }), error => error.statusCode === 400 && error.message === "INVALID_JSON_BODY"));

const ordersHandler = require("../api/orders");
const { createHandler } = ordersHandler;
const { MemoryOrderRepository } = require("../server/order-repository");
const { MemoryRateLimiter } = require("../server/rate-limit");

function response(){return{headers:{},setHeader(name,value){this.headers[name.toLowerCase()]=value;},end(value){this.body=JSON.parse(value);}};}
async function invoke(handler,{body=validOrder(),headers={}}={}){const res=response();await handler({method:"POST",url:"/api/orders",headers:{"content-type":"application/json","idempotency-key":"orders-hotfix",...headers},body},res);return res;}
function validOrder(){return{serviceCode:"RP0001",description:"Instalar tomada",address:{street:"Rua A",number:"1",neighborhood:"Centro",city:"Belo Horizonte",postalCode:"30110-000",state:"MG"},urgency:"Hoje",customer:{name:"Cliente",whatsapp:"31999999999"},termsAcceptance:{accepted:true,displayedDocumentVersion:"customer-service-terms-v1"}};}
function withEnvironment(values,run){const names=["AUTH_SESSION_SECRET","KV_REST_API_URL","KV_REST_API_TOKEN"],saved=Object.fromEntries(names.map(name=>[name,process.env[name]]));for(const name of names)values[name]===undefined?delete process.env[name]:process.env[name]=values[name];return Promise.resolve().then(run).finally(()=>{for(const name of names)saved[name]===undefined?delete process.env[name]:process.env[name]=saved[name];});}

 test("handler de produção sem env responde configuração em JSON, nunca HTML",async()=>withEnvironment({},async()=>{const res=await invoke(ordersHandler);assert.equal(res.statusCode,500);assert.equal(res.headers["content-type"],"application/json; charset=utf-8");assert.deepEqual(res.body,{ok:false,code:"PRODUCTION_CONFIGURATION_ERROR",error:"Não foi possível concluir a operação. Tente novamente."});assert.doesNotMatch(JSON.stringify(res.body),/<html/i);}));

test("handler sem datastore falha fechado em JSON e não usa memória",async()=>withEnvironment({AUTH_SESSION_SECRET:"s".repeat(32)},async()=>{const res=await invoke(ordersHandler);assert.equal(res.statusCode,503);assert.equal(res.headers["content-type"],"application/json; charset=utf-8");assert.equal(res.body.code,"DATASTORE_UNAVAILABLE");assert.doesNotMatch(JSON.stringify(res.body),/<html/i);}));

test("KV inválido e token inválido produzem resposta JSON segura",async()=>withEnvironment({AUTH_SESSION_SECRET:"s".repeat(32),KV_REST_API_URL:"http://127.0.0.1:1",KV_REST_API_TOKEN:"invalid-token"},async()=>{const res=await invoke(ordersHandler);assert.equal(res.statusCode,503);assert.equal(res.headers["content-type"],"application/json; charset=utf-8");assert.deepEqual(res.body,{ok:false,code:"DATASTORE_UNAVAILABLE",error:"Serviço temporariamente indisponível. Tente novamente."});}));

test("repository funcional cria 201 JSON e preserva idempotência",async()=>{const handler=createHandler({repository:new MemoryOrderRepository(),rateLimiter:new MemoryRateLimiter()}),first=await invoke(handler),retry=await invoke(handler);assert.equal(first.statusCode,201);assert.equal(first.headers["content-type"],"application/json; charset=utf-8");assert.equal(first.body.ok,true);assert.match(first.body.protocol,/./);assert.equal(retry.body.orderId,first.body.orderId);assert.equal(retry.body.protocol,first.body.protocol);});
