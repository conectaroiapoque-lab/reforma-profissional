/* Scheduling UI uses server decisions exclusively. No local roster or fake slots. */
(function (root) {
  "use strict";
  const ZONE = "America/Sao_Paulo";
  const labels = {
    PENDING_PROVIDER: "Aguardando confirmações",
    CONFIRMED: "Confirmado pelas partes",
    IN_PROGRESS: "Em andamento",
    COMPLETED: "Concluído",
    DECLINED: "Recusado",
    CANCELLED: "Cancelado",
    EXPIRED: "Prazo de aceite expirado",
    VISIT: "VISITA TÉCNICA / ORÇAMENTO",
    EXECUTION: "EXECUÇÃO DO SERVIÇO",
  };
  const orderLabels = {
    REQUESTED: "Solicitação recebida",
    SEARCHING_PROVIDER: "Buscando profissional",
    OFFERED: "Aguardando aceite do profissional",
    PROVIDER_ACCEPTED: "Profissional aceitou o pedido",
    PROVIDER_ARRIVED: "Profissional no local",
    SERVICE_STARTED: "Serviço em execução",
    SERVICE_COMPLETED: "Serviço concluído",
    CLOSED: "Atendimento encerrado",
    CANCELLED: "Cancelado",
    CUSTOMER_REQUEST: "Aguardando avaliação",
    PROVIDER_ANALYSIS: "Em avaliação técnica",
    PROVIDER_QUOTE_SUBMITTED: "Em revisão comercial",
    CUSTOMER_QUOTE_SENT: "Aguardando sua aprovação",
    CUSTOMER_APPROVED: "Orçamento aprovado pelo cliente",
    CUSTOMER_REJECTED: "Orçamento recusado",
    PROVIDER_AUTHORIZED: "Execução autorizada",
  };
  const humanStatus = (value) => orderLabels[value] || "Aguardando avaliação";
  const escape = (v) =>
    String(v ?? "").replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  const format = (v) =>
    new Intl.DateTimeFormat("pt-BR", {
      timeZone: ZONE,
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(v));
  function parts(date) {
    return Object.fromEntries(
      new Intl.DateTimeFormat("en-CA", {
        timeZone: ZONE,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
      })
        .formatToParts(date)
        .filter((p) => p.type !== "literal")
        .map((p) => [p.type, p.value]),
    );
  }
  function localDate(date = new Date()) {
    const p = parts(date);
    return `${p.year}-${p.month}-${p.day}`;
  }
  function instant(local) {
    if (!/^\d{4}-\d\d-\d\dT\d\d:\d\d$/.test(local))
      throw new Error("Informe data e hora.");
    const [y, m, d, h, n] = local.match(/\d+/g).map(Number),
      wall = Date.UTC(y, m - 1, d, h, n);
    let value = wall;
    for (let i = 0; i < 3; i++) {
      const p = parts(new Date(value));
      value +=
        wall - Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute);
    }
    const p = parts(new Date(value));
    if (`${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}` !== local)
      throw new Error("Horário inválido em Brasília.");
    return new Date(value).toISOString();
  }
  const field = (name, title, type = "text", extra = "") =>
    `<label>${title}<input name="${name}" type="${type}" ${extra} required></label>`;
  function mount(container, { scope, order } = {}) {
    if (!container) return;
    let token =
        scope === "customer"
          ? order?.orderAccessToken
          : sessionStorage.getItem(
              scope === "admin" ? "rp_admin_session" : "rp_provider_session",
            ),
      data = { appointments: [], orders: [] },
      currentOrder = order?.orderId || "",
      busy = false;
    const api = async (input, query = "") => {
      const response = await fetch(`/api/${scope}/agenda${query}`, {
          method: input ? "POST" : "GET",
          headers: {
            authorization: `Bearer ${token}`,
            accept: "application/json",
            ...(input ? { "content-type": "application/json" } : {}),
          },
          ...(input
            ? {
                body: JSON.stringify(
                  scope === "admin" &&
                    [
                      "rule",
                      "qualification",
                      "availability",
                      "plan",
                      "proposal",
                    ].includes(input.action)
                    ? { ...input, expectedRevision: data.revision }
                    : input,
                ),
              }
            : {}),
          cache: "no-store",
        }),
        body = await response.json();
      if (!response.ok) {
        const errors = {
          HUMAN_REVIEW_REQUIRED:
            "O CAC precisa avaliar a modalidade, duração e equipe antes de oferecer horários.",
          SCHEDULE_CONFLICT:
            "Este horário deixou de estar disponível. Consulte novamente.",
          APPROVED_QUOTE_AND_CONTRACT_REQUIRED:
            "A execução exige orçamento aprovado e condições de contratação aceitas.",
          STALE_SCHEDULE_CONFIGURATION:
            "A configuração mudou desde sua leitura. Atualize a agenda antes de editar.",
          STALE_APPOINTMENT: "A agenda mudou. Atualize e tente novamente.",
          PROVIDER_NOT_ELIGIBLE:
            "O profissional ainda não tem habilitação verificada para este atendimento.",
          CONTACT_CAC_REQUIRED:
            "Solicite ao CAC uma avaliação desta alteração conforme as regras comerciais.",
          MATERIALS_NOT_READY:
            "Os materiais ainda precisam ser confirmados pelo CAC.",
          UNAUTHENTICATED: "Sua sessão expirou. Entre novamente.",
          DATASTORE_UNAVAILABLE:
            "A agenda está temporariamente indisponível. Nenhum horário foi confirmado.",
        };
        throw new Error(
          errors[body.code] || body.error || "Operação não concluída.",
        );
      }
      return body;
    };
    const status = (m) => {
      const p = container.querySelector("[data-message]");
      if (p) p.textContent = m;
    };
    async function run(fn) {
      if (busy) return;
      busy = true;
      container.querySelectorAll("button").forEach((b) => (b.disabled = true));
      try {
        await fn();
      } catch (e) {
        status(e.message);
      } finally {
        busy = false;
        container
          .querySelectorAll("button")
          .forEach((b) => (b.disabled = false));
      }
    }
    function shell() {
      container.classList.add("agenda");
      container.innerHTML = `<h2>${scope === "admin" ? "CAC — AGENDA INTELIGENTE" : scope === "provider" ? "Minha agenda" : "Agenda do atendimento"}</h2><p class="notice">Horários de Brasília. Uma solicitação só se torna confirmada após o aceite de todos os profissionais e do cliente. Alterações ficam registradas.</p><p data-message role="status" aria-live="polite"></p>${!token ? "<p>Entre na sua conta para consultar dados protegidos.</p>" : ""}<div data-body></div>`;
    }
    function booking() {
      return `<details><summary>Consultar horários / solicitar agendamento</summary><form data-form="options" class="panel"><div class="grid">${scope !== "customer" ? `<label>Pedido<select name="orderId">${data.orders.map((o) => `<option value="${escape(o.orderId)}">${escape(o.protocol)} — ${escape(o.serviceName)}</option>`).join("")}</select></label>` : ""}<label>Modalidade<select name="type"><option value="VISIT">Visita técnica / orçamento</option><option value="EXECUTION">Execução do serviço</option></select></label>${field("from", "Consultar a partir de", "date", `value="${localDate()}"`)}</div><p>As alternativas consideram equipe, duração, deslocamento, bloqueios e materiais. Para vários dias, todos os períodos são reservados juntos.</p><button>Consultar disponibilidade real</button><div data-options></div></form></details>`;
    }
    function management() {
      return `<details><summary>Cadastros e regras de agenda</summary>${(data.providers || []).map((p) => `<p><b>${escape(p.name)}</b> · ID: ${escape(p.providerId)} · ${escape(p.status)}<br>${escape((p.specialties || []).join(", "))}</p>`).join("")}<h3>Regras registradas</h3>${
        Object.entries(data.rules || {})
          .map(
            ([code, r]) =>
              `<p>${escape(code)} · ${escape(r.mode)} · Referência: ${escape(r.source)}</p>`,
          )
          .join("") || "<p>Nenhuma regra comercial cadastrada.</p>"
      }</details><details><summary>Regras e habilitações — configuração autorizada do CAC</summary><form data-form="rule" class="panel"><h3>Regra comercial por código oficial</h3><div class="grid">${field("serviceCode", "Código do serviço")}<label>Modalidade aprovada<select name="mode"><option value="HUMAN_REVIEW">Avaliação humana por pedido</option><option value="VISIT">Visita presencial</option><option value="REMOTE">Orçamento remoto</option><option value="DIRECT">Sem visita obrigatória</option></select></label>${field("visitMinutes", "Duração da visita (min)", "number", 'min="15" max="480"')}${field("travelMinutes", "Margem de deslocamento por lado (min)", "number", 'min="0" max="240"')}${field("holdMinutes", "Prazo para aceites (min)", "number", 'min="5" max="1440"')}${field("cancelBeforeMinutes", "Antecedência para cancelar (min)", "number", 'min="0" max="10080"')}${field("source", "Referência da regra comercial aprovada")}${field("reason", "Justificativa")}</div><button>Registrar regra</button></form><form data-form="qualification" class="panel"><h3>Habilitação verificada</h3><div class="grid">${field("providerId", "ID do profissional")}${field("serviceCodes", "Códigos autorizados (separados por vírgula)")}${field("specialty", "Especialidade do cadastro validado")}${field("evidence", "Referência da verificação técnica")}${field("validUntil", "Validade da habilitação", "datetime-local")}${field("reason", "Justificativa")}</div><button>Registrar verificação</button></form></details><details><summary>Avaliar pedido, orçamento remoto e plano de execução</summary><form data-form="plan" class="panel"><div class="grid"><label>Pedido<select name="orderId">${data.orders.map((o) => `<option value="${escape(o.orderId)}">${escape(o.protocol)} — ${escape(o.serviceName)}</option>`).join("")}</select></label><label>Modalidade após análise<select name="mode"><option value="VISIT">Visita</option><option value="REMOTE">Orçamento remoto</option><option value="DIRECT">Sem visita</option></select></label>${field("durationMinutes", "Duração total de execução (min)", "number", 'min="15" max="14880"')}${field("crewSize", "Número de profissionais", "number", 'min="1" max="10"')}${field("providerIds", "IDs da equipe contratada (vírgulas)")}${field("reason", "Justificativa técnica / comercial")}</div><label><span><input name="materialsReady" type="checkbox"> Materiais disponíveis</span></label><button>Salvar plano avaliado</button></form><form data-form="proposal" class="panel"><h3>Preparar proposta comercial</h3><p>Preço fixo é recuperado da tabela oficial. Para outros modos, registre apenas o valor avaliado e autorizado, após o relatório técnico. A tabela e as regras financeiras permanecem intactas.</p><div class="grid">${field("orderId", "ID do pedido")}${field("description", "Escopo e condições de contratação")}<label>Valor autorizado (centavos; preço fixo usa tabela)<input name="amountCents" type="number" min="1" step="1"></label>${field("reason", "Justificativa da aprovação comercial")}</div><button>Enviar proposta para aprovação do cliente</button></form></details>`;
    }
    function profile() {
      const p = data.profile || { windows: [], blocks: [], regions: [] };
      return `<details><summary>Dias, horários, folgas, regiões e especialidades</summary><p>Habilitações verificadas: ${escape(p.qualification?.serviceCodes.join(", ") || "Aguardando verificação pelo CAC")}. Especialidade: ${escape(p.qualification?.specialty || "—")}</p><form data-form="availability" class="panel"><h3>Janelas de trabalho e folgas</h3><p>Uma linha por período: início e fim separados por vírgula, no formato AAAA-MM-DDTHH:mm. Inclua a margem de deslocamento nos horários de trabalho.</p><label>Dias e horários de trabalho<textarea name="windows" placeholder="2026-11-02T08:00,2026-11-02T18:00">${escape(
        (p.windows || [])
          .map((w) =>
            [w.start, w.end]
              .map((v) => {
                const z = parts(new Date(v));
                return `${z.year}-${z.month}-${z.day}T${z.hour}:${z.minute}`;
              })
              .join(","),
          )
          .join("\n"),
      )}</textarea></label><label>Folgas e bloqueios<textarea name="blocks" placeholder="2026-11-02T12:00,2026-11-02T13:00">${escape(
        (p.blocks || [])
          .map((w) =>
            [w.start, w.end]
              .map((v) => {
                const z = parts(new Date(v));
                return `${z.year}-${z.month}-${z.day}T${z.hour}:${z.minute}`;
              })
              .join(","),
          )
          .join("\n"),
      )}</textarea></label><label>Regiões — uma por linha: cidade,UF,bairro (bairro opcional)<textarea name="regions" required>${escape((p.regions || []).map((r) => [r.city, r.state, r.neighborhood].join(",")).join("\n"))}</textarea></label><button>Salvar disponibilidade</button></form><p>Uma folga que conflite com compromisso vigente exige reagendamento prévio. A edição da disponibilidade não altera habilitações.</p></details><details><summary>Registrar avaliação remota</summary>${data.orders
        .filter((o) => o.plan?.mode === "REMOTE")
        .map(
          (o) =>
            `<p>${escape(o.protocol)} · ID: ${escape(o.orderId)} · ${escape(o.serviceName)}</p>`,
        )
        .join(
          "",
        )}<form data-form="assessment" class="panel">${field("orderId", "ID do pedido atribuído para avaliação remota")}${reportFields()}<button>Registrar avaliação técnica remota</button></form></details>`;
    }
    function reportFields() {
      return `<div class="grid">${field("conditions", "Condições técnicas")}${field("quantity", "Quantidade", "number", 'min="0.01" step="any"')}${field("unit", "Unidade de medida avaliada")}${field("materials", "Materiais necessários")}${field("estimatedMinutes", "Duração estimada (min)", "number", 'min="15" max="14880"')}${field("notes", "Observações para o orçamento", "text", 'maxlength="2000"')}</div><label>Fotografias autorizadas<input name="photos" type="file" accept="image/jpeg,image/png,image/webp" multiple></label><label><span><input name="photoConsent" type="checkbox"> Tenho autorização para registrar estas fotografias.</span></label>`;
    }
    function cards(items) {
      return (
        items
          .map(
            (a) =>
              `<article class="appointment" data-id="${escape(a.id)}"><span class="badge">${escape(labels[a.status])}</span><h3>${escape(labels[a.type])}</h3><b>${escape(a.serviceName)}</b><p>Pedido ${escape(a.orderProtocol)} · Agenda ${escape(a.protocol)}</p><p>${a.slots.map((s) => `${format(s.start)} até ${format(s.end)}`).join("<br>")}</p><p>${escape(a.region.city)} / ${escape(a.region.neighborhood)} · ${escape(a.professionals.map((p) => p.name).join(", "))}</p><small>Aceites: ${a.acceptedBy.length}/${a.providerIds.length} profissionais · Cliente: ${a.customerConfirmed ? "registrado" : "pendente"}</small>${a.rescheduleRequest ? `<p class="notice">Reagendamento solicitado: ${escape(a.rescheduleRequest.reason)}. O compromisso atual permanece vigente até a confirmação do novo horário.</p>` : ""}<div class="row">${scope === "provider" && a.status === "PENDING_PROVIDER" ? '<button data-action="accept">Aceitar</button><button data-action="decline">Recusar</button>' : ""}${scope === "customer" && a.status === "PENDING_PROVIDER" && !a.customerConfirmed ? '<button data-action="confirm">Confirmar minha participação</button>' : ""}${["PENDING_PROVIDER", "CONFIRMED"].includes(a.status) ? '<button data-action="reschedule">Solicitar reagendamento</button>' : ""}${scope !== "provider" && ["PENDING_PROVIDER", "CONFIRMED"].includes(a.status) ? '<button data-action="cancel">Cancelar</button>' : ""}${scope === "provider" && a.status === "CONFIRMED" ? '<button data-action="start">Registrar início</button>' : ""}${scope === "provider" && a.status === "IN_PROGRESS" ? '<button data-action="complete">Registrar conclusão</button>' : ""}${scope !== "provider" && a.rescheduleRequest ? "<button data-replace>Consultar novo horário</button>" : ""}</div>${scope === "provider" && a.status === "IN_PROGRESS" ? `<details><summary>Registrar observações técnicas</summary><form data-form="technical">${reportFields()}<button>Salvar relatório técnico</button></form></details>` : ""}${a.technical ? `<details><summary>Relatório técnico</summary><p>${escape(a.technical.conditions)} · ${escape(a.technical.quantity)} ${escape(a.technical.unit)}</p><p>Materiais: ${escape(a.technical.materials)}</p></details>` : ""}<details><summary>Histórico</summary>${a.history.map((h) => `<p>${escape(h.event)} · ${format(h.at)}</p>`).join("")}</details>${
                scope === "admin"
                  ? `<details><summary>Preparar mensagem comercial</summary><form data-form="notification"><label>Mensagem<select name="event">${Object.entries(
                      {
                        REQUEST_RECEIVED: "Solicitação recebida",
                        PROVIDER_CONSULTED: "Profissional consultado",
                        VISIT_CONFIRMED: "Visita confirmada",
                        VISIT_REMINDER: "Lembrete visita",
                        QUOTE_AVAILABLE: "Orçamento disponível",
                        QUOTE_APPROVED: "Orçamento aprovado",
                        EXECUTION_SCHEDULED: "Execução agendada",
                        EXECUTION_REMINDER: "Lembrete execução",
                        RESCHEDULE: "Reagendamento",
                        CANCELLED: "Cancelamento",
                        VISIT_COMPLETED: "Visita concluída",
                        EXECUTION_COMPLETED: "Execução concluída",
                        AFTER_SALES: "Pós-venda",
                      },
                    )
                      .map(([k, v]) => `<option value="${k}">${v}</option>`)
                      .join(
                        "",
                      )}</select></label>${field("reason", "Justificativa")}<button>Gerar mensagem para copiar</button></form></details>`
                  : ""
              }</article>`,
          )
          .join("") || "<p>Nenhum agendamento neste filtro.</p>"
      );
    }
    function selectedItems() {
      const read = (n) =>
        container.querySelector(`[name="filter-${n}"]`)?.value || "";
      return data.appointments.filter(
        (a) =>
          (!read("status") || a.status === read("status")) &&
          (!read("provider") || a.providerIds.includes(read("provider"))) &&
          (!read("region") || a.region.city === read("region")) &&
          (!read("category") || a.category === read("category")),
      );
    }
    function calendar(items) {
      const date = container.querySelector('[name="calendar-date"]').value,
        view = container.querySelector('[name="calendar-view"]').value,
        days =
          view === "day"
            ? 1
            : view === "week"
              ? 7
              : new Date(
                  Number(date.slice(0, 4)),
                  Number(date.slice(5, 7)),
                  0,
                ).getDate(),
        first = view === "month" ? date.slice(0, 7) + "-01" : date,
        base = new Date(first + "T12:00:00Z");
      return Array.from({ length: days }, (_, i) => {
        const d = new Date(base.getTime() + i * 86400000),
          key = d.toISOString().slice(0, 10);
        return `<div class="day"><b>${key.slice(8)}/${key.slice(5, 7)}</b>${items
          .filter((a) =>
            a.slots.some((s) => localDate(new Date(s.start)) === key),
          )
          .map(
            (a) =>
              `<button data-jump="${escape(a.id)}">${escape(labels[a.type])}<br>${escape(labels[a.status])}</button>`,
          )
          .join("")}</div>`;
      }).join("");
    }
    function renderList() {
      const items = selectedItems();
      container.querySelector("[data-cards]").innerHTML = cards(items);
      container.querySelector("[data-calendar]").innerHTML = calendar(items);
    }
    let replacement = null;
    function render() {
      const host = container.querySelector("[data-body]");
      host.innerHTML = `<div class="row"><button data-refresh>Atualizar agenda</button><label>Visualização<select name="calendar-view"><option value="week">Semanal</option><option value="day">Diária</option><option value="month">Mensal</option></select></label><label>Data<input type="date" name="calendar-date" value="${localDate()}"></label></div><div class="grid"><label>Situação<select name="filter-status"><option value="">Todas</option>${Object.entries(
        labels,
      )
        .filter(([k]) => !["VISIT", "EXECUTION"].includes(k))
        .map(([k, v]) => `<option value="${k}">${v}</option>`)
        .join(
          "",
        )}</select></label>${["provider", "region", "category"].map((key, i) => `<label>${["Profissional", "Região", "Especialidade"][i]}<select name="filter-${key}"><option value="">Todos</option>${[...new Set(data.appointments.flatMap((a) => (key === "provider" ? a.providerIds : key === "region" ? [a.region.city] : [a.category])))].map((v) => `<option>${escape(v)}</option>`).join("")}</select></label>`).join("")}</div><div data-calendar class="calendar" aria-label="Calendário de compromissos"></div><details><summary>Assistente da agenda</summary><form data-form="assist" class="panel"><label>Descreva o serviço<input name="description" required maxlength="500"></label><button>Consultar catálogo oficial</button><div data-advice></div></form><p>As sugestões usam o catálogo; os horários são calculados a partir da disponibilidade real. O assistente não confirma compromissos.</p></details>${scope === "admin" ? management() : scope === "provider" ? profile() : ""}${scope === "customer" ? data.orders.map((o) => `<section class="panel"><h3>Orçamento e execução</h3><p>Situação do orçamento: ${escape(humanStatus(o.quoteStatus))}</p><p>Execução: ${escape(humanStatus(o.status))}</p>${o.quote ? `<p>${escape(o.quote.description)} · ${new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(o.quote.amountCents / 100)}</p>${o.quoteStatus === "CUSTOMER_QUOTE_SENT" ? `<button data-decision="APPROVE" data-order="${escape(o.orderId)}">Aprovar orçamento e condições</button> <button data-decision="REJECT" data-order="${escape(o.orderId)}">Recusar orçamento</button>` : ""}` : "<p>Valores dependentes de avaliação serão apresentados após revisão comercial.</p>"}</section>`).join("") : ""}${scope !== "provider" ? booking() : ""}<div data-cards></div>${
        scope === "admin"
          ? `<section class="panel"><h3>Alertas de agenda</h3>${(data.alerts || []).map((a) => `<p>${escape(a.event)} · ${escape(a.appointmentId)}</p>`).join("") || "<p>Nenhum alerta registrado.</p>"}</section><details><summary>Pendências de pedidos e orçamentos</summary>${data.orders.map((o) => `<p><b>${escape(o.protocol)}</b> — ${escape(o.serviceName)} · Orçamento: ${escape(humanStatus(o.quoteStatus))} · Plano: ${escape(o.plan?.mode || "Avaliação humana pendente")}<br><small>ID: ${escape(o.orderId)} · Preferência: ${o.preferences?.preferredAt ? format(o.preferences.preferredAt) : "Não informada"} · ${escape(o.preferences?.visitPreference || "REVIEW")} · Vídeo disponível: ${o.preferences?.hasVideo ? "sim" : "não"}</small></p>`).join("")}</details><details><summary>Auditoria do CAC</summary>${data.audit
              .slice(-100)
              .reverse()
              .map(
                (e) =>
                  `<p>${escape(e.event)} · ${escape(e.actorId)} · ${format(e.at)} · ${escape(e.reason)}</p>`,
              )
              .join("")}</details>`
          : ""
      }<details><summary>Mensagens prontas para WhatsApp Business</summary><p>Copie e envie manualmente ao destinatário autorizado. Não há envio automático. Confira consentimento e situação atual antes de enviar.</p>${data.notifications
        .slice(-50)
        .reverse()
        .map(
          (n) =>
            `<div class="panel"><p>${escape(n.text)}</p><button data-copy="${escape(n.id)}">Copiar mensagem</button></div>`,
        )
        .join("")}</details>`;
      renderList();
    }
    async function load() {
      status("Consultando registros reais…");
      data = await api(
        null,
        scope === "customer"
          ? `?orderId=${encodeURIComponent(currentOrder)}`
          : "",
      );
      render();
      if (scope === "customer") {
        const order = data.orders[0],
          appointment = data.appointments.find((a) =>
            ["CONFIRMED", "IN_PROGRESS"].includes(a.status),
          );
        const update = (id, text) => {
          const element = document.getElementById(id);
          if (element) element.textContent = text;
        };
        update("map-status", humanStatus(order?.status));
        update(
          "provider-name",
          appointment
            ? appointment.professionals.map((p) => p.name).join(", ")
            : "Aguardando confirmação do profissional",
        );
        update(
          "provider-specialty",
          appointment
            ? appointment.category
            : "A confirmação aparecerá na agenda.",
        );
        update("provider-whatsapp", "Falar com o suporte do atendimento");
        const step =
          {
            REQUESTED: 0,
            SEARCHING_PROVIDER: 1,
            OFFERED: 1,
            PROVIDER_ACCEPTED: 2,
            PROVIDER_ARRIVED: 4,
            SERVICE_STARTED: 5,
            SERVICE_COMPLETED: 6,
          }[order?.status] ?? 0;
        document.querySelectorAll("#status-timeline li").forEach((li, i) => {
          li.classList.toggle("current", i === step);
          li.classList.toggle("done", i < step);
        });
      }
      status("Agenda atualizada.");
    }
    container.onclick = (e) => {
      const b = e.target.closest("button");
      if (!b) return;
      if (b.hasAttribute("data-refresh")) return run(load);
      if (b.dataset.decision) {
        return run(async () => {
          const o = data.orders.find((o) => o.orderId === b.dataset.order);
          await api({
            action: "proposal-decision",
            orderId: o.orderId,
            quoteId: o.quote.quoteId,
            decision: b.dataset.decision,
          });
          await load();
        });
      }
      if (b.dataset.copy) {
        const n = data.notifications.find((n) => n.id === b.dataset.copy);
        return run(async () => {
          await navigator.clipboard.writeText(n.text);
          status("Mensagem copiada. Confira o destinatário antes do envio.");
        });
      }
      if (b.dataset.jump) {
        container
          .querySelector(`[data-id="${b.dataset.jump}"]`)
          ?.scrollIntoView({ behavior: "smooth" });
        return;
      }
      const a = data.appointments.find(
        (a) => a.id === b.closest("[data-id]")?.dataset.id,
      );
      if (!a) return;
      if (b.hasAttribute("data-replace")) {
        replacement = a;
        const bookingForm = container.querySelector('[data-form="options"]');
        bookingForm.elements.type.value = a.type;
        if (bookingForm.elements.orderId)
          bookingForm.elements.orderId.value = a.orderId;
        container
          .querySelector('[data-form="options"]')
          .closest("details").open = true;
        status(
          "Consulte novos horários. A reserva atual será mantida até os novos aceites.",
        );
        return;
      }
      if (b.dataset.action)
        run(async () => {
          const reason = ["cancel", "reschedule", "decline"].includes(
            b.dataset.action,
          )
            ? prompt("Justificativa da alteração:")
            : "";
          if (
            ["cancel", "reschedule", "decline"].includes(b.dataset.action) &&
            !reason
          )
            return;
          await api({
            action: b.dataset.action,
            id: a.id,
            version: a.version,
            reason,
          });
          await load();
        });
    };
    container.onchange = (e) => {
      if (
        e.target.name?.startsWith("filter-") ||
        e.target.name?.startsWith("calendar-")
      )
        renderList();
    };
    container.onsubmit = (e) => {
      const form = e.target;
      if (!form.dataset.form) return;
      e.preventDefault();
      run(async () => {
        const action = form.dataset.form,
          values = Object.fromEntries(new FormData(form)),
          appointment = data.appointments.find(
            (a) => a.id === form.closest("[data-id]")?.dataset.id,
          );
        if (action === "assist") {
          const advice = await api(
            null,
            "?assist=" + encodeURIComponent(values.description),
          );
          form.querySelector("[data-advice]").innerHTML =
            advice.services
              .map(
                (s) =>
                  `<p><b>${escape(s.serviceCode)}</b> — ${escape(s.name)} · ${escape(s.category)}</p>`,
              )
              .join("") ||
            "<p>O CAC precisa identificar o código apropriado.</p>";
          status(advice.notice || "Consulta concluída.");
          return;
        }
        if (action === "options") {
          const orderId = scope === "customer" ? currentOrder : values.orderId;
          const result = await api(
            null,
            `?options=true&orderId=${encodeURIComponent(orderId)}&type=${values.type}&from=${encodeURIComponent(instant(values.from + "T00:00") < new Date().toISOString() ? new Date(Date.now() + 60000).toISOString() : instant(values.from + "T00:00"))}`,
          );
          const box = form.querySelector("[data-options]");
          box.innerHTML = result.options.length
            ? result.options
                .map(
                  (o, i) =>
                    `<p><button type="button" data-slot="${i}">${o.slots.map((s) => format(s.start) + " até " + format(s.end)).join("<br>")} — solicitar, sujeito a aceite</button></p>`,
                )
                .join("")
            : "<p>Não há horários disponíveis. O CAC precisa revisar equipe, regiões ou disponibilidade.</p>";
          box.querySelectorAll("[data-slot]").forEach(
            (button) =>
              (button.onclick = () =>
                run(async () => {
                  if (
                    scope === "customer" &&
                    !confirm(
                      "Solicitar este horário e registrar minha concordância? A confirmação depende dos profissionais.",
                    )
                  )
                    return;
                  await api({
                    action: "book",
                    orderId,
                    type: values.type,
                    ...result.options[+button.dataset.slot],
                    customerConfirmed: scope === "customer",
                    replaceId: replacement?.id,
                    reason:
                      scope === "admin"
                        ? prompt("Justificativa do agendamento:")
                        : undefined,
                  });
                  replacement = null;
                  await load();
                })),
          );
          return;
        }
        if (action === "availability") {
          const parse = (v) =>
            v.trim()
              ? v
                  .trim()
                  .split("\n")
                  .map((line) => {
                    const [start, end] = line.split(",").map((s) => s.trim());
                    return { start: instant(start), end: instant(end) };
                  })
              : [];
          values.windows = parse(values.windows);
          values.blocks = parse(values.blocks);
          values.regions = values.regions
            .trim()
            .split("\n")
            .map((line) => {
              const [city, state, neighborhood = ""] = line
                .split(",")
                .map((s) => s.trim());
              return { city, state, neighborhood };
            });
        }
        for (const name of [
          "visitMinutes",
          "travelMinutes",
          "holdMinutes",
          "cancelBeforeMinutes",
          "durationMinutes",
          "crewSize",
          "quantity",
          "estimatedMinutes",
          "amountCents",
        ])
          if (name in values) values[name] = Number(values[name]);
        for (const name of ["serviceCodes", "providerIds"])
          if (name in values)
            values[name] = values[name].split(",").map((s) => s.trim());
        if (values.validUntil) values.validUntil = instant(values.validUntil);
        if (action === "plan")
          values.materialsReady = form.elements.materialsReady.checked;
        if (["technical", "assessment"].includes(action)) {
          values.photoConsent = form.elements.photoConsent.checked;
          values.photoEvidenceIds = [];
          const files = [...form.elements.photos.files];
          if (files.length && !values.photoConsent)
            throw new Error(
              "É necessária autorização para registrar fotografias.",
            );
          for (const file of files) {
            if (
              file.size > 8000000 ||
              !["image/jpeg", "image/png", "image/webp"].includes(file.type)
            )
              throw new Error("Envie fotos JPEG, PNG ou WEBP de até 8 MB.");
            const buffer = new Uint8Array(await file.arrayBuffer());
            let binary = "";
            for (let i = 0; i < buffer.length; i += 32768)
              binary += String.fromCharCode(...buffer.subarray(i, i + 32768));
            const response = await fetch("/api/evidence", {
                method: "POST",
                headers: {
                  authorization: `Bearer ${token}`,
                  "content-type": "application/json",
                },
                body: JSON.stringify({
                  purpose: "ORDER_PROBLEM",
                  originalName: file.name,
                  mimeType: file.type,
                  base64: btoa(binary),
                }),
              }),
              body = await response.json();
            if (!response.ok)
              throw new Error(
                "Não foi possível registrar a fotografia privada.",
              );
            values.photoEvidenceIds.push(body.evidenceId);
          }
          delete values.photos;
        }
        await api({
          ...values,
          action,
          ...(appointment
            ? { id: appointment.id, version: appointment.version }
            : {}),
        });
        await load();
      });
    };
    shell();
    if (token) run(load);
  }
  root.ReformaAgenda = { mount, instant, format, localDate };
  if (typeof module === "object" && module.exports)
    module.exports = root.ReformaAgenda;
})(typeof globalThis === "object" ? globalThis : window);
