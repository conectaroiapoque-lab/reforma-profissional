"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const Rules = require("../provider.js");

test("termos têm versões independentes e formato não vazio", () => {
  assert.equal(Rules.PROVIDER_TERMS_VERSION, "1.0-2026-09");
  assert.equal(Rules.CLIENT_TERMS_VERSION, "1.0-2026-09");
  assert.equal(Rules.termsSections.length, 17);
  assert.ok(Rules.clientTermsSections.some(([title]) => title === "Intermediação"));
});

test("aceite registra versão, instante e identificador local, preservando campos futuros", () => {
  const accepted = Rules.createAcceptance({ providerId: "P-1", name: "Ana Silva", taxId: "123", acceptedAt: "2026-09-03T10:00:00Z" });
  assert.deepEqual(accepted, { termsVersion: "1.0-2026-09", acceptedAt: "2026-09-03T10:00:00.000Z", providerId: "P-1", name: "Ana Silva", taxId: "123", ipAddress: null, userAgent: null, auditSource: "LOCAL_MVP" });
});

test("somente prestador aprovado recebe oportunidades", () => {
  for (const status of Rules.PROVIDER_STATUSES) assert.equal(Rules.canReceiveServices({ status }), status === "APROVADO");
});

test("aprovação e suspensão seguem transições explícitas com histórico", () => {
  const initial = { status: "EM ANÁLISE", statusHistory: [] };
  const approved = Rules.transitionStatus(initial, "APROVADO");
  assert.equal(approved.status, "APROVADO");
  assert.equal(approved.statusHistory.at(-1).to, "APROVADO");
  assert.throws(() => Rules.transitionStatus(initial, "SUSPENSO"), /não permitida/);
});

test("recusar oportunidade ou ficar indisponível não é transição automática", () => {
  assert.equal(Rules.allowedTransitions, undefined);
  const text = Rules.termsSections.flat().join(" ");
  assert.match(text, /recusa, isoladamente, não gera punição automática/i);
  assert.match(text, /ficar indisponível ou trabalhar para terceiros não são motivos automáticos/i);
});

test("perfil público remove dados sensíveis do prestador", () => {
  const publicData = Rules.publicProviderProfile({ fullName: "Ana Silva", cpf: "123", cnpj: "456", pixKey: "secret", documents: { id: ["rg.pdf"] }, address: "Rua A", specialties: ["Pintor"], rating: 4.9, rank: "Ouro", completedServices: 12, experienceYears: 5 });
  assert.equal(publicData.professionalName, "Ana");
  for (const sensitive of ["cpf", "cnpj", "pixKey", "documents", "address"]) assert.equal(sensitive in publicData, false);
});

test("oportunidade protege contato e endereço do cliente antes de autorização", () => {
  const request = { neighborhood: "Centro", city: "Belo Horizonte", service: "Elétrica", description: "Tomada", urgency: "Hoje", whatsapp: "31999", email: "x@y.com", address: "Rua A", number: "10" };
  const preview = Rules.professionalOpportunity(request, false);
  assert.equal(preview.phone, undefined); assert.equal(preview.email, undefined); assert.equal(preview.fullAddress, undefined);
  assert.equal(Rules.professionalOpportunity(request, true).phone, "31999");
});
