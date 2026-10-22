"use strict";
const { authorize } = require("./auth"),
  { send, wrap } = require("./http"),
  { ScheduleRepository } = require("./schedule-repository"),
  { ScheduleService } = require("./schedule-service"),
  { body } = require("./operations-api");
const permissions = {
  customer: "OWN_ORDER_READ",
  provider: "PROVIDER_OPERATE",
  admin: "ADMIN_WRITE",
};
const actions = {
  customer: new Set([
    "book",
    "confirm",
    "cancel",
    "reschedule",
    "proposal-decision",
  ]),
  provider: new Set([
    "availability",
    "accept",
    "decline",
    "reschedule",
    "start",
    "complete",
    "technical",
    "assessment",
  ]),
  admin: new Set([
    "rule",
    "qualification",
    "availability",
    "plan",
    "book",
    "cancel",
    "reschedule",
    "notification",
    "proposal",
  ]),
};
function createHandler(
  scope,
  { repository, secretValue, rateLimiter, clock, storage } = {},
) {
  return wrap(async (req, res) => {
    const claims = authorize(req, permissions[scope], { secretValue });
    if (claims.role !== scope.toUpperCase())
      throw Object.assign(new Error("FORBIDDEN"), { statusCode: 403 });
    res.setHeader?.("cache-control", "private, no-store");
    const service = new ScheduleService(
      repository || new ScheduleRepository(),
      { clock, storage },
    );
    if (rateLimiter)
      await rateLimiter.assert({
        scope: "scheduling",
        identity: claims.sub,
        limit: 60,
      });
    if (req.method === "GET") {
      const query = req.query || {};
      if (query.assist)
        return send(
          res,
          200,
          require("./schedule-assistant").suggestServices(
            String(query.assist).slice(0, 500),
          ),
        );
      return send(
        res,
        200,
        query.options === "true"
          ? await service.availability(claims, {
              orderId: query.orderId,
              type: query.type,
              from: query.from,
              days: Number(query.days || 7),
            })
          : await service.read(claims, { orderId: query.orderId }),
      );
    }
    if (req.method !== "POST")
      return send(res, 405, { error: "METHOD_NOT_ALLOWED" });
    const input = body(req);
    if (!actions[scope].has(input.action))
      return send(res, 403, { error: "FORBIDDEN" });
    return send(res, 200, await service.mutate(claims, input.action, input));
  });
}
function handle(scope, req, res) {
  return wrap(async (req, res) => {
    authorize(req, permissions[scope]);
    const { productionRateLimiter } = require("./rate-limit"),
      { productionPrivateFileStorage } = require("./private-file-storage");
    return createHandler(scope, {
      rateLimiter: productionRateLimiter(),
      storage: productionPrivateFileStorage(),
    })(req, res);
  })(req, res);
}
module.exports = { createHandler, handle };
