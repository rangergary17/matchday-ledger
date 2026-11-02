/**
 * Templated questions (penalties and training drills). Every number a
 * player sees is computed from the variables, so the maths is right by
 * construction, and drills can draw fresh numbers each time.
 */
import { evaluate } from "./calc";

export type Fmt = "usd" | "int" | "pct" | "num";

export interface TemplateVar {
  value: number;
  min: number;
  max: number;
  step: number;
  fmt: Fmt;
}

export interface Trap {
  formula: string;
  why: string;
}

export interface Penalty {
  vars: Record<string, TemplateVar>;
  /** Conditions random draws must meet, e.g. "price - cost >= 8", or "whole: fans * churn" for a whole number. */
  where?: string[];
  prompt: string;
  answer: string;
  fmt: Fmt;
  /** Random draws must give an answer that is a multiple of this (napkin numbers). */
  whole: number;
  /** Accepted distance from the answer, in the units the player types (default 0.5). */
  tol?: number;
  hint: string;
  working: string[];
  traps: Trap[];
}

export type Values = Record<string, number>;

export function format(v: number, fmt: Fmt): string {
  const r = (x: number, d: number) => Math.round(x * 10 ** d) / 10 ** d;
  const num = (x: number, d = 2) => r(x, d).toLocaleString("en-US", { maximumFractionDigits: d });
  const sign = v < 0 ? "-" : "";
  const a = Math.abs(v);
  switch (fmt) {
    case "usd":
      // Millions only when that's exact, so displayed sums always add up.
      if (a >= 1e6 && Math.abs(r(a / 1e6, 2) * 1e6 - a) < 1e-6) return `${sign}$${num(a / 1e6, 2)}M`;
      return `${sign}$${num(a, 2)}`;
    case "int":
      return `${sign}${num(a, 2)}`;
    case "pct":
      return `${sign}${num(a * 100, 1)}%`;
    case "num":
      return `${sign}${num(a, 2)}`;
  }
}

/** Value in the units a player types: dollars, a count, or percent points for "pct". */
export function inputUnits(v: number, fmt: Fmt): number {
  return fmt === "pct" ? v * 100 : v;
}

/** Reads what a player typed: "$1,200", "1.2m", "500k", "64%", "-3". */
export function parseInput(text: string): number | null {
  const t = text.trim().toLowerCase().replace(/[$,\s%]/g, "");
  const m = /^(-?\d*\.?\d+)([km]?)$/.exec(t);
  if (!m) return null;
  const n = parseFloat(m[1]);
  return m[2] === "k" ? n * 1e3 : m[2] === "m" ? n * 1e6 : n;
}

export function render(text: string, vars: Record<string, TemplateVar>, values: Values): string {
  return text.replace(/\{([^}|]+)(?:\|(\w+))?\}/g, (_, expr: string, fmt?: string) => {
    const e = expr.trim();
    const f = (fmt as Fmt | undefined) ?? vars[e]?.fmt;
    if (!f) throw new Error(`Placeholder {${e}} needs a format, like {${e}|usd}`);
    return format(evaluate(e, values), f);
  });
}

export function baseValues(p: Penalty): Values {
  return Object.fromEntries(Object.entries(p.vars).map(([k, v]) => [k, v.value]));
}

const near = (a: number, b: number, tol: number) => Math.abs(a - b) <= tol + 1e-9;

export function tolerance(p: Penalty): number {
  return p.tol ?? 0.5;
}

/** Checks a draw: constraints met, answer is a clean number, no trap gives the same answer. */
export function validDraw(p: Penalty, values: Values): boolean {
  for (const w of p.where ?? []) {
    if (w.startsWith("whole:")) {
      const x = evaluate(w.slice(6), values);
      if (Math.abs(x - Math.round(x)) > 1e-6) return false;
      continue;
    }
    const m = /^(.*?)(>=|<=|>|<|!=)(.*)$/.exec(w);
    if (!m) throw new Error(`Bad condition "${w}"`);
    const l = evaluate(m[1], values), r = evaluate(m[3], values);
    const ok = { ">=": l >= r, "<=": l <= r, ">": l > r, "<": l < r, "!=": l !== r }[m[2]]!;
    if (!ok) return false;
  }
  const ans = evaluate(p.answer, values);
  if (!Number.isFinite(ans) || ans <= 0) return false;
  const ratio = ans / p.whole;
  if (Math.abs(ratio - Math.round(ratio)) > 1e-6) return false;
  const tol = tolerance(p);
  const seen = [inputUnits(ans, p.fmt)];
  for (const t of p.traps) {
    const v = inputUnits(evaluate(t.formula, values), p.fmt);
    if (seen.some((x) => near(v, x, tol * 2))) return false;
    seen.push(v);
  }
  return true;
}

/** Small seeded random number generator so a drill is stable for the day. */
export function rng(seed: string): () => number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  return () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Fresh numbers for a drill. Falls back to the base numbers if no clean draw turns up. */
export function draw(p: Penalty, seed: string): Values {
  const rand = rng(seed);
  for (let i = 0; i < 300; i++) {
    const values: Values = {};
    for (const [k, v] of Object.entries(p.vars)) {
      const steps = Math.floor((v.max - v.min) / v.step);
      values[k] = Math.round((v.min + Math.floor(rand() * (steps + 1)) * v.step) * 1e6) / 1e6;
    }
    if (validDraw(p, values)) return values;
  }
  return baseValues(p);
}

export interface Judged {
  correct: boolean;
  answer: number;
  trap: Trap | null;
}

export function judge(p: Penalty, values: Values, typed: number): Judged {
  const ans = evaluate(p.answer, values);
  const tol = tolerance(p);
  if (near(typed, inputUnits(ans, p.fmt), tol)) return { correct: true, answer: ans, trap: null };
  const trap = p.traps.find((t) => near(typed, inputUnits(evaluate(t.formula, values), p.fmt), tol)) ?? null;
  return { correct: false, answer: ans, trap };
}

export interface RenderedPenalty {
  prompt: string;
  hint: string;
  working: string[];
  answerText: string;
  traps: { why: string }[];
}

export function renderPenalty(p: Penalty, values: Values): RenderedPenalty {
  return {
    prompt: render(p.prompt, p.vars, values),
    hint: render(p.hint, p.vars, values),
    working: p.working.map((w) => render(w, p.vars, values)),
    answerText: format(evaluate(p.answer, values), p.fmt),
    traps: p.traps.map((t) => ({ why: render(t.why, p.vars, values) })),
  };
}
