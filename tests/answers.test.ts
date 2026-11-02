/**
 * Recomputes every answer in every match. Fails if any number is wrong.
 *
 * 1. calc questions: the formula, run on the question's numbers, must equal
 *    the correct option, and no wrong option may equal it.
 * 2. Every "a x b = c" written in the working, hints and "why not" notes is
 *    recomputed.
 * 3. Every number in the explanations must come from the question, an
 *    option, a checked calculation, or a declared rule of thumb. No
 *    unexplained figures.
 */
import { describe, expect, it } from "vitest";
import { pack } from "../src/lib/content";
import { evaluate, parseOption, parseDisplay } from "../src/lib/calc";
import { checkWorking, numbersIn } from "./support/working";

const close = (a: number, b: number) => Math.abs(a - b) <= Math.max(Math.abs(a), Math.abs(b), 1) * 1e-9;
const FREE = new Set([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 100]);

for (const m of pack.matches) {
  describe(`Matchday ${m.number}: ${m.topic}`, () => {
    // Everything a player has been told so far in this match.
    const given: number[] = [];
    const proven: number[] = [];
    for (const q of m.questions) {
      given.push(...numbersIn(q.prompt));
      for (const o of q.options) given.push(...numbersIn(o));
      for (const b of q.benchmarks ?? []) given.push(parseDisplay(b)!.value);
      for (const t of [...q.working, q.hint, ...q.whyNot.filter((w): w is string => !!w)]) {
        proven.push(...checkWorking(t).results);
      }
    }
    const known = (v: number) =>
      FREE.has(Math.abs(v)) || [...given, ...proven].some((g) => close(Math.abs(g), Math.abs(v)));

    m.questions.forEach((q, qi) => {
      const label = `Q${qi + 1}: ${q.prompt.slice(0, 50)}`;

      it(`${label} - written calculations add up`, () => {
        const texts = [...q.working, q.hint, ...q.whyNot.filter((w): w is string => !!w)];
        const issues = texts.flatMap((t) => checkWorking(t).issues);
        expect(issues).toEqual([]);
      });

      it(`${label} - every figure is traceable`, () => {
        const texts = [...q.working, q.hint, ...q.whyNot.filter((w): w is string => !!w)];
        const stray = texts.flatMap((t) =>
          checkWorking(t).numbers.filter((n) => !known(n.value)).map((n) => `${n.text} in "${t}"`),
        );
        expect(stray).toEqual([]);
      });

      if (q.kind === "calc") {
        it(`${label} - formula gives the correct option`, () => {
          expect(q.calc, "calc questions need a formula").toBeDefined();
          const { vars, formula } = q.calc!;
          for (const [name, v] of Object.entries(vars)) {
            expect(known(v), `variable ${name}=${v} is not in the question`).toBe(true);
          }
          const result = evaluate(formula, vars);
          const right = parseOption(q.options[q.answer]);
          expect(right, `correct option "${q.options[q.answer]}" must be a number`).not.toBeNull();
          const tol = right!.unit / 2 + 1e-9;
          expect(Math.abs(result - right!.value), `${formula} = ${result}, option says ${q.options[q.answer]}`).toBeLessThanOrEqual(tol);
          q.options.forEach((o, i) => {
            if (i === q.answer) return;
            const p = parseOption(o);
            if (p) expect(Math.abs(p.value - result) > tol, `wrong option "${o}" also matches`).toBe(true);
          });
        });
      }
    });

    it("takeaway, talk and terms only use figures from the match", () => {
      const texts = [m.talk, m.takeaway, ...m.terms.map((t) => t.meaning)];
      const stray = texts.flatMap((t) => numbersIn(t).filter((v) => !known(v)));
      expect(stray).toEqual([]);
    });
  });
}
