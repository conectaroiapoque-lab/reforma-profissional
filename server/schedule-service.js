"use strict";
const crypto = require("node:crypto");
const { getServiceByCode, CATALOG_VERSION } = require("../catalog");
const { REQUIRED_DOCUMENTS } = require("./provider-onboarding");
const ZONE = "America/Sao_Paulo",
  MINUTE = 60000;
const fail = (code, statusCode = 409) => {
  throw Object.assign(new Error(code), { statusCode });
};
const text = (v, max = 500) =>
  typeof v === "string" ? v.trim().slice(0, max) : "";
function required(v, name, max = 500) {
  const value = text(v, max);
  if (!value) fail(`REQUIRED_${name}`, 400);
  return value;
}
function instant(v) {
  const match =
    typeof v === "string" &&
    v.match(
      /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?(Z|[+-]\d{2}:\d{2})$/,
    );
  if (!match || !Number.isFinite(Date.parse(v)))
    fail("TIMESTAMP_WITH_OFFSET_REQUIRED", 400);
  const [, year, month, day, hour, minute, second = "0"] = match;
  const daysInMonth = new Date(Date.UTC(+year, +month, 0)).getUTCDate();
  if (
    +month < 1 ||
    +month > 12 ||
    +day < 1 ||
    +day > daysInMonth ||
    +hour > 23 ||
    +minute > 59 ||
    +second > 59
  )
    fail("INVALID_CALENDAR_DATE", 400);
  return new Date(v).toISOString();
}
function periods(input, { future = false, now = Date.now() } = {}) {
  if (!Array.isArray(input) || !input.length || input.length > 31)
    fail("INVALID_PERIODS", 400);
  const result = input
    .map((p) => ({ start: instant(p.start), end: instant(p.end) }))
    .sort((a, b) => a.start.localeCompare(b.start));
  for (let i = 0; i < result.length; i++) {
    const p = result[i];
    if (
      p.end <= p.start ||
      Date.parse(p.end) - Date.parse(p.start) > 24 * 60 * MINUTE ||
      (future && Date.parse(p.start) <= now) ||
      (i && p.start < result[i - 1].end)
    )
      fail("INVALID_PERIOD", 400);
  }
  return result;
}
const overlap = (a, b) =>
  Date.parse(a.start) < Date.parse(b.end) &&
  Date.parse(b.start) < Date.parse(a.end);
const padded = (p, m) => ({
  start: new Date(Date.parse(p.start) - m * MINUTE).toISOString(),
  end: new Date(Date.parse(p.end) + m * MINUTE).toISOString(),
});
function active(a, now) {
  return (
    !["CANCELLED", "DECLINED", "COMPLETED", "EXPIRED"].includes(a.status) &&
    !(a.status === "PENDING_PROVIDER" && Date.parse(a.expiresAt) <= now)
  );
}
function authorizedOrder(order, actor) {
  if (!order) fail("ORDER_NOT_FOUND", 404);
  if (actor.role === "CUSTOMER" && order.customerId !== actor.sub)
    fail("FORBIDDEN", 403);
  if (!["CUSTOMER", "ADMIN"].includes(actor.role)) fail("FORBIDDEN", 403);
  return order;
}
function ruleFor(state, order) {
  const rule = state.rules[order.serviceId];
  if (!rule) fail("HUMAN_REVIEW_REQUIRED");
  return rule;
}
function planFor(state, order) {
  const rule = ruleFor(state, order);
  const plan = state.plans[order.orderId];
  if (!plan) fail("HUMAN_REVIEW_REQUIRED");
  return { rule, plan };
}
function providerEligible(provider, profile, order, now) {
  return (
    !!provider &&
    provider.status === "APPROVED" &&
    provider.active === true &&
    !provider.suspendedAt &&
    provider.contract?.status === "CURRENT" &&
    provider.backgroundCheck?.status === "VALIDATED" &&
    REQUIRED_DOCUMENTS.filter((k) => k !== "BACKGROUND_CHECK").every(
      (k) => provider.documents?.[k]?.status === "VALIDATED",
    ) &&
    Object.values(provider.documents || {}).every(
      (d) => d.status === "VALIDATED",
    ) &&
    !!profile?.qualification &&
    Date.parse(profile.qualification.validUntil) > now &&
    profile.qualification.serviceCodes.includes(order.serviceId) &&
    provider.specialties?.includes(profile.qualification.specialty) &&
    profile.regions?.some(
      (r) =>
        r.city === order.address.city &&
        r.state === order.address.state &&
        (!r.neighborhood || r.neighborhood === order.address.neighborhood),
    )
  );
}
function slotFree(state, providerId, slots, travel, now, ignore = []) {
  const profile = state.profiles[providerId];
  if (!profile) return false;
  if (
    profile.qualification &&
    Date.parse(profile.qualification.validUntil) <
      Math.max(...slots.map((s) => Date.parse(s.end)))
  )
    return false;
  const busy = Object.values(state.appointments).filter(
    (a) =>
      a.providerIds.includes(providerId) &&
      active(a, now) &&
      !ignore.includes(a.id),
  );
  if (
    busy.some(
      (a) =>
        a.status === "IN_PROGRESS" && Date.parse(a.slots.at(-1).end) <= now,
    )
  )
    return false;
  return slots.every((s) => {
    const reserved = padded(s, travel);
    return (
      profile.windows?.some(
        (w) => w.start <= reserved.start && w.end >= reserved.end,
      ) &&
      !(profile.blocks || []).some((b) => overlap(b, reserved)) &&
      !busy.some((a) =>
        a.slots.some((b) => overlap(padded(b, a.travelMinutes), reserved)),
      )
    );
  });
}
function audit(state, actor, event, target, reason, now) {
  state.audit.push({
    id: crypto.randomUUID(),
    actorId: actor.sub,
    role: actor.role,
    event,
    target,
    reason: text(reason),
    at: new Date(now).toISOString(),
  });
}
const EVENTS = [
  "REQUEST_RECEIVED",
  "PROVIDER_CONSULTED",
  "VISIT_CONFIRMED",
  "VISIT_REMINDER",
  "QUOTE_AVAILABLE",
  "QUOTE_APPROVED",
  "EXECUTION_SCHEDULED",
  "EXECUTION_REMINDER",
  "RESCHEDULE",
  "CANCELLED",
  "COMPLETED",
  "AFTER_SALES",
];
const LABELS = {
  REQUEST_RECEIVED: "Solicitação recebida",
  PROVIDER_CONSULTED: "Profissional consultado; aguardamos aceite",
  VISIT_CONFIRMED: "Visita técnica confirmada",
  VISIT_REMINDER: "Lembrete de visita técnica",
  QUOTE_AVAILABLE: "Orçamento disponível para sua análise",
  QUOTE_APPROVED: "Orçamento aprovado",
  EXECUTION_SCHEDULED: "Execução agendada",
  EXECUTION_REMINDER: "Lembrete de execução",
  RESCHEDULE: "Solicitação de reagendamento registrada",
  CANCELLED: "Agendamento cancelado",
  COMPLETED: "Serviço concluído",
  AFTER_SALES: "Como foi seu atendimento?",
};
function message(event, a) {
  if (!EVENTS.includes(event)) fail("INVALID_NOTIFICATION", 400);
  return `Reforma Profissional — ${LABELS[event]}. Protocolo ${a.protocol}. ${a.slots?.length ? a.slots.map((s) => new Intl.DateTimeFormat("pt-BR", { timeZone: ZONE, dateStyle: "short", timeStyle: "short" }).format(new Date(s.start))).join(", ") + " (Brasília). " : ""}Consulte os detalhes no acompanhamento seguro. ${a.status !== "CONFIRMED" && ["PROVIDER_CONSULTED", "REQUEST_RECEIVED", "RESCHEDULE"].includes(event) ? "O horário ainda depende das confirmações necessárias." : ""}`;
}
function notify(state, event, a, now) {
  state.notifications.push({
    id: crypto.randomUUID(),
    appointmentId: a.id,
    orderId: a.orderId,
    event,
    text: message(event, a),
    delivery: "MANUAL_COPY_ONLY",
    createdAt: new Date(now).toISOString(),
  });
}
function projection(a, role) {
  const { technical, history, proposal, ruleSource, ...safe } = a;
  return {
    ...safe,
    history:
      role === "ADMIN"
        ? history
        : (history || []).map(({ at, event }) => ({ at, event })),
    ...(role !== "CUSTOMER" ? { technical, proposal, ruleSource } : {}),
  };
}
class ScheduleService {
  constructor(repository, { clock = () => Date.now(), storage } = {}) {
    this.repo = repository;
    this.clock = clock;
    this.storage = storage;
  }
  async read(actor, { orderId } = {}) {
    const state = await this.repo.read(),
      now = this.clock();
    let orders = [];
    if (actor.role === "ADMIN") orders = await this.repo.list();
    else if (actor.role === "CUSTOMER") {
      if (!orderId) fail("ORDER_REQUIRED", 400);
      orders = [authorizedOrder(await this.repo.get(orderId), actor)];
    } else if (actor.role === "PROVIDER")
      orders = (await this.repo.list()).filter(
        (o) =>
          o.providerId === actor.sub ||
          state.plans[o.orderId]?.providerIds.includes(actor.sub),
      );
    else fail("FORBIDDEN", 403);
    const items = Object.values(state.appointments)
      .filter(
        (a) =>
          actor.role === "ADMIN" ||
          (actor.role === "CUSTOMER"
            ? orders.some((o) => o.orderId === a.orderId)
            : a.providerIds.includes(actor.sub)),
      )
      .map((a) =>
        projection(
          {
            ...a,
            status:
              a.status === "PENDING_PROVIDER" && !active(a, now)
                ? "EXPIRED"
                : a.status,
          },
          actor.role,
        ),
      );
    return {
      timeZone: ZONE,
      appointments: items,
      notifications: state.notifications.filter(
        (n) =>
          actor.role === "ADMIN" ||
          items.some((a) => a.id === n.appointmentId) ||
          orders.some((o) => o.orderId === n.orderId),
      ),
      ...(actor.role === "PROVIDER"
        ? {
            profile: state.profiles[actor.sub] || {
              windows: [],
              blocks: [],
              regions: [],
            },
          }
        : {}),
      ...(actor.role === "ADMIN"
        ? {
            providers: (await this.repo.listProviders()).map((p) => ({
              providerId: p.providerId,
              name: p.professionalName,
              specialties: p.specialties,
              status: p.status,
            })),
            profiles: state.profiles,
            rules: state.rules,
            audit: state.audit,
            alerts: items
              .filter(
                (a) =>
                  a.rescheduleRequest ||
                  a.status === "EXPIRED" ||
                  (a.status === "IN_PROGRESS" &&
                    Date.parse(a.slots.at(-1).end) <= now),
              )
              .map((a) => ({
                appointmentId: a.id,
                event: a.rescheduleRequest
                  ? "RESCHEDULE_REQUESTED"
                  : a.status === "EXPIRED"
                    ? "ACCEPTANCE_EXPIRED"
                    : "SERVICE_OVERRUN",
              })),
          }
        : {}),
      assessments: actor.role === "ADMIN" ? state.assessments || {} : undefined,
      orders: orders.map((o) => ({
        orderId: o.orderId,
        protocol: o.protocol,
        serviceCode: o.serviceId,
        serviceName: o.serviceName,
        category: o.category,
        region: {
          city: o.address?.city,
          state: o.address?.state,
          neighborhood: o.address?.neighborhood,
        },
        quoteStatus: o.quoteStatus,
        quote: o.quote
          ? {
              quoteId: o.quote.quoteId,
              amountCents: o.quote.amountCents,
              currency: "BRL",
              description: o.quote.description,
            }
          : null,
        status: o.status,
        preferences: o.schedulingPreferences || null,
        plan:
          actor.role === "ADMIN"
            ? state.plans[o.orderId] || null
            : state.plans[o.orderId]
              ? {
                  mode: state.plans[o.orderId].mode,
                  durationMinutes: state.plans[o.orderId].durationMinutes,
                  materialsReady: state.plans[o.orderId].materialsReady,
                }
              : null,
        rule: state.rules[o.serviceId]
          ? { mode: state.rules[o.serviceId].mode }
          : null,
      })),
    };
  }
  async availability(actor, { orderId, type, from, days = 7 }) {
    const order = authorizedOrder(await this.repo.get(orderId), actor),
      state = await this.repo.read(),
      { rule, plan } = planFor(state, order);
    this.assertReady(state, order, plan, type);
    const now = this.clock(),
      start = Date.parse(instant(from));
    if (
      start < now ||
      start > now + 180 * 86400000 ||
      !Number.isInteger(days) ||
      days < 1 ||
      days > 14
    )
      fail("INVALID_SEARCH_RANGE", 400);
    const providers = await this.repo.listProviders(),
      eligible = providers.filter((p) =>
        providerEligible(p, state.profiles[p.providerId], order, now),
      ),
      minutes = type === "VISIT" ? rule.visitMinutes : plan.durationMinutes,
      crew = type === "VISIT" ? 1 : plan.crewSize,
      options = [];
    // Search returns only groups of genuinely free, CAC-qualified providers. No invented roster.
    for (
      let t = Math.ceil(start / (30 * MINUTE)) * 30 * MINUTE;
      t < start + days * 86400000 && options.length < 80;
      t += 30 * MINUTE
    ) {
      const slots = [];
      for (let remaining = minutes, day = 0; remaining > 0; day++) {
        const duration = Math.min(480, remaining);
        slots.push({
          start: new Date(t + day * 86400000).toISOString(),
          end: new Date(t + day * 86400000 + duration * MINUTE).toISOString(),
        });
        remaining -= duration;
      }
      const free = eligible.filter(
        (p) =>
          slotFree(state, p.providerId, slots, rule.travelMinutes, now) &&
          (!(type === "EXECUTION") || plan.providerIds.includes(p.providerId)),
      );
      if (free.length >= crew)
        options.push({
          slots,
          providerIds: free.slice(0, crew).map((p) => p.providerId),
          durationMinutes: minutes,
          requiresAcceptance: true,
        });
    }
    return {
      options,
      timeZone: ZONE,
      mode: plan.mode,
      notice:
        "Disponibilidade consultada. A reserva só será confirmada após os aceites.",
    };
  }
  proposal(code, report) {
    const service = getServiceByCode(code);
    return {
      serviceCode: code,
      serviceName: service.name,
      catalogVersion: CATALOG_VERSION,
      pricingMode: service.pricingMode,
      unit: report.unit,
      quantity: report.quantity,
      referenceAmountCents: service.customerPriceCents,
      scopeNotes: service.scopeNotes,
      amountCents: null,
      status: "PLATFORM_REVIEW_REQUIRED",
      notice:
        "Referência oficial; proposta final depende da revisão comercial e do aceite do cliente. Não multiplicar valores por unidade sem regra aprovada.",
    };
  }
  async report(input, actor, serviceCode, now) {
    if (
      !Number.isFinite(input.quantity) ||
      input.quantity <= 0 ||
      !Number.isInteger(input.estimatedMinutes) ||
      input.estimatedMinutes < 15 ||
      input.estimatedMinutes > 14880
    )
      fail("INVALID_TECHNICAL_REPORT", 400);
    const ids = input.photoEvidenceIds || [];
    if (!Array.isArray(ids) || ids.length > 10) fail("INVALID_EVIDENCE", 400);
    if (ids.length && input.photoConsent !== true)
      fail("PHOTO_CONSENT_REQUIRED", 400);
    for (const id of ids) {
      if (typeof id !== "string" || !this.storage)
        fail("PRIVATE_EVIDENCE_REQUIRED", 400);
      const file = await this.storage.get(id, {
        subjectId: actor.sub,
        role: actor.role,
      });
      if (
        !file ||
        file.ownerId !== actor.sub ||
        !file.mimeType?.startsWith("image/")
      )
        fail("INVALID_EVIDENCE", 400);
    }
    return {
      serviceCode,
      conditions: required(input.conditions, "CONDITIONS", 2000),
      quantity: input.quantity,
      unit: required(input.unit, "UNIT", 30),
      materials: required(input.materials, "MATERIALS", 2000),
      estimatedMinutes: input.estimatedMinutes,
      notes: text(input.notes, 2000),
      photoEvidenceIds: ids,
      photoConsent: input.photoConsent === true,
      recordedBy: actor.sub,
      recordedAt: new Date(now).toISOString(),
    };
  }
  assertReady(state, order, plan, type) {
    this.assertType(order, plan, type);
    if (type !== "EXECUTION") return;
    if (!plan.materialsReady) fail("MATERIALS_NOT_READY");
    if (
      plan.mode === "VISIT" &&
      !Object.values(state.appointments).some(
        (a) =>
          a.orderId === order.orderId &&
          a.type === "VISIT" &&
          a.status === "COMPLETED" &&
          a.technical,
      )
    )
      fail("VISIT_REPORT_REQUIRED");
    if (plan.mode === "REMOTE" && !state.assessments?.[order.orderId])
      fail("REMOTE_ASSESSMENT_REQUIRED");
  }
  assertType(order, plan, type) {
    if (!["VISIT", "EXECUTION"].includes(type))
      fail("INVALID_APPOINTMENT_TYPE", 400);
    if (type === "VISIT" && plan.mode !== "VISIT") fail("VISIT_NOT_REQUIRED");
    if (
      [
        "CANCELLED",
        "CUSTOMER_REJECTED",
        "SERVICE_COMPLETED",
        "CLOSED",
        "DISPUTED",
        "PROVIDER_PAID",
        "CUSTOMER_VALIDATION",
      ].includes(order.status)
    )
      fail("ORDER_NOT_ACTIVE");
    if (
      type === "EXECUTION" &&
      (!["CUSTOMER_APPROVED", "PROVIDER_AUTHORIZED"].includes(
        order.quoteStatus,
      ) ||
        !order.termsAcceptance)
    )
      fail("APPROVED_QUOTE_AND_CONTRACT_REQUIRED");
  }
  async mutate(actor, action, input = {}) {
    const now = this.clock();
    return this.repo.transaction(async (state, refs) => {
      const admin = actor.role === "ADMIN",
        provider = actor.role === "PROVIDER";
      if (action === "rule") {
        if (!admin) fail("FORBIDDEN", 403);
        const s = getServiceByCode(input.serviceCode);
        if (!s) fail("UNKNOWN_OFFICIAL_SERVICE", 400);
        if (!["VISIT", "REMOTE", "DIRECT", "HUMAN_REVIEW"].includes(input.mode))
          fail("INVALID_MODE", 400);
        for (const [field, min, max] of [
          ["visitMinutes", 15, 480],
          ["travelMinutes", 0, 240],
          ["holdMinutes", 5, 1440],
          ["cancelBeforeMinutes", 0, 10080],
        ])
          if (
            !Number.isInteger(input[field]) ||
            input[field] < min ||
            input[field] > max
          )
            fail(`INVALID_${field}`, 400);
        state.rules[s.code] = {
          mode: input.mode,
          visitMinutes: input.visitMinutes,
          travelMinutes: input.travelMinutes,
          holdMinutes: input.holdMinutes,
          cancelBeforeMinutes: input.cancelBeforeMinutes,
          source: required(input.source, "OFFICIAL_RULE_SOURCE"),
          reason: required(input.reason, "REASON"),
          catalogVersion: CATALOG_VERSION,
        };
        audit(state, actor, "RULE_SAVED", s.code, input.reason, now);
        return { rule: state.rules[s.code] };
      }
      if (action === "qualification") {
        if (!admin) fail("FORBIDDEN", 403);
        const p = await refs.provider(input.providerId);
        if (!p) fail("PROVIDER_NOT_FOUND", 404);
        if (
          !Array.isArray(input.serviceCodes) ||
          !input.serviceCodes.length ||
          input.serviceCodes.length > 300 ||
          input.serviceCodes.some((c) => !getServiceByCode(c)) ||
          !p.specialties?.includes(input.specialty)
        )
          fail("INVALID_QUALIFICATION", 400);
        const validUntil = instant(input.validUntil);
        if (Date.parse(validUntil) <= now) fail("EXPIRED_QUALIFICATION", 400);
        const profile = state.profiles[p.providerId] || {
          windows: [],
          blocks: [],
          regions: [],
        };
        profile.qualification = {
          serviceCodes: [...new Set(input.serviceCodes)],
          specialty: input.specialty,
          evidence: required(input.evidence, "VERIFICATION_EVIDENCE"),
          validUntil,
          verifiedBy: actor.sub,
        };
        state.profiles[p.providerId] = profile;
        audit(
          state,
          actor,
          "QUALIFICATION_VERIFIED",
          p.providerId,
          required(input.reason, "REASON"),
          now,
        );
        return { profile };
      }
      if (action === "availability") {
        if (!provider && !admin) fail("FORBIDDEN", 403);
        const id = provider
            ? actor.sub
            : required(input.providerId, "PROVIDER"),
          p = await refs.provider(id);
        if (!p) fail("PROVIDER_NOT_FOUND", 404);
        const profile = state.profiles[id] || {};
        const windows = input.windows?.length ? periods(input.windows) : [],
          blocks = input.blocks?.length ? periods(input.blocks) : [];
        if (!Array.isArray(input.regions) || input.regions.length > 40)
          fail("INVALID_REGIONS", 400);
        const regions = input.regions.map((r) => ({
          city: required(r.city, "CITY", 80),
          state: required(r.state, "STATE", 2).toUpperCase(),
          neighborhood: text(r.neighborhood, 80),
        }));
        for (const a of Object.values(state.appointments).filter(
          (a) => a.providerIds.includes(id) && active(a, now),
        ))
          if (
            !regions.some(
              (r) =>
                r.city === a.region.city &&
                r.state === a.region.state &&
                (!r.neighborhood || r.neighborhood === a.region.neighborhood),
            ) ||
            !a.slots.every(
              (s) =>
                windows.some(
                  (w) =>
                    w.start <= padded(s, a.travelMinutes).start &&
                    w.end >= padded(s, a.travelMinutes).end,
                ) &&
                !blocks.some((b) => overlap(b, padded(s, a.travelMinutes))),
            )
          )
            fail("AVAILABILITY_CONFLICTS_WITH_APPOINTMENT");
        state.profiles[id] = { ...profile, windows, blocks, regions };
        audit(
          state,
          actor,
          "AVAILABILITY_UPDATED",
          id,
          admin ? required(input.reason, "REASON") : null,
          now,
        );
        return { profile: state.profiles[id] };
      }
      if (action === "plan") {
        if (!admin) fail("FORBIDDEN", 403);
        const order = await refs.order(input.orderId);
        if (!order) fail("ORDER_NOT_FOUND", 404);
        const rule = ruleFor(state, order);
        if (
          !["VISIT", "REMOTE", "DIRECT"].includes(input.mode) ||
          (rule.mode !== "HUMAN_REVIEW" && rule.mode !== input.mode)
        )
          fail("MODE_REQUIRES_APPROVED_RULE");
        if (
          !Number.isInteger(input.durationMinutes) ||
          input.durationMinutes < 15 ||
          input.durationMinutes > 14880 ||
          !Number.isInteger(input.crewSize) ||
          input.crewSize < 1 ||
          input.crewSize > 10 ||
          !Array.isArray(input.providerIds) ||
          input.providerIds.length !== input.crewSize ||
          new Set(input.providerIds).size !== input.crewSize
        )
          fail("INVALID_EXECUTION_PLAN", 400);
        for (const id of input.providerIds)
          if (
            !providerEligible(
              await refs.provider(id),
              state.profiles[id],
              order,
              now,
            )
          )
            fail("PROVIDER_NOT_ELIGIBLE");
        if (order.providerId && !input.providerIds.includes(order.providerId))
          fail("CONTRACTED_PROVIDER_REQUIRED");
        if (
          Object.values(state.appointments).some(
            (a) => a.orderId === order.orderId && active(a, now),
          )
        )
          fail("RESCHEDULE_BEFORE_CHANGING_PLAN");
        state.plans[order.orderId] = {
          mode: input.mode,
          durationMinutes: input.durationMinutes,
          crewSize: input.crewSize,
          providerIds: input.providerIds,
          materialsReady: input.materialsReady === true,
          reason: required(input.reason, "REASON"),
          reviewedBy: actor.sub,
          reviewedAt: new Date(now).toISOString(),
        };
        audit(state, actor, "PLAN_REVIEWED", order.orderId, input.reason, now);
        return { plan: state.plans[order.orderId] };
      }
      if (action === "proposal" || action === "proposal-decision") {
        const order = authorizedOrder(await refs.order(input.orderId), actor);
        const { plan } = planFor(state, order);
        if (action === "proposal") {
          if (!admin) fail("FORBIDDEN", 403);
          if (
            [
              "CUSTOMER_APPROVED",
              "PROVIDER_AUTHORIZED",
              "SERVICE_STARTED",
              "SERVICE_COMPLETED",
            ].includes(order.quoteStatus)
          )
            fail("APPROVED_PROPOSAL_IMMUTABLE");
          const report =
            plan.mode === "REMOTE"
              ? state.assessments?.[order.orderId]
              : Object.values(state.appointments).find(
                  (a) =>
                    a.orderId === order.orderId &&
                    a.type === "VISIT" &&
                    a.status === "COMPLETED",
                )?.technical;
          const service = getServiceByCode(order.serviceId);
          if (
            (plan.mode !== "DIRECT" && !report) ||
            (service.pricingMode !== "FIXED" && !report)
          )
            fail("TECHNICAL_ASSESSMENT_REQUIRED");
          const amountCents =
            service.pricingMode === "FIXED"
              ? service.customerPriceCents
              : input.amountCents;
          if (
            !Number.isSafeInteger(amountCents) ||
            amountCents <= 0 ||
            (service.pricingMode === "FROM" &&
              amountCents < service.customerPriceCents)
          )
            fail("INVALID_AUTHORIZED_QUOTE_AMOUNT", 400);
          order.quote = {
            quoteId: `QTE-${crypto.randomUUID()}`,
            amountCents,
            currency: "BRL",
            description: required(input.description, "COMMERCIAL_SCOPE", 2000),
            catalogVersion: CATALOG_VERSION,
            serviceCode: service.code,
            reviewedBy: actor.sub,
            reviewedAt: new Date(now).toISOString(),
          };
          order.quoteStatus = "CUSTOMER_QUOTE_SENT";
          order.quoteHistory = [
            ...(order.quoteHistory || []),
            "PLATFORM_REVIEW",
            "QUOTE_APPROVED",
            "CUSTOMER_QUOTE_SENT",
          ];
          required(input.reason, "REASON");
        } else {
          if (actor.role !== "CUSTOMER") fail("FORBIDDEN", 403);
          if (
            order.quoteStatus !== "CUSTOMER_QUOTE_SENT" ||
            !["APPROVE", "REJECT"].includes(input.decision) ||
            input.quoteId !== order.quote?.quoteId
          )
            fail("INVALID_QUOTE_STATE");
          order.quoteStatus =
            input.decision === "APPROVE"
              ? "CUSTOMER_APPROVED"
              : "CUSTOMER_REJECTED";
          order.quoteHistory = [
            ...(order.quoteHistory || []),
            order.quoteStatus,
          ];
          order.quote.customerDecision = {
            decision: input.decision,
            at: new Date(now).toISOString(),
            customerId: actor.sub,
          };
        }
        const event =
          action === "proposal"
            ? "QUOTE_AVAILABLE"
            : order.quoteStatus === "CUSTOMER_APPROVED"
              ? "QUOTE_APPROVED"
              : "QUOTE_REJECTED";
        audit(state, actor, event, order.orderId, input.reason, now);
        order.auditTrail = [
          ...(order.auditTrail || []),
          {
            event,
            actor: `${actor.role}:${actor.sub}`,
            timestamp: new Date(now).toISOString(),
          },
        ];
        refs.saveOrder(order);
        if (EVENTS.includes(event))
          notify(
            state,
            event,
            {
              id: null,
              orderId: order.orderId,
              protocol: order.protocol,
              slots: [],
            },
            now,
          );
        return {
          quote: {
            quoteId: order.quote.quoteId,
            amountCents: order.quote.amountCents,
            description: order.quote.description,
          },
          quoteStatus: order.quoteStatus,
        };
      }
      if (action === "assessment") {
        if (!provider) fail("FORBIDDEN", 403);
        const order = await refs.order(input.orderId);
        if (!order) fail("ORDER_NOT_FOUND", 404);
        const { plan } = planFor(state, order);
        if (
          plan.mode !== "REMOTE" ||
          !plan.providerIds.includes(actor.sub) ||
          !providerEligible(
            await refs.provider(actor.sub),
            state.profiles[actor.sub],
            order,
            now,
          )
        )
          fail("FORBIDDEN", 403);
        const report = await this.report(input, actor, order.serviceId, now);
        state.assessments = state.assessments || {};
        state.assessments[order.orderId] = report;
        audit(state, actor, "REMOTE_ASSESSMENT", order.orderId, null, now);
        return {
          assessment: report,
          proposal: this.proposal(order.serviceId, report),
        };
      }
      if (action === "book") {
        const order = authorizedOrder(await refs.order(input.orderId), actor),
          { rule, plan } = planFor(state, order);
        this.assertReady(state, order, plan, input.type);
        const slots = periods(input.slots, { future: true, now });
        if (
          slots.reduce(
            (n, s) => n + (Date.parse(s.end) - Date.parse(s.start)) / MINUTE,
            0,
          ) !==
          (input.type === "VISIT" ? rule.visitMinutes : plan.durationMinutes)
        )
          fail("DURATION_MISMATCH");
        const ids = input.providerIds;
        if (
          !Array.isArray(ids) ||
          new Set(ids).size !== ids.length ||
          ids.length !== (input.type === "VISIT" ? 1 : plan.crewSize)
        )
          fail("INVALID_CREW", 400);
        if (
          input.type === "EXECUTION" &&
          ids.some((id) => !plan.providerIds.includes(id))
        )
          fail("CONTRACTED_PROVIDER_REQUIRED");
        const old = input.replaceId && state.appointments[input.replaceId];
        if (
          input.replaceId &&
          (!old ||
            old.orderId !== order.orderId ||
            old.type !== input.type ||
            !["CONFIRMED", "PENDING_PROVIDER"].includes(old.status))
        )
          fail("INVALID_REPLACEMENT");
        if (
          Object.values(state.appointments).some(
            (a) =>
              a.orderId === order.orderId &&
              a.type === input.type &&
              active(a, now) &&
              a.id !== old?.id,
          )
        )
          fail("APPOINTMENT_ALREADY_EXISTS");
        for (const id of ids) {
          if (
            !providerEligible(
              await refs.provider(id),
              state.profiles[id],
              order,
              now,
            )
          )
            fail("PROVIDER_NOT_ELIGIBLE");
          if (
            !slotFree(
              state,
              id,
              slots,
              rule.travelMinutes,
              now,
              old ? [old.id] : [],
            )
          )
            fail("SCHEDULE_CONFLICT");
        }
        const id = `APT-${crypto.randomUUID()}`,
          a = {
            id,
            protocol: `AG-${crypto.randomUUID()}`,
            orderId: order.orderId,
            orderProtocol: order.protocol,
            serviceCode: order.serviceId,
            serviceName: order.serviceName,
            category: order.category,
            region: {
              city: order.address.city,
              state: order.address.state,
              neighborhood: order.address.neighborhood,
            },
            type: input.type,
            slots,
            providerIds: ids,
            professionals: await Promise.all(
              ids.map(async (id) => ({
                providerId: id,
                name: (await refs.provider(id)).professionalName,
              })),
            ),
            acceptedBy: [],
            customerConfirmed:
              actor.role === "CUSTOMER" && input.customerConfirmed === true,
            status: "PENDING_PROVIDER",
            expiresAt: new Date(now + rule.holdMinutes * MINUTE).toISOString(),
            travelMinutes: rule.travelMinutes,
            cancelBeforeMinutes: rule.cancelBeforeMinutes,
            ruleSource: rule.source,
            replaceId: old?.id || null,
            createdAt: new Date(now).toISOString(),
            version: 1,
            history: [],
          };
        state.appointments[id] = a;
        a.history.push({ event: "REQUEST_RECEIVED", at: a.createdAt });
        audit(
          state,
          actor,
          "BOOK_REQUESTED",
          id,
          admin ? required(input.reason, "REASON") : null,
          now,
        );
        notify(state, "REQUEST_RECEIVED", a, now);
        notify(state, "PROVIDER_CONSULTED", a, now);
        return { appointment: projection(a, actor.role) };
      }
      const a = state.appointments[input.id];
      if (!a) fail("APPOINTMENT_NOT_FOUND", 404);
      const order = await refs.order(a.orderId);
      if (!order) fail("ORDER_NOT_FOUND", 404);
      if (
        !admin &&
        !(provider
          ? a.providerIds.includes(actor.sub)
          : actor.role === "CUSTOMER" && order.customerId === actor.sub)
      )
        fail("FORBIDDEN", 403);
      if (input.version !== a.version) fail("STALE_APPOINTMENT");
      if (action !== "notification" && !active(a, now))
        fail("APPOINTMENT_NOT_ACTIVE");
      const reason = admin
        ? required(input.reason, "REASON")
        : text(input.reason);
      let event = action.toUpperCase();
      if (action === "accept" || action === "confirm") {
        if (
          a.status !== "PENDING_PROVIDER" ||
          Date.parse(a.slots[0].start) <= now
        )
          fail("INVALID_APPOINTMENT_STATE");
        if (action === "accept") {
          if (!provider) fail("FORBIDDEN", 403);
          if (!a.acceptedBy.includes(actor.sub)) a.acceptedBy.push(actor.sub);
        } else {
          if (actor.role !== "CUSTOMER") fail("FORBIDDEN", 403);
          a.customerConfirmed = true;
        }
        const { plan } = planFor(state, order);
        this.assertReady(state, order, plan, a.type);
        if (a.type === "EXECUTION" && !plan.materialsReady)
          fail("MATERIALS_NOT_READY");
        for (const id of a.providerIds) {
          if (
            !providerEligible(
              await refs.provider(id),
              state.profiles[id],
              order,
              now,
            )
          )
            fail("PROVIDER_NOT_ELIGIBLE");
          if (
            !slotFree(state, id, a.slots, a.travelMinutes, now, [
              a.id,
              ...(a.replaceId ? [a.replaceId] : []),
            ])
          )
            fail("SCHEDULE_CONFLICT");
        }
        if (
          a.customerConfirmed &&
          a.providerIds.every((id) => a.acceptedBy.includes(id))
        ) {
          a.status = "CONFIRMED";
          event =
            a.type === "VISIT" ? "VISIT_CONFIRMED" : "EXECUTION_SCHEDULED";
          if (a.replaceId) {
            const old = state.appointments[a.replaceId];
            if (!old || !active(old, now)) fail("INVALID_REPLACEMENT");
            old.status = "CANCELLED";
            old.version++;
            old.history.push({
              event: "REPLACED",
              at: new Date(now).toISOString(),
            });
            audit(
              state,
              actor,
              "REPLACED",
              old.id,
              "Novo horário confirmado pelas partes",
              now,
            );
          }
        }
      } else if (action === "decline") {
        if (!provider || a.status !== "PENDING_PROVIDER")
          fail("FORBIDDEN", 403);
        a.status = "DECLINED";
        required(input.reason, "REASON");
      } else if (action === "reschedule") {
        if (a.status === "IN_PROGRESS") fail("CONTACT_CAC_REQUIRED");
        a.rescheduleRequest = {
          requestedBy: actor.sub,
          at: new Date(now).toISOString(),
          reason: required(input.reason, "REASON"),
        };
        event = "RESCHEDULE";
      } else if (action === "cancel") {
        if (
          a.status === "IN_PROGRESS" ||
          (!admin &&
            Date.parse(a.slots[0].start) - now < a.cancelBeforeMinutes * MINUTE)
        )
          fail("CONTACT_CAC_REQUIRED");
        required(input.reason, "REASON");
        a.status = "CANCELLED";
        event = "CANCELLED";
        for (const replacement of Object.values(state.appointments).filter(
          (b) => b.replaceId === a.id && active(b, now),
        )) {
          replacement.status = "CANCELLED";
          replacement.version++;
          replacement.history.push({
            event: "CANCELLED",
            at: new Date(now).toISOString(),
          });
          audit(
            state,
            actor,
            "CANCELLED",
            replacement.id,
            "Compromisso anterior cancelado",
            now,
          );
          notify(state, "CANCELLED", replacement, now);
        }
      } else if (action === "start") {
        this.assertReady(state, order, planFor(state, order).plan, a.type);
        if (
          !provider ||
          a.status !== "CONFIRMED" ||
          now < Date.parse(a.slots[0].start) ||
          now >= Date.parse(a.slots.at(-1).end)
        )
          fail("INVALID_START");
        if (a.type === "EXECUTION") {
          const { plan } = planFor(state, order);
          this.assertReady(state, order, plan, a.type);
          if (!plan.materialsReady) fail("MATERIALS_NOT_READY");
        }
        for (const id of a.providerIds)
          if (
            !providerEligible(
              await refs.provider(id),
              state.profiles[id],
              order,
              now,
            )
          )
            fail("PROVIDER_NOT_ELIGIBLE");
        a.status = "IN_PROGRESS";
        a.startedAt = new Date(now).toISOString();
        if (a.type === "EXECUTION") {
          order.status = "SERVICE_STARTED";
          order.startedAt = a.startedAt;
          if (order.pricingMode === "QUOTE") {
            order.quoteStatus = "SERVICE_STARTED";
            order.quoteHistory = [
              ...(order.quoteHistory || []),
              "SERVICE_STARTED",
            ];
          }
          order.auditTrail = [
            ...(order.auditTrail || []),
            {
              event: "SERVICE_STARTED",
              actor: `PROVIDER:${actor.sub}`,
              timestamp: a.startedAt,
              appointmentId: a.id,
            },
          ];
          refs.saveOrder(order);
        }
      } else if (action === "technical") {
        if (!provider || !["IN_PROGRESS", "COMPLETED"].includes(a.status))
          fail("FORBIDDEN", 403);
        if (
          !Number.isFinite(input.quantity) ||
          input.quantity <= 0 ||
          !Number.isInteger(input.estimatedMinutes) ||
          input.estimatedMinutes < 15
        )
          fail("INVALID_TECHNICAL_REPORT", 400);
        a.technical = await this.report(input, actor, a.serviceCode, now);
        a.proposal = this.proposal(a.serviceCode, a.technical);
      } else if (action === "complete") {
        if (
          !provider ||
          a.status !== "IN_PROGRESS" ||
          (a.type === "VISIT" && !a.technical)
        )
          fail("TECHNICAL_REPORT_REQUIRED");
        a.status = "COMPLETED";
        a.completedAt = new Date(now).toISOString();
        if (a.type === "EXECUTION") {
          order.status = "SERVICE_COMPLETED";
          order.completedAt = a.completedAt;
          order.fiscalStatus = "FISCAL_DOCUMENT_REQUIRED";
          if (order.pricingMode === "QUOTE") {
            order.quoteStatus = "SERVICE_COMPLETED";
            order.quoteHistory = [
              ...(order.quoteHistory || []),
              "SERVICE_COMPLETED",
            ];
          }
          order.auditTrail = [
            ...(order.auditTrail || []),
            {
              event: "SERVICE_COMPLETED",
              actor: `PROVIDER:${actor.sub}`,
              timestamp: a.completedAt,
              appointmentId: a.id,
            },
          ];
          refs.saveOrder(order);
        }
        event = "COMPLETED";
      } else if (action === "notification") {
        if (!admin) fail("FORBIDDEN", 403);
        if (!EVENTS.includes(input.event)) fail("INVALID_NOTIFICATION", 400);
        if (
          ["VISIT_CONFIRMED", "VISIT_REMINDER"].includes(input.event) &&
          (a.type !== "VISIT" || a.status !== "CONFIRMED")
        )
          fail("NOTIFICATION_STATE_MISMATCH");
        if (
          ["EXECUTION_SCHEDULED", "EXECUTION_REMINDER"].includes(input.event) &&
          (a.type !== "EXECUTION" || a.status !== "CONFIRMED")
        )
          fail("NOTIFICATION_STATE_MISMATCH");
        if (
          ["COMPLETED", "AFTER_SALES"].includes(input.event) &&
          a.status !== "COMPLETED"
        )
          fail("NOTIFICATION_STATE_MISMATCH");
        if (input.event === "CANCELLED" && a.status !== "CANCELLED")
          fail("NOTIFICATION_STATE_MISMATCH");
        if (
          input.event === "QUOTE_AVAILABLE" &&
          ![
            "CUSTOMER_QUOTE_SENT",
            "CUSTOMER_APPROVED",
            "PROVIDER_AUTHORIZED",
          ].includes(order.quoteStatus)
        )
          fail("NOTIFICATION_STATE_MISMATCH");
        if (
          input.event === "QUOTE_APPROVED" &&
          !["CUSTOMER_APPROVED", "PROVIDER_AUTHORIZED"].includes(
            order.quoteStatus,
          )
        )
          fail("NOTIFICATION_STATE_MISMATCH");
        notify(state, input.event, a, now);
      } else fail("UNKNOWN_ACTION", 404);
      a.version++;
      a.history.push({ event, at: new Date(now).toISOString() });
      audit(state, actor, event, a.id, reason, now);
      if (EVENTS.includes(event) && action !== "notification")
        notify(state, event, a, now);
      return { appointment: projection(a, actor.role) };
    });
  }
}
module.exports = {
  ScheduleService,
  ZONE,
  EVENTS,
  message,
  instant,
  periods,
  overlap,
  slotFree,
  providerEligible,
  active,
};
