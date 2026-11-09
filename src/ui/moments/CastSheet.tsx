import { CAST, Defs, FrontBust, SidePlayer, type Look } from "./rig";

/*
 * Reference sheet for the cast: front and side view of each character
 * on a plain background. Open with ?cast (everyone) or ?cast=<name>.
 * Used as character references when generating video clips.
 */
const NAMES: Record<string, string> = {
  captain: "The Captain", striker: "The Striker", maestro: "The Maestro", stopper: "The Stopper",
  keeper: "Their keeper", homeKeeper: "Our keeper", rival: "The Rival", referee: "The Referee",
};

function Card({ id, look }: { id: string; look: Look }) {
  return (
    <figure className="cast-card">
      <svg viewBox="0 0 300 240" aria-label={NAMES[id]}>
        <Defs />
        <rect width="300" height="240" fill="#eceeec" />
        <FrontBust look={look} cls="cs-f" x={95} y={232} s={1.45} face="neutral" />
        <SidePlayer look={look} cls="cs-s" x={225} y={150} s={1.55} />
      </svg>
      <figcaption>{NAMES[id] ?? id}</figcaption>
    </figure>
  );
}

export function CastSheet({ only }: { only: string }) {
  const ids = Object.keys(CAST).filter((k) => !only || k === only);
  return (
    <main className="cast-sheet">
      {ids.map((id) => <Card key={id} id={id} look={CAST[id as keyof typeof CAST]} />)}
    </main>
  );
}

export function castParam(): string | null {
  if (typeof location === "undefined") return null;
  return new URLSearchParams(location.search).get("cast");
}
