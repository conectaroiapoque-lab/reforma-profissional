"use strict";
class Repository{async get(){throw new Error("Not implemented");}async save(){throw new Error("Not implemented");}}
class OrderRepository extends Repository{} class ProviderRepository extends Repository{} class PricingRepository extends Repository{} class GeoRepository extends Repository{} class EventRepository extends Repository{} class LedgerRepository extends Repository{} class AuditRepository extends Repository{}
module.exports={OrderRepository,ProviderRepository,PricingRepository,GeoRepository,EventRepository,LedgerRepository,AuditRepository};

class FinancialSnapshotRepository { async append(){throw new Error("Not implemented");} async getByOrderId(){throw new Error("Not implemented");} }
class PricingPolicyRepository { async getByVersion(){throw new Error("Not implemented");} }
class TaxProfileRepository { async getById(){throw new Error("Not implemented");} }
class InMemoryFinancialSnapshotRepository extends FinancialSnapshotRepository {
  constructor(){super();this.snapshots=new Map();}
  async append(orderId,snapshot){if(this.snapshots.has(orderId))throw new Error("IMMUTABLE_FINANCIAL_SNAPSHOT");const {validateFinancialSnapshot,deepFreeze}=require("../domain/financial-engine");validateFinancialSnapshot(snapshot);this.snapshots.set(orderId,deepFreeze(snapshot));return snapshot;}
  async getByOrderId(orderId){return this.snapshots.get(orderId)||null;}
}
class InMemoryPricingPolicyRepository extends PricingPolicyRepository { constructor(items=[]){super();this.items=new Map(items.map(x=>[x.version,Object.freeze({...x})]));} async getByVersion(v){return this.items.get(v)||null;} }
class InMemoryTaxProfileRepository extends TaxProfileRepository { constructor(items=[]){super();this.items=new Map(items.map(x=>[x.taxProfileId,Object.freeze({...x})]));} async getById(id){return this.items.get(id)||null;} }
Object.assign(module.exports,{FinancialSnapshotRepository,PricingPolicyRepository,TaxProfileRepository,InMemoryFinancialSnapshotRepository,InMemoryPricingPolicyRepository,InMemoryTaxProfileRepository});
