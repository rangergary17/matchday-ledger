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
  return (
    <div className="hub">
      {p.act && (
        <p className="act"><b>Act {p.act.n}: {p.act.title}</b> {p.act.blurb}</p>
      )}
      <section className="fixture-card" aria-labelledby="hub-title">
        <p className="eyebrow">Today · Matchday {p.day}</p>
        <h2 id="hub-title" ref={ref} tabIndex={-1}>v {p.match.opponent}</h2>
        <p className="topic">{p.match.topic}</p>
        {!played && <button className="btn" onClick={p.onPlay}>{p.inProgress ? "Back to the match" : "Play today's match"}</button>}
        {played && (() => {
          const s = score(played.goals, played.pen);
          const o = outcome(played.goals, played.pen);
          return (
            <>
              <p className={`hub-result ${o}`}>{o === "win" ? "Won" : o === "draw" ? "Drew" : "Lost"} {s.us}-{s.them}</p>
              <p className="dim">Next match in <span className="countdown-sm">{formatCountdown(left)}</span>: {p.nextTopic}</p>
            </>
          );
        })()}
      </section>

      {p.seasonOver && (
        <section className="panel gold" aria-label="Season review">
          <h3>Season over</h3>
          <p>You finished {p.position}. Check the Club tab for the board's verdict. A new season starts at the next matchday with the same club.</p>
        </section>
      )}

      {p.pendingCalls.length > 0 && (
        <section className="panel" aria-labelledby="calls-title">
          <h3 id="calls-title">Waiting for your call</h3>
          {p.pendingCalls.map(({ record, match }) => (
            <button key={record.day} className="row-btn" onClick={() => p.onCall(record.day)}>
              <span><b>{match.call.title}</b><small>Matchday {record.day} · {match.topic}</small></span><span aria-hidden="true">›</span>
            </button>
          ))}
        </section>
      )}

      <section className="panel" aria-labelledby="train-title">
        <h3 id="train-title">Training ground</h3>
        {p.drills.length === 0 ? (
          <p className="dim small">No drills due. Topics you struggle with come back here with fresh numbers, a day later. Ones you nail come back in a week.</p>
        ) : (
          <>
            <p className="dim small">Quick typed-answer drills with new numbers. They raise your Chairman rating.</p>
            {p.drills.map(({ due, match }) => (
              <button key={due.match} className="row-btn" onClick={() => p.onDrill(due.match)}>
                <span><b>{match.topic}</b><small>{due.box === 0 ? "You missed some of this" : "Keep it sharp"}</small></span><span aria-hidden="true">›</span>
              </button>
            ))}
          </>
        )}
      </section>

      {p.missed.length > 0 && (
        <section className="panel" aria-labelledby="missed-title">
          <h3 id="missed-title">Catch up</h3>
          <p className="dim small">Missed matchdays still count for the league and the club. They don't count for your streak.</p>
          {p.missed.slice(0, 3).map(({ day, match }) => (
            <button key={day} className="row-btn" onClick={() => p.onCatchUp(day)}>
              <span><b>Matchday {day} v {match.opponent}</b><small>{match.topic}</small></span><span aria-hidden="true">›</span>
            </button>
          ))}
        </section>
      )}
    </div>
  );
});
