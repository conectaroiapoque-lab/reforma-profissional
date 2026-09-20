"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const root = path.resolve(__dirname, "..");
const dist = path.join(root, "dist");

test("production build publishes one synchronized HTML, CSS, JavaScript and service-worker release", () => {
  execFileSync(process.execPath, [path.join(root, "scripts", "build-web.js")]);

  const expectedCopies = [
    ["web/index.html", "index.html"],
    ["styles.css", "styles.css"],
    ["web/app.js", "app.js"],
    ["sw.js", "sw.js"]
  ];
  for (const [source, output] of expectedCopies) {
    const built = path.join(dist, output);
    assert.ok(fs.existsSync(built), `${output} must exist in dist`);
    assert.ok(fs.statSync(built).size > 0, `${output} must not be empty`);
    if (output === "index.html") {
      const sourceHtml=fs.readFileSync(path.join(root,source),"utf8"),builtHtml=fs.readFileSync(built,"utf8");
      const release = builtHtml.match(/<meta name="rp-release" content="([0-9a-f]{7})">/)?.[1];
      assert.ok(release, "built index.html must expose its short SHA");
      assert.equal(builtHtml.replaceAll(release, "__RP_RELEASE__"),sourceHtml,"index.html must differ only by its build release markers");
    } else {
      assert.deepEqual(fs.readFileSync(built), fs.readFileSync(path.join(root, source)), `${output} must match its source`);
    }
  }
  for (const asset of [
    "manifest.webmanifest",
    "assets/brand/reforma-profissional-logo.svg",
    "assets/brand/reforma-profissional-mark.svg"
  ]) {
    assert.ok(fs.statSync(path.join(dist, asset)).size > 0, `${asset} must be published at its referenced URL`);
  }

  const html = fs.readFileSync(path.join(dist, "index.html"), "utf8");
  const css = fs.readFileSync(path.join(dist, "styles.css"), "utf8");
  const sw = fs.readFileSync(path.join(dist, "sw.js"), "utf8");
  const cssVersion = html.match(/styles\.css\?v=(\d+)/)?.[1];
  const jsVersion = html.match(/app\.js\?v=(\d+)/)?.[1];
  assert.ok(cssVersion, "index.html must version styles.css");
  assert.ok(jsVersion, "index.html must version app.js");
  assert.match(sw, new RegExp(`"/styles\\.css\\?v=${cssVersion}"`), "service worker must precache the exact HTML CSS version");
  assert.match(sw, new RegExp(`"/app\\.js\\?v=${jsVersion}"`), "service worker must precache the exact HTML JS version");
  assert.match(css, /\.hero\s*\{/);
  assert.match(css, /\.btn\s*\{/);
  assert.match(css, /@media\s*\(/);
  assert.doesNotMatch(html, /(?:href|src)="(?:\.\/)?(?:styles\.css|app\.js)/, "production assets must use root-absolute URLs");
  assert.equal(fs.existsSync(path.join(dist, "public", "assets", "brand")), false, "assets must not be nested below dist/public");
  assert.equal(fs.existsSync(path.join(root, "index.html")), false, "legacy root index.html must not exist");

  const publicOutput = expectedCopies.map(([, output]) => fs.readFileSync(path.join(dist, output), "utf8")).join("\n");
  for (const stale of ["João Técnico", "25 min", "328 atendimentos", "IA simulada", "pagamento demonstrativo"])
    assert.equal(publicOutput.toLowerCase().includes(stale.toLowerCase()), false, `${stale} must not be published`);
});
