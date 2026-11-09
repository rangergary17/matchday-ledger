import { useMemo, type ReactNode } from "react";

/*
 * The cast and the set. Characters are original cartoon footballers drawn
 * as jointed rigs (hip, knees, shoulders, elbows, head), so a scene can
 * pose them with keyframes. Each group's origin sits on its joint, which
 * is what SVG rotates around by default.
 */

export const INK = "#0b1310";
const st = { stroke: INK, strokeWidth: 1.2, strokeLinejoin: "round" as const };

export interface Look {
  skin: string; shade: string;
  hair: "short" | "bald" | "swept";
  hairColor: string;
  shirt: string; shirtShade: string; shorts: string; socks: string; trim: string;
  armband?: boolean; gloves?: boolean; brows?: string;
}

const KIT = { shirt: "#0a6b3a", shirtShade: "#064a27", shorts: "#f4f7f5", socks: "#0a6b3a", trim: "#f4f7f5" };

export const CAST = {
  /** Our skipper: thunderbolts and, on bad days, slips. */
  captain: { ...KIT, skin: "#eab48e", shade: "#c98d68", hair: "short", hairColor: "#4a2e1c", armband: true },
  /** Towering number nine who lives for a wet pitch. */
  striker: { ...KIT, skin: "#7a4a2e", shade: "#5a3420", hair: "short", hairColor: "#15100c" },
  /** Bald playmaker. Pure genius, short fuse. */
  maestro: { ...KIT, skin: "#dca37a", shade: "#b98059", hair: "bald", hairColor: "#3b2a1e" },
  /** Big ginger centre-back. Wins every header, including the wrong ones. */
  stopper: { ...KIT, skin: "#f0c3a4", shade: "#d19a78", hair: "short", hairColor: "#b5562a", brows: "#b5562a" },
  homeKeeper: { skin: "#e8b796", shade: "#c7926f", hair: "swept", hairColor: "#3a2a1c", shirt: "#e1e7e3", shirtShade: "#aab5af", shorts: "#1d2522", socks: "#e1e7e3", trim: "#0a6b3a", gloves: true },
  rival: { skin: "#d9a07c", shade: "#b47b58", hair: "swept", hairColor: "#2a1d14", shirt: "#4a5550", shirtShade: "#323a37", shorts: "#1d2522", socks: "#4a5550", trim: "#c9d1cc" },
  keeper: { skin: "#e3ad88", shade: "#c08a66", hair: "short", hairColor: "#6b4a2c", shirt: "#8a9590", shirtShade: "#5b6662", shorts: "#2a3330", socks: "#8a9590", trim: "#f4f7f5", gloves: true },
  referee: { skin: "#e0a986", shade: "#bf8763", hair: "short", hairColor: "#2b211a", shirt: "#141a18", shirtShade: "#060908", shorts: "#141a18", socks: "#141a18", trim: "#e9eeeb" },
} satisfies Record<string, Look>;

export function Defs() {
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
      <radialGradient id="mo-bokeh">
        <stop offset="0" stopColor="#ffffff" stopOpacity="0.5" />
        <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="mo-silver" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#8f9a95" />
        <stop offset="0.35" stopColor="#ffffff" />
        <stop offset="0.6" stopColor="#c9d1cc" />
        <stop offset="1" stopColor="#6c7772" />
      </linearGradient>
    </defs>
  );
}

const W = 400;

/** Night stadium: sky, floodlights, crowd, a pitch in perspective. */
export function Stadium({ wet = false }: { wet?: boolean }) {
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
      {wet && [[150, 232, 70], [262, 258, 54], [196, 286, 90], [110, 274, 40], [300, 214, 36]].map(([x, y, w], i) => (
        <ellipse key={i} cx={x} cy={y} rx={w} ry={w * 0.08} fill="#cfe6ee" opacity="0.13" />
      ))}
    </g>
  );
}

/** Out-of-focus crowd behind a close-up. */
export function CloseBg() {
  const dots = useMemo(() => Array.from({ length: 46 }, (_, i) => ({
    x: (i * 73) % 410, y: 40 + ((i * 41) % 190), r: 7 + ((i * 13) % 14), o: 0.12 + ((i * 7) % 5) * 0.06, g: i % 4 === 0,
  })), []);
  return (
    <g>
      <rect x="0" y="0" width={W} height="300" fill="url(#mo-sky)" />
      <rect x="0" y="40" width={W} height="200" fill="#0a1a12" />
      {dots.map((d, i) => (
        <circle key={i} className="fan" style={{ animationDelay: `${(i * 37) % 260}ms` }} cx={d.x} cy={d.y} r={d.r} fill={d.g ? "#14a35a" : "url(#mo-bokeh)"} opacity={d.g ? d.o * 0.8 : d.o * 2} />
      ))}
      <circle cx="70" cy="18" r="40" fill="url(#mo-lamp)" opacity="0.5" />
      <circle cx="330" cy="12" r="46" fill="url(#mo-lamp)" opacity="0.45" />
    </g>
  );
}

export function Rain() {
  const lines = useMemo(() => Array.from({ length: 150 }, (_, i) => ({
    x: ((i * 61) % 480) - 20, y: ((i * 97) % 600) - 300, l: 10 + (i % 4) * 4,
  })), []);
  return (
    <g className="rain" aria-hidden="true">
      {lines.map((d, i) => <line key={i} x1={d.x} y1={d.y} x2={d.x - d.l * 0.13} y2={d.y + d.l} />)}
    </g>
  );
}

export function Ball({ r = 10, cls }: { r?: number; cls?: string }) {
  const k = r / 18;
  return (
    <g className={cls}>
      <circle r={r} fill="url(#mo-ball)" stroke={INK} strokeWidth={0.8} />
      <g transform={`scale(${k})`}>
        <path d="M0 -7 L6.7 -2.2 L4.1 5.7 L-4.1 5.7 L-6.7 -2.2 Z" fill={INK} />
        <path d="M0 -7 L0 -17 M6.7 -2.2 L16 -5 M4.1 5.7 L10 14 M-4.1 5.7 L-10 14 M-6.7 -2.2 L-16 -5" stroke={INK} strokeWidth="1.6" />
      </g>
    </g>
  );
}

/* ---------------- Side view rig (faces right; origin at the hip) ---------------- */

function SideHead({ L }: { L: Look }) {
  return (
    <g>
      <circle cx="2" cy="-11" r="11" fill={L.skin} {...st} />
      <path d="M-3 -2 Q2 2 9 -1 Q4 -6 -3 -2 Z" fill={L.shade} opacity="0.35" />
      <path d="M12.4 -14 L15.6 -8.6 L12.2 -7.6" fill={L.skin} {...st} />
      <ellipse cx="-1.5" cy="-10" rx="2.6" ry="3.6" fill={L.skin} {...st} />
      <circle cx="8.2" cy="-13.6" r="1.3" fill={INK} />
      <path d="M5.4 -17.2 L10.8 -16.6" stroke={L.brows ?? INK} strokeWidth="1.7" strokeLinecap="round" />
      <path className="m-shut" d="M8 -4.6 L11.6 -5.2" stroke={INK} strokeWidth="1.3" strokeLinecap="round" />
      <path className="m-open" opacity="0" d="M7.2 -6.4 L12.2 -7 L11.4 -2.2 Q9 -0.8 7.6 -3 Z" fill="#2a0c0c" stroke={INK} strokeWidth="0.8" />
      {L.hair === "short" && <path d="M-9.4 -8 Q-11.5 -22 1 -23.6 Q11.5 -24.2 13.2 -15.4 Q9 -18.6 4.4 -18.4 Q1.4 -14.4 -3 -13.4 Q-5.4 -10 -6.4 -5.8 Z" fill={L.hairColor} {...st} />}
      {L.hair === "swept" && <path d="M-9.6 -7 Q-12 -24 3 -24.4 Q14 -24 14.6 -16.6 Q8 -20.6 2 -18 Q-2 -15 -5 -12 Q-6.6 -9 -6.4 -5.4 Z" fill={L.hairColor} {...st} />}
      {L.hair === "bald" && (
        <>
          <path d="M-8.4 -7.4 Q-9.6 -3.4 -6.4 -1.6" fill="none" stroke={L.hairColor} strokeWidth="2.4" strokeLinecap="round" />
          <ellipse cx="2" cy="-19.2" rx="4.4" ry="2" fill="#ffffff" opacity="0.4" />
        </>
      )}
    </g>
  );
}

function SideLeg({ L, side }: { L: Look; side: "N" | "F" }) {
  return (
    <g className={`th${side}${side === "F" ? " far" : ""}`}>
      <path d="M-5.6 10 L5.6 10 L4.4 25 L-4.4 25 Z" fill={L.skin} {...st} />
      <circle cx="0" cy="24" r="4.2" fill={L.skin} />
      <path d="M-7.6 -3 L8.2 -3 L7.2 12.4 L-6.6 12.4 Z" fill={L.shorts} {...st} />
      <g transform="translate(0,24)">
        <g className={`sh${side}`}>
          <path d="M-4.2 0 L4.2 0 L3.8 8 L-3.8 8 Z" fill={L.skin} {...st} />
          <path d="M-4 6 L4 6 L3.5 21 L-3.5 21 Z" fill={L.socks} {...st} />
          <path d="M-4.2 6.4 L4.2 6.4" stroke={L.trim} strokeWidth="1.4" />
          <path d="M-4.4 19.4 L4.2 19.4 Q10.8 20 11.2 25 L-4.8 25 Z" fill={INK} />
          <path d="M-4.8 25 L11.2 25" stroke="#f4f7f5" strokeWidth="0.9" />
        </g>
      </g>
    </g>
  );
}

function SideArm({ L, side }: { L: Look; side: "N" | "F" }) {
  return (
    <g transform="translate(0,-29)">
      <g className={`ua${side}${side === "F" ? " far" : ""}`}>
        <path d="M-3.4 2 L3.4 2 L2.9 15.4 L-2.9 15.4 Z" fill={L.skin} {...st} />
        <path d="M-4.6 -2.4 Q0 -5.4 4.6 -2.4 L4.2 8 L-4.2 8 Z" fill={L.shirt} {...st} />
        {L.armband && side === "N" && <rect x="-4.5" y="4.4" width="9" height="3" fill={L.trim} {...st} strokeWidth="0.8" />}
        <circle cx="0" cy="15" r="3" fill={L.skin} />
        <g transform="translate(0,15)">
          <g className={`fa${side}`}>
            <path d="M-2.9 0 L2.9 0 L2.5 12.6 L-2.5 12.6 Z" fill={L.skin} {...st} />
            <circle cx="0" cy="14.6" r={L.gloves ? 4.6 : 3.7} fill={L.gloves ? "#f4f7f5" : L.skin} {...st} />
          </g>
        </g>
      </g>
    </g>
  );
}

export function SidePlayer({ look: L, cls, x, y, s = 1 }: { look: Look; cls: string; x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <g className={cls}>
        <ellipse className="shadow" cx="2" cy="49" rx="20" ry="3.4" fill="url(#mo-shadow)" />
        <g className="pos">
          <g className="flip">
            <g className="body">
              <SideLeg L={L} side="F" />
              <g className="torso"><SideArm L={L} side="F" /></g>
              <path d="M-8.6 -5 L9.2 -5 L8.8 4 L-8.2 4 Z" fill={L.shorts} {...st} />
              <SideLeg L={L} side="N" />
              <g className="torso">
                <path d="M-8.6 -1 L9.2 -1 L11.6 -28.6 Q3 -35.6 -9.6 -30.6 Z" fill={L.shirt} {...st} />
                <path d="M-8.6 -1 L-4.2 -1 L-5.2 -31.4 L-9.6 -30.6 Z" fill={L.shirtShade} opacity="0.8" />
                <path d="M-2.4 -31.6 L4.6 -32 L4.2 -37.6 L-1.8 -37.6 Z" fill={L.skin} {...st} />
                <g transform="translate(1,-36)">
                  <g className="head"><SideHead L={L} /></g>
                </g>
                <SideArm L={L} side="N" />
              </g>
            </g>
          </g>
        </g>
      </g>
    </g>
  );
}

/* ---------------- Front view rig (origin at the waist) ---------------- */

export type Face = "neutral" | "roar" | "anguish" | "angry" | "stern" | "smug";

function FrontHead({ L, face }: { L: Look; face: Face }) {
  const show = (f: Face) => (f === face ? 1 : 0);
  const brow = L.brows ?? INK;
  return (
    <g>
      <ellipse cx="-17.4" cy="-19" rx="4" ry="6" fill={L.skin} {...st} />
      <ellipse cx="17.4" cy="-19" rx="4" ry="6" fill={L.skin} {...st} />
      <path d="M-17 -26 Q-17 -42 0 -42 Q17 -42 17 -26 L16 -12 Q13 1 0 3 Q-13 1 -16 -12 Z" fill={L.skin} {...st} />
      <path d="M8 -40 Q17 -36 17 -26 L16 -12 Q13 1 2 3 Q12 -12 8 -40 Z" fill={L.shade} opacity="0.45" />
      {L.hair === "short" && <path d="M-18 -21 Q-20.5 -44.6 0 -45.4 Q20.5 -44.6 18 -21 Q16.4 -32 11 -35.4 Q0 -31.6 -11 -35.4 Q-16.4 -32 -18 -21 Z" fill={L.hairColor} {...st} />}
      {L.hair === "swept" && <path d="M-18 -20 Q-21 -46 2 -46 Q21 -45 18 -22 Q15 -33 6 -36 Q-4 -32 -12 -34 Q-16 -30 -18 -20 Z" fill={L.hairColor} {...st} />}
      {L.hair === "bald" && (
        <>
          <ellipse cx="-6" cy="-37" rx="6.4" ry="2.6" fill="#ffffff" opacity="0.38" />
          <path d="M-16.8 -23 Q-17.4 -16 -16 -11 M16.8 -23 Q17.4 -16 16 -11" fill="none" stroke={L.hairColor} strokeWidth="2.6" strokeLinecap="round" />
        </>
      )}
      <path d="M0.6 -23 L-2.8 -12.6 L2.6 -12" fill="none" stroke={INK} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <g className="f-neutral" opacity={show("neutral")}>
        <circle cx="-7" cy="-24" r="1.9" fill={INK} /><circle cx="7" cy="-24" r="1.9" fill={INK} />
        <path d="M-11.4 -29.6 L-3 -29 M3 -29 L11.4 -29.6" stroke={brow} strokeWidth="2" strokeLinecap="round" />
        <path d="M-6 -5.6 Q0 -4.4 6 -5.6" fill="none" stroke={INK} strokeWidth="1.4" strokeLinecap="round" />
      </g>
      <g className="f-stern" opacity={show("stern")}>
        <circle cx="-7" cy="-24" r="1.8" fill={INK} /><circle cx="7" cy="-24" r="1.8" fill={INK} />
        <path d="M-12 -28.6 L-3 -27.4 M3 -27.4 L12 -28.6" stroke={brow} strokeWidth="2.4" strokeLinecap="round" />
        <path d="M-6 -6 L6 -6" stroke={INK} strokeWidth="1.6" strokeLinecap="round" />
      </g>
      <g className="f-smug" opacity={show("smug")}>
        <path d="M-11 -24.6 L-3.4 -24.6 M3.4 -24.6 L11 -24.6" stroke={INK} strokeWidth="1.6" strokeLinecap="round" />
        <path d="M-9.6 -24.4 A2.4 2.4 0 0 0 -4.8 -24.4 Z M4.8 -24.4 A2.4 2.4 0 0 0 9.6 -24.4 Z" fill={INK} />
        <path d="M-11.6 -32.6 Q-7 -35.4 -3 -31.4 M3 -29 L11.6 -29.4" fill="none" stroke={brow} strokeWidth="2.2" strokeLinecap="round" />
        <path d="M-6 -6.4 Q1 -4 7.4 -9" fill="none" stroke={INK} strokeWidth="1.6" strokeLinecap="round" />
      </g>
      <g className="f-roar" opacity={show("roar")}>
        <path d="M-11.4 -26.4 L-4 -23.6 L-11 -21.4 M11.4 -26.4 L4 -23.6 L11 -21.4" fill="none" stroke={INK} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M-12.4 -31.4 L-3 -27.4 M3 -27.4 L12.4 -31.4" stroke={brow} strokeWidth="2.6" strokeLinecap="round" />
        <g className="mouth">
          <path d="M-9.4 -12.6 Q0 -15.6 9.4 -12.6 Q9.4 1.6 0 3.6 Q-9.4 1.6 -9.4 -12.6 Z" fill="#2a0c0c" {...st} />
          <path d="M-7.8 -12.8 Q0 -14.8 7.8 -12.8 L7.2 -10.2 Q0 -11.8 -7.2 -10.2 Z" fill="#ffffff" />
          <ellipse cx="0" cy="-0.6" rx="4.8" ry="2.4" fill="#b4474a" />
        </g>
      </g>
      <g className="f-anguish" opacity={show("anguish")}>
        <path d="M-11.4 -23 Q-7 -25.4 -3 -23 M3 -23 Q7 -25.4 11.4 -23" fill="none" stroke={INK} strokeWidth="1.7" strokeLinecap="round" />
        <path d="M-12 -28.4 L-3.4 -33 M3.4 -33 L12 -28.4" stroke={brow} strokeWidth="2.4" strokeLinecap="round" />
        <path d="M-9 -2.6 Q-6 -13.4 0 -13.4 Q6 -13.4 9 -2.6 Q0 -6.4 -9 -2.6 Z" fill="#2a0c0c" {...st} />
        <path d="M-5.4 -11.6 Q0 -13 5.4 -11.6 L5 -10 Q0 -11 -5 -10 Z" fill="#ffffff" />
      </g>
      <g className="f-angry" opacity={show("angry")}>
        <circle cx="-7" cy="-23.4" r="1.9" fill={INK} /><circle cx="7" cy="-23.4" r="1.9" fill={INK} />
        <path d="M-12.6 -31 L-2.6 -25.4 M2.6 -25.4 L12.6 -31" stroke={brow} strokeWidth="2.8" strokeLinecap="round" />
        <path d="M-9 -11 L9 -11 L8 -4 L-8 -4 Z" fill="#ffffff" {...st} />
        <path d="M-9 -7.5 L9 -7.5 M-4.5 -11 L-4.5 -4 M0 -11 L0 -4 M4.5 -11 L4.5 -4" stroke={INK} strokeWidth="0.9" />
      </g>
    </g>
  );
}

function FrontArm({ L, side, item }: { L: Look; side: "L" | "R"; item?: ReactNode }) {
  const x = side === "L" ? -26 : 26;
  return (
    <g transform={`translate(${x},-53)`}>
      <g className={`ua${side}`}>
        <path d="M-6 4 L6 4 L5 30 L-5 30 Z" fill={L.skin} {...st} />
        <path d="M-8.4 -4 Q0 -9.4 8.4 -4 L7.6 14 L-7.6 14 Z" fill={L.shirt} {...st} />
        {L.armband && side === "R" && <rect x="-7.8" y="8.4" width="15.6" height="5" fill={L.trim} {...st} strokeWidth="1" />}
        <circle cx="0" cy="30" r="5" fill={L.skin} />
        <g transform="translate(0,30)">
          <g className={`fa${side}`}>
            <path d="M-5 0 L5 0 L4.4 25 L-4.4 25 Z" fill={L.skin} {...st} />
            {item}
            <circle cx="0" cy="29" r="7.2" fill={L.gloves ? "#f4f7f5" : L.skin} {...st} />
            <path d="M-4.6 25.6 Q0 27.4 4.6 25.6" fill="none" stroke={INK} strokeWidth="0.9" />
          </g>
        </g>
      </g>
    </g>
  );
}

export function FrontBust({ look: L, cls, x, y, s = 1, face = "neutral", kneel = false, itemR }: {
  look: Look; cls: string; x: number; y: number; s?: number; face?: Face; kneel?: boolean; itemR?: ReactNode;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <g className={cls}>
        <g className="pos">
          <g className="body">
            {kneel && (
              <g>
                <ellipse cx="0" cy="40" rx="46" ry="7" fill="url(#mo-shadow)" />
                <path d="M-36 30 L-30 36 L-22 36 Z M36 30 L30 36 L22 36 Z" fill={INK} />
                <path d="M-29 12 L-5 12 L-8 31 Q-18 38 -27 31 Z" fill={L.skin} {...st} />
                <path d="M29 12 L5 12 L8 31 Q18 38 27 31 Z" fill={L.skin} {...st} />
                <path d="M-27 -2 L27 -2 L31 18 L2 18 L0 12 L-2 18 L-31 18 Z" fill={L.shorts} {...st} />
              </g>
            )}
            <path d="M-25 2 L-29 -48 Q-27 -58 -14 -62 L14 -62 Q27 -58 29 -48 L25 2 Z" fill={L.shirt} {...st} />
            <path d="M14 -62 Q27 -58 29 -48 L25 2 L15 2 Q19 -30 14 -62 Z" fill={L.shirtShade} opacity="0.7" />
            <path d="M-9 -61.4 L0 -52.6 L9 -61.4" fill="none" stroke={L.trim} strokeWidth="3" />
            {L.shirt !== CAST.referee.shirt && <path d="M9 -46 L17 -46 L17 -40 Q17 -36 13 -34.4 Q9 -36 9 -40 Z" fill={L.trim} opacity="0.9" />}
            <path d="M-7 -61 L-6.4 -70 L6.4 -70 L7 -61 Q0 -55.6 -7 -61 Z" fill={L.skin} {...st} />
            <g transform="translate(0,-68)">
              <g className="head"><FrontHead L={L} face={face} /></g>
            </g>
            <FrontArm L={L} side="L" />
            <FrontArm L={L} side="R" item={itemR} />
          </g>
        </g>
      </g>
    </g>
  );
}

/** A generic silver cup on a plinth. */
export function Trophy({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx="0" cy="40" rx="34" ry="4" fill="url(#mo-shadow)" />
      <path d="M-24 0 L24 0 L22 40 L-22 40 Z" fill="#0f1915" {...st} />
      <path d="M-24 0 L24 0 L23.6 5 L-23.6 5 Z" fill="#24332c" />
      <path d="M-13 -8 L13 -8 L14 0 L-14 0 Z" fill="url(#mo-silver)" {...st} />
      <path d="M-4.4 -8 L4.4 -8 L3 -22 L-3 -22 Z" fill="url(#mo-silver)" {...st} />
      <path d="M-17 -54 L17 -54 Q17 -27 0 -22 Q-17 -27 -17 -54 Z" fill="url(#mo-silver)" {...st} />
      <path d="M-16 -49 Q-30 -47 -24 -34 Q-20 -29.6 -12.4 -31" fill="none" stroke="#c9d1cc" strokeWidth="3.4" strokeLinecap="round" />
      <path d="M16 -49 Q30 -47 24 -34 Q20 -29.6 12.4 -31" fill="none" stroke="#c9d1cc" strokeWidth="3.4" strokeLinecap="round" />
      <path d="M-19 -56 L19 -56 L17 -52 L-17 -52 Z" fill="url(#mo-silver)" {...st} />
      <path className="glint" d="M-6 -46 L-4.6 -41.4 L0 -40 L-4.6 -38.6 L-6 -34 L-7.4 -38.6 L-12 -40 L-7.4 -41.4 Z" fill="#ffffff" />
    </g>
  );
}

/** Water droplets that burst out from a point. */
export function Splash({ x, y, cls, n = 9, s = 1 }: { x: number; y: number; cls: string; n?: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <g className={cls}>
        {Array.from({ length: n }, (_, i) => <circle key={i} className={`d${i}`} r={1.6 + (i % 3) * 0.7} fill="#dcecf2" opacity="0" />)}
      </g>
    </g>
  );
}

/** A quick white ring at an impact. */
export function Impact({ x, y, cls, r = 14 }: { x: number; y: number; cls: string; r?: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle className={cls} r={r} fill="none" stroke="#ffffff" strokeWidth="3" opacity="0" />
    </g>
  );
}

/** A goal seen side-on. dir -1 puts the net to the left of the posts. */
export function SideGoal({ x, ground, bar, dir, cls }: { x: number; ground: number; bar: number; dir: 1 | -1; cls?: string }) {
  const d = dir, back = x + d * 34, foot = x + d * 64;
  const rows = Array.from({ length: 7 }, (_, i) => bar + ((ground - bar) * (i + 1)) / 8);
  return (
    <g>
      <g className={cls} style={{ transformOrigin: `${x}px ${ground}px` }}>
        <path d={`M${x} ${bar} L${back} ${bar} L${foot} ${ground} L${x} ${ground} Z`} fill="#ffffff" fillOpacity="0.06" />
        {rows.map((y, i) => {
          const t = (y - bar) / (ground - bar);
          return <line key={i} x1={x} y1={y} x2={back + (foot - back) * t} y2={y} className="mesh" />;
        })}
        {Array.from({ length: 6 }, (_, i) => {
          const f = (i + 1) / 7, top = x + (back - x) * f, bot = x + (foot - x) * f;
          return <line key={`v${i}`} x1={top} y1={bar} x2={bot} y2={ground} className="mesh" />;
        })}
        <path d={`M${back} ${bar} L${foot} ${ground}`} stroke="#c9d1cc" strokeWidth="1.6" />
      </g>
      <path d={`M${x} ${ground} L${x} ${bar} L${back} ${bar}`} fill="none" stroke="#f4f7f5" strokeWidth="4.4" strokeLinejoin="round" />
    </g>
  );
}

/** A raised index finger, held in a front-view fist. */
export function Finger({ skin }: { skin: string }) {
  return <rect x="-2.6" y="31" width="5.2" height="14" rx="2.6" fill={skin} stroke={INK} strokeWidth="1.1" />;
}
