"use strict";
const test=require("node:test"),assert=require("node:assert/strict");
const {normalizeGoogleResult,reverseGeocode}=require("../server/geocoding-provider");
const reverseHandler=require("../api/geocode/reverse");

function googleResult(parts){return {address_components:Object.entries(parts).map(([type,value])=>({types:[type],long_name:value,short_name:value}))};}
test("reverse geocode normaliza rua, número, bairro, cidade e CEP",()=>{assert.deepEqual(normalizeGoogleResult(googleResult({route:"Rua A",street_number:"42",sublocality_level_1:"Centro",administrative_area_level_2:"Belo Horizonte",administrative_area_level_1:"MG",postal_code:"30000-000"})),{address:"Rua A",number:"42",neighborhood:"Centro",city:"Belo Horizonte",state:"MG",postalCode:"30000-000"});});
test("reverse geocode parcial nunca inventa número",()=>{const value=normalizeGoogleResult(googleResult({route:"Rua Sem Número",locality:"Contagem"}));assert.equal(value.number,"");assert.equal(value.address,"Rua Sem Número");assert.equal(value.city,"Contagem");});
test("provedor exige chave somente no servidor",async()=>{await assert.rejects(reverseGeocode({latitude:-19,longitude:-44,env:{GEOCODING_PROVIDER:"google"}}),/GEOCODING_NOT_CONFIGURED/);});
test("falha do provedor produz fallback controlado",async()=>{await assert.rejects(reverseGeocode({latitude:-19,longitude:-44,env:{GEOCODING_PROVIDER:"google",GOOGLE_MAPS_GEOCODING_API_KEY:"test"},fetchImpl:async()=>({ok:false})}),/GEOCODING_PROVIDER_FAILED/);});
test("endpoint rejeita coordenadas inválidas sem consultar provedor",async()=>{let code,body;await reverseHandler({method:"GET",query:{lat:"x",lng:"1"}},{setHeader(){},status(value){code=value;return this},json(value){body=value;return this}});assert.equal(code,400);assert.match(body.error,/Coordenadas inválidas/);});
test("endpoint de geocode proíbe cache",async()=>{let cache;await reverseHandler({method:"POST",query:{}},{setHeader(name,value){if(name==="Cache-Control")cache=value},status(){return this},json(){return this}});assert.equal(cache,"no-store");});
