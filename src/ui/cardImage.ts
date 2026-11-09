/** Draws the Chairman card as a PNG for sharing. Uses the game's own fonts. */
import type { SkillRating } from "../lib/skills";

const TIERS = {
  gold: { a: "#f4c24d", b: "#a77b16", ink: "#1b1404" },
  silver: { a: "#e3e8e3", b: "#8e9a90", ink: "#101a14" },
  bronze: { a: "#d9925a", b: "#7d4a24", ink: "#1a0f06" },
};

export async function cardPng(opts: { name: string; club: string; overall: number; tier: keyof typeof TIERS; skills: SkillRating[]; site: string }): Promise<Blob | null> {
  try {
    await document.fonts.ready;
    const W = 1080, H = 1350;
    const c = document.createElement("canvas");
    c.width = W; c.height = H;
    const g = c.getContext("2d")!;
    g.fillStyle = "#0d261a"; g.fillRect(0, 0, W, H);
    for (let x = 0; x < W; x += 180) { g.fillStyle = "#12321f"; g.fillRect(x + 90, 0, 90, H); }
    const t = TIERS[opts.tier];
    const cx = 140, cy = 120, cw = 800, ch = 1000;
    const grad = g.createLinearGradient(cx, cy, cx + cw, cy + ch);
    grad.addColorStop(0, t.a); grad.addColorStop(1, t.b);
    g.fillStyle = grad;
    g.beginPath(); g.roundRect(cx, cy, cw, ch, 48); g.fill();
    g.fillStyle = t.ink;
    g.font = "900 220px 'Big Shoulders Display', Impact, sans-serif";
    g.fillText(String(opts.overall), cx + 70, cy + 250);
    g.font = "600 44px 'Barlow Condensed', sans-serif";
    g.fillText("CHAIRMAN", cx + 78, cy + 310);
    g.font = "900 96px 'Big Shoulders Display', Impact, sans-serif";
    g.fillText((opts.name || "The Chairman").toUpperCase().slice(0, 16), cx + 70, cy + 470);
    g.font = "600 40px 'Barlow Condensed', sans-serif";
    g.fillText(opts.club.toUpperCase(), cx + 74, cy + 525);
    g.fillRect(cx + 70, cy + 570, cw - 140, 4);
    opts.skills.forEach((s, i) => {
      const col = i % 2, row = Math.floor(i / 2);
      const x = cx + 90 + col * 340, y = cy + 680 + row * 110;
      g.font = "900 80px 'Big Shoulders Display', Impact, sans-serif";
      g.fillText(String(s.rating), x, y);
      g.font = "600 44px 'Barlow Condensed', sans-serif";
      g.fillText(s.key, x + 120, y - 6);
    });
    g.fillStyle = "#eef2e8";
    g.font = "600 40px 'Barlow Condensed', sans-serif";
    g.fillText("BIZBALL · " + opts.site.replace(/^https?:\/\//, "").toUpperCase(), 140, 1230);
    return await new Promise((res) => c.toBlob((b) => res(b), "image/png"));
  } catch {
    return null;
  }
}
