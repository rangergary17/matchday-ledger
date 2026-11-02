import { DISPLAY_NUMBER, evaluate, parseDisplay, roundedUnit } from "../../src/lib/calc";

/**
 * Finds every written calculation in a piece of text, like
 * "$30 - $12 = $18" or "(9 x $1.2M) + (3 x $0.3M) = $10.8M + $0.9M = $11.7M",
 * and checks that every side of each "=" agrees.
 *
 * Writing rules this enforces:
 *  - multiply is " x ", divide is " / ", plus/minus have spaces around them
 *  - a rounded result must say "about" ("= about 64%")
 */

type Tok =
  | { t: "num"; text: string; value: number; unit: number }
  | { t: "op"; v: "+" | "-" | "*" | "/" | "(" | ")" }
  | { t: "eq" }
  | { t: "about" }
  | { t: "break" };

function tokenize(text: string): Tok[] {
  const out: Tok[] = [];
  const num = new RegExp(DISPLAY_NUMBER.source, "y");
  let i = 0;
  const prev = () => out[out.length - 1];
  while (i < text.length) {
    const ch = text[i];
    if (ch === " " || ch === "\n" || ch === "\t") { i++; continue; }
    // Signed numbers only where a value can start, so "a - b" stays a subtraction.
    const canStartValue = !prev() || prev()!.t !== "num";
    num.lastIndex = i;
    const m = num.exec(text);
    if (m && (canStartValue || !/^[-+]/.test(m[0])) && !/[A-Za-z0-9]/.test(text[i - 1] ?? " ")) {
      const after = text[num.lastIndex] ?? " ";
      if (!/[A-Za-z0-9]/.test(after) || /[KMB%]$/.test(m[0])) {
        const p = parseDisplay(m[0])!;
        out.push({ t: "num", text: m[0], value: p.value, unit: p.unit });
        i = num.lastIndex;
        continue;
      }
    }
    if ((ch === "x" || ch === "+" || ch === "-" || ch === "/") && text[i - 1] === " " && text[i + 1] === " ") {
      out.push({ t: "op", v: ch === "x" ? "*" : (ch as "+" | "-" | "/") });
      i++;
      continue;
    }
    if (ch === "(" || ch === ")") { out.push({ t: "op", v: ch }); i++; continue; }
    if (ch === "=") { out.push({ t: "eq" }); i++; continue; }
    const word = /^[A-Za-z]+/.exec(text.slice(i));
    if (word && word[0].toLowerCase() === "about") { out.push({ t: "about" }); i += 5; continue; }
    out.push({ t: "break" });
    i += word ? word[0].length : 1;
  }
  return out;
}

export interface EquationIssue {
  text: string;
  problem: string;
}

export interface EquationReport {
  issues: EquationIssue[];
  /** Values proven by a checked equation. */
  results: number[];
  /** Every number written in the text. */
  numbers: { text: string; value: number }[];
}

function segmentValue(seg: Tok[]): { value: number; about: boolean; unit: number | null } {
  let about = false;
  let s = seg;
  if (s[0]?.t === "about") { about = true; s = s.slice(1); }
  if (s.some((t) => t.t === "about")) throw new Error(`"about" in the middle of a calculation`);
  if (s.length === 0) throw new Error("empty side of =");
  const formula = s
    .map((t) => (t.t === "num" ? `(${t.value})` : t.t === "op" ? t.v : ""))
    .join(" ");
  const value = evaluate(formula);
  const unit = s.length === 1 && s[0].t === "num" ? (about ? roundedUnit(s[0].text) : s[0].unit) : null;
  return { value, about, unit };
}

export function checkWorking(text: string): EquationReport {
  const toks = tokenize(text);
  const issues: EquationIssue[] = [];
  const results: number[] = [];
  const numbers = toks.filter((t): t is Extract<Tok, { t: "num" }> => t.t === "num").map((t) => ({ text: t.text, value: t.value }));

  // Split into runs of maths separated by words / punctuation.
  const runs: Tok[][] = [];
  let cur: Tok[] = [];
  for (const t of toks) {
    if (t.t === "break") { if (cur.length) runs.push(cur); cur = []; }
    else cur.push(t);
  }
  if (cur.length) runs.push(cur);

  for (const run of runs) {
    if (!run.some((t) => t.t === "eq")) continue;
    const segs: Tok[][] = [[]];
    for (const t of run) {
      if (t.t === "eq") segs.push([]);
      else segs[segs.length - 1].push(t);
    }
    // A trailing "about" belongs to the next segment already; leading "about" with no "=" is ignored.
    const shown = run
      .map((t) => (t.t === "num" ? t.text : t.t === "op" ? (t.v === "*" ? "x" : t.v) : t.t === "eq" ? "=" : t.t === "about" ? "about" : ""))
      .join(" ");
    try {
      const vals = segs.map(segmentValue);
      const base = vals[0];
      if (base.about) throw new Error(`"about" on the left of =`);
      for (const v of vals.slice(1)) {
        const tol = v.about
          ? (v.unit ?? Math.abs(base.value) * 0.05) * 0.5 + 1e-9
          : Math.max(Math.abs(base.value) * 1e-9, 1e-9);
        if (Math.abs(v.value - base.value) > tol) {
          throw new Error(
            v.about
              ? `left side is ${base.value}, which does not round to the right side`
              : `left side is ${base.value} but right side is ${v.value} (add "about" if it is rounded)`,
          );
        }
      }
      for (const v of vals) results.push(v.value);
    } catch (e) {
      issues.push({ text: shown, problem: (e as Error).message });
    }
  }
  return { issues, results, numbers };
}

/** All numbers written in a piece of text. */
export function numbersIn(text: string): number[] {
  return checkWorking(text).numbers.map((n) => n.value);
}
