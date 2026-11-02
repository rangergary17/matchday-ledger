/**
 * Tiny, safe arithmetic evaluator (no eval). Supports numbers, variables,
 * + - * / and brackets. Used by the answer-checking tests and, later,
 * by practice mode.
 */
type Tok = { t: "num"; v: number } | { t: "id"; v: string } | { t: "op"; v: string };

function lex(src: string): Tok[] {
  const out: Tok[] = [];
  const re = /\s*(?:(\d+(?:\.\d+)?)|([A-Za-z_]\w*)|([-+*/()]))/y;
  let i = 0;
  while (i < src.length) {
    if (/^\s*$/.test(src.slice(i))) break;
    re.lastIndex = i;
    const m = re.exec(src);
    if (!m) throw new Error(`Cannot read formula near "${src.slice(i)}"`);
    if (m[1] !== undefined) out.push({ t: "num", v: parseFloat(m[1]) });
    else if (m[2] !== undefined) out.push({ t: "id", v: m[2] });
    else out.push({ t: "op", v: m[3] });
    i = re.lastIndex;
  }
  return out;
}

export function evaluate(formula: string, vars: Record<string, number> = {}): number {
  const toks = lex(formula);
  let p = 0;
  const peek = () => toks[p];
  const isOp = (v: string) => peek()?.t === "op" && peek()!.v === v;

  function primary(): number {
    const tok = toks[p++];
    if (!tok) throw new Error(`Formula ends early: ${formula}`);
    if (tok.t === "num") return tok.v;
    if (tok.t === "id") {
      if (!(tok.v in vars)) throw new Error(`Unknown variable "${tok.v}" in ${formula}`);
      return vars[tok.v];
    }
    if (tok.v === "(") {
      const v = expr();
      if (!isOp(")")) throw new Error(`Missing ) in ${formula}`);
      p++;
      return v;
    }
    if (tok.v === "-") return -primary();
    if (tok.v === "+") return primary();
    throw new Error(`Unexpected "${tok.v}" in ${formula}`);
  }
  function term(): number {
    let v = primary();
    while (isOp("*") || isOp("/")) {
      const op = toks[p++].v;
      const r = primary();
      v = op === "*" ? v * r : v / r;
    }
    return v;
  }
  function expr(): number {
    let v = term();
    while (isOp("+") || isOp("-")) {
      const op = toks[p++].v;
      const r = term();
      v = op === "+" ? v + r : v - r;
    }
    return v;
  }
  const v = expr();
  if (p !== toks.length) throw new Error(`Unexpected trailing input in ${formula}`);
  return v;
}

/**
 * Reads a number the way it is written for players:
 * "$18", "5,000", "$4.5M", "$500K", "64%", "-$24,000", "+$21,000".
 * Returns the value and the size of its last shown digit (for rounding checks).
 */
export const DISPLAY_NUMBER = /[-+]?\$?(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d+)?(?:[KMB](?![A-Za-z])|%)?/;

export function parseDisplay(text: string): { value: number; unit: number } | null {
  const m = new RegExp(`^${DISPLAY_NUMBER.source}$`).exec(text.trim());
  if (!m) return null;
  let s = text.trim();
  let sign = 1;
  if (s[0] === "-") { sign = -1; s = s.slice(1); }
  else if (s[0] === "+") s = s.slice(1);
  s = s.replace("$", "");
  let scale = 1;
  const last = s[s.length - 1];
  if (last === "K") scale = 1e3;
  else if (last === "M") scale = 1e6;
  else if (last === "B") scale = 1e9;
  else if (last === "%") scale = 0.01;
  if (scale !== 1) s = s.slice(0, -1);
  s = s.replace(/,/g, "");
  const decimals = s.includes(".") ? s.split(".")[1].length : 0;
  return { value: sign * parseFloat(s) * scale, unit: Math.pow(10, -decimals) * scale };
}

/**
 * Precision of a rounded figure written with "about": "about $133,000" is
 * rounded to the nearest $1,000, "about 64%" to the nearest 1%.
 */
export function roundedUnit(text: string): number | null {
  const p = parseDisplay(text);
  if (!p) return null;
  const digits = text.replace(/[^0-9.]/g, "");
  if (digits.includes(".")) return p.unit;
  const zeros = /0*$/.exec(digits)![0].length;
  return p.unit * Math.pow(10, Math.min(zeros, digits.length - 1));
}

/** An option such as "$18", "About 64%" or "about 340". Null if not a number. */
export function parseOption(text: string): { value: number; unit: number } | null {
  const m = new RegExp(`^(?:about\\s+)?(${DISPLAY_NUMBER.source})(?:\\s+[A-Za-z].*)?$`, "i").exec(text.trim());
  if (!m) return null;
  const p = parseDisplay(m[1])!;
  return /^about\s/i.test(text.trim()) ? { value: p.value, unit: roundedUnit(m[1])! } : p;
}
