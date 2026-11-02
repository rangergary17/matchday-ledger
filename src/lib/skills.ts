/**
 * Skill ratings for the Chairman card. Each topic has a mastery score from
 * 0 to 1: your first match on it sets it, training drills move it.
 * A skill's rating runs from 40 (untried) to 99 (mastered every topic).
 */
import type { Match, Season, SkillKey } from "./types";
import type { SaveData } from "./save";

export function topicScores(data: SaveData): Map<number, number> {
  type Ev = { seq: number; match: number; first?: number; correct?: boolean };
  const evs: Ev[] = [
    ...Object.values(data.records).map((r) => ({ seq: r.seq, match: r.match, first: (r.goals.filter(Boolean).length + (r.pen ? 1 : 0)) / 4 })),
    ...data.drills.map((d) => ({ seq: d.seq, match: d.match, correct: d.correct })),
  ].sort((a, b) => a.seq - b.seq);
  const s = new Map<number, number>();
  for (const e of evs) {
    const cur = s.get(e.match);
    if (e.first !== undefined) {
      s.set(e.match, cur === undefined ? e.first : Math.max(cur, e.first));
    } else if (cur !== undefined || e.correct) {
      const base = cur ?? 0;
      s.set(e.match, e.correct ? base + (1 - base) * 0.5 : base * 0.6);
    }
  }
  return s;
}

export interface SkillRating {
  key: SkillKey;
  name: string;
  rating: number;
  topics: { number: number; topic: string; score: number | null }[];
}

export function ratings(data: SaveData, matches: Match[], season: Season): { skills: SkillRating[]; overall: number } {
  const scores = topicScores(data);
  const skills = season.skills.map((sk) => {
    const topics = matches.filter((m) => m.skill === sk.key).map((m) => ({ number: m.number, topic: m.topic, score: scores.get(m.number) ?? null }));
    const avg = topics.length ? topics.reduce((a, t) => a + (t.score ?? 0), 0) / topics.length : 0;
    return { key: sk.key, name: sk.name, rating: Math.round(40 + 59 * avg), topics };
  });
  const overall = Math.round(skills.reduce((a, s) => a + s.rating, 0) / skills.length);
  return { skills, overall };
}

export function tier(overall: number): "bronze" | "silver" | "gold" {
  return overall >= 70 ? "gold" : overall >= 55 ? "silver" : "bronze";
}
