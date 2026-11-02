import type { Match, Pack, Season } from "./types";
import season from "../../content/season.json";

const files = import.meta.glob<Match>("../../content/matches/*.json", {
  eager: true,
  import: "default",
});

export const pack: Pack = {
  season: season as Season,
  matches: Object.values(files).sort((a, b) => a.number - b.number),
};
