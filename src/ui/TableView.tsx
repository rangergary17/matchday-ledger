import { forwardRef } from "react";
import type { Row } from "../lib/league";
import type { Match } from "../lib/types";
import type { SaveData } from "../lib/save";
import { outcome, score } from "../lib/save";
import { dateForMatchday } from "../lib/schedule";

interface Props {
  rows: Row[];
  matches: Match[];
  startDate: string;
  today: number;
  save: SaveData;
  onPick: (day: number) => void;
}

function shortDate(key: string): string {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" });
}

export const TableView = forwardRef<HTMLHeadingElement, Props>(function TableView({ rows, matches, startDate, today, save, onPick }, ref) {
  const n = matches.length;
  const first = today - ((today - 1) % n);
  return (
    <div>
      <h2 ref={ref} tabIndex={-1} className="page-title">League table</h2>
      <div className="table-wrap" tabIndex={0} aria-label="League table">
        <table className="league">
          <thead><tr><th scope="col">#</th><th scope="col">Club</th><th scope="col">P</th><th scope="col">W</th><th scope="col">D</th><th scope="col">L</th><th scope="col">Pts</th></tr></thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.team} className={`${r.you ? "you" : ""} ${i === 9 ? "cut" : ""}`}>
                <td>{i + 1}</td><th scope="row">{r.team}</th><td>{r.p}</td><td>{r.w}</td><td>{r.d}</td><td>{r.l}</td><td><b>{r.pts}</b></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="dim small">Top 10 is the board's target. Everyone sees the same results.</p>

      <h3 className="section-title">Fixtures</h3>
      <ul className="fxlist">
        {matches.map((m, i) => {
          const day = first + i;
          const date = dateForMatchday(day, startDate);
          const rec = save.records[String(day)];
          const future = day > today;
          let text = "", cls = "";
          if (rec) { const s = score(rec.goals, rec.pen); text = `${s.us}-${s.them}`; cls = outcome(rec.goals, rec.pen); }
          else if (day === today) text = "Today";
          else if (!future) text = "Catch up";
          return (
            <li key={day}>
              <button className={`fx ${day === today ? "today" : ""}`} disabled={future} onClick={() => onPick(day)}
                aria-label={future ? `Matchday ${day}, locked until ${shortDate(date)}` : `Matchday ${day}: ${m.topic} against ${m.opponent}. ${text}${rec ? ". Replay" : ""}`}>
                <span className="n">{String(day).padStart(2, "0")}</span>
                <span className="t">{future ? "Locked" : m.topic}<small>{future ? `Kicks off ${shortDate(date)}` : `v ${m.opponent}`}</small></span>
                <span className={`r ${cls}`}>{text}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
});
