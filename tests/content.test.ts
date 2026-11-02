import { describe, expect, it } from "vitest";
import { pack } from "../src/lib/content";

const { season, matches } = pack;

/** Real clubs and leagues that must never appear. Not exhaustive: a guard against the obvious. */
const REAL = [
  "Arsenal", "Chelsea", "Liverpool", "Manchester", "Tottenham", "Everton", "Newcastle", "Aston Villa",
  "West Ham", "Leicester", "Leeds", "Celtic FC", "Rangers FC", "Barcelona", "Real Madrid", "Atletico",
  "Bayern", "Dortmund", "Juventus", "Inter Milan", "AC Milan", "Napoli", "Roma", "Lazio", "PSG",
  "Paris Saint", "Ajax", "PSV", "Feyenoord", "Benfica", "Porto", "Sporting", "Galatasaray", "LA Galaxy",
  "Inter Miami", "Premier League", "La Liga", "Bundesliga", "Serie A", "Ligue 1", "Champions League",
  "MLS", "Wrexham", "Messi", "Ronaldo", "Haaland", "Mbapp", "Beckham",
];

function allText(): string[] {
  const out: string[] = [season.club.name, season.club.role];
  for (const m of matches) {
    out.push(m.topic, m.opponent, m.talk, m.takeaway);
    for (const t of m.terms) out.push(t.term, t.meaning);
    for (const q of m.questions) {
      out.push(q.prompt, q.hint, ...q.options, ...q.working, ...q.whyNot.filter((w): w is string => !!w));
    }
  }
  return out;
}

describe("season", () => {
  it("has 30 matches numbered 1 to 30", () => {
    expect(matches.map((m) => m.number)).toEqual(Array.from({ length: 30 }, (_, i) => i + 1));
  });
  it("has a valid start date", () => {
    expect(season.startDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
  it("every opponent and topic is unique", () => {
    expect(new Set(matches.map((m) => m.opponent)).size).toBe(matches.length);
    expect(new Set(matches.map((m) => m.topic)).size).toBe(matches.length);
  });
});

describe.each(matches.map((m) => [m.number, m] as const))("match %i shape", (_, m) => {
  it("has a 2-3 sentence team talk and 3 terms", () => {
    const sentences = m.talk.split(/(?<=[.!?])\s+/).filter(Boolean).length;
    expect(sentences).toBeGreaterThanOrEqual(2);
    expect(sentences).toBeLessThanOrEqual(3);
    expect(m.terms).toHaveLength(3);
    for (const t of m.terms) expect(t.term && t.meaning).toBeTruthy();
    expect(m.takeaway.length).toBeGreaterThan(10);
  });
  it("has 3 questions with 4 options, a hint, working and a why-not for each wrong option", () => {
    expect(m.questions).toHaveLength(3);
    for (const q of m.questions) {
      expect(q.options).toHaveLength(4);
      expect(new Set(q.options).size).toBe(4);
      expect(q.answer).toBeGreaterThanOrEqual(0);
      expect(q.answer).toBeLessThan(4);
      expect(q.hint.length).toBeGreaterThan(5);
      expect(q.working.length).toBeGreaterThan(0);
      expect(q.whyNot).toHaveLength(4);
      q.whyNot.forEach((w, i) => {
        if (i === q.answer) expect(w).toBeNull();
        else expect(typeof w === "string" && w.length > 15, `why-not for "${q.options[i]}"`).toBe(true);
      });
      expect(["calc", "concept"]).toContain(q.kind);
    }
  });
});

describe("writing rules", () => {
  const text = allText();
  it("no em dashes or en dashes", () => {
    expect(text.filter((t) => /[—–]/.test(t))).toEqual([]);
  });
  it("no real clubs, leagues or players", () => {
    const hits = text.flatMap((t) => REAL.filter((r) => t.toLowerCase().includes(r.toLowerCase())).map((r) => `${r}: ${t.slice(0, 60)}`));
    expect(hits).toEqual([]);
  });
  it("no HTML in content", () => {
    expect(text.filter((t) => /<[a-z/]/i.test(t))).toEqual([]);
  });
});
