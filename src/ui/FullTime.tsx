import { forwardRef, useState } from "react";
import type { Match } from "../lib/types";
import { outcome, score } from "../lib/save";
import type { NewsItem } from "../lib/club";
import { copyText, shareText } from "../lib/share";
import { SITE_URL } from "../config";
import { signedCount, signedMoney } from "./fmt";

interface Props {
  match: Match;
  day: number;
  goals: boolean[];
  pen: boolean;
  kind: "daily" | "catchup" | "replay";
  news: NewsItem[];
  rating: number;
  position: string;
  callPending: boolean;
  onCall: () => void;
  onReplay: () => void;
  onDone: () => void;
}

const LINES = {
  win: ["Win", ""],
  draw: ["Draw", ""],
  loss: ["Loss", ""],
} as const;

export const FullTime = forwardRef<HTMLHeadingElement, Props>(function FullTime(p, ref) {
  const { us, them } = score(p.goals, p.pen);
  const o = outcome(p.goals, p.pen);
  const [toast, setToast] = useState("");

  async function share() {
    const ok = await copyText(shareText({ day: p.day, topic: p.match.topic, goals: p.goals, pen: p.pen, site: SITE_URL, rating: p.rating, position: p.position }));
    setToast(ok ? "Copied. Paste it anywhere." : "Couldn't copy. Your browser blocked the clipboard.");
  }

  return (
    <section className="ft" aria-labelledby="ft-title">
      <p className="eyebrow">Full time · {LINES[o][0]}{p.kind === "replay" ? " · Replay, doesn't count" : p.kind === "catchup" ? " · Catch-up" : ""}</p>
      <h2 id="ft-title" ref={ref} tabIndex={-1} className={o}>{us}:{them}</h2>
      <p className="balls" aria-label={`${p.goals.map((g) => (g ? "goal" : "conceded")).join(", ")}, penalty ${p.pen ? "scored" : "saved"}`}>
        {p.goals.map((g, i) => <i key={i} className={g ? "g" : ""} />)}<span className="pen-tag">Pen</span><i className={p.pen ? "g" : ""} />
      </p>
      <p className="takeaway">{p.match.takeaway}</p>

      {p.kind !== "replay" && p.news.length > 0 && (
        <ul className="ledger" aria-label="What this match did for the club">
          {p.news.filter((n) => n.kind === "result" || n.kind === "takings").map((n, i) => (
            <li key={i}>
              <span>{n.text}</span>
              <span className="amt">
                {n.cash !== undefined && <b className={n.cash >= 0 ? "pos" : "neg"}>{signedMoney(n.cash)}</b>}
                {n.fans !== undefined && <b className={n.fans >= 0 ? "pos" : "neg"}> {signedCount(n.fans)} fans</b>}
              </span>
            </li>
          ))}
        </ul>
      )}

      <div className="btn-row">
        {p.kind !== "replay" && p.callPending && <button className="btn block" onClick={p.onCall}>Make the Chairman's call</button>}
        {p.kind !== "replay" && !p.callPending && <button className="btn block" onClick={p.onDone}>Done</button>}
        {p.kind === "replay" && <button className="btn block" onClick={p.onDone}>Done</button>}
      </div>
      <div className="btn-row">
        {p.kind === "daily" && <button className="btn ghost" onClick={share}>Share</button>}
        <button className="btn ghost" onClick={p.onReplay}>Replay</button>
      </div>
      <p className="toast" role="status">{toast}</p>
    </section>
  );
});
