import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { pack } from "./lib/content";
import { browserStore } from "./lib/storage";
import { load, recordDaily, recordReplay, save as persist, score, seasonRecord, streak, type SaveData } from "./lib/results";
import { dateKey, matchIndexFor, matchdayFor } from "./lib/schedule";
import { screen } from "./lib/analytics";
import { Scoreboard } from "./components/Scoreboard";
import { TeamTalk } from "./components/TeamTalk";
import { HALVES, MINUTES, QuestionView } from "./components/QuestionView";
import { FullTime } from "./components/FullTime";
import { Fixtures } from "./components/Fixtures";

const { season, matches } = pack;
const store = browserStore();

type Phase =
  | { name: "talk" }
  | { name: "question"; q: number; picked: number | null; hint: boolean }
  | { name: "fulltime" };

interface Play {
  replay: boolean;
  matchIndex: number;
  /** Matchday number and date this play belongs to (daily only counts for this date). */
  day: number;
  date: string;
  goals: boolean[];
  hints: number;
  phase: Phase;
}

function todayInfo() {
  const date = dateKey(new Date());
  const day = matchdayFor(date, season.startDate);
  return { date, day, matchIndex: matchIndexFor(day, matches.length) };
}

/** Today's daily match, resuming a finished or half-played match if there is one. */
function dailyPlay(data: SaveData): Play {
  const t = todayInfo();
  const done = data.daily[t.date];
  if (done) return { replay: false, ...t, goals: done.goals, hints: done.hints, phase: { name: "fulltime" } };
  const prog = data.progress;
  if (prog && prog.date === t.date && prog.match === matches[t.matchIndex].number && prog.goals.length > 0) {
    return { replay: false, ...t, goals: prog.goals, hints: prog.hints, phase: { name: "question", q: prog.goals.length, picked: null, hint: false } };
  }
  return { replay: false, ...t, goals: [], hints: 0, phase: { name: "talk" } };
}

export function App() {
  const [data, setData] = useState<SaveData>(() => load(store));
  const [play, setPlay] = useState<Play>(() => dailyPlay(load(store)));
  const [today, setToday] = useState(todayInfo);
  const focusRef = useRef<HTMLElement | null>(null);
  const firstRender = useRef(true);

  const update = useCallback((next: SaveData) => {
    setData(next);
    persist(store, next);
  }, []);

  // Roll over at local midnight, and when the tab comes back after a while.
  useEffect(() => {
    const check = () => setToday((prev) => (prev.date === dateKey(new Date()) ? prev : todayInfo()));
    const id = setInterval(check, 15_000);
    document.addEventListener("visibilitychange", check);
    return () => { clearInterval(id); document.removeEventListener("visibilitychange", check); };
  }, []);
  useEffect(() => {
    // A new day: move to the new match unless someone is mid-question.
    setPlay((p) => (!p.replay && p.date !== today.date && p.phase.name !== "question" ? dailyPlay(load(store)) : p));
  }, [today.date]);

  // Move keyboard and screen reader focus to the new screen's heading.
  const phaseKey = `${play.replay}-${play.matchIndex}-${play.phase.name}-${play.phase.name === "question" ? play.phase.q : ""}`;
  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return; }
    focusRef.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }, [phaseKey]);

  const match = matches[play.matchIndex];
  const { us, them } = score(play.goals);

  function kickOff() {
    screen(play.replay ? "/replay/kick-off" : "/daily/kick-off");
    setPlay({ ...play, phase: { name: "question", q: 0, picked: null, hint: false } });
  }

  function showHint() {
    if (play.phase.name !== "question") return;
    const hints = play.hints + 1;
    setPlay({ ...play, hints, phase: { ...play.phase, hint: true } });
    if (!play.replay) update({ ...data, progress: { date: play.date, match: match.number, goals: play.goals, hints } });
  }

  function answer(i: number) {
    if (play.phase.name !== "question" || play.phase.picked !== null) return;
    const q = match.questions[play.phase.q];
    const goals = [...play.goals, i === q.answer];
    setPlay({ ...play, goals, phase: { ...play.phase, picked: i } });
    if (!play.replay) update({ ...data, progress: { date: play.date, match: match.number, goals, hints: play.hints } });
  }

  function next() {
    if (play.phase.name !== "question") return;
    if (play.phase.q < 2) {
      setPlay({ ...play, phase: { name: "question", q: play.phase.q + 1, picked: null, hint: false } });
      return;
    }
    if (play.replay) {
      update(recordReplay(data, match.number, play.goals));
      screen("/replay/full-time");
    } else {
      update(recordDaily(data, { day: play.day, date: play.date, match: match.number, goals: play.goals, hints: play.hints }));
      screen("/daily/full-time");
    }
    setPlay({ ...play, phase: { name: "fulltime" } });
  }

  function startReplay(matchIndex: number) {
    setPlay({ replay: true, matchIndex, day: play.day, date: play.date, goals: [], hints: 0, phase: { name: "talk" } });
  }

  function pickFixture(matchIndex: number) {
    if (matchIndex === today.matchIndex && !data.daily[today.date]) setPlay(dailyPlay(data));
    else startReplay(matchIndex);
  }

  const s = streak(data, today.date);
  const rec = seasonRecord(data);
  const clock = useMemo(() => {
    if (play.phase.name === "talk") return "Pre-match team talk";
    if (play.phase.name === "fulltime") return "Full time";
    return `${HALVES[play.phase.q]} · ${MINUTES[play.phase.q]}`;
  }, [play.phase]);
  const nextTopic = matches[matchIndexFor(today.day + 1, matches.length)].topic;
  const setFocus = (el: HTMLElement | null) => { focusRef.current = el; };

  return (
    <div className="wrap">
      <a className="skip" href="#stage">Skip to the match</a>
      <header className="top">
        <div>
          <p className="eyebrow">
            {play.replay ? "Replay" : "Today"} · Matchday {play.replay ? play.matchIndex + 1 : play.day} · {match.topic}
          </p>
          <h1>Matchday Ledger</h1>
        </div>
        <div className="stats">
          <div className="streak">{s ? `${s}-day streak` : "Play daily to build a streak"}</div>
          <div className="record" aria-label={`Season record: ${rec.w} won, ${rec.d} drawn, ${rec.l} lost`}>
            W {rec.w} · D {rec.d} · L {rec.l}
          </div>
        </div>
      </header>

      <Scoreboard club={season.club.name} role={season.club.role} opponent={match.opponent} us={us} them={them} clock={clock} />

      <main id="stage" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {play.phase.name === "talk" && <TeamTalk ref={setFocus} match={match} replay={play.replay} onKickOff={kickOff} />}
        {play.phase.name === "question" && (
          <QuestionView
            key={play.phase.q}
            ref={setFocus}
            question={match.questions[play.phase.q]}
            index={play.phase.q}
            opponent={match.opponent}
            picked={play.phase.picked}
            hintShown={play.phase.hint}
            onHint={showHint}
            onAnswer={answer}
            onNext={next}
          />
        )}
        {play.phase.name === "fulltime" && (
          <FullTime
            ref={setFocus}
            match={match}
            day={play.day}
            goals={play.goals}
            replay={play.replay}
            nextTopic={nextTopic}
            onReplay={() => startReplay(play.matchIndex)}
            onBackToToday={() => setPlay(dailyPlay(data))}
          />
        )}
      </main>

      <Fixtures matches={matches} startDate={season.startDate} today={today.day} save={data} onPick={pickFixture} />
      <p className="foot">A new match every day at midnight, your time. Your results stay on this device. No account, no ads.</p>
    </div>
  );
}
