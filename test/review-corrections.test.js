"use strict";
const test = require("node:test"),
  assert = require("node:assert/strict");
const {
  fixture,
  admin,
  customer,
  professional,
} = require("../test-support/schedule-fixture");
const { MemoryOrderRepository } = require("../server/order-repository"),
  ops = require("../server/operations-service");
const { customerHandler, adminHandler } = require("../server/operations-api"),
  { signSession } = require("../server/auth"),
  { resolveOperationalPath } = require("../server/api-path");
const secretValue = "TEST-ONLY-REVIEW-CORRECTIONS-SECRET-000";
async function invoke(handler, claims, query, body, method = "POST") {
  const req = {
    method,
    query,
    body,
    headers: {
      authorization: "Bearer " + signSession(claims, { secretValue }),
    },
  };
  const response = {
    setHeader() {},
    status(code) {
      this.code = code;
      return this;
    },
    json(body) {
      this.body = body;
    },
  };
  await handler(req, response);
  return response;
}
async function adminInvoke(handler, repo, route, body) {
  return invoke(handler, admin, route, {
    expectedVersion: (await repo.get(route.id)).version || 0,
    ...body,
  });
}
async function quoted() {
  const repo = new MemoryOrderRepository();
  await repo.create(
    {
      orderId: "o",
      customerId: customer.sub,
      serviceId: "RP0012",
      serviceName: "Curto-circuito",
      pricingMode: "QUOTE",
      quoteStatus: "CUSTOMER_QUOTE_SENT",
      quoteHistory: ["CUSTOMER_QUOTE_SENT"],
      quote: {
        quoteId: "quote-current",
        amountCents: 25000,
        description: "Escopo revisado",
      },
      pricingSnapshot: { internalCanary: "NEVER_PUBLIC" },
      auditTrail: [],
    },
    "only",
  );
  return repo;
}
test("regressão: rota antiga quote-decision exige quoteId atual e decisão explícita; resposta pública não vaza composição", async () => {
  const repo = await quoted(),
    handler = customerHandler({ repository: repo, secretValue }),
    query = resolveOperationalPath("customer", [
      "orders",
      "o",
      "quote-decision",
    ]);
  const before = await repo.get("o");
  for (const [body, status] of [
    [{ decision: "APPROVE" }, 400],
    [{ decision: "APPROVE", quoteId: "quote-old" }, 409],
    [{ decision: "UNEXPECTED", quoteId: "quote-current" }, 400],
  ]) {
    const r = await invoke(handler, customer, query, body);
    assert.equal(r.code, status);
    assert.deepEqual(await repo.get("o"), before);
  }
  const view = await invoke(
    handler,
    customer,
    resolveOperationalPath("customer", ["orders", "o"]),
    null,
    "GET",
  );
  assert.equal(view.body.order.quote.quoteId, "quote-current");
  const result = await invoke(handler, customer, query, {
    decision: "APPROVE",
    quoteId: "quote-current",
  });
  assert.equal(result.code, 200);
  assert.equal(result.body.order.quoteStatus, "CUSTOMER_APPROVED");
  assert.doesNotMatch(
    JSON.stringify(result.body),
    /NEVER_PUBLIC|pricingSnapshot|providerMinimum/,
  );
  assert.equal(
    (await repo.get("o")).quote.customerDecision.quoteId,
    "quote-current",
  );
});
test("regressão: aprovação e autorização administrativas antigas recusam orçamento de outra versão", async () => {
  const repo = await quoted();
  let order = await repo.get("o");
  order.quoteStatus = "PROVIDER_QUOTE_SUBMITTED";
  await repo.save(order);
  const handler = adminHandler({ repository: repo, secretValue });
  let route = resolveOperationalPath("admin", ["order", "o", "approve-quote"]);
  assert.equal(
    (await adminInvoke(handler, repo, route, { quoteId: "old" })).code,
    409,
  );
  assert.equal(
    (await adminInvoke(handler, repo, route, { quoteId: "quote-current" }))
      .code,
    200,
  );
  await ops.customerQuoteDecision(
    repo,
    "o",
    customer.sub,
    "APPROVE",
    "quote-current",
  );
  route = resolveOperationalPath("admin", ["order", "o", "authorize-service"]);
  assert.equal(
    (await adminInvoke(handler, repo, route, { quoteId: "old" })).code,
    409,
  );
  assert.equal(
    (await adminInvoke(handler, repo, route, { quoteId: "quote-current" }))
      .code,
    200,
  );
});
const slots = [
  { start: "2030-01-08T12:00:00Z", end: "2030-01-08T13:00:00Z" },
  { start: "2030-01-09T12:00:00Z", end: "2030-01-09T13:00:00Z" },
];
async function confirmed(options = {}) {
  const f = await fixture(undefined, options);
  let a = (await f.book(options.duration === 120 ? { slots } : {})).appointment;
  a = (await f.action(professional("p1"), "accept", a)).appointment;
  return { ...f, a };
}
test("regressão: início não é permitido antes, no fim ou entre períodos reservados de vários dias", async () => {
  for (const now of [
    "2030-01-08T11:59:59Z",
    "2030-01-08T13:00:00Z",
    "2030-01-08T20:00:00Z",
    "2030-01-09T11:59:59Z",
    "2030-01-09T13:00:00Z",
  ]) {
    const f = await confirmed({ duration: 120 });
    f.setNow(now);
    const before = await f.repo.read(),
      order = await f.repo.get("o1");
    await assert.rejects(
      f.action(professional("p1"), "start", f.a),
      /INVALID_START/,
    );
    assert.deepEqual(await f.repo.read(), before);
    assert.deepEqual(await f.repo.get("o1"), order);
  }
});
test("regressão: início no começo e dentro do segundo período realmente reservado é aceito", async () => {
  for (const now of [
    "2030-01-08T12:00:00Z",
    "2030-01-09T12:00:00Z",
    "2030-01-09T12:59:59Z",
  ]) {
    const f = await confirmed({ duration: 120 });
    f.setNow(now);
    const r = await f.action(professional("p1"), "start", f.a);
    assert.equal(r.appointment.status, "IN_PROGRESS");
    assert.equal((await f.repo.get("o1")).status, "SERVICE_STARTED");
  }
});
test("regressão: conclusão de visita emite VISIT_COMPLETED, sem concluir OS ou liberar pós-venda de execução", async () => {
  const f = await confirmed({ mode: "VISIT" });
  f.setNow("2030-01-08T12:00:00Z");
  let a = (await f.action(professional("p1"), "start", f.a)).appointment;
  a = (
    await f.action(professional("p1"), "technical", a, {
      conditions: "Ponto avaliado",
      quantity: 1,
      unit: "ponto",
      materials: "Cliente fornecerá",
      estimatedMinutes: 60,
    })
  ).appointment;
  a = (await f.action(professional("p1"), "complete", a)).appointment;
  let state = await f.repo.read();
  assert.equal(state.notifications.at(-1).event, "VISIT_COMPLETED");
  assert.match(state.notifications.at(-1).text, /Visita técnica concluída/);
  assert.doesNotMatch(
    state.notifications.at(-1).text,
    /Execução do serviço concluída/,
  );
  assert.equal((await f.repo.get("o1")).status, "PROVIDER_ACCEPTED");
  assert.equal((await f.repo.get("o1")).fiscalStatus, undefined);
  await assert.rejects(
    f.action(admin, "notification", a, {
      reason: "Teste",
      event: "AFTER_SALES",
    }),
    /NOTIFICATION_STATE_MISMATCH/,
  );
  await f.action(admin, "notification", a, {
    reason: "Compatibilidade de mensagem antiga",
    event: "COMPLETED",
  });
  state = await f.repo.read();
  assert.equal(state.notifications.at(-1).event, "VISIT_COMPLETED");
});
test("regressão: conclusão de execução emite EXECUTION_COMPLETED e habilita mensagem de pós-venda", async () => {
  const f = await confirmed();
  f.setNow("2030-01-08T12:00:00Z");
  let a = (await f.action(professional("p1"), "start", f.a)).appointment;
  a = (await f.action(professional("p1"), "complete", a)).appointment;
  const state = await f.repo.read();
  assert.equal(state.notifications.at(-1).event, "EXECUTION_COMPLETED");
  assert.match(
    state.notifications.at(-1).text,
    /Execução do serviço concluída/,
  );
  assert.equal((await f.repo.get("o1")).status, "SERVICE_COMPLETED");
  await f.action(admin, "notification", a, {
    reason: "Atendimento concluído",
    event: "AFTER_SALES",
  });
});
test("regressão: edição administrativa exige revisão lida e rejeita configuração desatualizada nas cinco ações", async () => {
  const f = await fixture();
  const read = await f.service.read(admin),
    old = read.revision;
  await f.adminMutate("rule", {
    ...(await f.repo.read()).rules.RP0001,
    serviceCode: "RP0001",
    source: "Regra atualizada",
    reason: "Revisão atual",
  });
  const before = await f.repo.read();
  for (const action of [
    "rule",
    "qualification",
    "availability",
    "plan",
    "proposal",
  ]) {
    await assert.rejects(
      f.service.mutate(admin, action, { expectedRevision: old }),
      /STALE_SCHEDULE_CONFIGURATION/,
    );
    await assert.rejects(
      f.service.mutate(admin, action, {}),
      /REVISION_REQUIRED/,
    );
    assert.deepEqual(await f.repo.read(), before);
  }
  assert.equal(before.rules.RP0001.source, "Regra atualizada");
});
test("regressão: cliente administrativo antigo não sobrescreve proposta mais recente", async () => {
  const f = await fixture();
  let order = await f.repo.get("o1");
  order.quoteStatus = null;
  await f.repo.save(order);
  const expectedRevision = (await f.repo.read()).revision;
  const first = await f.service.mutate(admin, "proposal", {
    expectedRevision,
    orderId: "o1",
    description: "Escopo 1",
    reason: "Avaliado",
  });
  await assert.rejects(
    f.service.mutate(admin, "proposal", {
      expectedRevision,
      orderId: "o1",
      description: "Escopo obsoleto",
      reason: "Tela antiga",
    }),
    /STALE_SCHEDULE_CONFIGURATION/,
  );
  assert.equal((await f.repo.get("o1")).quote.quoteId, first.quote.quoteId);
  assert.equal((await f.repo.get("o1")).quote.description, "Escopo 1");
});
test("regressão: ações antigas de iniciar e concluir não contornam plano da agenda, mesmo sem guarda no handler", async () => {
  const f = await fixture();
  await assert.rejects(
    ops.providerAction(f.repo, "o1", "p1", "start"),
    /USE_SCHEDULE_ACTION/,
  );
  await assert.rejects(
    ops.providerAction(f.repo, "o1", "p1", "complete"),
    /USE_SCHEDULE_ACTION/,
  );
});

test("regressão: orçamento adicional antigo exige changeOrderId na revisão e no aceite", async () => {
  const repo = await quoted();
  const order = await repo.get("o");
  order.status = "SERVICE_STARTED";
  order.changeOrder = {
    changeOrderId: "extra-current",
    status: "CHANGE_ORDER_CREATED",
    amountCents: 3000,
    reason: "Escopo adicional",
  };
  await repo.save(order);
  const adminRoute = resolveOperationalPath("admin", [
      "order",
      "o",
      "review-change-order",
    ]),
    ah = adminHandler({ repository: repo, secretValue });
  assert.equal(
    (
      await adminInvoke(ah, repo, adminRoute, {
        decision: "APPROVE",
        changeOrderId: "extra-old",
      })
    ).code,
    409,
  );
  assert.equal(
    (
      await adminInvoke(ah, repo, adminRoute, {
        decision: "APPROVE",
        changeOrderId: "extra-current",
      })
    ).code,
    200,
  );
  const route = resolveOperationalPath("customer", [
      "orders",
      "o",
      "change-order-decision",
    ]),
    ch = customerHandler({ repository: repo, secretValue });
  for (const [body, code] of [
    [{ decision: "APPROVE" }, 400],
    [{ decision: "APPROVE", changeOrderId: "extra-old" }, 409],
    [{ decision: "UNKNOWN", changeOrderId: "extra-current" }, 400],
  ])
    assert.equal((await invoke(ch, customer, route, body)).code, code);
  assert.equal((await repo.get("o")).approvedAdditionalAmountCents, undefined);
  assert.equal(
    (
      await invoke(ch, customer, route, {
        decision: "APPROVE",
        changeOrderId: "extra-current",
      })
    ).code,
    200,
  );
  assert.equal((await repo.get("o")).approvedAdditionalAmountCents, 3000);
});

test("regressão: atribuição administrativa antiga exige versão da OS e não sobrescreve outra edição", async () => {
  const f = await fixture(),
    handler = adminHandler({ repository: f.repo, secretValue }),
    route = resolveOperationalPath("admin", ["order", "o1", "assign-provider"]);
  assert.equal(
    (await invoke(handler, admin, route, { providerId: "p1" })).code,
    400,
  );
  const expectedVersion = (await f.repo.get("o1")).version || 0;
  assert.equal(
    (await invoke(handler, admin, route, { providerId: "p1", expectedVersion }))
      .code,
    200,
  );
  const after = await f.repo.get("o1");
  assert.equal(
    (await invoke(handler, admin, route, { providerId: "p2", expectedVersion }))
      .code,
    409,
  );
  assert.deepEqual(await f.repo.get("o1"), after);
  assert.equal(after.providerId, "p1");
});
