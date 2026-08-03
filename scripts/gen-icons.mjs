#!/usr/bin/env node
/**
 * The Investment Casebook — app icons (PWA + favicon + Apple touch), generated
 * with zero dependencies: the gold "IC" bookplate seal (navy field, gold disc,
 * navy serifed monogram) on the app's near-black navy, drawn with supersampled
 * coverage and encoded to PNG by hand. Matches the in-app seal and the Funds
 * zone icons.
 *
 * Run:  npm run gen-icons   (output → public/)
 */
import zlib from "node:zlib";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "public");
const TARGETS = [
  ["icon-512.png", 512],
  ["icon-192.png", 192],
  ["icon-maskable-512.png", 512],
  ["apple-touch-icon.png", 180],
  ["favicon-64.png", 64],
];

const NAVY = [11, 16, 28];
const GOLD = [189, 161, 107];

// ── PNG encoder (RGBA, single IDAT) ──────────────────────────────────────────
const CRC = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; }
  return t;
})();
function crc32(buf) { let c = 0xffffffff; for (let i = 0; i < buf.length; i++) c = CRC[(c ^ buf[i]) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; }
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length, 0);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}
function encodePng(w, h, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 6;
  const raw = Buffer.alloc((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) { raw[y * (w * 4 + 1)] = 0; rgba.copy(raw, y * (w * 4 + 1) + 1, y * w * 4, (y + 1) * w * 4); }
  const idat = zlib.deflateSync(raw, { level: 9 });
  return Buffer.concat([sig, chunk("IHDR", ihdr), chunk("IDAT", idat), chunk("IEND", Buffer.alloc(0))]);
}

// ── The "IC" seal ────────────────────────────────────────────────────────────
function render(N) {
  const rgba = Buffer.alloc(N * N * 4);
  const c = N / 2;
  const SS = 4;
  const discR = 0.46 * N;

  const H = 0.40 * N;              // cap height
  const stemHalf = 0.030 * N;
  const serifHalfW = 0.062 * N;
  const serifT = 0.030 * N;        // serif half-thickness
  const rC = 0.20 * N;             // C outer radius
  const tC = 0.066 * N;            // C ring thickness
  const gap = 0.055 * N;
  const groupW = 2 * serifHalfW + gap + 2 * rC;
  const leftX = c - groupW / 2;
  const Ix = leftX + serifHalfW;
  const Cx = leftX + 2 * serifHalfW + gap + rC;

  const inI = (x, y) => {
    const dy = Math.abs(y - c);
    if (Math.abs(x - Ix) <= stemHalf && dy <= H / 2) return true;
    if (Math.abs(x - Ix) <= serifHalfW && Math.abs(dy - H / 2) <= serifT) return true;
    return false;
  };
  const inC = (x, y) => {
    const d = Math.hypot(x - Cx, y - c);
    if (d < rC - tC || d > rC) return false;
    const ang = Math.abs(Math.atan2(y - c, x - Cx) * 180 / Math.PI);
    return ang > 38; // opening to the right
  };

  for (let py = 0; py < N; py++) {
    for (let px = 0; px < N; px++) {
      let discCov = 0, inkCov = 0;
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const x = px + (sx + 0.5) / SS;
          const y = py + (sy + 0.5) / SS;
          if (Math.hypot(x - c, y - c) <= discR) discCov++;
          if (inI(x, y) || inC(x, y)) inkCov++;
        }
      }
      const disc = discCov / (SS * SS);
      const ink = inkCov / (SS * SS);
      const r0 = NAVY[0] + (GOLD[0] - NAVY[0]) * disc;
      const g0 = NAVY[1] + (GOLD[1] - NAVY[1]) * disc;
      const b0 = NAVY[2] + (GOLD[2] - NAVY[2]) * disc;
      const i = (py * N + px) * 4;
      rgba[i] = Math.round(r0 + (NAVY[0] - r0) * ink);
      rgba[i + 1] = Math.round(g0 + (NAVY[1] - g0) * ink);
      rgba[i + 2] = Math.round(b0 + (NAVY[2] - b0) * ink);
      rgba[i + 3] = 255;
    }
  }
  return encodePng(N, N, rgba);
}

mkdirSync(OUT, { recursive: true });
for (const [name, size] of TARGETS) {
  writeFileSync(join(OUT, name), render(size));
  console.log(`  ✓ public/${name} (${size}×${size})`);
}
console.log("Icons generated.");
