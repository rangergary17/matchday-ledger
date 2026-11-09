import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { pack } from "./lib/content";
import { browserStore } from "./lib/storage";
import { load, recordCall, recordDrill, recordMatch, recordReplay, save as persist, score, streak, type SaveData } from "./lib/save";
import { dateKey, matchIndexFor, matchdayFor } from "./lib/schedule";
import { screen as track } from "./lib/analytics";
import { buildClub, cfgOf, wealth } from "./lib/club";
import { money } from "./ui/fmt";
import { ordinal, seasonOf, table } from "./lib/league";
import { ratings } from "./lib/skills";
import { dueToday } from "./lib/drills";
import { baseValues, draw, type Values } from "./lib/template";
import { commentary } from "./lib/commentary";
import { buzz, playSound } from "./lib/sound";
import { Scoreboard } from "./ui/Scoreboard";
import { TeamTalk } from "./ui/TeamTalk";
import { Chance, HALVES, MINUTES } from "./ui/Chance";
import { PenaltyView } from "./ui/Penalty";
import { FullTime } from "./ui/FullTime";
import { CallView } from "./ui/CallView";
import { Hub } from "./ui/Hub";
import { ClubView } from "./ui/ClubView";
import { TableView } from "./ui/TableView";
import { CardView } from "./ui/CardView";
import { Intro } from "./ui/Intro";
import { TabBar, type Tab } from "./ui/TabBar";
import { GoalBurst } from "./ui/GoalBurst";
import { reducedMotion } from "./ui/fmt";

const { season, matches } = pack;
const N = matches.length;
const store = browserStore();

type Kind = "daily" | "catchup" | "replay";
interface Play {
  kind: Kind;
  day: number;
  date: string;
  matchIndex: number;
  goals: boolean[];
  hints: number;
  pen: boolean | null;
}
type Screen =
  | { s: "hub" }
  | { s: "talk"; play: Play }
  | { s: "chance"; play: Play; q: number; picked: number | null; hint: boolean }
  | { s: "penalty"; play: Play; done: boolean }
  | { s: "fulltime"; play: Play }
  | { s: "call"; day: number; chosen: number | null }
  | { s: "drill"; match: number; values: Values; done: boolean };

function todayInfo() {
  const date = dateKey(new Date());
  const day = matchdayFor(date, season.startDate);
  return { date, day, matchIndex: matchIndexFor(day, N) };
}

export function App() {
  const [data, setData] = useState<SaveData>(() => load(store));
  const [today, setToday] = useState(todayInfo);
  const [screen, setScreen] = useState<Screen>({ s: "hub" });
  const [tab, setTab] = useState<Tab>("match");
  const [burst, setBurst] = useState({ n: 0, text: "" });
  const focusRef = useRef<HTMLElement | null>(null);
  const firstRender = useRef(true);
  const setFocus = (el: HTMLElement | null) => { focusRef.current = el; };

  const update = useCallback((next: SaveData) => { setData(next); persist(store, next); }, []);

  // Local midnight rollover.
  useEffect(() => {
    const check = () => setToday((prev) => (prev.date === dateKey(new Date()) ? prev : todayInfo()));
    const id = setInterval(check, 15_000);
    document.addEventListener("visibilitychange", check);
    return () => { clearInterval(id); document.removeEventListener("visibilitychange", check); };
  }, []);

  const records = useMemo(() => Object.values(data.records), [data.records]);
  const club = useMemo(() => buildClub(records, matches, season), [records]);
  const rows = useMemo(() => table(season.club.name, matches, records, today.day), [records, today.day]);
  const position = rows.findIndex((r) => r.you) + 1;
  const rate = useMemo(() => ratings(data, matches, season), [data]);
  const drills = useMemo(() => dueToday(data, today.date), [data, today.date]);
  const byNumber = useMemo(() => new Map(matches.map((m) => [m.number, m])), []);

  // Focus the new screen's heading for keyboard and screen reader users.
  const key = `${tab}-${screen.s}-${"q" in screen ? screen.q : ""}-${"match" in screen ? screen.match : ""}`;
  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return; }
    focusRef.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: reducedMotion() ? "auto" : "smooth" });
  }, [key]);

  const sound = data.settings.sound;
  const todayRecord = data.records[String(today.day)] ?? null;
  const prog = data.progress;
  const progressToday = prog && prog.kind === "daily" && prog.day === today.day && prog.date === today.date ? prog : null;

  // Matchdays this season that are in the past and unplayed.
  const seasonStart = seasonOf(today.day, N) * N + 1;
  const missed: { day: number; match: (typeof matches)[number] }[] = [];
  for (let d = Math.max(seasonStart, today.day - N + 1); d < today.day; d++) if (!data.records[String(d)]) missed.push({ day: d, match: matches[matchIndexFor(d, N)] });

  function startPlay(kind: Kind, day: number, matchIndex: number) {
    const date = today.date;
    const p = data.progress;
    const resume = kind !== "replay" && p && p.kind === kind && p.day === day ? p : null;
    const play: Play = { kind, day, date, matchIndex, goals: resume?.goals ?? [], hints: resume?.hints ?? 0, pen: null };
    setTab("match");
    if (resume && resume.goals.length > 0) {
      if (resume.goals.length >= 3) setScreen({ s: "penalty", play, done: false });
      else setScreen({ s: "chance", play, q: resume.goals.length, picked: null, hint: false });
    } else setScreen({ s: "talk", play });
  }

  function saveProgress(play: Play) {
    if (play.kind === "replay") return;
    update({ ...data, progress: { day: play.day, date: play.date, match: matches[play.matchIndex].number, kind: play.kind, goals: play.goals, hints: play.hints } });
  }

  function celebrate(goal: boolean, text = "Goal") {
    if (goal) { setBurst((b) => ({ n: b.n + 1, text })); playSound("goal", sound); buzz([40, 60, 120]); }
    else { playSound("conceded", sound); buzz([80]); }
  }

  // ---------- render helpers ----------
  const scoreboard = (play: Play, clock: string, now = -1) => {
    const s = score(play.goals, play.pen);
    const dots = [0, 1, 2, 3].map((i) => (i < play.goals.length ? (play.goals[i] ? "g" : "c") : i === 3 && play.pen !== null ? (play.pen ? "g" : "c") : i === now ? "now" : ""));
    return <Scoreboard club={season.club.name} opponent={matches[play.matchIndex].opponent} us={s.us} them={s.them} clock={clock} dots={dots} />;
  };
  const seed = (play: Play) => `${play.kind}:${play.day}:${play.matchIndex}`;

  function matchScreen() {
    switch (screen.s) {
      case "hub": {
        const pendingCalls = club.pendingCalls.map((r) => ({ record: r, match: byNumber.get(r.match)! }));
        return (
          <Hub ref={setFocus} act={(() => { const n = ((today.day - 1) % N) + 1; const i = season.acts.findIndex((a) => n >= a.from && n <= a.to); return i >= 0 ? { n: i + 1, title: season.acts[i].title, blurb: season.acts[i].blurb } : null; })()} day={today.day} match={matches[today.matchIndex]} today={todayRecord} inProgress={!!progressToday}
            pendingCalls={pendingCalls}
            drills={drills.map((d) => ({ due: d, match: byNumber.get(d.match)! }))}
            missed={missed}
            nextTopic={matches[matchIndexFor(today.day + 1, N)].topic}
            seasonOver={(today.day % N === 0) && !!todayRecord}
            position={ordinal(position)}
            onPlay={() => startPlay("daily", today.day, today.matchIndex)}
            onCall={(day) => setScreen({ s: "call", day, chosen: null })}
            onDrill={(m) => setScreen({ s: "drill", match: m, values: draw(byNumber.get(m)!.penalty, `${today.date}:${m}`), done: false })}
            onCatchUp={(day) => startPlay("catchup", day, matchIndexFor(day, N))} />
        );
      }
      case "talk": {
        const { play } = screen;
        const label = play.kind === "replay" ? "replay, doesn't count" : play.kind === "catchup" ? `catch-up, matchday ${play.day}` : `matchday ${play.day}`;
        return (<>
          {scoreboard(play, "Pre-match")}
          <TeamTalk ref={setFocus} match={matches[play.matchIndex]} label={label} onKickOff={() => {
            playSound("whistle", sound);
            track(play.kind === "daily" ? "/daily/kick-off" : "/replay/kick-off");
            setScreen({ s: "chance", play, q: 0, picked: null, hint: false });
          }} />
        </>);
      }
      case "chance": {
        const { play, q, picked, hint } = screen;
        const m = matches[play.matchIndex];
        const sd = `${seed(play)}:${q}`;
        const right = picked !== null && picked === m.questions[q].answer;
        return (<>
          {scoreboard(play, `${HALVES[q]} · ${MINUTES[q]}`, q)}
          <Chance key={q} ref={setFocus} question={m.questions[q]} index={q} opponent={m.opponent} picked={picked} hintShown={hint}
            build={commentary.build(sd, season.club.name, m.opponent)}
            after={right ? commentary.goal(sd, season.club.name, m.opponent) : commentary.conceded(sd, season.club.name, m.opponent)}
            onHint={() => { const p = { ...play, hints: play.hints + 1 }; setScreen({ ...screen, play: p, hint: true }); saveProgress(p); }}
            onAnswer={(i) => {
              if (picked !== null) return;
              const ok = i === m.questions[q].answer;
              const p = { ...play, goals: [...play.goals, ok] };
              setScreen({ ...screen, play: p, picked: i });
              saveProgress(p);
              celebrate(ok);
            }}
            onNext={() => setScreen(q < 2 ? { s: "chance", play, q: q + 1, picked: null, hint: false } : { s: "penalty", play, done: false })} />
        </>);
      }
      case "penalty": {
        const { play } = screen;
        const m = matches[play.matchIndex];
        return (<>
          {scoreboard(play, "90+2' · Penalty", 3)}
          <PenaltyView ref={setFocus} penalty={m.penalty} values={baseValues(m.penalty)} mode="penalty"
            intro={commentary.penalty(seed(play), season.club.name, m.opponent)}
            onHint={() => setScreen({ ...screen, play: { ...play, hints: play.hints + 1 } })}
            onResult={(ok) => {
              const p = { ...play, pen: ok };
              setScreen({ s: "penalty", play: p, done: true });
              if (ok) celebrate(true); else { playSound("saved", sound); buzz([80]); }
              if (play.kind === "replay") update(recordReplay(data, m.number, p.goals, ok));
              else {
                update(recordMatch(data, { day: play.day, date: play.date, match: m.number, kind: play.kind, goals: p.goals, pen: ok, hints: p.hints }));
                if (play.kind === "daily") track("/daily/full-time");
              }
            }}
            nextLabel="Full time"
            onNext={() => { playSound("whistle", sound); setScreen({ s: "fulltime", play: screen.play }); }} />
        </>);
      }
      case "fulltime": {
        const { play } = screen;
        const m = matches[play.matchIndex];
        const rec = data.records[String(play.day)];
        const pen = play.pen ?? false;
        return (<>
          <FullTime ref={setFocus} match={m} day={play.day} goals={play.goals} pen={pen} kind={play.kind}
            news={club.news.filter((n) => n.day === play.day)}
            rating={rate.overall} position={ordinal(position)}
            callPending={!!rec && rec.call === null}
            onCall={() => setScreen({ s: "call", day: play.day, chosen: null })}
            onReplay={() => startPlay("replay", play.day, play.matchIndex)}
            onDone={() => setScreen({ s: "hub" })} />
        </>);
      }
      case "call": {
        const rec = data.records[String(screen.day)];
        const m = rec ? byNumber.get(rec.match) : undefined;
        if (!rec || !m) return null;
        return (
          <CallView ref={setFocus} call={m.call} chosen={screen.chosen ?? rec.call}
            onChoose={(i) => {
              if (rec.call !== null) return;
              update(recordCall(data, screen.day, i));
              setScreen({ ...screen, chosen: i });
              track("/daily/call");
              if (i === m.call.best) { playSound("goal", sound); buzz([30, 40, 60]); }
            }}
            onDone={() => setScreen({ s: "hub" })} />
        );
      }
      case "drill": {
        const m = byNumber.get(screen.match)!;
        return (
          <PenaltyView key={`${screen.match}-${JSON.stringify(screen.values)}`} ref={setFocus} penalty={m.penalty} values={screen.values} mode="drill"
            intro={`Training ground: ${m.topic}. Same idea, new numbers.`}
            onHint={() => undefined}
            onResult={(ok) => {
              update(recordDrill(data, m.number, today.date, ok));
              setScreen({ ...screen, done: true });
              if (ok) celebrate(true, "Spot on"); else playSound("saved", sound);
              track("/drill");
            }}
            nextLabel="Back to the club" onNext={() => setScreen({ s: "hub" })} />
        );
      }
    }
  }

  const s = streak(data, today.date);
  const pendingBadge = club.pendingCalls.length > 0 || drills.length > 0 || !todayRecord;

  return (
    <div className="app">
      <a className="skip" href="#stage">Skip to the game</a>
      <header className="top">
        <h1>Biz<span>Ball</span></h1>
        <div className="top-right">
          {data.settings.introSeen && <span className="pill" aria-label="Your wealth">{money(wealth(club.state, cfgOf(season)))}</span>}
          {s > 0 && <span className="pill on">{s} day streak</span>}
        </div>
      </header>

      <main id="stage" className="stage">
        {!data.settings.introSeen ? (
          <Intro club={season.club.name} onStart={() => update({ ...data, settings: { ...data.settings, introSeen: true } })} />
        ) : tab === "match" ? matchScreen()
          : tab === "club" ? <ClubView ref={setFocus} club={club} season={season} position={position} teams={rows.length} />
          : tab === "table" ? (
            <TableView ref={setFocus} rows={rows} matches={matches} startDate={season.startDate} today={today.day} save={data}
              onPick={(day) => {
                const mi = matchIndexFor(day, N);
                if (data.records[String(day)]) startPlay("replay", day, mi);
                else if (day === today.day) startPlay("daily", day, mi);
                else startPlay("catchup", day, mi);
              }} />
          ) : (
            <CardView ref={setFocus} sound={sound} onSound={(on: boolean) => update({ ...data, settings: { ...data.settings, sound: on } })} name={data.settings.name} club={season.club.name} overall={rate.overall} skills={rate.skills}
              onName={(name) => update({ ...data, settings: { ...data.settings, name } })}
              onTrain={(mn) => { setTab("match"); setScreen({ s: "drill", match: mn, values: draw(byNumber.get(mn)!.penalty, `${Date.now()}:${mn}`), done: false }); }}
              onReplay={(mn) => {
                const idx = matches.findIndex((m) => m.number === mn);
                const rec = records.find((r) => r.match === mn);
                startPlay("replay", rec?.day ?? idx + 1, idx);
              }} />
          )}
      </main>
      {data.settings.introSeen && <TabBar tab={tab} onTab={(t) => { setTab(t); if (t === "match" && (screen.s === "fulltime" || screen.s === "call" || (screen.s === "drill" && screen.done))) setScreen({ s: "hub" }); }} badges={{ match: pendingBadge && tab !== "match" }} />}
      <GoalBurst trigger={burst.n} text={burst.text} />
    </div>
  );
}
