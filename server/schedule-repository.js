"use strict";
const {
  RedisOrderRepository,
  datastoreUnavailable,
} = require("./order-repository");
const KEY = "rp:scheduling:v1";
const empty = () => ({
  schemaVersion: 1,
  revision: 0,
  profiles: {},
  rules: {},
  plans: {},
  assessments: {},
  appointments: {},
  audit: [],
  notifications: [],
});
// One compare-and-swap serializes all calendar writes, including complete crews and days.
// Dependency keys prevent booking against an order/provider changed during validation.
const CAS = `if (redis.call('GET',KEYS[1]) or '') ~= ARGV[1] then return 0 end
for i=2,#KEYS do if (redis.call('GET',KEYS[i]) or '') ~= ARGV[i+1] then return 0 end end
redis.call('SET',KEYS[1],ARGV[2]); for i=2,#KEYS do local value=ARGV[#KEYS+i]; if value and value~='' then redis.call('SET',KEYS[i],value) end end; return 1`;
class ScheduleRepository extends RedisOrderRepository {
  async command(...args) {
    try {
      const response = await fetch(this.url, {
        method: "POST",
        headers: {
          authorization: `Bearer ${this.token}`,
          "content-type": "application/json",
        },
        body: JSON.stringify(args),
      });
      if (!response.ok) throw datastoreUnavailable();
      const body = await response.json();
      if (body.error) throw datastoreUnavailable("SCHEDULING_REDIS_ERROR");
      return body.result;
    } catch {
      throw datastoreUnavailable();
    }
  }
  async read() {
    const raw = await this.command("GET", KEY);
    return raw ? JSON.parse(raw) : empty();
  }
  async transaction(fn) {
    for (let attempt = 0; attempt < 12; attempt++) {
      const raw = await this.command("GET", KEY),
        state = raw ? JSON.parse(raw) : empty(),
        dependencies = new Map(),
        writes = new Map();
      const read = async (key) => {
        if (!dependencies.has(key))
          dependencies.set(key, (await this.command("GET", key)) || "");
        const value = dependencies.get(key);
        return value ? JSON.parse(value) : null;
      };
      if (state.schemaVersion !== 1)
        throw Object.assign(new Error("UNSUPPORTED_SCHEDULE_SCHEMA"), {
          statusCode: 503,
        });
      const result = await fn(state, {
        order: (id) => read(`order:${id}`),
        provider: (id) => read(`provider:${id}`),
        saveOrder: (order) =>
          writes.set(`order:${order.orderId}`, JSON.stringify(order)),
      });
      state.revision++;
      if (Buffer.byteLength(JSON.stringify(state)) > 8_000_000)
        throw Object.assign(new Error("SCHEDULE_CAPACITY_REQUIRES_ARCHIVING"), {
          statusCode: 503,
        });
      const keys = [KEY, ...dependencies.keys()],
        ok = await this.command(
          "EVAL",
          CAS,
          keys.length,
          ...keys,
          raw || "",
          JSON.stringify(state),
          ...dependencies.values(),
          ...[...dependencies.keys()].map((key) => writes.get(key) || ""),
        );
      if (ok === 1) return result;
    }
    throw Object.assign(new Error("SCHEDULE_BUSY_RETRY"), { statusCode: 409 });
  }
}
module.exports = { ScheduleRepository, empty, CAS, KEY };
