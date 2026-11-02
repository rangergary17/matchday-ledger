import type { Penalty } from "./template";

/**
 * Content format. Every match lives in its own JSON file under
 * content/matches/. Adding a match never needs a code change.
 */

export interface Term {
  term: string;
  meaning: string;
}

/**
 * Machine-checkable version of a question. `formula` is evaluated with
 * `vars` by src/lib/calc.ts and must equal the correct option.
 * Version 2 practice mode can reuse this to generate fresh numbers.
 */
export interface Calc {
  vars: Record<string, number>;
  formula: string;
}

export interface Question {
  prompt: string;
  /** Exactly 4 options. */
  options: string[];
  /** Index (0-3) of the correct option. */
  answer: number;
  hint: string;
  /** The full working, one step per line. Every "a x b = c" is checked by the test suite. */
  working: string[];
  /** One entry per option: why that option is wrong. `null` at the correct answer. */
  whyNot: (string | null)[];
  /** "calc" questions must have `calc`. "concept" questions are judgement calls with no single formula. */
  kind: "calc" | "concept";
  calc?: Calc;
  /** Rule-of-thumb figures quoted in the text that are not computed (e.g. "70%"). */
  benchmarks?: string[];
}

export type SkillKey = "PRF" | "PRI" | "CSH" | "GRO" | "PLN" | "INV";

/** Changes to the club. cash is one-off; fans, contrib (per fan) and fixed (per matchday) last. */
export interface Effects {
  cash?: number;
  fans?: number;
  contrib?: number;
  fixed?: number;
}

export interface CallOption {
  label: string;
  effects: Effects;
  /** What happens and why, shown after choosing. Sums are checked by the tests. */
  result: string;
  /** A consequence that lands a few matchdays later. */
  later?: { after: number; text: string; effects: Effects };
}

/** The Chairman's call: today's idea applied to your own club. */
export interface Call {
  title: string;
  prompt: string;
  options: CallOption[];
  best: number;
}

export interface Match {
  number: number;
  topic: string;
  skill: SkillKey;
  opponent: string;
  /** Team talk: the concept in 2-3 sentences. */
  talk: string;
  /** Exactly 3 key terms. */
  terms: Term[];
  /** Exactly 3 questions: first half, second half, extra time. */
  questions: Question[];
  /** Typed-answer question taken after the 3 chances. Also used for training drills. */
  penalty: Penalty;
  call: Call;
  /** One line shown at full time. */
  takeaway: string;
}

/**
 * A pack is a season of matches plus the club you play as.
 * Version 2 "club packs" for a specific business are just another pack.
 */
export interface ClubState {
  cash: number;
  fans: number;
  /** Profit per fan per matchday. */
  contrib: number;
  /** Costs per matchday whatever the crowd. */
  fixed: number;
  /** Board confidence, 0 to 100. */
  board: number;
}

export interface Season {
  id: string;
  name: string;
  club: { name: string; role: string; start: ClubState; capacity: number };
  skills: { key: SkillKey; name: string }[];
  /** Local date (YYYY-MM-DD) of matchday 1. */
  startDate: string;
}

export interface Pack {
  season: Season;
  matches: Match[];
}
