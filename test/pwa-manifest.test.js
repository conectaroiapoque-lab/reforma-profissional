const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "..");
const manifest = JSON.parse(fs.readFileSync(path.join(root, "manifest.webmanifest"), "utf8"));

test("manifest declares installable any and maskable icons", () => {
  assert.ok(manifest.icons.length >= 3);
  assert.ok(manifest.icons.some(icon => icon.src.includes("icon-192") && icon.purpose === "any"));
  assert.ok(manifest.icons.some(icon => icon.src.includes("icon-512") && icon.purpose === "any"));
  assert.ok(manifest.icons.some(icon => icon.src.includes("maskable") && icon.purpose === "maskable"));
});

test("all manifest icons are textual SVG files with valid metadata", () => {
  for (const icon of manifest.icons) {
    assert.equal(icon.type, "image/svg+xml");
    assert.equal(icon.sizes, "any");

    const iconPath = path.join(root, icon.src.replace(/^\.\//, ""));
    const source = fs.readFileSync(iconPath, "utf8");
    assert.match(source, /^<svg[^>]+viewBox="0 0 \d+ \d+"/);
    assert.doesNotMatch(source, /data:image\//);
  }
});

test("service worker caches every manifest icon", () => {
  const serviceWorker = fs.readFileSync(path.join(root, "sw.js"), "utf8");
  for (const icon of manifest.icons) {
    assert.ok(serviceWorker.includes(icon.src), `${icon.src} is absent from the app shell`);
  }
});
