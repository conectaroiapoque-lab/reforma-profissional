"use strict";
const queues = new WeakMap();
function missing() {
  throw Object.assign(new Error("ORDER_NOT_FOUND"), { statusCode: 404 });
}
async function redisMutateOrder(id, fn) {
  // Reuse the SAME calendar/document CAS for every legacy OS mutation.
  const { ScheduleRepository } = require("./schedule-repository");
  return ScheduleRepository.prototype.transaction.call(
    this,
    async (state, refs) => {
      const order = await refs.order(id);
      if (!order) missing();
      const updated = await fn(order, state, refs);
      refs.saveOrder(updated);
      return updated;
    },
  );
}
async function memoryMutateOrder(id, fn) {
  if (typeof this.transaction === "function")
    return this.transaction(async (state, refs) => {
      const order = await refs.order(id);
      if (!order) missing();
      const updated = await fn(order, state, refs);
      refs.saveOrder(updated);
      return updated;
    });
  const result = (queues.get(this) || Promise.resolve()).then(async () => {
    const order = await this.get(id);
    if (!order) missing();
    const updated = await fn(order, null, {
      provider: (id) => this.getProvider(id),
    });
    updated.version = (order.version || 0) + 1;
    return this.save(updated);
  });
  queues.set(
    this,
    result.catch(() => {}),
  );
  return result;
}
const SAVE_ORDER = `local raw=redis.call('GET',KEYS[1]); if not raw then return -1 end
local old=cjson.decode(raw);if (old.version or 0)~=tonumber(ARGV[1]) then return 0 end
redis.call('SET',KEYS[1],ARGV[2]);return 1`;
async function saveRedisOrder(order) {
  if (!order?.orderId) missing();
  const expected = order.version || 0;
  const original=await this.get(order.orderId);
  if(!original)missing();
  if((original.version||0)!==expected)throw Object.assign(new Error("STALE_ORDER"),{statusCode:409});
  require("./quote-snapshots").preserve(original,order);
  const updated = { ...order, version: expected + 1 };
  const result = await this.command(
    "EVAL",
    SAVE_ORDER,
    1,
    `order:${order.orderId}`,
    expected,
    JSON.stringify(updated),
  );
  if (result === -1) missing();
  if (result !== 1)
    throw Object.assign(new Error("STALE_ORDER"), { statusCode: 409 });
  return updated;
}
module.exports = {
  redisMutateOrder,
  memoryMutateOrder,
  saveRedisOrder,
  SAVE_ORDER,
};
