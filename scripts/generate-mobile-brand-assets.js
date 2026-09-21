"use strict";

/**
 * Deterministic, dependency-free raster generation for native stores/builds.
 * The geometry and palette are read and verified against the official SVG mark;
 * generation stops if that source no longer contains the expected official art.
 * Generated PNG files are intentionally ignored by Git.
 */
const fs = require("node:fs");
const path = require("node:path");
const zlib = require("node:zlib");
const root = path.resolve(__dirname, "..");
const sourcePath = path.join(root, "public/assets/brand/reforma-profissional-mark.svg");
const source = fs.readFileSync(sourcePath, "utf8");
const requiredSourceFragments = [
  'viewBox="0 0 192 192"', "M29 84 96 30l67 54", "M25 85 96 27l71 58",
  "m65 143 54-54", "#0759bd", "#f5ae00"
];
for (const fragment of requiredSourceFragments) {
  if (!source.includes(fragment)) throw new Error(`Official brand SVG changed; update renderer for: ${fragment}`);
}

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const name = Buffer.from(type), length = Buffer.alloc(4), checksum = Buffer.alloc(4);
  length.writeUInt32BE(data.length); checksum.writeUInt32BE(crc32(Buffer.concat([name, data])));
  return Buffer.concat([length, name, data, checksum]);
}
function raster(width, height, markScale = 0.72) {
  const pixels = Buffer.alloc(width * height * 4, 255);
  const side = Math.min(width, height) * markScale, scale = side / 192;
  const offsetX = (width - side) / 2, offsetY = (height - side) / 2;
  const blue = [7, 89, 189, 255], gold = [245, 174, 0, 255], white = [255, 255, 255, 255];
  const point = ([x, y]) => [offsetX + x * scale, offsetY + y * scale];
  const set = (x, y, color) => {
    x = Math.round(x); y = Math.round(y);
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    pixels.set(color, (y * width + x) * 4);
  };
  const line = (from, to, color, radius) => {
    const [x0, y0] = point(from), [x1, y1] = point(to), steps = Math.ceil(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)));
    const r = Math.max(1, Math.round(radius * scale));
    for (let step = 0; step <= steps; step += 1) {
      const x = x0 + (x1 - x0) * step / steps, y = y0 + (y1 - y0) * step / steps;
      for (let dx = -r; dx <= r; dx += 1) for (let dy = -r; dy <= r; dy += 1) if (dx * dx + dy * dy <= r * r) set(x + dx, y + dy, color);
    }
  };
  const polygon = (sourcePoints, color) => {
    const points = sourcePoints.map(point), minY = Math.floor(Math.min(...points.map(p => p[1]))), maxY = Math.ceil(Math.max(...points.map(p => p[1])));
    for (let y = minY; y <= maxY; y += 1) {
      const intersections = [];
      for (let current = 0, previous = points.length - 1; current < points.length; previous = current, current += 1) {
        const a = points[current], b = points[previous];
        if ((a[1] > y) !== (b[1] > y)) intersections.push((b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0]);
      }
      intersections.sort((a, b) => a - b);
      for (let i = 0; i < intersections.length; i += 2) for (let x = Math.ceil(intersections[i]); x <= Math.floor(intersections[i + 1]); x += 1) set(x, y, color);
    }
  };
  const circle = (center, radius, color) => {
    const [cx, cy] = point(center), r = Math.max(1, Math.round(radius * scale));
    for (let y = -r; y <= r; y += 1) for (let x = -r; x <= r; x += 1) if (x * x + y * y <= r * r) set(cx + x, cy + y, color);
  };
  polygon([[29,84],[96,30],[163,84],[163,154],[151,166],[41,166],[29,154]], white);
  line([29,84],[96,30],blue,7); line([96,30],[163,84],blue,7);
  line([29,84],[29,154],blue,7); line([29,154],[41,166],blue,7);
  line([41,166],[151,166],blue,7); line([151,166],[163,154],blue,7); line([163,154],[163,84],blue,7);
  line([25,85],[96,27],gold,7); line([96,27],[167,85],gold,7);
  line([65,143],[119,89],blue,7.5);
  polygon([[111,76],[105,88],[105,101],[120,116],[133,116],[145,110],[128,102],[119,93]],blue);
  circle([65,143],12,gold); circle([65,143],5,white);
  circle([145,54],6,blue); circle([160,65],5,blue); circle([169,80],4,blue);
  const rows = [];
  for (let y = 0; y < height; y += 1) rows.push(Buffer.concat([Buffer.from([0]), pixels.subarray(y * width * 4, (y + 1) * width * 4)]));
  const header = Buffer.alloc(13); header.writeUInt32BE(width, 0); header.writeUInt32BE(height, 4); header[8] = 8; header[9] = 6;
  return Buffer.concat([Buffer.from("89504e470d0a1a0a", "hex"), chunk("IHDR", header), chunk("IDAT", zlib.deflateSync(Buffer.concat(rows), { level: 9 })), chunk("IEND", Buffer.alloc(0))]);
}

const targets = [];
for (const [density, size] of Object.entries({ mdpi:48, hdpi:72, xhdpi:96, xxhdpi:144, xxxhdpi:192 })) {
  for (const name of ["ic_launcher.png", "ic_launcher_foreground.png", "ic_launcher_round.png"]) targets.push([`android/app/src/main/res/mipmap-${density}/${name}`, size, size, 0.78]);
}
const splashSizes = { mdpi:[480,320], hdpi:[800,480], xhdpi:[1280,720], xxhdpi:[1600,960], xxxhdpi:[1920,1280] };
for (const [density, [width, height]] of Object.entries(splashSizes)) {
  targets.push([`android/app/src/main/res/drawable-land-${density}/splash.png`, width, height, 0.55]);
  targets.push([`android/app/src/main/res/drawable-port-${density}/splash.png`, height, width, 0.55]);
}
targets.push(
  ["android/app/src/main/res/drawable/splash.png", 480, 480, 0.55],
  ["public/assets/brand/reforma-profissional-store-512.png", 512, 512, 0.78],
  ["ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png", 1024, 1024, 0.78],
  ["ios/App/App/Assets.xcassets/Splash.imageset/splash-2732x2732.png", 2732, 2732, 0.42],
  ["ios/App/App/Assets.xcassets/Splash.imageset/splash-2732x2732-1.png", 2732, 2732, 0.42],
  ["ios/App/App/Assets.xcassets/Splash.imageset/splash-2732x2732-2.png", 2732, 2732, 0.42]
);
const cache = new Map();
for (const [relativePath, width, height, scale] of targets) {
  const key = `${width}x${height}@${scale}`;
  if (!cache.has(key)) cache.set(key, raster(width, height, scale));
  const output = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, cache.get(key));
}
console.log(`Generated ${targets.length} mobile brand assets from ${path.relative(root, sourcePath)}.`);
