"use strict";
const { empty } = require("../server/schedule-repository"),
  { ScheduleService } = require("../server/schedule-service"),
  { MemoryOrderRepository } = require("../server/order-repository"),
  { getServiceByCode } = require("../catalog"),
  { REQUIRED_DOCUMENTS } = require("../server/provider-onboarding");
class MemoryScheduleRepository extends MemoryOrderRepository {
  constructor() {
    super();
    this.state = empty();
    this.queue = Promise.resolve();
  }
  async read() {
    return structuredClone(this.state);
  }
  async transaction(fn) {
    const result = this.queue.then(async () => {
      const state = await this.read(),
        writes = [];
      const value = await fn(state, {
        order: (id) => this.get(id),
        provider: (id) => this.getProvider(id),
        saveOrder: (o) => writes.push(o),
      });
      state.revision++;
      for (const order of writes) await this.save(order);
      this.state = state;
      return structuredClone(value);
    });
    this.queue = result.catch(() => {});
    return result;
  }
}
const admin = { sub: "cac-test", role: "ADMIN" },
  customer = { sub: "customer-test", role: "CUSTOMER" },
  professional = (id) => ({ sub: id, role: "PROVIDER" });
const start = "2030-01-08T12:00:00.000Z",
  end = "2030-01-08T13:00:00.000Z";
async function fixture(
  repo = new MemoryScheduleRepository(),
  { mode = "DIRECT", crew = 1, duration = 60 } = {},
) {
  let now = Date.parse("2030-01-07T12:00:00Z");
  const service = new ScheduleService(repo, { clock: () => now });
  for (const providerId of ["p1", "p2", "p3"])
    await repo.saveProvider({
      providerId,
      professionalName: "Profissional de teste " + providerId,
      specialties: ["ELETRICISTA"],
      status: "APPROVED",
      active: true,
      contract: { status: "CURRENT" },
      backgroundCheck: { status: "VALIDATED" },
      documents: Object.fromEntries(
        REQUIRED_DOCUMENTS.map((type) => [type, { status: "VALIDATED" }]),
      ),
    });
  const catalog = getServiceByCode("RP0001");
  for (const [id, owner] of [
    ["o1", customer.sub],
    ["o2", "other-customer"],
  ])
    await repo.create(
      {
        orderId: id,
        customerId: owner,
        protocol: "PED-" + id,
        serviceId: catalog.code,
        serviceName: catalog.name,
        category: catalog.category,
        pricingMode: catalog.pricingMode,
        status: "PROVIDER_ACCEPTED",
        providerId: "p1",
        address: {
          city: "Belo Horizonte",
          state: "MG",
          neighborhood: "Centro",
        },
        termsAcceptance: { accepted: true },
        quoteStatus: "CUSTOMER_APPROVED",
      },
      "key-" + id,
    );
  await service.mutate(admin, "rule", {
    serviceCode: catalog.code,
    mode,
    visitMinutes: 60,
    travelMinutes: 30,
    holdMinutes: 1440,
    cancelBeforeMinutes: 60,
    source: "TEST POLICY ONLY",
    reason: "Teste automatizado",
  });
  for (const id of ["p1", "p2", "p3"]) {
    await service.mutate(admin, "qualification", {
      providerId: id,
      serviceCodes: [catalog.code],
      specialty: "ELETRICISTA",
      validUntil: "2031-01-01T00:00:00Z",
      evidence: "TEST VALIDATION ONLY",
      reason: "Teste",
    });
    await service.mutate(professional(id), "availability", {
      windows: [
        { start: "2030-01-08T10:00:00Z", end: "2030-01-08T23:00:00Z" },
        { start: "2030-01-09T10:00:00Z", end: "2030-01-09T23:00:00Z" },
      ],
      blocks: [],
      regions: [
        { city: "Belo Horizonte", state: "MG", neighborhood: "Centro" },
      ],
    });
  }
  for (const orderId of ["o1", "o2"])
    await service.mutate(admin, "plan", {
      orderId,
      mode,
      durationMinutes: duration,
      crewSize: crew,
      providerIds: ["p1", "p2", "p3"].slice(0, crew),
      materialsReady: true,
      reason: "Plano de teste",
    });
  const book = (overrides = {}) =>
    service.mutate(customer, "book", {
      orderId: "o1",
      type: mode === "VISIT" ? "VISIT" : "EXECUTION",
      slots: [{ start, end }],
      providerIds: ["p1", "p2", "p3"].slice(0, mode === "VISIT" ? 1 : crew),
      customerConfirmed: true,
      ...overrides,
    });
  const action = (actor, name, a, input = {}) =>
    service.mutate(actor, name, { id: a.id, version: a.version, ...input });
  return {
    repo,
    service,
    book,
    action,
    admin,
    customer,
    professional,
    setNow: (value) => (now = Date.parse(value)),
    now: () => now,
  };
}
module.exports = {
  MemoryScheduleRepository,
  fixture,
  admin,
  customer,
  professional,
  start,
  end,
};
