"use strict";

(function exposeBusinessRules(root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.BusinessRules = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createBusinessRules() {
  const PROFESSIONAL_PERCENT = 0.60;
  const PLATFORM_PERCENT = 0.40;
  const INSPECTOR_PERCENT = 0.04;
  const WARRANTY_DAYS = 90;
  const toCents = value => {
    const number = Number(value);
    if (!Number.isFinite(number) || number < 0) throw new TypeError("O valor deve ser um número não negativo.");
    return Math.round((number + Number.EPSILON) * 100);
  };

  function calculateServiceDistribution(serviceValue, executor, inspector) {
    if (!executor || !inspector) throw new TypeError("Executor e fiscal são obrigatórios.");
    const cents = toCents(serviceValue);
    const sameProfessional = String(executor) === String(inspector);
    const professionalCents = Math.round(cents * PROFESSIONAL_PERCENT);
    const inspectorCents = sameProfessional ? 0 : Math.round(cents * INSPECTOR_PERCENT);
    return Object.freeze({
      executor: professionalCents / 100,
      inspector: inspectorCents / 100,
      platform: (cents - professionalCents - inspectorCents) / 100,
      selfInspectionCommission: false
    });
  }

  function calculateWarrantyEnd(completedAt) {
    const completion = new Date(completedAt);
    if (Number.isNaN(completion.getTime())) throw new TypeError("Data de conclusão inválida.");
    const warrantyEnd = new Date(completion);
    warrantyEnd.setUTCDate(warrantyEnd.getUTCDate() + WARRANTY_DAYS);
    return { completedAt: completion.toISOString(), warrantyEnd: warrantyEnd.toISOString(), warrantyDays: WARRANTY_DAYS };
  }

  function createCashbackRecord({ value, origin, serviceId, paymentStatus, serviceStatus, date = new Date() }) {
    if (paymentStatus !== "PAID" || serviceStatus !== "COMPLETED") throw new Error("Cashback exige pagamento e serviço concluído.");
    if (!origin || !serviceId) throw new TypeError("Origem e serviço são obrigatórios.");
    return Object.freeze({ value: toCents(value) / 100, origin, service: serviceId, date: new Date(date).toISOString(), status: "AVAILABLE", withdrawable: false });
  }

  function createReferralCashback({ referrerId, referredId, hired, paymentStatus, serviceStatus, ...cashback }) {
    if (!referrerId || String(referrerId) === String(referredId)) throw new Error("Autoindicação não é permitida.");
    if (!hired) throw new Error("A primeira contratação válida ainda não ocorreu.");
    return createCashbackRecord({ ...cashback, origin: "REFERRAL", paymentStatus, serviceStatus });
  }

  function createProfessionalWorkOrder(request, authorized = false) {
    const order = { protocol: request.protocol, service: request.service, description: request.description, urgency: request.urgency, status: request.status };
    if (authorized) order.serviceLocation = `${request.address}, ${request.number} - ${request.neighborhood}, ${request.city}`;
    return Object.freeze(order);
  }

  return { PROFESSIONAL_PERCENT, PLATFORM_PERCENT, INSPECTOR_PERCENT, WARRANTY_DAYS, calculateServiceDistribution, calculateWarrantyEnd, createCashbackRecord, createReferralCashback, createProfessionalWorkOrder };
});
