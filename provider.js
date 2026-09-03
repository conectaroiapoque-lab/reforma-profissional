"use strict";

(function exposeProviderRules(root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.ProviderRules = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createProviderRules() {
  const PROVIDER_TERMS_VERSION = "1.0-2026-09";
  const CLIENT_TERMS_VERSION = "1.0-2026-09";
  const PROVIDER_STORAGE_KEY = "reforma-profissional-prestadores";
  const PROVIDER_STATUSES = Object.freeze(["CADASTRO INICIADO", "DOCUMENTOS PENDENTES", "EM ANÁLISE", "APROVADO", "REPROVADO", "SUSPENSO"]);
  const PAYOUT_STATUSES = Object.freeze(["AGUARDANDO EXECUÇÃO", "AGUARDANDO CONCLUSÃO", "AGUARDANDO DOCUMENTO FISCAL", "DOCUMENTO FISCAL RECEBIDO", "AGUARDANDO VALIDAÇÃO", "REPASSE LIBERADO", "REPASSE REALIZADO", "EM ANÁLISE"]);
  const RANKS = Object.freeze(["Bronze", "Prata", "Ouro", "Diamante"]);
  const specialties = Object.freeze(["Marido de Aluguel", "Eletricista", "Encanador / Bombeiro Hidráulico", "Pintor", "Pedreiro", "Montador de Móveis", "Instalador", "Técnico de Ar-Condicionado", "Gesseiro", "Serralheiro", "Vidraceiro", "Jardineiro", "Telhadista", "Reforma Geral"]);
  const specificServices = Object.freeze({ Eletricista: ["Curto-circuito", "Troca de tomada", "Instalação de tomada", "Disjuntor", "Chuveiro", "Ventilador", "Quadro elétrico", "Elétrica residencial", "Outros"] });
  const fiscalConfiguration = { requireInvoice: "WHEN_APPLICABLE", reviewStatus: "PENDING_ACCOUNTING_REVIEW" };
  const allowedTransitions = Object.freeze({
    "CADASTRO INICIADO": ["DOCUMENTOS PENDENTES", "EM ANÁLISE"], "DOCUMENTOS PENDENTES": ["EM ANÁLISE"], "EM ANÁLISE": ["APROVADO", "REPROVADO"], APROVADO: ["SUSPENSO"], REPROVADO: ["EM ANÁLISE"], SUSPENSO: ["APROVADO"]
  });
  const termsSections = [
    ["1. Sobre a Reforma Profissional", "A Reforma Profissional é uma plataforma tecnológica de intermediação que conecta clientes interessados em contratar serviços a profissionais independentes interessados em executá-los. A Plataforma disponibiliza tecnologia, atendimento, organização dos chamados, meios de pagamento, acompanhamento e outros recursos. O Prestador executa os serviços de forma independente."],
    ["2. Prestador independente", "O Prestador declara atuar por conta própria, com autonomia para organizar sua atividade profissional e empresarial. O cadastramento na Reforma Profissional não constitui contrato de emprego, sociedade, associação, representação ou exclusividade entre o Prestador e a Plataforma. As partes reconhecem a natureza independente da relação, observada a forma efetiva de prestação dos serviços e a legislação aplicável."],
    ["3. Liberdade para aceitar ou recusar", "O Prestador poderá aceitar ou recusar oportunidades de serviço disponibilizadas pela Plataforma. Não existe obrigação de aceitar quantidade mínima de chamados. A recusa, isoladamente, não gera punição automática."],
    ["4. Disponibilidade sem horário obrigatório", "Não existe horário mínimo obrigatório, horário fixo, controle de presença ou obrigação de permanecer conectado à Plataforma. O Prestador informa sua disponibilidade para receber oportunidades."],
    ["5. Não exclusividade", "O Prestador poderá atender clientes próprios e prestar serviços para outras empresas, pessoas ou plataformas, respeitando os serviços que voluntariamente tenha aceitado através da Reforma Profissional."],
    ["6. Responsabilidade técnica", "O Prestador é responsável pela execução técnica dos serviços que aceitar, devendo possuir conhecimento, ferramentas, habilitações, licenças e autorizações necessárias quando exigidas para sua atividade."],
    ["7. Equipamentos e ferramentas", "Salvo ajuste específico registrado no chamado, as ferramentas, equipamentos e meios necessários para a prestação do serviço são de responsabilidade do Prestador."],
    ["8. Remuneração por serviço", "A remuneração ocorre por serviço efetivamente contratado, executado, concluído e validado através da Plataforma. O modelo comercial atual prevê participação de 60% do valor do serviço para o Prestador Executor. Os 40% restantes correspondem à remuneração de intermediação da Plataforma e demais custos da operação, conforme regras comerciais vigentes."],
    ["9. Nota fiscal", "O Prestador é responsável por suas obrigações empresariais e fiscais. Quando aplicável à operação e à legislação correspondente, deverá emitir o documento fiscal referente ao serviço prestado ao Cliente/tomador identificado na contratação. Após a emissão, deverá disponibilizar os dados ou cópia à Reforma Profissional para registro e procedimento de liberação financeira. O fluxo fiscal é configurável e será validado por assessoria contábil e tributária."],
    ["10. Pagamento e repasse", "O Cliente realiza o pagamento pelos canais oficiais da Reforma Profissional. Após o cumprimento das condições da ordem de serviço, documentação necessária e validações previstas, a Plataforma poderá efetuar o repasse ao Prestador, inclusive por Pix para a conta ou chave cadastrada."],
    ["11. Sem pagamento direto", "Serviços originados através da Reforma Profissional devem permanecer registrados na Plataforma. Valores referentes a esses serviços e adicionais devem ser tratados pelos meios oficiais disponibilizados pela Plataforma."],
    ["12. Não atravessamento", "O Prestador compromete-se a não utilizar dados ou oportunidades fornecidos pela Reforma Profissional para desviar, retirar ou concluir diretamente fora da Plataforma serviços originados através dela. Serviços adicionais identificados durante um chamado também devem ser registrados no atendimento correspondente antes da execução."],
    ["13. Proteção dos dados", "O Prestador deverá utilizar os dados do Cliente exclusivamente para execução do serviço autorizado. É proibido armazenar, compartilhar, vender ou utilizar os dados para finalidades estranhas ao chamado."],
    ["14. Avaliação e qualidade", "O Cliente poderá avaliar a execução do serviço. Avaliações, reclamações, cancelamentos, pontualidade, conclusão e qualidade poderão ser considerados para organização e priorização de oportunidades na Plataforma."],
    ["15. Ranking", "Os níveis Bronze, Prata, Ouro e Diamante compõem um mecanismo de reputação dentro da Plataforma e não representam cargo, promoção trabalhista ou hierarquia funcional."],
    ["16. Garantia ao cliente", "O Prestador deverá cumprir as obrigações relativas ao serviço contratado e colaborar com os procedimentos de garantia, correção, avaliação e suporte aplicáveis. A garantia adicional oferecida pela Reforma Profissional será de até 90 dias, conforme serviço, regras e legislação aplicável."],
    ["17. Suspensão", "A Plataforma poderá suspender ou encerrar o acesso em caso de fraude comprovada, uso indevido de dados, falsidade documental, descumprimento grave de serviço aceito, tentativa comprovada de desvio de cliente, risco à segurança de clientes ou violação grave dos termos. Recusar oportunidade, ficar indisponível ou trabalhar para terceiros não são motivos automáticos de suspensão."]
  ];
  const clientTermsSections = [
    ["Intermediação", "A Reforma Profissional atua como plataforma tecnológica de intermediação e organização do atendimento. O serviço técnico é executado pelo Prestador independente identificado no chamado. A Plataforma poderá intermediar pagamentos, atendimento, suporte, registro do orçamento, acompanhamento e demais recursos relacionados à contratação."],
    ["Contratação registrada", "Orçamentos, serviços adicionais e pagamentos devem permanecer registrados no chamado oficial para permitir acompanhamento e aplicação dos benefícios e da garantia adicional, quando cabíveis."],
    ["Garantia e suporte", "A garantia adicional poderá ser de até 90 dias, conforme o serviço, as regras aplicáveis e sem prejuízo dos direitos previstos na legislação."],
    ["Dados e contato", "Os dados serão usados para organizar o atendimento, permitir contato autorizado, processar pagamentos e cumprir obrigações aplicáveis, conforme a Política de Privacidade."]
  ];
  const canReceiveServices = provider => provider?.status === "APROVADO";
  function createAcceptance({ providerId, name, taxId, acceptedAt = new Date() }) {
    if (!providerId || !name || !taxId) throw new TypeError("Identificação do aceite incompleta.");
    return Object.freeze({ termsVersion: PROVIDER_TERMS_VERSION, acceptedAt: new Date(acceptedAt).toISOString(), providerId, name, taxId, ipAddress: null, userAgent: null, auditSource: "LOCAL_MVP" });
  }
  function transitionStatus(provider, nextStatus, reason = "Ação administrativa local") {
    if (!allowedTransitions[provider.status]?.includes(nextStatus)) throw new Error("Transição de status não permitida.");
    return { ...provider, status: nextStatus, statusHistory: [...(provider.statusHistory || []), { from: provider.status, to: nextStatus, at: new Date().toISOString(), reason, actor: "ADMIN_LOCAL_MVP" }] };
  }
  function publicProviderProfile(provider) {
    return { professionalName: provider.professionalName || provider.fullName?.split(" ")[0], photoUrl: provider.photoUrl || null, specialties: provider.specialties || [], rating: provider.rating || 0, rank: provider.rank || "Bronze", completedServices: provider.completedServices || 0, experienceYears: provider.experienceYears || 0 };
  }
  function professionalOpportunity(request, authorized = false) {
    const safe = { neighborhood: request.neighborhood, region: request.region || request.city, service: request.service, description: request.description, schedule: request.schedule || request.urgency, approximateDistance: request.approximateDistance || "A calcular", value: request.value ?? request.quote?.value ?? null };
    if (authorized) Object.assign(safe, { phone: request.whatsapp, email: request.email, fullAddress: `${request.address}, ${request.number}` });
    return safe;
  }
  return { PROVIDER_TERMS_VERSION, CLIENT_TERMS_VERSION, PROVIDER_STORAGE_KEY, PROVIDER_STATUSES, PAYOUT_STATUSES, RANKS, specialties, specificServices, fiscalConfiguration, termsSections, clientTermsSections, canReceiveServices, createAcceptance, transitionStatus, publicProviderProfile, professionalOpportunity };
});

if (typeof document !== "undefined") {
  let providerStep = 1;
  const form = document.querySelector("#provider-form");
  const readProviders = () => { try { return JSON.parse(localStorage.getItem(ProviderRules.PROVIDER_STORAGE_KEY)) || []; } catch { return []; } };
  const writeProviders = value => localStorage.setItem(ProviderRules.PROVIDER_STORAGE_KEY, JSON.stringify(value));
  const selectedSpecialties = () => [...form.querySelectorAll("[name=specialties]:checked")].map(item => item.value);
  function renderProviderStep(step) {
    providerStep = Math.max(1, Math.min(4, step));
    document.querySelectorAll(".provider-step").forEach(item => item.classList.toggle("active", Number(item.dataset.providerStep) === providerStep));
    document.querySelectorAll(".provider-steps .step").forEach((item, index) => { item.classList.toggle("active", index + 1 === providerStep); item.classList.toggle("done", index + 1 < providerStep); });
    document.querySelector("#provider-prev").hidden = providerStep === 1;
    document.querySelector("#provider-next").hidden = providerStep === 4;
    document.querySelector("#provider-submit").hidden = providerStep !== 4;
  }
  function validateProviderStep() {
    const fieldset = form.querySelector(`[data-provider-step="${providerStep}"]`);
    if (providerStep === 2 && !selectedSpecialties().length) return "Selecione ao menos uma especialidade.";
    const invalid = [...fieldset.querySelectorAll("[required]")].find(field => !field.checkValidity());
    if (invalid) { invalid.reportValidity(); return "Revise os campos obrigatórios desta etapa."; }
    return "";
  }
  function updateSubmitState() {
    const accepted = form.elements.providerTerms.checked && form.elements.truthDeclaration.checked;
    document.querySelector("#provider-submit").disabled = !accepted;
  }
  function renderSpecificServices() {
    const box = document.querySelector("#specific-services");
    const chosen = selectedSpecialties();
    const groups = chosen.filter(name => ProviderRules.specificServices[name]).map(name => `<div><h3>Serviços de ${name}</h3>${ProviderRules.specificServices[name].map(service => `<label class="check"><input type="checkbox" name="specificServices" value="${service}"><span>${service}</span></label>`).join("")}</div>`);
    box.hidden = !groups.length; box.innerHTML = groups.join("");
  }
  document.querySelector("#provider-specialties").innerHTML = ProviderRules.specialties.map(item => `<label class="specialty-option"><input type="checkbox" name="specialties" value="${item}"><span>${item}</span></label>`).join("");
  document.querySelector("#provider-summary-list").innerHTML = ["Você atua como profissional independente.", "Você escolhe quando ficar disponível.", "Você pode aceitar ou recusar serviços.", "Não há exclusividade.", "O pagamento é por serviço realizado.", "Você pode atender clientes próprios e outras plataformas.", "Serviços recebidos pela Reforma Profissional devem permanecer registrados na plataforma.", "O modelo comercial atual prevê 60% ao profissional executor.", "O documento fiscal deverá ser apresentado quando aplicável."].map(item => `<li>✓ ${item}</li>`).join("");
  document.querySelector("#provider-terms-version").textContent = ProviderRules.PROVIDER_TERMS_VERSION;
  document.querySelector("#provider-terms-content").innerHTML = ProviderRules.termsSections.map(([title, body]) => `<section><h2>${title}</h2><p>${body}</p></section>`).join("");
  document.querySelector("#client-terms-content").innerHTML = ProviderRules.clientTermsSections.map(([title, body]) => `<section><h2>${title}</h2><p>${body}</p></section>`).join("");
  document.querySelector("#provider-next").addEventListener("click", () => { const error = validateProviderStep(); document.querySelector("#provider-error").hidden = !error; document.querySelector("#provider-error").textContent = error; if (!error) renderProviderStep(providerStep + 1); });
  document.querySelector("#provider-prev").addEventListener("click", () => renderProviderStep(providerStep - 1));
  form.addEventListener("change", event => { if (event.target.name === "specialties") renderSpecificServices(); updateSubmitState(); });
  form.addEventListener("submit", event => {
    event.preventDefault(); updateSubmitState(); if (document.querySelector("#provider-submit").disabled) return;
    const data = Object.fromEntries(new FormData(form).entries());
    const providerId = `PREST-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
    const documentNames = {}; [...form.querySelectorAll('input[type="file"]')].forEach(input => { documentNames[input.name] = [...input.files].map(file => file.name); });
    const provider = { ...data, providerId, specialties: selectedSpecialties(), specificServices: [...form.querySelectorAll('[name="specificServices"]:checked')].map(item => item.value), documents: documentNames, status: "EM ANÁLISE", rank: "Bronze", rating: 0, completedServices: 0, acceptance: ProviderRules.createAcceptance({ providerId, name: data.fullName, taxId: data.cnpj || data.cpf }), statusHistory: [{ from: "CADASTRO INICIADO", to: "EM ANÁLISE", at: new Date().toISOString(), reason: "Cadastro enviado", actor: "PROVIDER_LOCAL_MVP" }], createdAt: new Date().toISOString() };
    const providers = readProviders(); providers.unshift(provider); writeProviders(providers);
    localStorage.setItem("reforma-profissional-prestador-atual", providerId);
    form.reset(); updateSubmitState(); renderProviderStep(1);
    if (typeof renderAdmin === "function") renderAdmin();
    if (typeof showToast === "function") showToast("Cadastro enviado e colocado EM ANÁLISE.");
    if (typeof showView === "function") showView("provider-area");
    document.querySelector("#accepted-terms-display").textContent = `Versão ${provider.acceptance.termsVersion} • aceite em ${new Date(provider.acceptance.acceptedAt).toLocaleString("pt-BR")} • vigente no cadastro`;
  });
}
