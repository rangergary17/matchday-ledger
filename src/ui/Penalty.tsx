import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import type { Penalty as P, Values } from "../lib/template";
import { judge, parseInput, renderPenalty, type Judged } from "../lib/template";
import { reducedMotion } from "./fmt";

interface Props {
  penalty: P;
  values: Values;
  /** "penalty" in a match (a miss is saved), "drill" on the training ground. */
  mode: "penalty" | "drill";
  intro: string;
  onHint: () => void;
  onResult: (correct: boolean) => void;
  onNext: () => void;
  nextLabel: string;
}

export const PenaltyView = forwardRef<HTMLParagraphElement, Props>(function PenaltyView(p, ref) {
  const r = useMemo(() => renderPenalty(p.penalty, p.values), [p.penalty, p.values]);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [hint, setHint] = useState(false);
  const [result, setResult] = useState<{ j: Judged; typed: string } | null>(null);
  const verdictRef = useRef<HTMLHeadingElement>(null);
  const fmt = p.penalty.fmt;

  useEffect(() => {
    if (!result) return;
    verdictRef.current?.focus({ preventScroll: true });
    verdictRef.current?.scrollIntoView({ block: "nearest", behavior: reducedMotion() ? "auto" : "smooth" });
  }, [result]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (result) return;
    const n = parseInput(text);
    if (n === null) { setError("Type a number, like 5000, 1.2m or 64."); return; }
    setError("");
    const j = judge(p.penalty, p.values, n);
    setResult({ j, typed: text.trim() });
    p.onResult(j.correct);
  }

  const ok = result?.j.correct;
  const trapIndex = result?.j.trap ? p.penalty.traps.indexOf(result.j.trap) : -1;

  return (
    <section className="q" aria-labelledby="pen-prompt">
      <p className="commentary">{p.intro}</p>
      <p className="eyebrow">{p.mode === "penalty" ? "Penalty. Type your answer." : "Training. Same idea, new numbers."}</p>
      <p className="prompt" id="pen-prompt" ref={ref} tabIndex={-1}>{r.prompt}</p>
      <form className="pen-form" onSubmit={submit}>
        <label htmlFor="pen-input" className="sr-only">Your answer</label>
        <div className="pen-field">
          {fmt === "usd" && <span className="affix" aria-hidden="true">$</span>}
          <input
            id="pen-input"
            inputMode="decimal"
            autoComplete="off"
            enterKeyHint="go"
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={!!result}
            aria-describedby="pen-help"
            placeholder="Your answer"
          />
          {fmt === "pct" && <span className="affix" aria-hidden="true">%</span>}
        </div>
        <button className="btn" type="submit" disabled={!!result || !text.trim()}>{p.mode === "penalty" ? "Shoot" : "Check"}</button>
      </form>
      <p id="pen-help" className="dim small">{error || (fmt === "usd" ? "Shortcuts work: 500k, 1.2m." : fmt === "pct" ? "Just the number, like 30 for 30%." : "Just the number.")}</p>

      {!result && !hint && <button className="hint-btn" onClick={() => { setHint(true); p.onHint(); }}>Show a hint</button>}
      {hint && <p className="hint" role="note"><b>Hint.</b> {r.hint}</p>}

      {result && (
        <div className="ref">
          <h2 ref={verdictRef} tabIndex={-1} className={`verdict ${ok ? "goal" : "conc"}`}>
            {ok ? (p.mode === "penalty" ? "Goal" : "Spot on") : p.mode === "penalty" ? "Saved" : "Not quite"}
          </h2>
          {!ok && (
            <p className="whynot">
              <b>You said {result.typed}. The answer is {r.answerText}.</b>{" "}
              {trapIndex >= 0 ? r.traps[trapIndex].why : "Walk through the working below and see where yours split off."}
            </p>
          )}
          <h3>How it works</h3>
          <ol className="working">{r.working.map((w, i) => <li key={i}>{w}</li>)}</ol>
          <button className="btn block" onClick={p.onNext}>{p.nextLabel}</button>
        </div>
      )}
    </section>
  );
});
