import { score, outcome } from "./results";

export function shareText(opts: { day: number; topic: string; goals: boolean[]; site: string }): string {
  const { us, them } = score(opts.goals);
  const verb = { win: "Won", draw: "Drew", loss: "Lost" }[outcome(opts.goals)];
  const balls = opts.goals.map((g) => (g ? "⚽" : "❌")).join("");
  const site = opts.site.replace(/^https?:\/\//, "").replace(/\/$/, "");
  return `Matchday Ledger #${opts.day} - ${opts.topic}\n${balls} ${verb} ${us}-${them}\n${site}`;
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
