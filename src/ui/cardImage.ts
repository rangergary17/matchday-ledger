/** Draws the Chairman card as a PNG for sharing. Uses the game's own fonts. */
import type { SkillRating } from "../lib/skills";

export async function cardPng(opts: { name: string; club: string; overall: number; tier: string; skills: SkillRating[]; site: string }): Promise<Blob | null> {
  try {
    await document.fonts.ready;
    const W = 1080, H = 1350;
    const c = document.createElement("canvas");
    c.width = W; c.height = H;
    const g = c.getContext("2d")!;
    const F = (w: number, px: number) => `${w} ${px}px Archivo, -apple-system, system-ui, sans-serif`;
    const wide = (on: boolean) => { try { (g as unknown as { fontStretch: string }).fontStretch = on ? "expanded" : "normal"; } catch { /* older browsers */ } };
    g.fillStyle = "#f5f6f4"; g.fillRect(0, 0, W, H);
    wide(true); g.fillStyle = "#0b1310"; g.font = F(800, 56); g.fillText("Biz", 90, 150);
    const bw = g.measureText("Biz").width;
    g.fillStyle = "#0a6b3a"; g.fillText("Ball", 90 + bw, 150);
    const x = 90, y = 260, w = 900, h = 568;
    g.fillStyle = "#0b3a22";
    g.beginPath(); g.roundRect(x, y, w, h, 48); g.fill();
    g.strokeStyle = "rgba(255,255,255,0.12)"; g.lineWidth = 3;
    g.beginPath(); g.arc(x + w - 60, y + 60, 230, 0, Math.PI * 2); g.stroke();
    g.fillStyle = "#ffffff"; g.font = F(800, 150); g.fillText(String(opts.overall), x + 60, y + 190);
    g.font = F(700, 28); g.globalAlpha = 0.75; g.fillText(opts.tier.toUpperCase(), x + 66, y + 240); g.globalAlpha = 1;
    wide(false); g.font = F(600, 52); g.fillText(opts.name || "The Chairman", x + 60, y + 380);
    g.font = F(500, 30); g.globalAlpha = 0.7; g.fillText(opts.club, x + 60, y + 425); g.globalAlpha = 1;
    g.fillStyle = "rgba(255,255,255,0.2)"; g.fillRect(x + 60, y + 455, w - 120, 2);
    opts.skills.forEach((s, i) => {
      const sx = x + 60 + i * ((w - 120) / 6);
      wide(true); g.fillStyle = "#ffffff"; g.font = F(800, 44); g.fillText(String(s.rating), sx, y + 520); wide(false);
      g.globalAlpha = 0.65; g.font = F(600, 22); g.fillText(s.key, sx, y + 552); g.globalAlpha = 1;
    });
    g.fillStyle = "#4a5550"; g.font = F(500, 34);
    g.fillText("Learn venture capital and private equity,", 90, 980);
    g.fillText("one football match a day.", 90, 1028);
    g.fillStyle = "#0b1310"; g.font = F(700, 34); g.fillText(opts.site.replace(/^https?:\/\//, ""), 90, 1200);
    return await new Promise((res) => c.toBlob((b) => res(b), "image/png"));
  } catch {
    return null;
  }
}
