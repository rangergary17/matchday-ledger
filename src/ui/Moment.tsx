import React, { useEffect, useMemo } from "react";
import type { MomentDef } from "../lib/moments";

/*
 * Broadcast-style goal and concede moments. A night stadium drawn in
 * perspective (2.5D): floodlights, a crowd that reacts, a pitch that
 * recedes to the horizon, and shaded figures that move toward or away
 * from the camera. The "camera" pushes in for joy and shakes for anger.
 * Everything is original drawing: no footage, clubs or players.
 */

const W = 400;

function Defs() {
  return (
    <defs>
      <linearGradient id="mo-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#030b07" />
        <stop offset="1" stopColor="#0c2418" />
      </linearGradient>
      <linearGradient id="mo-beam" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#ffffff" stopOpacity="0.38" />
        <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
      </linearGradient>
      <linearGradient id="mo-shirt" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#14a35a" />
        <stop offset="0.55" stopColor="#0a6b3a" />
        <stop offset="1" stopColor="#053d20" />
      </linearGradient>
      <linearGradient id="mo-keeper" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#8a9590" />
        <stop offset="0.55" stopColor="#5b6662" />
        <stop offset="1" stopColor="#343c39" />
      </linearGradient>
      <linearGradient id="mo-limb" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#3c4642" />
        <stop offset="1" stopColor="#0b1310" />
      </linearGradient>
      <radialGradient id="mo-head" cx="0.35" cy="0.3" r="0.8">
        <stop offset="0" stopColor="#5d6964" />
        <stop offset="0.6" stopColor="#1a2420" />
        <stop offset="1" stopColor="#060a08" />
      </radialGradient>
      <radialGradient id="mo-ball" cx="0.35" cy="0.3" r="0.75">
        <stop offset="0" stopColor="#ffffff" />
        <stop offset="0.7" stopColor="#e3e7e4" />
        <stop offset="1" stopColor="#9aa59f" />
      </radialGradient>
      <radialGradient id="mo-shadow">
        <stop offset="0" stopColor="#000" stopOpacity="0.55" />
        <stop offset="1" stopColor="#000" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="mo-lamp">
        <stop offset="0" stopColor="#ffffff" />
        <stop offset="0.4" stopColor="#f3fff7" stopOpacity="0.8" />
        <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
      </radialGradient>
    </defs>
  );
}

/** Night stadium: sky, floodlights, four rows of crowd, a pitch in perspective. */
function Stadium() {
  const rows = useMemo(() => {
    const out: { x: number; y: number; s: number; c: string; d: number }[][] = [];
    const tones = ["#16241d", "#1d2e25", "#24382d", "#2b4135", "#0a6b3a", "#e9efe9"];
    for (let r = 0; r < 4; r++) {
      const y = 96 + r * 15, s = 0.8 + r * 0.14, row = [];
      for (let x = -4 + (r % 2) * 5; x < W + 8; x += 9 + r) {
        const k = (x * 7 + r * 13) % 23;
        row.push({ x, y, s, c: k === 3 ? tones[4] : k === 11 ? tones[5] : tones[k % 4], d: (k * 37) % 260 });
      }
      out.push(row);
    }
    return out;
  }, []);
  const stripes = useMemo(() => {
    const ys = Array.from({ length: 11 }, (_, i) => 150 + 150 * Math.pow(i / 10, 1.7));
    return ys.slice(0, -1).map((y, i) => ({ y, h: ys[i + 1] - y, dark: i % 2 === 0 }));
  }, []);
  return (
    <g>
      <rect x="0" y="0" width={W} height="300" fill="url(#mo-sky)" />
      {[40, 140, 260, 360].map((x, i) => (
        <g key={x} className={`lamp l${i}`}>
          <polygon points={`${x - 6},18 ${x + 6},18 ${x + 70 - i * 40},150 ${x - 70 - i * 10},150`} fill="url(#mo-beam)" className="beam" />
          <circle cx={x} cy="16" r="16" fill="url(#mo-lamp)" />
          <rect x={x - 9} y="10" width="18" height="8" rx="2" fill="#f7fff9" />
        </g>
      ))}
      <path d="M0 78 L400 78 L400 152 L0 152 Z" fill="#07140d" />
      {[90, 105, 120, 135].map((y) => <line key={y} x1="0" y1={y} x2={W} y2={y} stroke="#0f2219" strokeWidth="1" />)}
      {rows.map((row, r) => (
        <g key={r} className={`crowd r${r}`}>
          {row.map((p, i) => (
            <g key={i} className="fan" style={{ animationDelay: `${p.d}ms` }}>
              <path d={`M${p.x - 4.5 * p.s} ${p.y + 9 * p.s} Q${p.x} ${p.y + 1 * p.s} ${p.x + 4.5 * p.s} ${p.y + 9 * p.s} Z`} fill={p.c === "#e9efe9" ? "#2b4135" : p.c} />
              <circle cx={p.x} cy={p.y} r={3.1 * p.s} fill={p.c === "#0a6b3a" || p.c === "#e9efe9" ? "#2b4135" : p.c} />
              {(p.c === "#0a6b3a" || p.c === "#e9efe9") && <rect x={p.x - 5 * p.s} y={p.y + 3 * p.s} width={10 * p.s} height={2.4 * p.s} rx="1" fill={p.c} />}
            </g>
          ))}
        </g>
      ))}
      <rect x="0" y="148" width={W} height="4" fill="#d8e3dc" opacity="0.18" />
      {stripes.map((s, i) => <rect key={i} x="0" y={s.y} width={W} height={s.h + 0.5} fill={s.dark ? "#0e3a22" : "#12472a"} />)}
      <rect x="0" y="150" width={W} height="40" fill="#03100a" opacity="0.35" />
    </g>
  );
}

function Limb({ d, w = 8 }: { d: string; w?: number }) {
  return <path d={d} fill="none" stroke="url(#mo-limb)" strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />;
}

/** Goal: the scorer knee-slides from deep in the picture straight at the camera. */
function KneeSlide() {
  const blades = Array.from({ length: 14 }, (_, i) => i);
  return (
    <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" className="stadium ks" aria-hidden="true">
      <Defs />
      <Stadium />
      <path d="M150 300 L188 152 M250 300 L212 152" stroke="#ffffff" strokeOpacity="0.32" strokeWidth="1.4" fill="none" />
      <g className="slider">
        <ellipse cx="0" cy="4" rx="38" ry="8" fill="url(#mo-shadow)" />
        <g className="spray">
          {blades.map((i) => (
            <line key={i} x1={(i % 2 ? 1 : -1) * (6 + (i % 5) * 3)} y1="0" x2={(i % 2 ? 1 : -1) * (8 + (i % 5) * 3)} y2="-5" className={`blade k${i}`} />
          ))}
        </g>
        <Limb d="M-12 0 L-15 -6" w={9} />
        <Limb d="M12 0 L15 -6" w={9} />
        <Limb d="M-12 0 L-8 -30" w={10} />
        <Limb d="M12 0 L8 -30" w={10} />
        <rect x="-14" y="-40" width="28" height="15" rx="5" fill="#0b1310" />
        <path d="M-16 -74 Q0 -80 16 -74 L13 -37 Q0 -33 -13 -37 Z" fill="url(#mo-shirt)" />
        <path d="M-5 -66 L5 -66 L5 -48 L-5 -48 Z" fill="#ffffff" opacity="0.2" />
        <g className="arms">
          <Limb d="M-14 -70 L-30 -88 L-33 -112" />
          <Limb d="M14 -70 L30 -88 L33 -112" />
          <circle cx="-33" cy="-114" r="5" fill="url(#mo-head)" />
          <circle cx="33" cy="-114" r="5" fill="url(#mo-head)" />
        </g>
        <circle cx="0" cy="-86" r="11" fill="url(#mo-head)" />
        <ellipse cx="0" cy="-82" rx="4" ry="5" fill="#000" opacity="0.65" className="shout" />
      </g>
    </svg>
  );
}

/** Concede: the ball rolls in from the foreground and through the keeper's legs. He is not happy. */
function Nutmeg() {
  return (
    <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" className="stadium nm" aria-hidden="true">
      <Defs />
      <Stadium />
      <path d="M118 238 L282 238 L262 206 L138 206 Z" fill="none" stroke="#ffffff" strokeOpacity="0.3" strokeWidth="1.4" />
      <g className="net">
        <path d="M152 170 L248 170 L240 180 L160 180 Z" fill="#ffffff" opacity="0.07" />
        <path d="M160 180 L240 180 L240 214 L160 214 Z" className="mesh-back" />
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => <line key={`v${i}`} x1={160 + i * 10} y1="180" x2={160 + i * 10} y2="214" className="mesh" />)}
        {[0, 1, 2, 3].map((i) => <line key={`h${i}`} x1="160" y1={188 + i * 8} x2="240" y2={188 + i * 8} className="mesh" />)}
        <path d="M152 226 L160 214 L160 180 L152 170 M248 226 L240 214 L240 180 L248 170" className="mesh" />
      </g>
      <ellipse cx="200" cy="228" rx="22" ry="4" fill="url(#mo-shadow)" />
      <g className="ball">
        <circle cx="0" cy="0" r="18" fill="url(#mo-ball)" />
        <path d="M0 -7 L6.7 -2.2 L4.1 5.7 L-4.1 5.7 L-6.7 -2.2 Z" fill="#0b1310" />
        <path d="M0 -7 L0 -17 M6.7 -2.2 L16 -5 M4.1 5.7 L10 14 M-4.1 5.7 L-10 14 M-6.7 -2.2 L-16 -5" stroke="#0b1310" strokeWidth="1.6" />
      </g>
      <g className="keeper stand">
        <Limb d="M200 202 L188 226" w={7} />
        <Limb d="M200 202 L212 226" w={7} />
        <path d="M191 188 Q200 184 209 188 L207 204 L193 204 Z" fill="url(#mo-keeper)" />
        <Limb d="M192 190 L180 204 L176 214" w={6} />
        <Limb d="M208 190 L220 204 L224 214" w={6} />
        <circle cx="176" cy="215" r="4" fill="#f2f5f3" />
        <circle cx="224" cy="215" r="4" fill="#f2f5f3" />
        <circle cx="200" cy="179" r="7.5" fill="url(#mo-head)" />
      </g>
      <g className="keeper raise">
        <Limb d="M195 226 L197 210" w={7} />
        <Limb d="M205 226 L203 210" w={7} />
        <path d="M192 195 Q200 191 208 195 L206 212 L194 212 Z" fill="url(#mo-keeper)" />
        <Limb d="M193 197 L186 210 L192 218" w={6} />
        <Limb d="M207 197 L216 182 L218 168" w={6} />
        <circle cx="218" cy="166" r="4.5" fill="#f2f5f3" />
        <circle cx="200" cy="186" r="7.5" fill="url(#mo-head)" />
      </g>
      <g className="keeper slam">
        <Limb d="M195 226 L197 212" w={7} />
        <Limb d="M205 226 L203 212" w={7} />
        <path d="M192 199 Q200 195 208 199 L206 214 L194 214 Z" fill="url(#mo-keeper)" />
        <Limb d="M193 201 L186 212 L192 220" w={6} />
        <Limb d="M207 201 L218 214 L220 226" w={6} />
        <circle cx="220" cy="227" r="4.5" fill="#f2f5f3" />
        <circle cx="201" cy="192" r="7.5" fill="url(#mo-head)" />
      </g>
      <g className="dust">
        {[0, 1, 2, 3, 4].map((i) => <circle key={i} cx={220 + (i - 2) * 5} cy="226" r={3 + (i % 2)} className={`puff p${i}`} />)}
      </g>
      <g className="steam">
        {[0, 1, 2].map((i) => <circle key={i} cx={196 + i * 5} cy="180" r={3 + i} className={`st s${i}`} />)}
      </g>
      <g className="frame">
        <path d="M152 226 L152 170 L248 170 L248 226" fill="none" stroke="#f4f7f5" strokeWidth="4" strokeLinejoin="round" />
        <path d="M153 226 L153 171 L247 171" fill="none" stroke="#9aa59f" strokeWidth="1" />
      </g>
    </svg>
  );
}

const SCENES: Record<string, () => React.JSX.Element> = { "knee-slide": KneeSlide, nutmeg: Nutmeg };

function Confetti() {
  const bits = Array.from({ length: 42 }, (_, i) => ({
    left: (i * 37) % 100,
    delay: 1050 + ((i * 53) % 700),
    dur: 1600 + ((i * 71) % 900),
    c: ["#ffffff", "#14a35a", "#0a6b3a", "#d9f2e3", "#f4f7f5"][i % 5],
    w: 6 + (i % 4) * 2,
    sway: ((i * 29) % 60) - 30,
  }));
  return (
    <div className="confetti" aria-hidden="true">
      {bits.map((b, i) => (
        <i key={i} style={{ left: `${b.left}%`, animationDelay: `${b.delay}ms, ${b.delay}ms`, animationDuration: `${b.dur}ms, ${b.dur / 3}ms`, background: b.c, width: b.w, height: b.w * 0.45, ["--sway" as string]: `${b.sway}px` }} />
      ))}
    </div>
  );
}

export function Moment({ moment, onDone }: { moment: MomentDef; onDone: () => void }) {
  useEffect(() => {
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const id = setTimeout(onDone, reduced ? 2000 : 3400);
    const key = (e: KeyboardEvent) => { if (e.key === "Escape" || e.key === "Enter" || e.key === " ") onDone(); };
    window.addEventListener("keydown", key);
    return () => { clearTimeout(id); window.removeEventListener("keydown", key); };
  }, [onDone]);
  const Scene = SCENES[moment.id];
  const goal = moment.kind === "goal";
  return (
    <div className={`moment ${moment.kind}`} onClick={onDone} role="status">
      <div className="cam">{Scene && <Scene />}</div>
      <div className="vignette" />
      <div className="flash" />
      {goal && <Confetti />}
      <div className="moment-text">
        <span className="slam" data-text={goal ? "Goal" : "Conceded"}>{goal ? "Goal" : "Conceded"}</span>
        <div className="moment-cap">
          <b>{moment.title}</b>
          <span>{moment.quip}</span>
        </div>
      </div>
      <span className="moment-skip" aria-hidden="true">Tap to skip</span>
    </div>
  );
}
