"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { parseJsonRequest } = require("../api/orders");
test("API rejeita content-type não JSON com erro amigável", () => assert.throws(() => parseJsonRequest({ headers: { "content-type": "text/plain" }, body: "{}" }), error => error.statusCode === 415));
test("API aceita JSON já processado ou texto válido", () => { assert.deepEqual(parseJsonRequest({ headers: { "content-type": "application/json; charset=utf-8" }, body: '{"ok":true}' }), { ok: true }); assert.deepEqual(parseJsonRequest({ headers: { "content-type": "application/json" }, body: { ok: true } }), { ok: true }); });
test("API converte JSON inválido em 400 sem expor parser", () => assert.throws(() => parseJsonRequest({ headers: { "content-type": "application/json" }, body: "<html>" }), error => error.statusCode === 400 && error.message === "INVALID_JSON_BODY"));
