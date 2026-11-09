import React, { useEffect } from "react";
import type { MomentDef } from "../lib/moments";

/** Olympic-pictogram style limbs: thick, round-capped strokes. */
const Limb = ({ d, className = "" }: { d: string; className?: string }) => <path d={d} className={`limb ${className}`} />;

function KneeSlide() {
  return (
    <svg viewBox="0 0 400 220" className="scene ks" aria-hidden="true">
      <line x1="0" y1="190" x2="400" y2="190" className="ground" />
      <line x1="40" y1="190" x2="40" y2="150" className="pitchline" />
      <g className="flag">
        <line x1="362" y1="190" x2="362" y2="112" className="pole" />
        <path d="M362 112 L392 121 L362 130 Z" className="pennant" />
      </g>
      <g className="spray">
        {[0, 1, 2, 3, 4, 5].map((i) => <line key={i} x1={300 - i * 6} y1="188" x2={296 - i * 6} y2="182" className={`blade b${i}`} />)}
      </g>
      <g className="player">
        <g transform="translate(300 188)">
          <Limb d="M0 0 L-36 0" />
          <Limb d="M0 0 L-8 -32" />
          <Limb d="M-8 -32 L-22 -62" className="torso" />
          <g className="arms">
            <Limb d="M-21 -58 L4 -74 L14 -96" />
            <Limb d="M-21 -58 L-46 -70 L-58 -92" />
          </g>
          <circle cx="-27" cy="-80" r="10.5" className="head" />
        </g>
      </g>
    </svg>
  );
}

function Nutmeg() {
  return (
    <svg viewBox="0 0 400 220" className="scene nm" aria-hidden="true">
      <line x1="0" y1="190" x2="400" y2="190" className="ground" />
      <g className="net">
        {[0, 1, 2, 3, 4, 5, 6].map((i) => <line key={`v${i}`} x1={282 + i * 15} y1="74" x2={286 + i * 15} y2="190" className="mesh" />)}
        {[0, 1, 2, 3, 4, 5].map((i) => <line key={`h${i}`} x1="276" y1={88 + i * 19} x2="376" y2={88 + i * 19} className="mesh" />)}
      </g>
      <path d="M270 190 L270 68 L384 68 L384 190" className="frame" />
      <g className="keeper">
        <Limb d="M325 146 L304 190" />
        <Limb d="M325 146 L346 190" />
        <Limb d="M325 146 L325 110" className="torso" />
        <g className="arms-out">
          <Limb d="M325 114 L300 136" />
          <Limb d="M325 114 L350 136" />
        </g>
        <g className="arms-head">
          <Limb d="M325 114 L304 104 L316 86" />
          <Limb d="M325 114 L346 104 L334 86" />
        </g>
        <circle cx="325" cy="94" r="10" className="head" />
      </g>
      <g className="ball">
        <circle cx="362" cy="182" r="8" className="ballc" />
        <path d="M356 178 L368 186 M362 174 L362 190" className="seam" />
      </g>
      <g className="dots">
        <circle cx="344" cy="62" r="3" /><circle cx="354" cy="52" r="3.5" /><circle cx="366" cy="40" r="4" />
      </g>
    </svg>
  );
}

const SCENES: Record<string, () => React.JSX.Element> = { "knee-slide": KneeSlide, nutmeg: Nutmeg };

export function Moment({ moment, onDone }: { moment: MomentDef; onDone: () => void }) {
  useEffect(() => {
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const id = setTimeout(onDone, reduced ? 1800 : 2600);
    const key = (e: KeyboardEvent) => { if (e.key === "Escape" || e.key === "Enter" || e.key === " ") onDone(); };
    window.addEventListener("keydown", key);
    return () => { clearTimeout(id); window.removeEventListener("keydown", key); };
  }, [onDone]);
  const Scene = SCENES[moment.id];
  return (
    <div className={`moment ${moment.kind}`} onClick={onDone} role="status">
      <div className="moment-card">
        {Scene && <Scene />}
        <div className="moment-cap">
          <span className="moment-kind">{moment.kind === "goal" ? "Goal" : "Conceded"}</span>
          <b>{moment.title}</b>
          <span className="moment-quip">{moment.quip}</span>
        </div>
        <span className="moment-skip" aria-hidden="true">Tap to skip</span>
      </div>
    </div>
  );
}
