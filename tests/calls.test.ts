/**
 * Chairman's calls: the option marked best must actually be best for the
 * club over the next 20 matchdays, run through the real club simulation,
 * and every sum in the explanations must add up and trace back.
 */
import { describe, expect, it } from "vitest";
import { pack } from "../src/lib/content";
import { applyEffects, matchdayProfit, valueOver } from "../src/lib/club";
import { checkWorking, numbersIn } from "./support/working";
import type { CallOption } from "../src/lib/types";

const { season, matches } = pack;
const start = season.club.start;
const cap = season.club.capacity;
const H = 20;
const FREE = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 100, H, start.fans, start.contrib, start.fixed, matchdayProfit(start), start.fans * start.contrib];
const close = (a: number, b: number) => Math.abs(Math.abs(a) - Math.abs(b)) <= Math.max(Math.abs(a), 1) * 1e-9;

function value(o: CallOption): number {
  let v = valueOver(start, o.effects, H, cap);
  if (o.later && o.later.after < H) {
    const mid = applyEffects(start, o.effects, cap);
    v += valueOver(mid, o.later.effects, H - o.later.after, cap);
  }
  return v;
}

for (const m of matches) {
  const c = m.call;
  describe(`Call ${m.number}: ${c.title}`, () => {
    it("has 2 or 3 options and a valid best pick", () => {
      expect(c.options.length).toBeGreaterThanOrEqual(2);
      expect(c.options.length).toBeLessThanOrEqual(3);
      expect(c.options[c.best]).toBeDefined();
      for (const o of c.options) {
        for (const k of Object.keys(o.effects)) expect(["cash", "fans", "contrib", "fixed"]).toContain(k);
        expect(o.result.length).toBeGreaterThan(20);
      }
    });

    it("the best option really is best for the club over 20 matchdays", () => {
      const values = c.options.map(value);
      const best = values[c.best];
      values.forEach((v, i) => {
        if (i !== c.best) expect(best, `${c.options[c.best].label} (${best}) vs ${c.options[i].label} (${v})`).toBeGreaterThan(v);
      });
    });

    it("every sum adds up and every figure traces back", () => {
      const texts = [c.prompt, ...c.options.flatMap((o) => [o.label, o.result, o.later?.text ?? ""])];
      const issues = texts.flatMap((t) => checkWorking(t).issues);
      expect(issues).toEqual([]);
      const effects = c.options.flatMap((o) => [...Object.values(o.effects), ...Object.values(o.later?.effects ?? {})]) as number[];
      const known = [...FREE, ...effects, ...numbersIn(c.prompt), ...c.options.flatMap((o) => numbersIn(o.label)), ...texts.flatMap((t) => checkWorking(t).results)];
      const stray = texts.slice(1).flatMap((t) => numbersIn(t).filter((n) => !known.some((k) => close(k, n))).map((n) => `${n} in "${t.slice(0, 60)}"`));
      expect(stray).toEqual([]);
    });
  });
}
