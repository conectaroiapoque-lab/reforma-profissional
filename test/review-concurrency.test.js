"use strict";
const test = require("node:test"),
  assert = require("node:assert/strict"),
  { isolatedRedis } = require("../test-support/isolated-redis");
const {
    fixture,
    admin,
    professional,
  } = require("../test-support/schedule-fixture"),
  ops = require("../server/operations-service"),
  { CAS } = require("../server/schedule-repository");
const deferred = () => {
  let resolve;
  return {
    promise: new Promise((r) => (resolve = r)),
    resolve: () => resolve(),
  };
};
function pauseWrite(repo, match) {
  const original = repo.command.bind(repo),
    seen = deferred(),
    release = deferred();
  let paused = false;
  repo.command = async (...args) => {
    if (!paused && args[0] === "EVAL" && args[1] === CAS && match(args)) {
      paused = true;
      seen.resolve();
      await release.promise;
    }
    return original(...args);
  };
  return {
    seen: seen.promise,
    release: release.resolve,
    restore: () => (repo.command = original),
  };
}
test("Redis real: escrita antiga da OS pausada não desfaz início confirmado pela agenda", async (t) => {
  const repo = await isolatedRedis(t);
  if (!repo) return;
  const f = await fixture(repo);
  let a = (await f.book()).appointment;
  a = (await f.action(professional("p1"), "accept", a)).appointment;
  const gate = pauseWrite(repo, (args) =>
    args.some((v) => typeof v === "string" && v.includes("SERVICE_AUTHORIZED")),
  );
  const pending = ops.adminAction(repo, "o1", "authorize-service", {}, admin);
  try {
    await gate.seen;
    f.setNow("2030-01-08T12:00:00Z");
    a = (await f.action(professional("p1"), "start", a)).appointment;
  } finally {
    gate.release();
  }
  await pending;
  gate.restore();
  const order = await repo.get("o1");
  assert.equal(order.status, "SERVICE_STARTED");
  assert.equal((await repo.read()).appointments[a.id].status, "IN_PROGRESS");
  assert.ok(order.auditTrail.some((e) => e.event === "SERVICE_STARTED"));
  assert.ok(order.auditTrail.some((e) => e.event === "SERVICE_AUTHORIZED"));
  assert.ok(order.version >= 2);
});
test("Redis real: plano criado durante início antigo força revalidação e impede bypass", async (t) => {
  const repo = await isolatedRedis(t);
  if (!repo) return;
  const f = await fixture(repo);
  await repo.transaction((s) => {
    delete s.plans.o1;
  });
  const gate = pauseWrite(repo, (args) =>
    args.some((v) => typeof v === "string" && v.includes("SERVICE_STARTED")),
  );
  const pending = ops.providerAction(repo, "o1", "p1", "start");
  const outcome = assert.rejects(pending, /USE_SCHEDULE_ACTION/);
  try {
    await gate.seen;
    await f.adminMutate("plan", {
      orderId: "o1",
      mode: "DIRECT",
      durationMinutes: 60,
      crewSize: 1,
      providerIds: ["p1"],
      materialsReady: true,
      reason: "Plano criado durante disputa",
    });
  } finally {
    gate.release();
  }
  await outcome;
  gate.restore();
  assert.equal((await repo.get("o1")).status, "PROVIDER_ACCEPTED");
  assert.ok((await repo.read()).plans.o1);
});
test("Redis real: save de cópia desatualizada da OS é rejeitado após escrita da agenda", async (t) => {
  const repo = await isolatedRedis(t);
  if (!repo) return;
  const f = await fixture(repo);
  let a = (await f.book()).appointment;
  a = (await f.action(professional("p1"), "accept", a)).appointment;
  const stale = await repo.get("o1");
  f.setNow("2030-01-08T12:00:00Z");
  await f.action(professional("p1"), "start", a);
  await assert.rejects(
    repo.save({ ...stale, status: "OFFERED" }),
    /STALE_ORDER/,
  );
  assert.equal((await repo.get("o1")).status, "SERVICE_STARTED");
});

test("Redis real: início revalida hora no retry e recusa pedido que saiu do período reservado", async (t) => {
  const repo = await isolatedRedis(t);
  if (!repo) return;
  const f = await fixture(repo, { duration: 120 });
  let a = (
    await f.book({
      slots: [
        { start: "2030-01-08T12:00:00Z", end: "2030-01-08T13:00:00Z" },
        { start: "2030-01-09T12:00:00Z", end: "2030-01-09T13:00:00Z" },
      ],
    })
  ).appointment;
  a = (await f.action(professional("p1"), "accept", a)).appointment;
  f.setNow("2030-01-08T12:59:59Z");
  const gate = pauseWrite(repo, (args) =>
    args.some((v) => typeof v === "string" && v.includes("SERVICE_STARTED")),
  );
  const pending = f.action(professional("p1"), "start", a),
    outcome = assert.rejects(pending, /INVALID_START/);
  try {
    await gate.seen;
    await repo.transaction((s) => {
      s.testConcurrentRevision = true;
    });
    f.setNow("2030-01-08T13:00:01Z");
  } finally {
    gate.release();
  }
  await outcome;
  gate.restore();
  assert.equal((await repo.get("o1")).status, "PROVIDER_ACCEPTED");
  assert.equal((await repo.read()).appointments[a.id].status, "CONFIRMED");
});
