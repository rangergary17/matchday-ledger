/**
 * Everything the game remembers, as one versioned JSON blob in the
 * browser. Club money, league table and skill ratings are all worked out
 * from these records, so nothing can drift out of step, and version 2
 * sign-in only has to sync this one object.
 */
import type { KeyValueStore } from "./storage";
import { addDays } from "./schedule";

export type Outcome = "win" | "draw" | "loss";

export interface MatchRecord {
  /** Matchday slot in the league (1, 2, 3...). */
  day: number;
  /** Local date it was played. */
  date: string;
  /** Content match number. */
  match: number;
  /** "daily" = played on its day (counts for streak). "catchup" = a missed matchday played later. */
  kind: "daily" | "catchup";
  /** The 3 chances: true = your goal, false = conceded. */
  goals: boolean[];
  /** The penalty: true = scored. */
  pen: boolean;
  hints: number;
  /** Chairman's call option chosen, or null if not made yet. */
  call: number | null;
  /** Order of completion. */
  seq: number;
}

export interface DrillRecord {
  match: number;
  date: string;
  correct: boolean;
  seq: number;
}

export interface Progress {
  day: number;
  date: string;
  match: number;
  kind: "daily" | "catchup";
  goals: boolean[];
  hints: number;
}

export interface SaveData {
  version: 2;
  seq: number;
  records: Record<string, MatchRecord>;
  /** Latest replay per match number. Never counted. */
  replays: Record<string, { goals: boolean[]; pen: boolean }>;
  drills: DrillRecord[];
  progress: Progress | null;
  settings: { sound: boolean; introSeen: boolean; name: string };
}

const KEY = "matchday-ledger:v2";

export function emptySave(): SaveData {
  return { version: 2, seq: 0, records: {}, replays: {}, drills: [], progress: null, settings: { sound: false, introSeen: false, name: "" } };
}

export function load(store: KeyValueStore): SaveData {
  try {
    const raw = store.get(KEY);
    if (!raw) return emptySave();
    const d = JSON.parse(raw) as Partial<SaveData>;
    if (d.version !== 2) return emptySave();
    const e = emptySave();
    return {
      version: 2,
      seq: d.seq ?? 0,
      records: d.records ?? {},
      replays: d.replays ?? {},
      drills: Array.isArray(d.drills) ? d.drills : [],
      progress: d.progress ?? null,
      settings: { ...e.settings, ...(d.settings ?? {}) },
    };
  } catch {
    return emptySave();
  }
}

export function save(store: KeyValueStore, data: SaveData): void {
  try {
    store.set(KEY, JSON.stringify(data));
  } catch {
    /* never crash the game over storage */
  }
}

export function score(goals: boolean[], pen: boolean | null = null): { us: number; them: number } {
  const us = goals.filter(Boolean).length + (pen ? 1 : 0);
  return { us, them: goals.filter((g) => !g).length };
}

export function outcome(goals: boolean[], pen: boolean | null = null): Outcome {
  const { us, them } = score(goals, pen);
  return us > them ? "win" : us < them ? "loss" : "draw";
}

/** Saves a finished match. A matchday can only be played for real once. */
export function recordMatch(data: SaveData, r: Omit<MatchRecord, "seq" | "call">): SaveData {
  if (data.records[String(r.day)]) return { ...data, progress: null };
  const seq = data.seq + 1;
  return { ...data, seq, progress: null, records: { ...data.records, [String(r.day)]: { ...r, call: null, seq } } };
}

export function recordCall(data: SaveData, day: number, option: number): SaveData {
  const r = data.records[String(day)];
  if (!r || r.call !== null) return data;
  return { ...data, records: { ...data.records, [String(day)]: { ...r, call: option } } };
}

export function recordReplay(data: SaveData, match: number, goals: boolean[], pen: boolean): SaveData {
  return { ...data, replays: { ...data.replays, [String(match)]: { goals, pen } } };
}

export function recordDrill(data: SaveData, match: number, date: string, correct: boolean): SaveData {
  const seq = data.seq + 1;
  return { ...data, seq, drills: [...data.drills, { match, date, correct, seq }] };
}

/** Consecutive days with the daily match played, ending today (or yesterday if today isn't played yet). */
export function streak(data: SaveData, today: string): number {
  const days = new Set(Object.values(data.records).filter((r) => r.kind === "daily").map((r) => r.date));
  let day = days.has(today) ? today : addDays(today, -1);
  let n = 0;
  while (days.has(day)) {
    n++;
    day = addDays(day, -1);
  }
  return n;
}

export function record(records: MatchRecord[]): { w: number; d: number; l: number } {
  const r = { w: 0, d: 0, l: 0 };
  for (const m of records) {
    const o = outcome(m.goals, m.pen);
    if (o === "win") r.w++;
    else if (o === "draw") r.d++;
    else r.l++;
  }
  return r;
}
