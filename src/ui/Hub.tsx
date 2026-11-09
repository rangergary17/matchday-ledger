import { forwardRef, useEffect, useState } from "react";
import type { Match } from "../lib/types";
import type { MatchRecord } from "../lib/save";
import { outcome, score } from "../lib/save";
import { formatCountdown, msUntilMidnight } from "../lib/schedule";
import type { Due } from "../lib/drills";

interface Props {
  act: { n: number; title: string; blurb: string } | null;
  day: number;
  match: Match;
  today: MatchRecord | null;
  inProgress: boolean;
  pendingCalls: { record: MatchRecord; match: Match }[];
  drills: { due: Due; match: Match }[];
  missed: { day: number; match: Match }[];
  nextTopic: string;
  seasonOver: boolean;
  position: string;
  onPlay: () => void;
  onCall: (day: number) => void;
  onDrill: (match: number) => void;
  onCatchUp: (day: number) => void;
}

export const Hub = forwardRef<HTMLHeadingElement, Props>(function Hub(p, ref) {
  const [left, setLeft] = useState(() => msUntilMidnight(new Date()));
  useEffect(() => {
    const id = setInterval(() => setLeft(msUntilMidnight(new Date())), 1000);
    return () => clearInterval(id);
  }, []);
  const played = p.today;
  const label = `Matchday ${p.day}${p.act ? ` · Act ${p.act.n}, ${p.act.title}` : ""}`;
  return (
    <div className="hub">
      <section className="fixture-card" aria-labelledby="hub-title">
        <p className="eyebrow">{label}</p>
        <h2 id="hub-title" ref={ref} tabIndex={-1}>{p.match.topic}</h2>
        <p className="opp">vs {p.match.opponent}</p>
        {!played && <button className="btn block" onClick={p.onPlay}>{p.inProgress ? "Resume match" : "Play"}</button>}
        {played && (() => {
          const s = score(played.goals, played.pen);
          const o = outcome(played.goals, played.pen);
          return (
            <>
              <p className={`hub-result ${o}`}>{s.us}:{s.them}</p>
              <p className="next">{o === "win" ? "Won" : o === "draw" ? "Drew" : "Lost"}. Next match in <b>{formatCountdown(left)}</b></p>
            </>
          );
        })()}
      </section>

      {p.pendingCalls.length > 0 && (
        <div className="list" role="group" aria-label="Decisions waiting">
          {p.pendingCalls.map(({ record, match }) => (
            <button key={record.day} className="row-btn" onClick={() => p.onCall(record.day)}>
              <span>{match.call.title}<small>Chairman's call · Matchday {record.day}</small></span>
              <span className="tag">Decide</span>
            </button>
          ))}
        </div>
      )}

      {p.drills.length > 0 && (
        <div className="list" role="group" aria-label="Training">
          <p className="eyebrow">Training</p>
          {p.drills.map(({ due, match }) => (
            <button key={due.match} className="row-btn" onClick={() => p.onDrill(due.match)}>
              <span>{match.topic}<small>{due.box === 0 ? "You missed some of this" : "Keep it sharp"}</small></span>
              <span className="chev" aria-hidden="true">›</span>
            </button>
          ))}
        </div>
      )}

      {p.missed.length > 0 && (
        <div className="list" role="group" aria-label="Catch up">
          <p className="eyebrow">Catch up. Counts for the league, not your streak.</p>
          {p.missed.slice(0, 3).map(({ day, match }) => (
            <button key={day} className="row-btn" onClick={() => p.onCatchUp(day)}>
              <span>{match.topic}<small>Matchday {day} · vs {match.opponent}</small></span>
              <span className="chev" aria-hidden="true">›</span>
            </button>
          ))}
        </div>
      )}

      {p.seasonOver && (
        <section className="panel">
          <h3>Season over</h3>
          <p className="dim small">You finished {p.position}. A new season starts tomorrow with the same club.</p>
        </section>
      )}
    </div>
  );
});
