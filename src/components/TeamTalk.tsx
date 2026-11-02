import type { Match } from "../lib/types";
import { forwardRef } from "react";

export const TeamTalk = forwardRef<HTMLHeadingElement, { match: Match; onKickOff: () => void; replay: boolean }>(
  function TeamTalk({ match, onKickOff, replay }, ref) {
    return (
      <>
        <section className="tactics" aria-labelledby="talk-title">
          <p className="eyebrow">Tactics board{replay ? " · replay, doesn't count" : ""}</p>
          <h2 id="talk-title" ref={ref} tabIndex={-1}>{match.topic}</h2>
          <p>{match.talk}</p>
          <ul className="terms" aria-label="Key terms">
            {match.terms.map((t) => (
              <li className="term" key={t.term}><b>{t.term}</b><span>{t.meaning}</span></li>
            ))}
          </ul>
        </section>
        <button className="btn" onClick={onKickOff}>Kick off</button>
      </>
    );
  },
);
