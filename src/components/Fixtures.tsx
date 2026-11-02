import type { Match } from "../lib/types";
import type { SaveData } from "../lib/results";
import { outcome, score } from "../lib/results";
import { dateForMatchday } from "../lib/schedule";

interface Props {
  matches: Match[];
  startDate: string;
  today: number;
  save: SaveData;
  onPick: (matchIndex: number) => void;
}

function shortDate(key: string): string {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" });
}

export function Fixtures({ matches, startDate, today, save, onPick }: Props) {
  const n = matches.length;
  // The fixture list shows the current run through the season.
  const cycleStart = today - ((today - 1) % n);
  return (
    <details className="fixtures">
      <summary>Fixture list · replay past matchdays</summary>
      <ul className="fxlist">
        {matches.map((m, i) => {
          const day = cycleStart + i;
          const date = dateForMatchday(day, startDate);
          const daily = save.daily[date];
          const replay = save.replays[String(m.number)];
          const future = day > today;
          let text = "";
          let cls = "";
          if (daily) { const s = score(daily.goals); text = `${s.us}-${s.them}`; cls = outcome(daily.goals); }
          else if (day === today) text = "Today";
          else if (future) text = "";
          else if (replay) { const s = score(replay); text = `Replay ${s.us}-${s.them}`; }
          else text = "Missed";
          return (
            <li key={m.number}>
              <button className={`fx ${day === today ? "today" : ""}`} disabled={future} onClick={() => onPick(i)}
                aria-label={`Matchday ${day}: ${future ? "locked until " + shortDate(date) : m.topic + " against " + m.opponent + ". " + text}`}>
                <span className="n">{String(day).padStart(2, "0")}</span>
                <span className="t">{future ? "Locked" : m.topic}<small>{future ? "Kicks off " + shortDate(date) : "v " + m.opponent}</small></span>
                <span className={`r ${cls}`}>{text}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </details>
  );
}
