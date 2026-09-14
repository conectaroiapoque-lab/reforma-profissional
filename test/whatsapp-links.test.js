"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const whatsappNumber = "5531990102500";
const landings = [
  "eletricista-bh",
  "bombeiro-hidraulico-bh",
  "ar-condicionado-bh",
  "pedreiro-bh",
  "marido-de-aluguel-bh",
  "solicitar-servico"
];

const read = file => fs.readFileSync(path.join(root, file), "utf8");
const hrefs = source => [...source.matchAll(/<a\b[^>]*\bhref="([^"]+)"[^>]*>/g)].map(match => match[1]);

test("Home gera o destino real de todos os links centrais com o WhatsApp Business", () => {
  const app = read("app.js");
  const configuredNumber = app.match(/const WHATSAPP_NUMBER = "(\d+)";/)?.[1];
  assert.equal(configuredNumber, whatsappNumber);

  const generatedUrl = new URL(`https://wa.me/${configuredNumber}?text=${encodeURIComponent("teste")}`);
  assert.equal(generatedUrl.origin + generatedUrl.pathname, `https://wa.me/${whatsappNumber}`);
  assert.match(app, /\.whatsapp-general"\)\.forEach\(link=>link\.href=whatsappUrl\(WHATSAPP_MESSAGE\)\)/);
  assert.match(app, /#success-whatsapp"\)\.href=whatsappUrl\(/);
  assert.match(app, /#provider-whatsapp"\)\.href=whatsappUrl\(/);
  assert.equal((app.match(/const WHATSAPP_NUMBER/g) || []).length, 1);
});

test("cada CTA das seis landing pages aponta de fato para o WhatsApp Business", () => {
  for (const slug of landings) {
    const source = read(`${slug}/index.html`);
    const ctas = hrefs(source).filter(href => href.startsWith("https://wa.me/"));
    assert.ok(ctas.length > 0, `${slug} deve possuir CTAs de WhatsApp`);
    for (const href of ctas) {
      const destination = new URL(href);
      assert.equal(destination.origin + destination.pathname.split("/").slice(0, 2).join("/"), `https://wa.me/${whatsappNumber}`, `${slug}: ${href}`);
      assert.ok(destination.searchParams.get("text"), `${slug} deve preservar uma mensagem contextual`);
    }
  }
});

test("número fixo não é usado como WhatsApp em nenhum arquivo de produção", () => {
  const productionFiles = ["app.js", "index.html", "landing-pages.js", ...landings.map(slug => `${slug}/index.html`)];
  const combined = productionFiles.map(file => read(file)).join("\n");
  assert.doesNotMatch(combined, /wa\.me\/553125102500/);
  assert.doesNotMatch(combined, /WHATSAPP_NUMBER\s*=\s*["']553125102500/);
  assert.match(read("index.html"), /href="tel:\+553125102500"[^>]*>Atendimento: \(31\) 2510-2500<\/a>/);
});

test("Google Ads e a atualização do cache permanecem intactos", () => {
  const index = read("index.html");
  const app = read("app.js");
  const landingScript = read("landing-pages.js");
  const worker = read("sw.js");

  assert.match(index, /AW-17424041657/);
  assert.match(app, /AW-17424041657\/Rb7QCI780u4cELmNt_RA/);
  assert.match(landingScript, /AW-17424041657\/Rb7QCI780u4cELmNt_RA/);
  assert.match(index, /src="app\.js\?v=6"/);
  assert.match(worker, /CACHE_NAME = "reforma-profissional-v8"/);
  assert.match(worker, /"\.\/app\.js\?v=6"/);
});
