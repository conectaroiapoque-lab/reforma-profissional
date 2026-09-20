"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const catalog = require("../catalog");

class ClassList {
  constructor(...values) { this.values = new Set(values); }
  add(value) { this.values.add(value); }
  remove(value) { this.values.delete(value); }
  contains(value) { return this.values.has(value); }
  toggle(value, force) { force ? this.add(value) : this.remove(value); return force; }
}

class ElementStub {
  constructor({ id = "", classes = [], dataset = {} } = {}) {
    this.id = id; this.dataset = dataset; this.classList = new ClassList(...classes);
    this.hidden = false; this.innerHTML = ""; this.textContent = ""; this.value = ""; this.listeners = {};
  }
  addEventListener(type, listener) { this.listeners[type] = listener; }
  setAttribute() {}
  removeAttribute() {}
  focus() { this.focused = true; }
  scrollIntoView(options) { this.scrollOptions = options; }
  closest(selector) {
    if (selector === "[data-category]" && this.dataset.category) return this;
    if (selector === "[data-code]" && this.dataset.code) return this;
    if (selector === "[data-start]" && "start" in this.dataset) return this;
    if (selector === "[data-view]" && this.dataset.view) return this;
    if (selector === "[data-urgency]" && this.dataset.urgency) return this;
    return null;
  }
}

global.Element = ElementStub;

function createHarness() {
  const ids = new Map();
  const add = (id, options) => { const item = new ElementStub({ id, ...options }); ids.set(id, item); return item; };
  const views = ["home", "request", "tracking", "success"].map((name, index) => add(`${name}-view`, { classes: ["view", ...(index ? [] : ["active"])] }));
  const steps = [1, 2, 3, 4].map(step => new ElementStub({ classes: ["form-step", ...(step === 1 ? ["active"] : [])], dataset: { step: String(step) } }));
  const progress = [1, 2, 3, 4].map(() => new ElementStub({ classes: ["step"] }));
  const categoryButtons = [...new Set(catalog.catalog.map(service => service.category))].map(category => new ElementStub({ dataset: { category } }));
  for (const id of ["service-types", "official-service", "selected-detail", "selected-service-summary", "popular-services", "common-problems", "construction-services", "assistant-options", "urgency-options", "safety-list", "year", "schedule-field", "prev-step", "next-step", "submit-request", "form-error", "get-location", "location-status", "share-tracking", "toast", "empty-tracking", "tracking-content", "tracking-protocol", "map-address", "map-status", "status-timeline", "payment-panel", "provider-whatsapp", "notifications-list"]) add(id);
  const form = add("request-form"); form.reset = () => {};
  const listeners = {};
  global.document = {
    querySelector(selector) { if (selector.startsWith("#")) return ids.get(selector.slice(1)); if (selector === ".trust-strip") return new ElementStub(); return null; },
    querySelectorAll(selector) { if (selector === ".view") return views; if (selector === ".form-step") return steps; if (selector === "[data-category]") return categoryButtons; if (selector === "[data-category],[data-urgency]") return categoryButtons; return []; },
    addEventListener(type, listener) { listeners[type] = listener; }
  };
  ids.get("request-view").querySelectorAll = selector => selector === ".step" ? progress : [];
  global.window = { scrollTo() {}, addEventListener() {} };
  Object.defineProperty(global, "navigator", { value: {}, configurable: true });
  global.ReformaProfissionalCatalog = catalog;
  delete require.cache[require.resolve("../web/app")];
  const app = require("../web/app"); app.init();
  return { app, ids, categoryButtons, click: target => listeners.click({ target }) };
}

const optionCount = markup => (markup.match(/<option value="(?:RP|V7)/g) || []).length;

test("select inicial agrupa e exibe os 111 serviços V7", () => {
  const h = createHarness();
  const markup = h.ids.get("official-service").innerHTML;
  assert.equal(catalog.catalog.length, 111);
  assert.equal(optionCount(markup), 111);
  assert.equal((markup.match(/<optgroup label=/g) || []).length, 7);
  assert.match(markup, /^<option value="">Selecione um serviço<\/option>/);
  for (const category of ["ELÉTRICA", "HIDRÁULICA", "LIMPEZA"]) assert.match(markup, new RegExp(`<optgroup label="${category}">`));
});

test("categorias filtram, destacam e focam o select sem torná-las obrigatórias", () => {
  for (const category of ["ELÉTRICA", "HIDRÁULICA", "LIMPEZA"]) {
    const h = createHarness(), button = h.categoryButtons.find(item => item.dataset.category === category);
    h.click(button);
    const expected = catalog.catalog.filter(service => service.category === category);
    const markup = h.ids.get("official-service").innerHTML;
    assert.equal(optionCount(markup), expected.length);
    assert.match(markup, /^<option value="">Selecione um serviço<\/option>/);
    assert.equal(button.classList.contains("selected"), true);
    assert.equal(h.ids.get("official-service").focused, true);
    assert.deepEqual(h.ids.get("official-service").scrollOptions, { behavior: "smooth", block: "center" });
  }
});

test("seleção define o código, formata modos de preço e libera Continuar", () => {
  const h = createHarness(), select = h.ids.get("official-service");
  h.ids.get("next-step").listeners.click();
  assert.equal(h.app.getState().currentStep, 1);
  assert.equal(select.focused, true);

  for (const [code, expected] of [["RP0001", /R\$\s*149,90/], ["RP0012", /Sob orçamento/], ["RP0023", /A partir de R\$\s*199,90/]]) {
    select.value = code; select.listeners.change({ target: select });
    assert.equal(h.app.getState().selectedServiceCode, code);
    assert.match(h.ids.get("selected-detail").textContent, expected);
  }
  h.ids.get("next-step").listeners.click();
  assert.equal(h.app.getState().currentStep, 2);
});

test("select permanece contido em telas móveis", () => {
  const css = fs.readFileSync(path.join(__dirname, "..", "styles.css"), "utf8");
  assert.match(css, /\.service-select\{[^}]*max-width:100%[^}]*width:100%/);
  assert.match(css, /@media\(max-width:520px\)\{[^}]*html,body\{max-width:100%;overflow-x:hidden/);
  assert.match(css, /\.page-view\{overflow-x:clip\}/);
});
