/**
 * A slice of pitch above each chance. The ball sits in midfield, then flies
 * into their net on a goal, back toward yours when you concede.
 */
export type BallState = "build" | "goal" | "conceded" | "spot" | "saved";

export function PitchStrip({ state }: { state: BallState }) {
  const x = { build: 50, spot: 82, goal: 97, conceded: 3, saved: 88 }[state];
  return (
    <div className={`pitch pitch-${state}`} aria-hidden="true">
      <svg viewBox="0 0 100 24" preserveAspectRatio="none">
        <rect x="0" y="0" width="100" height="24" className="turf" />
        <line x1="50" y1="0" x2="50" y2="24" className="ln" />
        <circle cx="50" cy="12" r="5" className="ln" fill="none" />
        <rect x="0" y="5" width="12" height="14" className="ln" fill="none" />
        <rect x="88" y="5" width="12" height="14" className="ln" fill="none" />
        <rect x="-1" y="9" width="2.5" height="6" className="net left" />
        <rect x="98.5" y="9" width="2.5" height="6" className="net right" />
      </svg>
      <span className="ball" style={{ left: `${x}%` }} />
    </div>
  );
}
