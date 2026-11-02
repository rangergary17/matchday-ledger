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

export interface Match {
  number: number;
  topic: string;
  opponent: string;
  /** Team talk: the concept in 2-3 sentences. */
  talk: string;
  /** Exactly 3 key terms. */
  terms: Term[];
  /** Exactly 3 questions: first half, second half, extra time. */
  questions: Question[];
  /** One line shown at full time. */
  takeaway: string;
}

/**
 * A pack is a season of matches plus the club you play as.
 * Version 2 "club packs" for a specific business are just another pack.
 */
export interface Season {
  id: string;
  name: string;
  club: { name: string; role: string };
  /** Local date (YYYY-MM-DD) of matchday 1. */
  startDate: string;
}

export interface Pack {
  season: Season;
  matches: Match[];
}
