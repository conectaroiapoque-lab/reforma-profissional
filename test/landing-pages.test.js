"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const slugs = ["eletricista-bh", "bombeiro-hidraulico-bh", "ar-condicionado-bh", "pedreiro-bh", "marido-de-aluguel-bh", "solicitar-servico"];
const requiredLinks = ["/", "/solicitar-servico/", ...slugs.slice(0, 5).map(slug => `/${slug}/`)];
const pages = slugs.map(slug => ({ slug, source: fs.readFileSync(path.join(root, slug, "index.html"), "utf8") }));

test("as seis landing pages existem e possuem SEO individual", () => {
  const titles = new Set();
  for (const { slug, source } of pages) {
    assert.match(source, /<html lang="pt-BR">/);
    const title = source.match(/<title>([^<]+)<\/title>/)?.[1];
    assert.ok(title); titles.add(title);
    const description = source.match(/<meta name="description" content="([^"]+)">/)?.[1];
    assert.ok(description && description.length >= 120 && description.length <= 170);
    assert.match(source, new RegExp(`<link rel="canonical" href="https://www\\.reformaprofissional\\.com\\.br/${slug}/">`));
    assert.match(source, /<meta name="robots" content="index,follow">/);
    assert.equal((source.match(/<h1[ >]/g) || []).length, 1);
  }
  assert.equal(titles.size, pages.length);
});

test("CTAs usam WhatsApp oficial e todas as rotas internas", () => {
  for (const { source } of pages) {
    assert.match(source, /https:\/\/wa\.me\/5531990102500\?text=/);
    assert.match(source, /data-whatsapp-cta/);
    assert.match(source, /target="_blank" rel="noopener"/);
    for (const href of requiredLinks) assert.ok(source.includes(`href="${href}"`), `link ${href} ausente`);
  }
});

test("rastreamento é pequeno, oficial e ocorre apenas no clique", () => {
  const script = fs.readFileSync(path.join(root, "landing-pages.js"), "utf8");
  assert.match(script, /document\.addEventListener\("click"/);
  assert.match(script, /send_to: "AW-17424041657\/Rb7QCI780u4cELmNt_RA"/);
  assert.doesNotMatch(script, /(?:DOMContentLoaded|load)[\s\S]*conversion/);
  assert.doesNotMatch(script, /preventDefault/);
});

test("páginas não usam frameworks nem alegações demonstrativas proibidas", () => {
  const combined = pages.map(page => page.source).join("\n");
  assert.doesNotMatch(combined, /react|vue|angular|bootstrap/i);
  assert.doesNotMatch(combined, /24 horas|4[.,]9 estrelas|328 atendimentos|25 minutos|primeiro lugar no google/i);
});

test("sitemap e robots tornam as rotas indexáveis", () => {
  const sitemap = fs.readFileSync(path.join(root, "sitemap.xml"), "utf8");
  const robots = fs.readFileSync(path.join(root, "robots.txt"), "utf8");
  for (const href of requiredLinks) assert.ok(sitemap.includes(`https://www.reformaprofissional.com.br${href}`));
  assert.match(robots, /Allow: \//);
  assert.match(robots, /Sitemap: https:\/\/www\.reformaprofissional\.com\.br\/sitemap\.xml/);
});
