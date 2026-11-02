import { forwardRef } from "react";
import type { Match } from "../lib/types";

export const TeamTalk = forwardRef<HTMLHeadingElement, { match: Match; label: string; onKickOff: () => void }>(
  function TeamTalk({ match, label, onKickOff }, ref) {
    return (
      <>
        <section className="tactics" aria-labelledby="talk-title">
          <p className="eyebrow">Team talk · {label}</p>
          <h2 id="talk-title" ref={ref} tabIndex={-1}>{match.topic}</h2>
          <p>{match.talk}</p>
          <ul className="terms" aria-label="Key terms">
            {match.terms.map((t) => (
              <li className="term" key={t.term}><b>{t.term}</b><span>{t.meaning}</span></li>
            ))}
          </ul>
        </section>
        <p className="dim small">3 chances, then a penalty. Right answers are goals. Wrong ones are goals for {match.opponent}.</p>
        <button className="btn" onClick={onKickOff}>Kick off</button>
      </>
    );
  },
);
