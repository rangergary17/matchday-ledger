import { forwardRef, useEffect, useRef } from "react";
import type { Call, Effects } from "../lib/types";
import { count, money, reducedMotion, signedMoney } from "./fmt";

function chips(e: Effects): string[] {
  const out: string[] = [];
  if (e.cash) out.push(`${signedMoney(e.cash)} now`);
  if (e.fans) out.push(`${e.fans > 0 ? "+" : "-"}${count(Math.abs(e.fans))} fans a match`);
  if (e.contrib) out.push(`${e.contrib > 0 ? "+" : "-"}${money(Math.abs(e.contrib)).replace(/\.00$/, "")} profit per fan`);
  if (e.fixed) out.push(`${e.fixed > 0 ? "+" : "-"}${money(Math.abs(e.fixed))} ${e.fixed > 0 ? "costs" : "income"} a matchday`);
  const pc = (x: number) => `${Math.round(x * 1000) / 10}%`;
  if (e.sellFraction) out.push(`Sell ${pc(e.sellFraction)} of your stake at ${e.sellMultiple ?? 8} times yearly profit`);
  if (e.dilute) out.push(`Sell ${pc(e.dilute)} of the club`);
  if (e.recap) out.push(`Borrow ${money(e.recap)} and pay it to owners`);
  if (e.debt) out.push(`${e.debt > 0 ? "+" : "-"}${money(Math.abs(e.debt))} debt`);
  if (e.banked) out.push(`+${money(e.banked)} to you`);
  return out.length ? out : ["No change now"];
}

interface Props {
  call: Call;
  chosen: number | null;
  onChoose: (i: number) => void;
  onDone: () => void;
}

export const CallView = forwardRef<HTMLHeadingElement, Props>(function CallView({ call, chosen, onChoose, onDone }, ref) {
  const resultRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (chosen === null) return;
    resultRef.current?.focus({ preventScroll: true });
    resultRef.current?.scrollIntoView({ block: "nearest", behavior: reducedMotion() ? "auto" : "smooth" });
  }, [chosen]);
  const good = chosen === call.best;
  return (
    <section className="call" aria-labelledby="call-title">
      <p className="eyebrow">Chairman's call</p>
      <h2 id="call-title" ref={ref} tabIndex={-1}>{call.title}</h2>
      <p>{call.prompt}</p>
      <ul className="choices">
        {call.options.map((o, i) => (
          <li key={i}>
            <button className={`choice ${chosen === i ? (good ? "right" : "wrong") : chosen !== null && i === call.best ? "best" : ""}`} disabled={chosen !== null} onClick={() => onChoose(i)}>
              <b>{o.label}</b>
              <span className="chips">{chips(o.effects).map((c) => <span key={c} className="chip">{c}</span>)}</span>
            </button>
          </li>
        ))}
      </ul>
      {chosen !== null && (
        <div className="ref">
          <h3 ref={resultRef} tabIndex={-1} className={`verdict ${good ? "goal" : "conc"}`}>{good ? "Good call" : "Not the best call"}</h3>
          <p>{call.options[chosen].result.replace(/^Good call\. /, "")}</p>
          {!good && <p className="whynot"><b>Better call: {call.options[call.best].label}.</b> {call.options[call.best].result.replace(/^Good call\. /, "")}</p>}
          {call.options[chosen].later && <p className="dim small">Something from this decision will land in a few matchdays. Watch the club news.</p>}
          <button className="btn block" onClick={onDone}>Done</button>
        </div>
      )}
    </section>
  );
});
