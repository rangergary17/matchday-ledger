import { forwardRef, useEffect, useRef } from "react";
import type { Question } from "../lib/types";

export const HALVES = ["First half", "Second half", "Extra time"];
export const MINUTES = ["23'", "67'", "112'"];
const KEYS = ["A", "B", "C", "D"];

interface Props {
  question: Question;
  index: number;
  opponent: string;
  picked: number | null;
  hintShown: boolean;
  onHint: () => void;
  onAnswer: (i: number) => void;
  onNext: () => void;
}

export const QuestionView = forwardRef<HTMLParagraphElement, Props>(function QuestionView(p, ref) {
  const { question: q, picked } = p;
  const answered = picked !== null;
  const right = answered && picked === q.answer;
  const verdictRef = useRef<HTMLHeadingElement>(null);
  const last = p.index === 2;

  useEffect(() => {
    if (answered) verdictRef.current?.focus({ preventScroll: true });
    if (answered) verdictRef.current?.scrollIntoView({ block: "nearest", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }, [answered]);

  const others = q.whyNot
    .map((w, i) => ({ w, i }))
    .filter(({ w, i }) => w && i !== picked);

  return (
    <section className="q" aria-labelledby="q-prompt">
      <p className="eyebrow">{HALVES[p.index]} · chance {p.index + 1} of 3</p>
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

      {!answered && !p.hintShown && (
        <button className="hint-btn" onClick={p.onHint}>Ask the assistant coach</button>
      )}
      {p.hintShown && <p className="hint" role="note"><b>Coach:</b> {q.hint}</p>}

      {answered && (
        <div className="ref">
          <h2 ref={verdictRef} tabIndex={-1} className={`verdict ${right ? "goal" : "conc"}`}>
            {right ? "Goal! Back of the net." : `Conceded. ${p.opponent} score.`}
          </h2>
          {!right && (
            <p className="whynot"><b>Why not {q.options[picked!]}?</b> {q.whyNot[picked!]}</p>
          )}
          <h3>The working</h3>
          <ol className="working">
            {q.working.map((w, i) => <li key={i}>{w}</li>)}
          </ol>
          {others.length > 0 && (
            <details className="others">
              <summary>Why the other answers are wrong</summary>
              <ul>
                {others.map(({ w, i }) => <li key={i}><b>{q.options[i]}:</b> {w}</li>)}
              </ul>
            </details>
          )}
          <div className="btn-row">
            <button className="btn" onClick={p.onNext}>{last ? "Final whistle" : "Next half"}</button>
          </div>
        </div>
      )}
    </section>
  );
});
