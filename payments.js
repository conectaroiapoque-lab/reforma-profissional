"use strict";

(function exposePayments(root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.PaymentRules = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createPayments() {
  const PAYMENT_FEES = Object.freeze({
    1: 0.0449, 2: 0.0609, 3: 0.0695, 4: 0.0776,
    5: 0.0862, 6: 0.0952, 7: 0.1062, 8: 0.1122,
    9: 0.1214, 10: 0.1250, 11: 0.1349, 12: 0.1416
  });

  const toCents = value => {
    const number = Number(value);
    if (!Number.isFinite(number) || number < 0) throw new TypeError("O valor deve ser um número não negativo.");
    return Math.round((number + Number.EPSILON) * 100);
  };
  const fromCents = cents => cents / 100;
  const formatCurrency = value => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

  function validateInstallments(installments) {
    if (!Number.isInteger(installments) || !(installments in PAYMENT_FEES)) {
      throw new RangeError("A quantidade de parcelas deve estar entre 1 e 12.");
    }
    return installments;
  }

  function calculateGrossUp(baseValue, fee) {
    const baseCents = toCents(baseValue);
    const rate = Number(fee);
    if (!Number.isFinite(rate) || rate < 0 || rate >= 1) throw new RangeError("A taxa deve estar entre 0 e 1.");
    return fromCents(Math.round(baseCents / (1 - rate)));
  }

  function splitInstallments(total, installments) {
    validateInstallments(installments);
    const totalCents = toCents(total);
    const regularCents = Math.floor(totalCents / installments);
    const values = Array(installments).fill(regularCents);
    values[installments - 1] += totalCents - regularCents * installments;
    return values.map(fromCents);
  }

  function calculateInstallmentOptions(baseValue) {
    toCents(baseValue);
    const sharedTotal = calculateGrossUp(baseValue, PAYMENT_FEES[3]);
    return Object.keys(PAYMENT_FEES).map(Number).map(installments => {
      validateInstallments(installments);
      const fee = PAYMENT_FEES[installments];
      const total = installments <= 3 ? sharedTotal : calculateGrossUp(baseValue, fee);
      const installmentValues = splitInstallments(total, installments);
      const installmentValue = installmentValues[0];
      const interestFree = installments <= 3;
      return Object.freeze({
        installments, fee, total, installmentValue, installmentValues,
        interestFree,
        displayText: `${installments}x de ${formatCurrency(installmentValue)}${installments > 1 && interestFree ? " sem juros" : ""}`
      });
    });
  }

  function createPaymentMethods(baseValue) {
    const value = fromCents(toCents(baseValue));
    return Object.freeze({
      pix: { type: "PIX", amount: value, status: "AWAITING_GATEWAY", configurable: true },
      debit: { type: "DEBIT_CARD", amount: value, status: "AWAITING_GATEWAY", storesCardData: false },
      credit: calculateInstallmentOptions(value)
    });
  }

  return { PAYMENT_FEES, calculateGrossUp, calculateInstallmentOptions, createPaymentMethods, splitInstallments, validateInstallments, formatCurrency };
});
