import { rng } from "./template";

const BUILD = [
  "{club} win it back in midfield and push forward.",
  "A quick one-two on the edge of the box. Here's a chance.",
  "{club} break down the left. The cross is coming in.",
  "The captain picks up the ball and looks up.",
  "Corner to {club}. The big men go forward.",
  "{opp} lose it cheaply. {club} pounce.",
  "Neat passing from {club}. The crowd is up.",
];
const GOAL = [
  "Back of the net. The home end erupts.",
  "Top corner. The keeper had no chance.",
  "Slotted home. Cool as you like.",
  "A thumping finish. What a goal.",
];
const CONCEDED = [
  "Wrong pass. {opp} break and score.",
  "Caught out at the back. {opp} make it count.",
  "The move breaks down, and {opp} punish it.",
  "{opp} counter at pace. That's a goal against.",
];
const PEN = [
  "Penalty to {club}. Stoppage time. Everyone holds their breath.",
  "Hand ball. The referee points to the spot.",
  "Brought down in the box. Penalty.",
];

function pick(list: string[], seed: string, club: string, opp: string): string {
  const i = Math.floor(rng(seed)() * list.length);
  return list[i].replaceAll("{club}", club).replaceAll("{opp}", opp);
}

export const commentary = {
  build: (seed: string, club: string, opp: string) => pick(BUILD, `b${seed}`, club, opp),
  goal: (seed: string, club: string, opp: string) => pick(GOAL, `g${seed}`, club, opp),
  conceded: (seed: string, club: string, opp: string) => pick(CONCEDED, `c${seed}`, club, opp),
  penalty: (seed: string, club: string, opp: string) => pick(PEN, `p${seed}`, club, opp),
};
