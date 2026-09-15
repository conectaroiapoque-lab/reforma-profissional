"use strict";
class Repository{async get(){throw new Error("Not implemented");}async save(){throw new Error("Not implemented");}}
class OrderRepository extends Repository{} class ProviderRepository extends Repository{} class PricingRepository extends Repository{} class GeoRepository extends Repository{} class EventRepository extends Repository{} class LedgerRepository extends Repository{} class AuditRepository extends Repository{}
module.exports={OrderRepository,ProviderRepository,PricingRepository,GeoRepository,EventRepository,LedgerRepository,AuditRepository};
