import { useEffect, useRef } from "react";

export function Scoreboard(props: { club: string; role: string; opponent: string; us: number; them: number; clock: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const total = props.us + props.them;
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    const el = ref.current;
    if (!el || total === 0) return;
    el.classList.remove("bump");
    void el.offsetWidth;
    el.classList.add("bump");
  }, [total]);
  return (
    <section className="board" aria-label="Scoreboard">
      <div className="team">{props.club}<small>{props.role}</small></div>
      <div className="score" ref={ref} aria-hidden="true">
        <span>{props.us}</span><span className="dash">-</span><span>{props.them}</span>
      </div>
      <div className="team away">{props.opponent}<small>Away</small></div>
      <div className="clock">{props.clock}</div>
      <p className="sr-only" aria-live="polite">
        {props.clock}. {props.club} {props.us}, {props.opponent} {props.them}.
      </p>
    </section>
  );
}
