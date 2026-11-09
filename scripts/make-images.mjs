// Renders the share image (og.png) and app icons with Inter.
// Run: NODE_PATH=$(npm root -g) node scripts/make-images.mjs
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
const { chromium } = createRequire(import.meta.url)("playwright");

const root = fileURLToPath(new URL("..", import.meta.url));
const font = (w) => `@font-face{font-family:Inter;font-weight:${w};src:url(data:font/woff2;base64,${readFileSync(`${root}src/fonts/inter-latin-${w}-normal.woff2`).toString("base64")})}`;
const css = [400, 500, 600, 700].map(font).join("") + `*{box-sizing:border-box;margin:0}body{font-family:Inter;-webkit-font-smoothing:antialiased}`;

const og = `<html><head><style>${css}
body{width:1200px;height:630px;background:#f5f6f4;color:#0b1310;padding:72px 80px;display:flex;justify-content:space-between;align-items:center;gap:56px}
.l{display:flex;flex-direction:column;gap:22px;max-width:560px}
.logo{font:700 44px Inter;letter-spacing:-.03em}.logo span{color:#0a7a3e}
h1{font:700 64px/1.05 Inter;letter-spacing:-.04em}h1 span{color:#0a7a3e}
p{font:500 26px/1.4 Inter;color:#4a5550}
.card{width:440px;height:520px;border-radius:32px;background:#fff;border:2px solid #e3e7e4;padding:36px;display:flex;flex-direction:column;gap:22px}
.lab{font:600 20px Inter;color:#85908b}
.score{display:flex;justify-content:space-between;align-items:center}
.t{font:600 22px Inter}.t small{display:block;font:400 18px Inter;color:#85908b}
.s{font:700 84px Inter;letter-spacing:-.04em}.s i{color:#d3d9d5;font-style:normal;font-weight:400;padding:0 8px}
.dots{display:flex;gap:10px}.dots b{width:16px;height:16px;border-radius:50%;background:#0a7a3e}.dots b.c{background:#c4372c}
.w{margin-top:auto;background:#0a7a3e;color:#fff;border-radius:20px;padding:22px 24px}
.w span{font:600 18px Inter;opacity:.8}.w div{font:700 52px Inter;letter-spacing:-.04em}
</style></head><body>
<div class="l"><div class="logo">Biz<span>Ball</span></div><h1>Learn how money works. <span>One match a day.</span></h1><p>Venture capital, private equity and business finance, taught through football.</p></div>
<div class="card"><div class="lab">Matchday 1 · Act 1, The Raise</div>
<div class="score"><div class="t">Your club<small>Home</small></div><div class="s">3<i>:</i>1</div><div class="t" style="text-align:right">Rivals<small>Away</small></div></div>
<div class="dots"><b></b><b></b><b class="c"></b><b></b></div>
<div class="w"><span>Your wealth</span><div>$15.3M</div></div></div>
</body></html>`;

const icon = (size, pad) => `<html><head><style>${css}
body{width:${size}px;height:${size}px;display:grid;place-items:center;background:#0a7a3e}
.m{width:${size - pad * 2}px;height:${size - pad * 2}px;display:grid;place-items:center;color:#fff;font:700 ${Math.round((size - pad * 2) * 0.5)}px/1 Inter;letter-spacing:-.06em}
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
