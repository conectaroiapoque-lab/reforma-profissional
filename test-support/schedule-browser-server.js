"use strict";
// Explicit test-only harness, never included by scripts/build-web.js. No production data.
const {
    fixture,
    admin,
    customer,
    professional,
  } = require("./schedule-fixture"),
  { signSession } = require("../server/auth"),
  { createHandler } = require("../server/schedule-api"),
  { createServer } = require("../scripts/dev-server");
async function start() {
  const secretValue = "TEST-ONLY-BROWSER-SESSION-SECRET-000",
    f = await fixture(undefined, { mode: "VISIT" });
  const a = (await f.book()).appointment;
  const tokens = {
    admin: signSession(admin, { secretValue }),
    customer: signSession(customer, { secretValue }),
    provider: signSession(professional("p1"), { secretValue }),
  };
  const server = createServer({
    agendaHandler: (scope) =>
      createHandler(scope, { repository: f.repo, secretValue, clock: f.now }),
    beforeRequest: async (req, res) => {
      if (req.url === "/api/provider/me") {
        res.setHeader("content-type", "application/json");
        res.end(
          JSON.stringify({
            provider: { status: "APPROVED", correctionRequests: [] },
          }),
        );
        return true;
      }
      if (req.url === "/__test_sessions") {
        res.setHeader("content-type", "application/json");
        res.end(
          JSON.stringify({
            tokens,
            order: {
              orderId: "o1",
              protocol: "PED-o1",
              status: "REQUESTED",
              orderAccessToken: tokens.customer,
            },
            appointmentId: a.id,
          }),
        );
        return true;
      }
      return false;
    },
  });
  server.listen(8001, "127.0.0.1", () =>
    console.log("Test-only browser fixture listening on port 8001"),
  );
}
if (require.main === module) start();
