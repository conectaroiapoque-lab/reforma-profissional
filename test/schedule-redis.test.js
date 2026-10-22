"use strict";
const test = require("node:test"),
  assert = require("node:assert/strict"),
  { spawn, execFile } = require("node:child_process"),
  { promisify } = require("node:util"),
  fs = require("node:fs/promises"),
  os = require("node:os"),
  path = require("node:path");
const exec = promisify(execFile),
  { ScheduleRepository, KEY } = require("../server/schedule-repository"),
  {
    fixture,
    customer,
    professional,
    start,
  } = require("../test-support/schedule-fixture");
const server = process.env.REDIS_SERVER || "redis-server",
  cli = process.env.REDIS_CLI || "redis-cli";
test("Redis real: concorrência, atomicidade de equipe/dias, CAS com dependências e atualização da OS", async (t) => {
  try {
    await exec(server, ["--version"]);
    await exec(cli, ["--version"]);
  } catch {
    t.skip(
      "Instale redis-server e redis-cli ou defina REDIS_SERVER / REDIS_CLI para executar a integração real.",
    );
    return;
  }
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "rp-redis-")),
    socket = path.join(dir, "redis.sock"),
    child = spawn(
      server,
      [
        "--port",
        "0",
        "--unixsocket",
        socket,
        "--save",
        "",
        "--appendonly",
        "no",
        "--dir",
        dir,
      ],
      { stdio: "ignore" },
    );
  t.after(async () => {
    child.kill("SIGTERM");
    await fs.rm(dir, { recursive: true, force: true });
  });
  for (let i = 0; i < 100; i++) {
    try {
      await fs.access(socket);
      break;
    } catch {
      await new Promise((r) => setTimeout(r, 20));
    }
  }
  class LocalRepository extends ScheduleRepository {
    constructor() {
      super({ url: "http://unused", token: "test-only" });
    }
    async command(...args) {
      const result = await exec(
        cli,
        ["--json", "-s", socket, ...args.map(String)],
        { maxBuffer: 20_000_000 },
      );
      const value = JSON.parse(result.stdout);
      if (value?.error) throw new Error("REDIS_ERROR");
      return value;
    }
  }
  const repo = new LocalRepository();
  // Seed through production Redis formats, then run exactly the production transaction implementation.
  const original = repo.saveProvider.bind(repo);
  repo.saveProvider = async (provider) => {
    await repo.command(
      "SET",
      `provider:${provider.providerId}`,
      JSON.stringify(provider),
    );
    await repo.command("SADD", "providers", provider.providerId);
    return provider;
  };
  const f = await fixture(repo, { crew: 2, duration: 960 }),
    slots = [
      { start: "2030-01-08T11:00:00Z", end: "2030-01-08T19:00:00Z" },
      { start: "2030-01-09T11:00:00Z", end: "2030-01-09T19:00:00Z" },
    ];
  const requests = await Promise.allSettled([
    f.book({ slots }),
    f.service.mutate({ ...customer, sub: "other-customer" }, "book", {
      orderId: "o2",
      type: "EXECUTION",
      slots,
      providerIds: ["p1", "p2"],
      customerConfirmed: true,
    }),
  ]);
  assert.equal(requests.filter((r) => r.status === "fulfilled").length, 1);
  assert.equal(
    requests.find((r) => r.status === "rejected").reason.message,
    "SCHEDULE_CONFLICT",
  );
  let state = await repo.read();
  assert.equal(Object.keys(state.appointments).length, 1);
  const booked = Object.values(state.appointments)[0];
  assert.equal(booked.slots.length, 2);
  assert.equal(booked.providerIds.length, 2);
  const before = state.revision;
  await assert.rejects(
    repo.transaction(async (s, refs) => {
      await refs.order(booked.orderId);
      s.appointments.bad = {};
      throw new Error("INTERRUPTED");
    }),
  );
  assert.equal((await repo.read()).revision, before);
  assert.equal((await repo.read()).appointments.bad, undefined);
  // Force a real dependency write between snapshot and EVAL: callback must revalidate.
  let visits = 0;
  await repo.transaction(async (s, refs) => {
    const order = await refs.order(booked.orderId);
    visits++;
    if (visits === 1) {
      order.externalRevision = 1;
      await repo.command(
        "SET",
        `order:${order.orderId}`,
        JSON.stringify(order),
      );
    }
    s.testDependency = order.externalRevision || 0;
  });
  assert.equal(visits, 2);
  assert.equal((await repo.read()).testDependency, 1);
  let a = booked;
  for (const id of ["p1", "p2"])
    a = (await f.action(professional(id), "accept", a)).appointment;
  assert.equal(a.status, "CONFIRMED");
  f.setNow(slots[0].start);
  a = (await f.action(professional("p1"), "start", a)).appointment;
  assert.equal((await repo.get(a.orderId)).status, "SERVICE_STARTED");
  assert.equal((await repo.read()).appointments[a.id].status, "IN_PROGRESS");
  a = (await f.action(professional("p2"), "complete", a)).appointment;
  assert.equal((await repo.get(a.orderId)).status, "SERVICE_COMPLETED");
  assert.equal(
    (await repo.get(a.orderId)).fiscalStatus,
    "FISCAL_DOCUMENT_REQUIRED",
  );
  // No deletion of existing order/provider data, versioned additive scheduling key only.
  assert.equal((await repo.command("SMEMBERS", "orders")).length, 2);
  assert.equal((await repo.command("SMEMBERS", "providers")).length, 3);
  assert.ok(await repo.command("GET", KEY));
  repo.saveProvider = original;
});
