"use strict";
const test = require("node:test"),
  assert = require("node:assert/strict");
const {
  fixture,
  admin,
  customer,
  professional,
  start,
  end,
} = require("../test-support/schedule-fixture");
const error = (code) => (e) => e.message === code;
test("visita: solicitação, dois aceites, relatório, conclusão e execução após orçamento", async () => {
  const f = await fixture(undefined, { mode: "VISIT" });
  let { appointment: a } = await f.book();
  assert.equal(a.status, "PENDING_PROVIDER");
  a = (await f.action(professional("p1"), "accept", a)).appointment;
  assert.equal(a.status, "CONFIRMED");
  f.setNow(start);
  a = (await f.action(professional("p1"), "start", a)).appointment;
  await assert.rejects(
    f.action(professional("p1"), "complete", a),
    error("TECHNICAL_REPORT_REQUIRED"),
  );
  a = (
    await f.action(professional("p1"), "technical", a, {
      conditions: "Ponto acessível",
      quantity: 1,
      unit: "unidade",
      materials: "Tomada",
      estimatedMinutes: 60,
    })
  ).appointment;
  assert.equal(a.proposal.referenceAmountCents, 14990);
  assert.equal(a.proposal.amountCents, null);
  a = (await f.action(professional("p1"), "complete", a)).appointment;
  assert.equal(a.status, "COMPLETED");
  assert.equal((await f.repo.get("o1")).status, "PROVIDER_ACCEPTED");
  const b = await f.book({
    type: "EXECUTION",
    slots: [{ start: "2030-01-08T15:00:00Z", end: "2030-01-08T16:00:00Z" }],
  });
  assert.equal(b.appointment.status, "PENDING_PROVIDER");
});
test("agendamento administrativo exige confirmação explícita do cliente e de toda equipe", async () => {
  const f = await fixture(undefined, { crew: 2 });
  let a = (
    await f.service.mutate(admin, "book", {
      orderId: "o1",
      type: "EXECUTION",
      slots: [{ start, end }],
      providerIds: ["p1", "p2"],
      reason: "Pedido telefônico",
    })
  ).appointment;
  a = (await f.action(professional("p1"), "accept", a)).appointment;
  assert.equal(a.status, "PENDING_PROVIDER");
  a = (await f.action(professional("p2"), "accept", a)).appointment;
  assert.equal(a.status, "PENDING_PROVIDER");
  a = (await f.action(customer, "confirm", a)).appointment;
  assert.equal(a.status, "CONFIRMED");
  f.setNow(start);
  a = (await f.action(professional("p1"), "start", a)).appointment;
  assert.equal((await f.repo.get("o1")).status, "SERVICE_STARTED");
  a = (await f.action(professional("p2"), "complete", a)).appointment;
  assert.equal((await f.repo.get("o1")).status, "SERVICE_COMPLETED");
  assert.equal(a.status, "COMPLETED");
});
test("remoto não cria visita e exige avaliação registrada antes da execução", async () => {
  const f = await fixture(undefined, { mode: "REMOTE" });
  await assert.rejects(f.book(), error("REMOTE_ASSESSMENT_REQUIRED"));
  await assert.rejects(f.book({ type: "VISIT" }), error("VISIT_NOT_REQUIRED"));
  const r = await f.service.mutate(professional("p1"), "assessment", {
    orderId: "o1",
    conditions: "Avaliação remota",
    quantity: 2,
    unit: "pontos",
    materials: "Cliente fornecerá",
    estimatedMinutes: 60,
  });
  assert.equal(r.proposal.amountCents, null);
  assert.equal((await f.book()).appointment.status, "PENDING_PROVIDER");
});
test("conflitos consideram tempo de deslocamento, reservas pendentes e períodos bloqueados", async () => {
  const f = await fixture();
  await f.book();
  await assert.rejects(f.book({ orderId: "o2" }), error("FORBIDDEN"));
  await assert.rejects(
    f.service.mutate({ ...customer, sub: "other-customer" }, "book", {
      orderId: "o2",
      type: "EXECUTION",
      slots: [{ start: "2030-01-08T13:30:00Z", end: "2030-01-08T14:30:00Z" }],
      providerIds: ["p1"],
      customerConfirmed: true,
    }),
    error("SCHEDULE_CONFLICT"),
  );
  await assert.rejects(
    f.service.mutate(professional("p1"), "availability", {
      windows: [],
      blocks: [],
      regions: [],
    }),
    error("AVAILABILITY_CONFLICTS_WITH_APPOINTMENT"),
  );
});
test("sem janelas, habilitação válida ou região não há horários inventados", async () => {
  const f = await fixture();
  await f.service.mutate(professional("p1"), "availability", {
    windows: [],
    blocks: [],
    regions: [],
  });
  assert.equal(
    (
      await f.service.availability(customer, {
        orderId: "o1",
        type: "EXECUTION",
        from: start,
      })
    ).options.length,
    0,
  );
  await assert.rejects(f.book(), error("PROVIDER_NOT_ELIGIBLE"));
});
test("orçamento não aprovado e materiais pendentes impedem execução", async () => {
  const f = await fixture();
  let o = await f.repo.get("o1");
  o.quoteStatus = "CUSTOMER_QUOTE_SENT";
  await f.repo.save(o);
  await assert.rejects(f.book(), error("APPROVED_QUOTE_AND_CONTRACT_REQUIRED"));
  o.quoteStatus = "CUSTOMER_APPROVED";
  await f.repo.save(o);
  await f.service.mutate(admin, "plan", {
    orderId: "o1",
    mode: "DIRECT",
    durationMinutes: 60,
    crewSize: 1,
    providerIds: ["p1"],
    materialsReady: false,
    reason: "Materiais pendentes",
  });
  await assert.rejects(f.book(), error("MATERIALS_NOT_READY"));
});
test("vários dias e equipe: reserva integral falha sem gravar parcialmente", async () => {
  const f = await fixture(undefined, { crew: 2, duration: 960 });
  const slots = [
    { start: "2030-01-08T11:00:00Z", end: "2030-01-08T19:00:00Z" },
    { start: "2030-01-09T11:00:00Z", end: "2030-01-09T19:00:00Z" },
  ];
  await f.service.mutate(professional("p2"), "availability", {
    windows: [{ start: "2030-01-08T10:00:00Z", end: "2030-01-08T23:00:00Z" }],
    blocks: [],
    regions: [{ city: "Belo Horizonte", state: "MG" }],
  });
  await assert.rejects(f.book({ slots }), error("SCHEDULE_CONFLICT"));
  assert.equal(Object.keys((await f.repo.read()).appointments).length, 0);
  await f.service.mutate(professional("p2"), "availability", {
    windows: [
      { start: "2030-01-08T10:00:00Z", end: "2030-01-08T23:00:00Z" },
      { start: "2030-01-09T10:00:00Z", end: "2030-01-09T23:00:00Z" },
    ],
    blocks: [],
    regions: [{ city: "Belo Horizonte", state: "MG" }],
  });
  assert.equal((await f.book({ slots })).appointment.slots.length, 2);
});
test("reagendamento mantém horário anterior até novos aceites e cancela atomicamente ao confirmar", async () => {
  const f = await fixture();
  let a = (await f.book()).appointment;
  a = (await f.action(professional("p1"), "accept", a)).appointment;
  a = (
    await f.action(customer, "reschedule", a, { reason: "Mudança de horário" })
  ).appointment;
  const b = (
    await f.book({
      replaceId: a.id,
      slots: [{ start: "2030-01-08T16:00:00Z", end: "2030-01-08T17:00:00Z" }],
    })
  ).appointment;
  assert.equal((await f.repo.read()).appointments[a.id].status, "CONFIRMED");
  await f.action(professional("p1"), "accept", b);
  assert.equal((await f.repo.read()).appointments[a.id].status, "CANCELLED");
  assert.equal((await f.repo.read()).appointments[b.id].status, "CONFIRMED");
});
test("cancelamento com motivo libera reserva; versão obsoleta não altera dados", async () => {
  const f = await fixture();
  let a = (await f.book()).appointment;
  await assert.rejects(
    f.action(customer, "cancel", a, { version: 0, reason: "Solicitado" }),
    error("STALE_APPOINTMENT"),
  );
  a = (await f.action(customer, "cancel", a, { reason: "Cliente solicitou" }))
    .appointment;
  assert.equal(a.status, "CANCELLED");
  assert.equal((await f.repo.read()).audit.at(-1).actorId, customer.sub);
  await f.book();
});
test("cancelamento tardio requer CAC; nenhum valor de multa é inventado", async () => {
  const f = await fixture();
  let a = (await f.book()).appointment;
  a = (await f.action(professional("p1"), "accept", a)).appointment;
  f.setNow("2030-01-08T11:30:00Z");
  await assert.rejects(
    f.action(customer, "cancel", a, { reason: "Mudança" }),
    error("CONTACT_CAC_REQUIRED"),
  );
  assert.equal(
    (
      await f.action(admin, "cancel", a, {
        reason: "Ajuste comercial aprovado",
      })
    ).appointment.status,
    "CANCELLED",
  );
});
test("segurança: dono do pedido, profissional atribuído e perfil; projeção sem informações internas", async () => {
  const f = await fixture();
  const a = (await f.book()).appointment;
  await assert.rejects(
    f.service.read({ ...customer, sub: "intruso" }, { orderId: "o1" }),
    error("FORBIDDEN"),
  );
  await assert.rejects(
    f.action(professional("p3"), "accept", a),
    error("FORBIDDEN"),
  );
  await assert.rejects(
    f.service.mutate(professional("p1"), "qualification", {}),
    error("FORBIDDEN"),
  );
  const view = await f.service.read(customer, { orderId: "o1" });
  assert.equal(view.audit, undefined);
  assert.equal(view.profiles, undefined);
  assert.doesNotMatch(
    JSON.stringify(view),
    /password|cpf|commission|margin|minimumPayout|"cost"/i,
  );
});
test("reserva expirada libera horário; aceite fora do prazo não confirma", async () => {
  const f = await fixture();
  const a = (await f.book()).appointment;
  f.setNow("2030-01-08T12:01:00Z");
  await assert.rejects(
    f.action(professional("p1"), "accept", a),
    error("APPOINTMENT_NOT_ACTIVE"),
  );
  assert.equal(
    (await f.service.read(customer, { orderId: "o1" })).appointments[0].status,
    "EXPIRED",
  );
});
test("mensagens não alegam confirmação antes dos aceites; pós-venda após conclusão", async () => {
  const f = await fixture();
  const a = (await f.book()).appointment;
  await assert.rejects(
    f.action(admin, "notification", a, {
      event: "EXECUTION_SCHEDULED",
      reason: "Teste",
    }),
    error("NOTIFICATION_STATE_MISMATCH"),
  );
  const notes = (await f.repo.read()).notifications;
  assert.match(notes[0].text, /ainda depende/);
  assert.equal(notes[0].delivery, "MANUAL_COPY_ONLY");
});
test("somente avaliação humana quando não existe regra aprovada; catálogo permanece intacto", async () => {
  const f = await fixture();
  delete f.repo.state.rules.RP0001;
  await assert.rejects(f.book(), error("HUMAN_REVIEW_REQUIRED"));
  assert.equal(require("../catalog").catalog.length, 111);
  assert.equal(
    require("../catalog").getServiceByCode("RP0001").customerPriceCents,
    14990,
  );
});
test("fuso de apresentação e conversão não dependem do fuso da máquina", () => {
  const ui = require("../public/agenda/agenda");
  assert.equal(ui.instant("2030-01-08T09:00"), start);
  assert.match(ui.format(start), /09:00/);
  assert.throws(() => ui.instant("2030-02-31T12:00"));
  const { periods } = require("../server/schedule-service");
  assert.throws(
    () => periods([{ start: "2030-01-08T09:00", end }]),
    error("TIMESTAMP_WITH_OFFSET_REQUIRED"),
  );
});

test("habilitação deve continuar válida até o final do atendimento proposto", async () => {
  const f = await fixture();
  f.repo.state.profiles.p1.qualification.validUntil = "2030-01-08T12:30:00Z";
  await assert.rejects(f.book(), /SCHEDULE_CONFLICT/);
});
test("consulta não oferece horários de execução com materiais ainda pendentes", async () => {
  const f = await fixture();
  f.repo.state.plans.o1.materialsReady = false;
  await assert.rejects(
    f.service.availability(customer, {
      orderId: "o1",
      type: "EXECUTION",
      from: start,
    }),
    /MATERIALS_NOT_READY/,
  );
});
