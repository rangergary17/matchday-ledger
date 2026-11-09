/*
 * Tiny keyframe compiler. A scene lists tracks (a CSS selector, a
 * property and timed keys) and this turns them into @keyframes that all
 * share the scene's duration, so every joint of every character stays in
 * sync. The last key of each track is also written as the resting value,
 * which is the frame people with reduced motion see.
 */
export type Val = string | number;
export type Key = [number, Val, string?];
export interface Track { sel: string; prop: string; keys: Key[]; unit?: string }

const pct = (t: number, dur: number) => Math.max(0, Math.min(100, (t / dur) * 100)).toFixed(3);

export function timeline(scope: string, dur: number, tracks: Track[]): string {
  let kf = "", base = "";
  const bySel = new Map<string, string[]>();
  tracks.forEach((tr, i) => {
    const name = `${scope}-${i}`;
    const fmt = (v: Val) => (typeof v === "number" ? `${v}${tr.unit ?? ""}` : v);
    const keys = [...tr.keys].sort((a, b) => a[0] - b[0]);
    const def = tr.prop === "opacity" ? "steps(1, end)" : "ease-in-out";
    const frames = keys.map(([t, v, e]) => `${pct(t, dur)}%{${tr.prop}:${fmt(v)};animation-timing-function:${e ?? def}}`);
    if (keys[0][0] > 0) frames.unshift(`0%{${tr.prop}:${fmt(keys[0][1])};animation-timing-function:steps(1, end)}`);
    const last = keys[keys.length - 1];
    if (last[0] < dur) frames.push(`100%{${tr.prop}:${fmt(last[1])}}`);
    kf += `@keyframes ${name}{${frames.join("")}}`;
    base += `.${scope} ${tr.sel}{${tr.prop}:${fmt(last[1])}}`;
    bySel.set(tr.sel, [...(bySel.get(tr.sel) ?? []), `${name} ${dur}ms linear both`]);
  });
  let anim = "";
  bySel.forEach((list, sel) => { anim += `.${scope} ${sel}{animation:${list.join(",")}}`; });
  return `${base}@media (prefers-reduced-motion: no-preference){${kf}${anim}}`;
}

export const R = (sel: string, keys: Key[]): Track => ({ sel, prop: "rotate", unit: "deg", keys });
export const S = (sel: string, keys: Key[]): Track => ({ sel, prop: "scale", keys });
export const O = (sel: string, keys: Key[]): Track => ({ sel, prop: "opacity", keys });
export const T = (sel: string, keys: [number, number, number, string?][]): Track => ({
  sel, prop: "translate", keys: keys.map(([t, x, y, e]) => [t, `${x}px ${y}px`, e] as Key),
});

/** Alternate between a and b every half period from t0 to t1. */
export function wave(t0: number, t1: number, period: number, a: number, b: number): Key[] {
  const out: Key[] = [];
  for (let t = t0, i = 0; t <= t1; t += period / 2, i++) out.push([t, i % 2 ? b : a]);
  return out;
}

/** Show from `from` until `to` (hard cuts). */
export const cut = (sel: string, from: number, to: number | null): Track =>
  O(sel, to === null ? [[0, from === 0 ? 1 : 0], ...(from > 0 ? ([[from, 1]] as Key[]) : [])] : [[0, from === 0 ? 1 : 0], ...(from > 0 ? ([[from, 1]] as Key[]) : []), [to, 0]]);
