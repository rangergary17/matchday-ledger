// Renders the share image (og.png) and app icons with the game's own fonts.
// Run: node scripts/make-images.mjs   (uses the pre-installed Playwright Chromium)
import { createRequire } from "node:module";
const { chromium } = createRequire(import.meta.url)("playwright");
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const font = (f) => `data:font/woff2;base64,${readFileSync(root + "src/fonts/" + f).toString("base64")}`;
const css = `
@font-face{font-family:BSD;font-weight:900;src:url(${font("big-shoulders-display-latin-900-normal.woff2")})}
@font-face{font-family:BSD;font-weight:800;src:url(${font("big-shoulders-display-latin-800-normal.woff2")})}
@font-face{font-family:BC;font-weight:600;src:url(${font("barlow-condensed-latin-600-normal.woff2")})}
@font-face{font-family:B;font-weight:500;src:url(${font("barlow-latin-500-normal.woff2")})}
*{box-sizing:border-box;margin:0}
body{background:#0d261a;color:#eef2e8;
 background:radial-gradient(ellipse 120% 60% at 50% -10%,rgba(244,194,77,.16),transparent 60%),repeating-linear-gradient(90deg,#0d261a 0 100px,#12321f 100px 200px)}
`;

const og = `<html><head><style>${css}
body{width:1200px;height:630px;padding:64px 72px;display:flex;flex-direction:column;justify-content:space-between;position:relative;overflow:hidden}
.ring{position:absolute;width:420px;height:420px;border:4px solid rgba(238,242,232,.14);border-radius:50%;right:-160px;top:105px}
.half{position:absolute;left:0;right:0;top:315px;border-top:4px solid rgba(238,242,232,.08)}
.eyebrow{font:600 28px BC;letter-spacing:.16em;text-transform:uppercase;color:#b4c4b4}
h1{font:900 112px/0.95 BSD;text-transform:uppercase;letter-spacing:.01em}
.board{display:flex;align-items:center;gap:36px;background:#071810;border:2px solid rgba(238,242,232,.18);border-radius:10px;padding:22px 34px;width:max-content;box-shadow:0 0 0 6px rgba(0,0,0,.25)}
.team{font:800 38px BSD;text-transform:uppercase;line-height:1}
.team small{display:block;font:600 20px BC;letter-spacing:.14em;color:#b4c4b4;margin-top:6px}
.score{font:900 92px BSD;color:#f4c24d;text-shadow:0 0 30px rgba(244,194,77,.4)}
.tag{font:500 32px B;color:#eef2e8;max-width:900px}
</style></head><body><div class="ring"></div><div class="half"></div>
<div><p class="eyebrow">Free daily game · 3 minutes</p><h1>Matchday<br>Ledger</h1></div>
<div class="board"><div class="team">Your club<small>Chairman</small></div><div class="score">3-0</div><div class="team">Business<br>Finance<small>Away</small></div></div>
<p class="tag">One match a day. Right answers are goals. Learn the numbers that run a business.</p>
</body></html>`;

const icon = (size, pad) => `<html><head><style>${css}
body{width:${size}px;height:${size}px;display:grid;place-items:center;background:#071810}
.inner{width:${size - pad * 2}px;height:${size - pad * 2}px;border:${Math.round(size / 64)}px solid rgba(238,242,232,.22);border-radius:${Math.round(size / 8)}px;display:grid;place-items:center;align-content:center;gap:${Math.round(size / 40)}px}
.s{font:900 ${Math.round((size - pad * 2) * 0.42)}px/0.9 BSD;color:#f4c24d;text-shadow:0 0 ${size / 20}px rgba(244,194,77,.4)}
.l{font:600 ${Math.round((size - pad * 2) * 0.1)}px BC;letter-spacing:.14em;color:#eef2e8;text-transform:uppercase}
</style></head><body><div class="inner"><div class="s">3-0</div><div class="l">Ledger</div></div></body></html>`;

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
