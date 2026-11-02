import type { KeyValueStore } from "./storage";
import { addDays } from "./schedule";

export type Outcome = "win" | "draw" | "loss";

/** A finished daily match. Only daily matches count for streak and record. */
export interface DailyResult {
  day: number;
  date: string;
  match: number;
  /** true = your goal, false = conceded, in question order. */
  goals: boolean[];
  hints: number;
}

/** Today's match while it is being played, so a refresh resumes instead of restarting. */
export interface Progress {
  date: string;
  match: number;
  goals: boolean[];
  hints: number;
}

export interface SaveData {
  version: 1;
  /** Keyed by local date (YYYY-MM-DD). */
  daily: Record<string, DailyResult>;
  /** Latest replay score per match number. Shown in the fixture list, never counted. */
  replays: Record<string, boolean[]>;
  progress: Progress | null;
}

const KEY = "matchday-ledger:v1";

export function emptySave(): SaveData {
  return { version: 1, daily: {}, replays: {}, progress: null };
}

export function load(store: KeyValueStore): SaveData {
  try {
    const raw = store.get(KEY);
    if (!raw) return emptySave();
    const data = JSON.parse(raw) as Partial<SaveData>;
    if (data.version !== 1) return emptySave();
    return {
      version: 1,
      daily: data.daily ?? {},
      replays: data.replays ?? {},
      progress: data.progress ?? null,
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

export function score(goals: boolean[]): { us: number; them: number } {
  const us = goals.filter(Boolean).length;
  return { us, them: goals.length - us };
}

export function outcome(goals: boolean[]): Outcome {
  const { us, them } = score(goals);
  return us > them ? "win" : us < them ? "loss" : "draw";
}

/** Records today's result. The first finished attempt of the day is the one that counts. */
export function recordDaily(data: SaveData, result: DailyResult): SaveData {
  if (data.daily[result.date]) return { ...data, progress: null };
  return { ...data, daily: { ...data.daily, [result.date]: result }, progress: null };
}

export function recordReplay(data: SaveData, match: number, goals: boolean[]): SaveData {
  return { ...data, replays: { ...data.replays, [String(match)]: goals } };
}

/**
 * Consecutive days played, ending today. If today is not played yet the
 * streak from yesterday is still alive and is shown.
 */
export function streak(data: SaveData, today: string): number {
  let day = data.daily[today] ? today : addDays(today, -1);
  let n = 0;
  while (data.daily[day]) {
    n++;
    day = addDays(day, -1);
  }
  return n;
}

export function seasonRecord(data: SaveData): { w: number; d: number; l: number } {
  const r = { w: 0, d: 0, l: 0 };
  for (const res of Object.values(data.daily)) {
    const o = outcome(res.goals);
    if (o === "win") r.w++;
    else if (o === "draw") r.d++;
    else r.l++;
  }
  return r;
}
