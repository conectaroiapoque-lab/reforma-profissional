"use strict";
const test = require("node:test"),
  assert = require("node:assert/strict"),
  { createHandler } = require("../server/schedule-api"),
  { signSession } = require("../server/auth"),
  {
    fixture,
    admin,
    customer,
    professional,
    start,
    end,
  } = require("../test-support/schedule-fixture");
const secretValue = "TEST-ONLY-SCHEDULING-SESSION-SECRET-000";
async function request(
  f,
  scope,
  actor,
  { method = "GET", query = {}, input } = {},
) {
  let code,
    body,
    headers = {};
  const req = {
    method,
    headers: actor
      ? { authorization: "Bearer " + signSession(actor, { secretValue }) }
      : {},
    query,
    body: input,
  };
  const res = {
    setHeader: (k, v) => (headers[k] = v),
    status(s) {
      code = s;
      return this;
    },
    json(v) {
      body = v;
    },
  };
  await createHandler(scope, { repository: f.repo, secretValue, clock: f.now })(
    req,
    res,
  );
  return { code, body, headers };
}
test("API: autenticação, isolamento de perfis e resposta privada sem cache", async () => {
  const f = await fixture();
  assert.equal(
    (await request(f, "customer", null, { query: { orderId: "o1" } })).code,
    401,
  );
  assert.equal((await request(f, "admin", professional("p1"))).code, 403);
  assert.equal(
    (
      await request(
        f,
        "customer",
        { ...customer, sub: "intruso" },
        { query: { orderId: "o1" } },
      )
    ).code,
    403,
  );
  const r = await request(f, "customer", customer, {
    query: { orderId: "o1" },
  });
  assert.equal(r.code, 200);
  assert.equal(r.headers["cache-control"], "private, no-store");
  assert.equal(
    (
      await request(f, "provider", professional("p1"), {
        method: "POST",
        input: { action: "qualification" },
      })
    ).code,
    403,
  );
});
test("API: orçamento oficial aprovado pelo cliente antes da reserva; versão de proposta obrigatória", async () => {
  const f = await fixture();
  const o = await f.repo.get("o1");
  o.quoteStatus = null;
  await f.repo.save(o);
  let r = await request(f, "admin", admin, {
    method: "POST",
    input: {
      action: "proposal",
      orderId: "o1",
      amountCents: 1,
      description: "Troca conforme tabela",
      reason: "Escopo validado",
    },
  });
  assert.equal(r.code, 200);
  assert.equal(r.body.quote.amountCents, 14990);
  let view = (
    await request(f, "customer", customer, { query: { orderId: "o1" } })
  ).body;
  assert.equal(view.orders[0].quote.quoteId, r.body.quote.quoteId);
  assert.equal(view.orders[0].quoteStatus, "CUSTOMER_QUOTE_SENT");
  assert.equal(
    (
      await request(f, "customer", customer, {
        method: "POST",
        input: {
          action: "proposal-decision",
          orderId: "o1",
          quoteId: "antiga",
          decision: "APPROVE",
        },
      })
    ).code,
    409,
  );
  r = await request(f, "customer", customer, {
    method: "POST",
    input: {
      action: "proposal-decision",
      orderId: "o1",
      quoteId: r.body.quote.quoteId,
      decision: "APPROVE",
    },
  });
  assert.equal(r.code, 200);
  assert.equal(r.body.quoteStatus, "CUSTOMER_APPROVED");
  r = await request(f, "customer", customer, {
    method: "POST",
    input: {
      action: "book",
      orderId: "o1",
      type: "EXECUTION",
      slots: [{ start, end }],
      providerIds: ["p1"],
      customerConfirmed: true,
    },
  });
  assert.equal(r.code, 200);
  assert.equal(r.body.appointment.status, "PENDING_PROVIDER");
});
test("API: métodos e ações não permitidos não alteram agenda", async () => {
  const f = await fixture(),
    before = (await f.repo.read()).revision;
  assert.equal(
    (await request(f, "admin", admin, { method: "DELETE" })).code,
    405,
  );
  assert.equal(
    (
      await request(f, "customer", customer, {
        method: "POST",
        input: { action: "rule", serviceCode: "RP0001" },
      })
    ).code,
    403,
  );
  assert.equal((await f.repo.read()).revision, before);
});
test("evidências técnicas exigem propriedade e consentimento, sem aceitar referência de outro profissional", async () => {
  const f = await fixture(undefined, { mode: "REMOTE" });
  f.service.storage = {
    get: async () => ({ ownerId: "p2", mimeType: "image/jpeg" }),
  };
  const input = {
    orderId: "o1",
    quantity: 1,
    estimatedMinutes: 60,
    conditions: "Teste",
    unit: "unidade",
    materials: "Nenhum",
    photoEvidenceIds: ["private-file"],
  };
  await assert.rejects(
    f.service.mutate(professional("p1"), "assessment", input),
    /PHOTO_CONSENT_REQUIRED/,
  );
  await assert.rejects(
    f.service.mutate(professional("p1"), "assessment", {
      ...input,
      photoConsent: true,
    }),
    /INVALID_EVIDENCE/,
  );
  assert.equal(Object.keys((await f.repo.read()).assessments).length, 0);
});

test("assistente usa apenas catálogo oficial e não recebe autoridade de confirmação", async () => {
  const f = await fixture();
  const r = await request(f, "customer", customer, {
    query: { assist: "tomada elétrica" },
  });
  assert.equal(r.code, 200);
  assert.ok(r.body.services.some((s) => s.serviceCode === "RP0001"));
  assert.equal(r.body.policy.autonomousConfirmation, false);
  assert.equal(r.body.policy.externalModelEnabled, false);
  assert.doesNotMatch(
    JSON.stringify(r.body.services),
    /commission|margin|providerMinimum|password/,
  );
});
test("timestamp impossível não é normalizado silenciosamente pelo servidor", () => {
  const { instant } = require("../server/schedule-service");
  assert.throws(() => instant("2030-02-31T12:00:00Z"), /INVALID_CALENDAR_DATE/);
  assert.equal(instant("2030-01-08T09:00:00-03:00"), start);
});
