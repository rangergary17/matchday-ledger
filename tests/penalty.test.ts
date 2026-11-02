/**
 * Penalties and training drills: every number is computed from variables,
 * so here we check the templates themselves on the base numbers and on 25
 * random draws: the working adds up, the answer appears in it, traps are
 * different from the answer, and draws actually vary.
 */
import { describe, expect, it } from "vitest";
import { pack } from "../src/lib/content";
import { baseValues, draw, format, judge, inputUnits, renderPenalty, validDraw } from "../src/lib/template";
import { evaluate } from "../src/lib/calc";
import { checkWorking } from "./support/working";

for (const m of pack.matches) {
  const p = m.penalty;
  describe(`Penalty ${m.number}: ${m.topic}`, () => {
    it("base numbers are a valid, clean question", () => {
      expect(validDraw(p, baseValues(p))).toBe(true);
    });

    const seeds = ["base", ...Array.from({ length: 25 }, (_, i) => `seed-${i}`)];
    const draws = seeds.map((s) => (s === "base" ? baseValues(p) : draw(p, `${m.number}:${s}`)));

    it("working adds up and shows the answer, for base and random numbers", () => {
      for (const values of draws) {
        const r = renderPenalty(p, values);
        const text = [r.prompt, r.hint, ...r.working, ...r.traps.map((t) => t.why)].join(" ");
        expect(text, "unfilled placeholder").not.toMatch(/[{}]/);
        const issues = r.working.flatMap((w) => checkWorking(w).issues);
        expect(issues, JSON.stringify(values)).toEqual([]);
        expect(r.working.join(" "), `answer ${r.answerText} missing from working`).toContain(r.answerText);
      }
    });

    it("the right answer is accepted and every trap is caught as a trap", () => {
      for (const values of draws) {
        const ans = evaluate(p.answer, values);
        expect(judge(p, values, inputUnits(ans, p.fmt)).correct).toBe(true);
        for (const t of p.traps) {
          const typed = inputUnits(evaluate(t.formula, values), p.fmt);
          const j = judge(p, values, typed);
          expect(j.correct, `trap ${t.formula} accepted as right`).toBe(false);
          expect(j.trap?.formula).toBe(t.formula);
        }
      }
    });

    it("drills get fresh numbers", () => {
      const answers = new Set(draws.map((d) => format(evaluate(p.answer, d), p.fmt)));
      const fixed = Object.values(p.vars).every((v) => v.min === v.max);
      if (!fixed) expect(answers.size).toBeGreaterThanOrEqual(3);
    });

    it("has a hint and at least one trap", () => {
      expect(p.hint.length).toBeGreaterThan(5);
      expect(p.traps.length).toBeGreaterThan(0);
    });
  });
}
