import { forwardRef, useEffect, useRef } from "react";
import type { Question } from "../lib/types";
import { reducedMotion } from "./fmt";

export const HALVES = ["First half", "Second half", "Late on"];
export const MINUTES = ["19'", "52'", "81'"];
const KEYS = ["A", "B", "C", "D"];

interface Props {
  question: Question;
  index: number;
  build: string;
  after: string;
  opponent: string;
  picked: number | null;
  hintShown: boolean;
  onHint: () => void;
  onAnswer: (i: number) => void;
  onNext: () => void;
}

export const Chance = forwardRef<HTMLParagraphElement, Props>(function Chance(p, ref) {
  const { question: q, picked } = p;
  const answered = picked !== null;
  const right = answered && picked === q.answer;
  const verdictRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!answered) return;
    verdictRef.current?.focus({ preventScroll: true });
    verdictRef.current?.scrollIntoView({ block: "nearest", behavior: reducedMotion() ? "auto" : "smooth" });
  }, [answered]);

  // Keyboard: 1-4 or A-D answer, H for a hint.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey || answered) return;
      const t = e.target as HTMLElement;
      if (t.tagName === "INPUT" || t.tagName === "TEXTAREA") return;
      const k = e.key.toUpperCase();
      const i = ["1", "2", "3", "4"].indexOf(k) >= 0 ? Number(k) - 1 : KEYS.indexOf(k);
      if (i >= 0) { e.preventDefault(); p.onAnswer(i); }
      else if (k === "H" && !p.hintShown) { e.preventDefault(); p.onHint(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [answered, p]);

  const others = q.whyNot.map((w, i) => ({ w, i })).filter(({ w, i }) => w && i !== picked);

  return (
    <section className="q" aria-labelledby="q-prompt">
      {!answered && <p className="commentary">{p.build}</p>}
      <p className="prompt" id="q-prompt" ref={ref} tabIndex={-1}>{q.prompt}</p>
      <ul className="opts">
        {q.options.map((o, i) => {
          const cls = answered ? (i === q.answer ? "right" : i === picked ? "wrong" : "") : "";
          const state = answered ? (i === q.answer ? ", correct answer" : i === picked ? ", your answer, wrong" : "") : "";
          return (
            <li key={i}>
              <button className={`opt ${cls}`} disabled={answered} onClick={() => p.onAnswer(i)} aria-label={`${KEYS[i]}: ${o}${state}`}>
                <span className="key" aria-hidden="true">{KEYS[i]}</span>
                <span>{o}</span>
              </button>
            </li>
          );
        })}
      </ul>

      {!answered && !p.hintShown && <button className="hint-btn" onClick={p.onHint}>Show a hint</button>}
      {p.hintShown && <p className="hint" role="note"><b>Hint.</b> {q.hint}</p>}

      {answered && (
        <div className="ref">
          <h2 ref={verdictRef} tabIndex={-1} className={`verdict ${right ? "goal" : "conc"}`}>
            {right ? "Goal" : `${p.opponent} score`}
          </h2>
          {!right && <p className="whynot"><b>Why not {q.options[picked!]}?</b> {q.whyNot[picked!]}</p>}
          <h3>How it works</h3>
          <ol className="working">{q.working.map((w, i) => <li key={i}>{w}</li>)}</ol>
          {others.length > 0 && (
            <details className="others">
              <summary>Why the other answers are wrong</summary>
              <ul>{others.map(({ w, i }) => <li key={i}><b>{q.options[i]}:</b> {w}</li>)}</ul>
            </details>
          )}
          <button className="btn block" onClick={p.onNext}>{p.index === 2 ? "Take the penalty" : "Next chance"}</button>
        </div>
      )}
    </section>
  );
});
