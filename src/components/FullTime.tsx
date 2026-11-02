import { forwardRef, useEffect, useState } from "react";
import type { Match } from "../lib/types";
import { outcome, score } from "../lib/results";
import { formatCountdown, msUntilMidnight } from "../lib/schedule";
import { copyText, shareText } from "../lib/share";
import { SITE_URL } from "../config";

interface Props {
  match: Match;
  day: number;
  goals: boolean[];
  replay: boolean;
  nextTopic: string;
  onReplay: () => void;
  onBackToToday?: () => void;
}

const LINES = {
  win: ["Win", "Three points. You read the numbers like a chairman."],
  draw: ["Draw", "A point. Check the working on the ones you missed."],
  loss: ["Defeat", "The board wants a word. Replay it and take the hints this time."],
} as const;

export const FullTime = forwardRef<HTMLHeadingElement, Props>(function FullTime(p, ref) {
  const { us, them } = score(p.goals);
  const o = outcome(p.goals);
  const [left, setLeft] = useState(() => msUntilMidnight(new Date()));
  const [toast, setToast] = useState("");

  useEffect(() => {
    const id = setInterval(() => setLeft(msUntilMidnight(new Date())), 1000);
    return () => clearInterval(id);
  }, []);

  async function share() {
    const ok = await copyText(shareText({ day: p.day, topic: p.match.topic, goals: p.goals, site: SITE_URL }));
    setToast(ok ? "Copied. Paste it anywhere." : "Couldn't copy. Your browser blocked the clipboard.");
  }

  return (
    <section className="ft" aria-labelledby="ft-title">
      <p className="eyebrow">Full time · {p.match.topic}{p.replay ? " · replay" : ""}</p>
      <h2 id="ft-title" ref={ref} tabIndex={-1} className={o}>{LINES[o][0]} {us}-{them}</h2>
      <p className="balls" aria-label={p.goals.map((g) => (g ? "goal" : "conceded")).join(", ")}>
        {p.goals.map((g) => (g ? "⚽" : "❌")).join("")}
      </p>
      <p className="dim">{LINES[o][1]}</p>
      <p className="takeaway">{p.match.takeaway}</p>
      {p.replay ? (
        <p className="dim">Replays don't change your streak or season record.</p>
      ) : (
        <>
          <div className="btn-row">
            <button className="btn" onClick={share}>Share result</button>
            <button className="btn ghost" onClick={p.onReplay}>Replay this match</button>
          </div>
          <p className="toast" role="status">{toast}</p>
        </>
      )}
      {p.replay && (
        <div className="btn-row">
          <button className="btn ghost" onClick={p.onReplay}>Play it again</button>
          {p.onBackToToday && <button className="btn" onClick={p.onBackToToday}>Back to today</button>}
        </div>
      )}
      <p className="dim">Next matchday kicks off in</p>
      <p className="countdown" aria-label={`${Math.floor(left / 3600000)} hours ${Math.floor((left % 3600000) / 60000)} minutes`}>
        {formatCountdown(left)}
      </p>
      <p className="dim">Up next: <b style={{ color: "var(--chalk)" }}>{p.nextTopic}</b></p>
    </section>
  );
});
