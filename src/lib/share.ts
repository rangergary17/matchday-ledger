import { score, outcome } from "./save";

export interface ShareInput {
  day: number;
  topic: string;
  goals: boolean[];
  pen: boolean;
  site: string;
  rating?: number;
  position?: string;
}

/** Spoiler-free result: no answers, just how it went. */
export function shareText(o: ShareInput): string {
  const { us, them } = score(o.goals, o.pen);
  const verb = { win: "Won", draw: "Drew", loss: "Lost" }[outcome(o.goals, o.pen)];
  const balls = o.goals.map((g) => (g ? "⚽" : "❌")).join("");
  const site = o.site.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const extra = [o.rating ? `Rating ${o.rating}` : "", o.position ? `${o.position} in the league` : ""].filter(Boolean).join(" · ");
  return [`BizBall #${o.day} - ${o.topic}`, `${balls} pen ${o.pen ? "⚽" : "❌"} ${verb} ${us}-${them}`, extra, site].filter(Boolean).join("\n");
}

/** Copies text. Uses the Clipboard API, falls back to a hidden textarea for older browsers. */
export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through */
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}
