// Renders the share image (og.png) and app icons with Archivo.
// Run: NODE_PATH=$(npm root -g) node scripts/make-images.mjs
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
const { chromium } = createRequire(import.meta.url)("playwright");

const root = fileURLToPath(new URL("..", import.meta.url));
const css = `@font-face{font-family:Archivo;font-weight:100 900;font-stretch:62% 125%;src:url(data:font/woff2;base64,${readFileSync(`${root}src/fonts/archivo-latin-wdth-normal.woff2`).toString("base64")}) format("woff2-variations")}
*{box-sizing:border-box;margin:0}body{font-family:Archivo;-webkit-font-smoothing:antialiased}.x{font-stretch:125%}`;

const og = `<html><head><style>${css}
body{width:1200px;height:630px;background:#f5f6f4;color:#0b1310;padding:72px 80px;display:flex;justify-content:space-between;align-items:center;gap:56px}
.l{display:flex;flex-direction:column;gap:22px;max-width:560px}
.logo{font:800 40px Archivo;font-stretch:125%;letter-spacing:-.01em}.logo span{color:#0a6b3a}
h1{font:800 60px/1.05 Archivo;font-stretch:125%;letter-spacing:-.02em}h1 span{color:#0a6b3a}
p{font:500 26px/1.4 Archivo;color:#4a5550}
.card{width:440px;height:520px;border-radius:32px;background:#fff;border:2px solid #e3e7e4;padding:36px;display:flex;flex-direction:column;gap:22px}
.lab{font:600 16px Archivo;font-stretch:112%;letter-spacing:.06em;text-transform:uppercase;color:#85908b}
.score{display:flex;justify-content:space-between;align-items:center}
.t{font:600 22px Archivo}.t small{display:block;font:400 18px Archivo;color:#85908b}
.s{font:800 84px Archivo;font-stretch:125%;letter-spacing:-.02em}.s i{color:#d3d9d5;font-style:normal;font-weight:400;padding:0 8px}
.dots{display:flex;gap:10px}.dots b{width:16px;height:16px;border-radius:50%;background:#0b1310}.dots b.c{background:none;border:2px solid #4a5550}
.w{margin-top:auto;background:#0a6b3a;color:#fff;border-radius:20px;padding:22px 24px}
.w span{font:600 15px Archivo;font-stretch:112%;letter-spacing:.06em;text-transform:uppercase;opacity:.8}.w div{font:800 52px Archivo;font-stretch:125%;letter-spacing:-.02em}
</style></head><body>
<div class="l"><div class="logo">Biz<span>Ball</span></div><h1>Learn how money works. <span>One match a day.</span></h1><p>Venture capital, private equity and business finance, taught through football.</p></div>
<div class="card"><div class="lab">Matchday 1 · Act 1, The Raise</div>
<div class="score"><div class="t">Your club<small>Home</small></div><div class="s">3<i>:</i>1</div><div class="t" style="text-align:right">Rivals<small>Away</small></div></div>
<div class="dots"><b></b><b></b><b class="c"></b><b></b></div>
<div class="w"><span>Your wealth</span><div>$15.3M</div></div></div>
</body></html>`;

const icon = (size, pad) => `<html><head><style>${css}
body{width:${size}px;height:${size}px;display:grid;place-items:center;background:#0a6b3a}
.m{width:${size - pad * 2}px;height:${size - pad * 2}px;display:grid;place-items:center;color:#fff;font:900 ${Math.round((size - pad * 2) * 0.5)}px/1 Archivo;font-stretch:125%;letter-spacing:-.02em}
</style></head><body><div class="m">B</div></body></html>`;

const browser = await chromium.launch();
const shot = async (html, w, h, out) => {
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  await page.setContent(html);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: root + "public/" + out });
  await page.close();
};
await shot(og, 1200, 630, "og.png");
await shot(icon(512, 40), 512, 512, "icon-512.png");
await shot(icon(192, 15), 192, 192, "icon-192.png");
await shot(icon(180, 14), 180, 180, "apple-touch-icon.png");
await shot(icon(512, 100), 512, 512, "icon-maskable-512.png");
await browser.close();
console.log("images written to public/");
