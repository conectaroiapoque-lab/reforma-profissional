"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const {catalog,getServiceByCode}=require("../catalog");
const {createCatalogPricingSnapshot}=require("../services/pricing-engine");
const {exportCatalog}=require("../adapters/gestao-click-adapter");

test("catálogo oficial contém os 89 códigos únicos",()=>{
  assert.equal(catalog.length,89);
  assert.ok(getServiceByCode("RP0001"));
  assert.ok(getServiceByCode("RP0089"));
  assert.equal(new Set(catalog.map(service=>service.code)).size,89);
  assert.deepEqual(catalog.map(service=>service.code),Array.from({length:89},(_,index)=>`RP${String(index+1).padStart(4,"0")}`));
});

test("catálogo mantém faixas e serviços sob orçamento",()=>{
  assert.equal(catalog.filter(service=>service.tier==="STANDARD").length,13);
  assert.equal(catalog.filter(service=>service.tier==="TECHNICAL").length,51);
  assert.equal(catalog.filter(service=>service.tier==="SPECIALIST").length,25);
  assert.equal(catalog.filter(service=>service.pricingMode==="QUOTE").length,32);
  for(const service of catalog.filter(service=>service.pricingMode==="QUOTE")){
    assert.equal(service.customerPriceCents,null);
    assert.equal(service.providerPayoutCents,null);
    assert.equal(service.platformRevenueCents,null);
  }
  assert.ok(catalog.every(service=>service.materialsIncluded===false));
});

test("valores de referência têm divisão correta",()=>{
  assert.deepEqual(getServiceByCode("RP0001"),assertion("RP0001","TECHNICAL",15000,9750,5250));
  assert.deepEqual(getServiceByCode("RP0037"),assertion("RP0037","STANDARD",18000,10800,7200));
  assert.deepEqual(getServiceByCode("RP0046"),assertion("RP0046","SPECIALIST",71000,49700,21300));
});

test("pricing engine e GestãoClick consomem a mesma fonte",()=>{
  const snapshot=createCatalogPricingSnapshot("RP0001");
  assert.equal(snapshot.providerBasePayoutCents,9750);
  assert.equal(snapshot.platformGrossRevenueCents,5250);
  assert.throws(()=>createCatalogPricingSnapshot("RP0089"),/exige orçamento/);
  const exported=exportCatalog();
  assert.equal(exported.length,89);
  assert.equal(exported[0].codigo,"RP0001");
  assert.equal(exported.at(-1).codigo,"RP0089");
});

function assertion(code,tier,customerPriceCents,providerPayoutCents,platformRevenueCents){
  const actual=getServiceByCode(code);
  return {...actual,tier,customerPriceCents,providerPayoutCents,platformRevenueCents};
}
