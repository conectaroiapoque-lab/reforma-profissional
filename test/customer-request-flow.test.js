"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const catalog = require("../catalog");

class ClassList {
  constructor(...values) { this.values = new Set(values); }
  add(value) { this.values.add(value); }
  remove(value) { this.values.delete(value); }
  contains(value) { return this.values.has(value); }
  toggle(value, force) {
    const enabled = force === undefined ? !this.contains(value) : force;
    enabled ? this.add(value) : this.remove(value);
    return enabled;
  }
}

class FakeElement {
  constructor({ id = "", classes = [], dataset = {} } = {}) {
    this.id = id;
    this.dataset = dataset;
    this.classList = new ClassList(...classes);
    this.hidden = false;
    this.textContent = "";
    this.innerHTML = "";
    this.value = "";
    this.listeners = {};
  }
  addEventListener(type, listener) { this.listeners[type] = listener; }
  removeAttribute(name) { if (name === "aria-hidden") delete this.ariaHidden; }
  setAttribute(name, value) { if (name === "aria-hidden") this.ariaHidden = value; }
  focus() { this.focused = true; }
  closest(selector) {
    if (selector === "[data-start]" && "start" in this.dataset) return this;
    if (selector === "[data-code]" && this.dataset.code) return this;
    if (selector === "[data-view]" && this.dataset.view) return this;
    if (selector === "[data-category]" && this.dataset.category) return this;
    if (selector === "[data-urgency]" && this.dataset.urgency) return this;
    if (selector === ".whatsapp-general" && this.classList.contains("whatsapp-general")) return this;
    return null;
  }
}

global.Element = FakeElement;

function createHarness() {
  const ids = new Map();
  const add = (id, options) => {
    const element = new FakeElement({ id, ...options });
    ids.set(id, element);
    return element;
  };
  const views = ["home", "request", "tracking", "success", "client-terms"].map((name, index) =>
    add(`${name}-view`, { classes: ["view", ...(index === 0 ? ["active"] : [])] })
  );
  const steps = [1, 2, 3, 4].map(step => new FakeElement({ classes: ["form-step", ...(step === 1 ? ["active"] : [])], dataset: { step: String(step) } }));
  const progress = [1, 2, 3, 4].map(step => new FakeElement({ classes: ["step", ...(step === 1 ? ["active"] : [])] }));
  const categories = [];
  const urgencies = [];
  const whatsapp = [new FakeElement({ classes: ["whatsapp-general"] })];

  ["service-types", "popular-services", "common-problems", "construction-services", "assistant-options", "urgency-options", "safety-list", "year", "selected-detail", "selected-service-summary", "schedule-field", "prev-step", "next-step", "submit-request", "form-error", "get-location", "location-status", "share-tracking", "toast", "official-service"].forEach(id => add(id));
  add("empty-tracking"); add("tracking-content"); add("tracking-protocol"); add("map-address"); add("map-status"); add("status-timeline"); add("payment-panel"); add("provider-whatsapp"); add("notifications-list"); add("success-protocol"); add("success-whatsapp");
  const trust = new FakeElement();
  const form = add("request-form");
  for (const name of ["description", "schedule", "address", "number", "complement", "neighborhood", "city", "reference", "latitude", "longitude", "locationAccuracy", "locationTimestamp", "name", "whatsapp"]) form[name] = new FakeElement();
  form.terms = { checked: false };
  form.reset = () => {
    for (const name of ["description", "schedule", "address", "number", "complement", "neighborhood", "city", "reference", "latitude", "longitude", "locationAccuracy", "locationTimestamp", "name", "whatsapp"]) form[name].value = "";
    form.terms.checked = false;
  };

  const documentListeners = {};
  global.document = {
    querySelector(selector) {
      if (selector.startsWith("#")) return ids.get(selector.slice(1));
      if (selector === ".trust-strip") return trust;
      return null;
    },
    querySelectorAll(selector) {
      if (selector === ".view") return views;
      if (selector === ".form-step") return steps;
      if (selector === "[data-category]") return categories;
      if (selector === "[data-urgency]") return urgencies;
      if (selector === "[data-category],[data-urgency]") return [...categories, ...urgencies];
      if (selector === ".whatsapp-general") return whatsapp;
      return [];
    },
    addEventListener(type, listener) { documentListeners[type] = listener; }
  };
  ids.get("request-view").querySelectorAll = selector => selector === ".step" ? progress : [];
  global.window = { scrollTo() {}, addEventListener() {} };
  Object.defineProperty(global, "navigator", { value: {}, configurable: true });
  global.sessionStorage = { getItem() { return null; }, setItem() {} };
  global.ReformaProfissionalCatalog = catalog;

  delete require.cache[require.resolve("../web/app")];
  const app = require("../web/app");
  app.init();
  const click = element => documentListeners.click({ target: element });
  return { app, ids, steps, progress, categories, urgencies, form, click };
}

function activeStep(harness) {
  return harness.steps.findIndex(step => step.classList.contains("active")) + 1;
}

test("CTA abre a seleção e Solicitar outro serviço reinicia o fluxo", () => {
  const h = createHarness();
  h.click(new FakeElement({ dataset: { start: "" } }));
  assert.equal(h.ids.get("request-view").classList.contains("active"), true);
  assert.equal(activeStep(h), 1);

  h.click(new FakeElement({ dataset: { code: "RP0001" } }));
  assert.equal(activeStep(h), 2);
  h.click(new FakeElement({ dataset: { start: "" } }));
  assert.deepEqual(h.app.getState(), { selectedServiceCode: "", selectedUrgency: "", currentStep: 1 });
  assert.equal(activeStep(h), 1);
});

test("categoria unificada exibe o nome completo e carrega apenas seus serviços V4", () => {
  const h = createHarness();
  const unifiedLabel = "MONTAGEM / INSTALAÇÃO / MARIDO DE ALUGUEL";
  const categoryMarkup = h.ids.get("service-types").innerHTML;
  assert.equal(categoryMarkup.split(unifiedLabel).length - 1, 1);
  assert.doesNotMatch(categoryMarkup, />Montagem</);
  assert.doesNotMatch(categoryMarkup, />Instalação</);
  assert.doesNotMatch(categoryMarkup, />Marido de Aluguel</);

  const category = new FakeElement({ dataset: { category: "MONTAGEM E INSTALAÇÃO" } });
  h.categories.push(category);
  h.click(category);

  const expected = catalog.catalog.filter(service => service.category === "MONTAGEM E INSTALAÇÃO");
  assert.ok(expected.length > 0);
  for (const service of expected) assert.match(h.ids.get("official-service").innerHTML, new RegExp(service.code));
  assert.equal((h.ids.get("official-service").innerHTML.match(/<option value="RP/g) || []).length, expected.length);
});

test("card inteiro seleciona o código e mostra detalhes e preço FIXED", () => {
  const h = createHarness();
  h.click(new FakeElement({ dataset: { code: "RP0001" } }));
  assert.equal(h.app.getState().selectedServiceCode, "RP0001");
  assert.equal(activeStep(h), 2);
  assert.match(h.ids.get("selected-service-summary").textContent, /Instalação de tomada simples/);
  assert.match(h.ids.get("selected-service-summary").textContent, /R\$\s*150,00/);
  assert.equal(h.ids.get("next-step").hidden, false);
});

test("serviço QUOTE mostra Sob orçamento", () => {
  const h = createHarness();
  h.click(new FakeElement({ dataset: { code: "RP0012" } }));
  assert.equal(activeStep(h), 2);
  assert.match(h.ids.get("selected-service-summary").textContent, /Sob orçamento/);
});

test("Voltar preserva serviço e Continuar percorre detalhes, endereço e confirmação", () => {
  const h = createHarness();
  h.click(new FakeElement({ dataset: { code: "RP0001" } }));
  h.form.description.value = "Preciso instalar uma tomada";
  const urgency = new FakeElement({ dataset: { urgency: "Hoje" } });
  h.urgencies.push(urgency);
  h.click(urgency);
  h.ids.get("next-step").listeners.click();
  assert.equal(activeStep(h), 3);

  h.ids.get("prev-step").listeners.click();
  assert.equal(activeStep(h), 2);
  assert.equal(h.app.getState().selectedServiceCode, "RP0001");
  assert.equal(h.app.getState().selectedUrgency, "Hoje");

  h.ids.get("next-step").listeners.click();
  Object.assign(h.form.address, { value: "Rua Teste" });
  Object.assign(h.form.number, { value: "123" });
  Object.assign(h.form.neighborhood, { value: "Centro" });
  Object.assign(h.form.city, { value: "Belo Horizonte" });
  h.ids.get("next-step").listeners.click();
  assert.equal(activeStep(h), 4);
  assert.equal(h.ids.get("submit-request").hidden, false);
  assert.equal(h.ids.get("next-step").hidden, true);
});
