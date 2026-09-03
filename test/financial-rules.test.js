"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const payments = require("../payments.js");
const business = require("../business-rules.js");

test("simula 1x a 12x para R$ 1.000 e preserva os totais de 1x a 3x", () => {
  const options = payments.calculateInstallmentOptions(1000);
  assert.equal(options.length, 12);
  options.forEach((option, index) => {
    assert.equal(option.installments, index + 1);
    assert.equal(option.fee, payments.PAYMENT_FEES[index + 1]);
    assert.equal(Number(option.installmentValues.reduce((sum, value) => sum + value, 0).toFixed(2)), option.total);
    assert.ok(Number.isFinite(option.total));
  });
  assert.equal(options[0].total, options[1].total);
  assert.equal(options[1].total, options[2].total);
  assert.deepEqual(options.map(option => option.interestFree), [true,true,true,false,false,false,false,false,false,false,false,false]);
});

test("gross-up e parcelas rejeitam entradas inválidas", () => {
  for (const value of [NaN, Infinity, -1, "x"]) assert.throws(() => payments.calculateGrossUp(value, .1));
  for (const fee of [NaN, -0.1, 1, Infinity]) assert.throws(() => payments.calculateGrossUp(1000, fee));
  for (const count of [0, 1.5, 13]) assert.throws(() => payments.validateInstallments(count));
});

test("estrutura PIX e débito não simula transação nem armazena cartão", () => {
  const methods = payments.createPaymentMethods(1000);
  assert.equal(methods.pix.status, "AWAITING_GATEWAY");
  assert.equal(methods.debit.storesCardData, false);
  assert.equal(methods.credit.length, 12);
});

test("distribui 60/4/36 quando fiscal é diferente", () => {
  assert.deepEqual(business.calculateServiceDistribution(1000, "executor", "fiscal"), { executor: 600, inspector: 40, platform: 360, selfInspectionCommission: false });
});

test("distribui 60/0/40 e bloqueia comissão própria", () => {
  assert.deepEqual(business.calculateServiceDistribution(1000, "executor", "executor"), { executor: 600, inspector: 0, platform: 400, selfInspectionCommission: false });
});

test("garantia termina 90 dias após a conclusão", () => {
  const warranty = business.calculateWarrantyEnd("2026-01-01T12:00:00.000Z");
  assert.equal(warranty.warrantyEnd, "2026-04-01T12:00:00.000Z");
  assert.equal(warranty.warrantyDays, 90);
});

test("cashback exige PAID e COMPLETED e nunca permite saque", () => {
  assert.throws(() => business.createCashbackRecord({ value: 20, origin: "SERVICE", serviceId: "RP-1", paymentStatus: "PENDING", serviceStatus: "COMPLETED" }));
  const record = business.createCashbackRecord({ value: 20, origin: "SERVICE", serviceId: "RP-1", paymentStatus: "PAID", serviceStatus: "COMPLETED", date: "2026-01-01" });
  assert.equal(record.withdrawable, false);
  assert.equal(record.status, "AVAILABLE");
  assert.equal(record.service, "RP-1");
});

test("indicação bloqueia autoindicação e exige contratar, pagar e concluir", () => {
  const base = { value: 10, serviceId: "RP-2", paymentStatus: "PAID", serviceStatus: "COMPLETED", hired: true, date: "2026-01-01" };
  assert.throws(() => business.createReferralCashback({ ...base, referrerId: "1", referredId: "1" }));
  assert.throws(() => business.createReferralCashback({ ...base, hired: false, referrerId: "1", referredId: "2" }));
  assert.equal(business.createReferralCashback({ ...base, referrerId: "1", referredId: "2" }).origin, "REFERRAL");
});

test("ordem profissional não revela contato nem endereço antes da autorização", () => {
  const request = { protocol:"RP-1", service:"Pintura", description:"Parede", urgency:"Hoje", status:"Recebida", phone:"1", whatsapp:"2", email:"a@b.com", address:"Rua A", number:"10", neighborhood:"Centro", city:"BH" };
  const order = business.createProfessionalWorkOrder(request);
  for (const key of ["phone", "whatsapp", "email", "address", "serviceLocation"]) assert.equal(key in order, false);
});

test("interface conecta orçamento aprovado e renderiza todas as 12 opções", () => {
  const html = fs.readFileSync(new URL("../index.html", `file://${__dirname}/`), "utf8");
  const app = fs.readFileSync(new URL("../app.js", `file://${__dirname}/`), "utf8");
  assert.match(html, /id="payment-panel"/);
  assert.match(html, /PIX/);
  assert.match(html, /Cartão de débito/);
  assert.match(html, /id="installment-options"/);
  assert.match(app, /methods\.credit\.map/);
  assert.equal(payments.calculateInstallmentOptions(1000).map(x => x.displayText).length, 12);
});
