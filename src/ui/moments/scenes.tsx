import React, { useMemo } from "react";
import { Ball, CAST, CloseBg, Defs, Finger, FrontBust, Impact, Rain, SideGoal, SidePlayer, Splash, Stadium, Trophy, INK } from "./rig";
import { cut, O, R, S, T, timeline, wave, type Key, type Track } from "./timeline";

/*
 * Four homages to the kind of moments fans never forget. Original
 * characters and situations: no real names, faces, clubs or footage.
 * Timings line up with the shared overlay in styles.css: the goal
 * lands at about 1.1s, a concede hits at 1.15s and again at 1.95s.
 */

const DUR = 3400;

function Scene({ scope, tracks, children }: { scope: string; tracks: Track[]; children: React.ReactNode }) {
  const css = useMemo(() => timeline(scope, DUR, tracks), [scope, tracks]);
  return (
    <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" className={`stadium ${scope}`} aria-hidden="true">
      <style>{css}</style>
      <Defs />
      {children}
    </svg>
  );
}

/** Droplets flying out from a splash, then falling away. */
function burst(sel: string, t0: number, n: number, spread = 1): Track[] {
  const out: Track[] = [];
  for (let i = 0; i < n; i++) {
    const a = Math.PI * (0.1 + (0.8 * i) / Math.max(1, n - 1));
    const v = (16 + ((i * 7) % 4) * 6) * spread;
    const dx = -Math.cos(a) * v * 1.3, dy = -Math.sin(a) * v;
    out.push(T(`${sel} .d${i}`, [[t0, 0, 0, "cubic-bezier(.1,.7,.3,1)"], [t0 + 200, dx, dy, "ease-in"], [t0 + 520, dx * 1.35, dy + 22 * spread]]));
    out.push(O(`${sel} .d${i}`, [[0, 0], [t0, 0.95, "linear"], [t0 + 520, 0]]));
  }
  return out;
}

const ring = (sel: string, t: number): Track[] => [
  S(sel, [[0, "0.2"], [t, "0.2", "cubic-bezier(.1,.8,.3,1)"], [t + 220, "1.8"]]),
  O(sel, [[0, 0], [t, 1, "linear"], [t + 220, 0]]),
];

/* ------------------------------------------------------------------
 * 1. The captain's thunderbolt (goal)
 * Side-on strike, then the goal camera, then a roar at the lens.
 * ------------------------------------------------------------------ */
const thunderTracks: Track[] = [
  cut(".s1", 0, 700), cut(".s2", 700, 1100), cut(".s3", 1100, null),
  // run-up and strike
  T(".cap .pos", [[0, -70, 0], [95, -52, -3], [190, -35, 0], [285, -17, -3], [380, 0, 0], [650, 6, -2], [700, 8, 0]]),
  R(".cap .thN", [[0, -35], [190, 30], [380, 40], [470, 58, "cubic-bezier(.5,0,.2,1)"], [540, -15], [650, -88], [700, -82]]),
  R(".cap .shN", [[0, 20], [190, 60], [380, 70], [470, 98], [540, 12], [650, 0], [700, 6]]),
  R(".cap .thF", [[0, 30], [190, -35], [380, -12], [540, -6], [700, 4]]),
  R(".cap .shF", [[0, 60], [190, 20], [380, 6], [700, 10]]),
  R(".cap .torso", [[0, 12], [380, 4], [470, -6], [540, -14], [650, -6], [700, -2]]),
  R(".cap .uaN", [[0, -35], [190, 35], [380, 40], [540, 64], [700, 34]]),
  R(".cap .faN", [[0, -60], [380, -40], [700, -30]]),
  R(".cap .uaF", [[0, 35], [190, -35], [380, -60], [540, -86], [700, -52]]),
  R(".cap .faF", [[0, -50], [700, -30]]),
  R(".cap .head", [[0, 0], [540, 10], [700, -4]]),
  T(".ball1", [[0, 0, 0], [530, 0, 0, "cubic-bezier(.2,.6,.4,1)"], [700, 240, -180]]),
  S(".ball1", [[530, "1"], [700, "0.4"]]),
  { sel: ".trail1", prop: "stroke-dashoffset", keys: [[0, "1"], [530, "1", "cubic-bezier(.2,.6,.4,1)"], [700, "0"]] },
  ...ring(".hit1", 530),
  // goal camera: keeper at full stretch, ball into the top corner
  T(".gk .pos", [[700, 0, 0], [1000, 14, -30, "ease-out"], [1100, 16, -28]]),
  R(".gk .body", [[700, 0], [1000, 62, "ease-out"], [1100, 66]]),
  R(".gk .uaN", [[700, 20], [950, -172]]), R(".gk .uaF", [[700, -20], [950, -160]]),
  R(".gk .thN", [[700, 10], [1000, 18]]), R(".gk .thF", [[700, -10], [1000, 34]]),
  R(".gk .shN", [[700, 0], [1000, 40]]),
  T(".ball2", [[700, 150, 330, "cubic-bezier(.15,.5,.35,1)"], [1060, 262, 122], [1100, 265, 117]]),
  S(".ball2", [[700, "2.6", "cubic-bezier(.15,.5,.35,1)"], [1060, "0.55"], [1100, "0.5"]]),
  R(".ball2", [[700, 0, "linear"], [1100, 900]]),
  S(".net2", [[0, "1"], [1050, "1", "ease-out"], [1090, "1.035 1.05"], [1100, "1.03 1.04"]]),
  // the roar
  S(".capf .pos", [[1100, "0.86", "linear"], [DUR, "1.04"]]),
  T(".capf .pos", wave(1100, DUR, 420, 0, -6).map(([t, v]) => [t, 0, Number(v)] as [number, number, number])),
  R(".capf .uaL", [[1100, 30, "cubic-bezier(.2,.9,.3,1.3)"], ...wave(1300, DUR, 520, 104, 122)]),
  R(".capf .faL", [[1100, -10, "cubic-bezier(.2,.9,.3,1.3)"], ...wave(1300, DUR, 520, 84, 64)]),
  R(".capf .uaR", [[1100, -30, "cubic-bezier(.2,.9,.3,1.3)"], ...wave(1300, DUR, 520, -104, -122)]),
  R(".capf .faR", [[1100, 10, "cubic-bezier(.2,.9,.3,1.3)"], ...wave(1300, DUR, 520, -84, -64)]),
  R(".capf .head", wave(1100, DUR, 520, -3, 3)),
  S(".capf .mouth", [[1100, "1 0.7"], ...wave(1300, DUR, 520, 1, 1.12).map(([t, v]) => [t, `1 ${v}`] as Key)]),
];

export function Thunderbolt() {
  return (
    <Scene scope="thunder" tracks={thunderTracks}>
      <g className="s1">
        <Stadium />
        <SidePlayer look={CAST.captain} cls="cap" x={185} y={200} s={1.5} />
        <path className="trail1" d="M232 263 L472 83" pathLength={1} strokeDasharray="1" stroke="#ffffff" strokeOpacity="0.7" strokeWidth="5" strokeLinecap="round" />
        <g transform="translate(232 263)"><Ball cls="ball1" r={10} /></g>
        <Impact x={232} y={263} cls="hit1" />
      </g>
      <g className="s2">
        <Stadium />
        <g className="net2" style={{ transformOrigin: "258px 124px" }}>
          <path d="M136 120 L264 120 L264 206 L136 206 Z" fill="#ffffff" fillOpacity="0.06" />
          {Array.from({ length: 13 }, (_, i) => <line key={`v${i}`} x1={136 + i * 10.6} y1="120" x2={136 + i * 10.6} y2="206" className="mesh" />)}
          {Array.from({ length: 8 }, (_, i) => <line key={`h${i}`} x1="136" y1={120 + i * 12.3} x2="264" y2={120 + i * 12.3} className="mesh" />)}
          <path d="M130 112 L136 120 M270 112 L264 120 M130 214 L136 206 M270 214 L264 206" className="mesh" />
        </g>
        <SidePlayer look={CAST.keeper} cls="gk" x={195} y={178} s={0.75} />
        <g className="ball2"><Ball r={10} /></g>
        <path d="M130 214 L130 112 L270 112 L270 214" fill="none" stroke="#f4f7f5" strokeWidth="5" strokeLinejoin="round" />
        <path d="M110 214 L290 214" stroke="#ffffff" strokeOpacity="0.4" strokeWidth="1.5" />
      </g>
      <g className="s3">
        <CloseBg />
        <FrontBust look={CAST.captain} cls="capf" x={200} y={322} s={1.6} face="roar" />
      </g>
    </Scene>
  );
}

/* ------------------------------------------------------------------
 * 2. The rain slide (goal)
 * The big number nine knee-slides through the puddles, arms wide.
 * ------------------------------------------------------------------ */
const slideTracks: Track[] = [
  T(".dro .pos", [[0, 6, -64, "cubic-bezier(.3,.15,.25,1)"], [1100, 0, 0], [DUR, 0, 2]]),
  S(".dro .pos", [[0, "0.26", "cubic-bezier(.3,.15,.25,1)"], [1100, "1"], [DUR, "1.05"]]),
  R(".dro .uaL", [[0, 96], [1100, 100, "cubic-bezier(.2,.9,.3,1.4)"], ...wave(1300, DUR, 700, 118, 108)]),
  R(".dro .faL", [[0, 12], [1100, 14], [1300, 6]]),
  R(".dro .uaR", [[0, -96], [1100, -100, "cubic-bezier(.2,.9,.3,1.4)"], ...wave(1300, DUR, 700, -118, -108)]),
  R(".dro .faR", [[0, -12], [1100, -14], [1300, -6]]),
  R(".dro .head", [[0, 0], [1100, -4], ...wave(1300, DUR, 700, -4, 4)]),
  O(".dro .f-neutral", [[0, 1], [800, 0]]),
  O(".dro .f-roar", [[0, 0], [800, 1]]),
  S(".dro .mouth", [[800, "1 0.6", "ease-out"], [1100, "1 1"], ...wave(1300, DUR, 700, 1, 1.1).map(([t, v]) => [t, `1 ${v}`] as Key)]),
  O(".wake", [[0, 1, "linear"], [1100, 1, "linear"], [1500, 0]]),
  ...burst(".sp1", 1080, 9, 1.6),
  ...burst(".sp2", 1100, 9, 1.6),
];

export function RainSlide() {
  return (
    <Scene scope="slide" tracks={slideTracks}>
      <Stadium wet />
      <path d="M150 300 L188 152 M250 300 L212 152" stroke="#ffffff" strokeOpacity="0.3" strokeWidth="1.4" fill="none" />
      <g transform="translate(200 232)">
        <g className="dro">
          <g className="pos">
            <g className="wake">
              <path className="flick" d="M-20 34 Q-60 10 -86 26 Q-58 22 -20 42 Z" fill="#e6f2f7" opacity="0.6" />
              <path className="flick" d="M20 34 Q60 10 86 26 Q58 22 20 42 Z" fill="#e6f2f7" opacity="0.6" />
              <path className="flick f2" d="M-14 38 Q-40 26 -58 40 Q-36 36 -14 44 Z" fill="#ffffff" opacity="0.5" />
              <path className="flick f2" d="M14 38 Q40 26 58 40 Q36 36 14 44 Z" fill="#ffffff" opacity="0.5" />
            </g>
          </g>
        </g>
      </g>
      <FrontBust look={CAST.striker} cls="dro" x={200} y={232} s={1} kneel />
      <Splash x={180} y={268} cls="sp1" s={1.6} />
      <Splash x={220} y={268} cls="sp2" s={1.6} />
      <Rain />
    </Scene>
  );
}

/* ------------------------------------------------------------------
 * 3. The slip (concede)
 * Rain, the winning kick, the standing foot goes. Then the turf gets it.
 * ------------------------------------------------------------------ */
const slipTracks: Track[] = [
  cut(".s1", 0, 1500), cut(".s2", 1500, null),
  T(".cap .pos", [[0, -60, 0], [200, -45, -2], [400, -30, 0], [600, -15, -2], [800, 0, 0], [950, 8, -6, "cubic-bezier(.6,0,.9,.6)"], [1150, 4, 42, "ease-out"], [1260, 5, 38, "ease-in"], [1380, 5, 42]]),
  R(".cap .body", [[0, 6], [800, 4], [880, -10, "ease-in"], [1000, -58, "ease-out"], [1150, -32], [1500, -26]]),
  R(".cap .thF", [[0, 30], [200, -30], [400, 30], [600, -30], [800, -5], [880, -40, "ease-in"], [1000, -100], [1150, -60], [1500, -64]]),
  R(".cap .shF", [[0, 10], [200, 60], [400, 10], [600, 60], [800, 5], [1000, 0], [1150, 10], [1500, 14]]),
  R(".cap .thN", [[0, -30], [200, 30], [400, -30], [600, 30], [800, 42], [880, 12], [1000, -124], [1150, -76], [1500, -58]]),
  R(".cap .shN", [[0, 60], [200, 10], [400, 60], [600, 10], [800, 84], [1000, 12], [1150, 30], [1500, 52]]),
  R(".cap .torso", [[0, 8], [1000, -12], [1150, 12], [1500, 18]]),
  R(".cap .uaN", [[0, -30], [200, 30], [400, -30], [600, 30], [800, 10], [1000, 150], [1150, 60], [1500, 40]]),
  R(".cap .faN", [[0, -50], [1000, -20], [1500, -10]]),
  R(".cap .uaF", [[0, 30], [200, -30], [400, 30], [600, -30], [800, -20], [1000, -150], [1150, 50], [1500, 36]]),
  R(".cap .head", [[0, 6], [1000, -22], [1150, 12], [1500, 26]]),
  O(".cap .m-shut", [[0, 1], [940, 0]]), O(".cap .m-open", [[0, 0], [940, 1]]),
  T(".ball3", [[0, 0, 0], [1000, 0, 0, "ease-out"], [1500, 64, -1]]),
  R(".ball3", [[1000, 0, "ease-out"], [1500, 240]]),
  ...burst(".sp3", 1150, 9, 1.4),
  // close-up: hands on head, then both fists into the wet turf
  T(".capf .pos", [[1500, 0, 0], [1900, 0, 0, "ease-in"], [1960, 0, 8, "ease-out"], [2300, 0, 6]]),
  R(".capf .uaL", [[1500, 165], [1900, 165, "cubic-bezier(.6,0,1,1)"], [1960, 18]]),
  R(".capf .faL", [[1500, 62], [1900, 62, "cubic-bezier(.6,0,1,1)"], [1960, 0]]),
  R(".capf .uaR", [[1500, -165], [1900, -165, "cubic-bezier(.6,0,1,1)"], [1960, -18]]),
  R(".capf .faR", [[1500, -62], [1900, -62, "cubic-bezier(.6,0,1,1)"], [1960, 0]]),
  O(".capf .f-anguish", [[0, 1], [1950, 0]]), O(".capf .f-angry", [[0, 0], [1950, 1]]),
  R(".capf .head", [[1500, 0], [1950, 0], [2050, -6], [2150, 5], [2250, -3], [2400, 0]]),
  ...burst(".sp4", 1960, 9, 2.4),
  ...burst(".sp5", 1970, 9, 2.4),
];

export function TheSlip() {
  return (
    <Scene scope="slip" tracks={slipTracks}>
      <g className="s1">
        <Stadium wet />
        <ellipse cx="236" cy="274" rx="5" ry="1.4" fill="#ffffff" opacity="0.6" />
        <SidePlayer look={CAST.captain} cls="cap" x={160} y={205} s={1.45} />
        <g transform="translate(236 266)"><Ball cls="ball3" r={10} /></g>
        <Splash x={166} y={272} cls="sp3" s={1.4} />
      </g>
      <g className="s2">
        <CloseBg />
        <FrontBust look={CAST.captain} cls="capf" x={200} y={336} s={1.6} face="anguish" />
        <Splash x={150} y={300} cls="sp4" s={2} />
        <Splash x={250} y={300} cls="sp5" s={2} />
      </g>
      <Rain />
    </Scene>
  );
}

/* ------------------------------------------------------------------
 * 4. The last act (concede)
 * A word in the ear, a long pause, a headbutt to the chest. A red card.
 * Then the slow walk past the trophy.
 * ------------------------------------------------------------------ */
const walk = (sel: string, t0: number, t1: number, step: number, a: number): Track[] => [
  R(`${sel} .thN`, wave(t0, t1, step * 2, -a, a)),
  R(`${sel} .thF`, wave(t0, t1, step * 2, a, -a)),
  R(`${sel} .shN`, wave(t0, t1, step * 2, 4, a * 1.2)),
  R(`${sel} .shF`, wave(t0, t1, step * 2, a * 1.2, 4)),
  R(`${sel} .uaN`, wave(t0, t1, step * 2, a * 0.6, -a * 0.6)),
  R(`${sel} .uaF`, wave(t0, t1, step * 2, -a * 0.6, a * 0.6)),
];

const actTracks: Track[] = [
  cut(".s1", 0, 1500), cut(".s2", 1500, 2350), cut(".s3", 2350, null),
  // the maestro walks away, stops, turns
  S(".pm .flip", [[0, "-1 1", "steps(1, end)"], [640, "1 1"]]),
  T(".pm .pos", [[0, 18, 0, "linear"], [450, 0, 0], [860, 0, 0, "cubic-bezier(.5,0,.3,1)"], [1080, 16, 0], [1500, 14, 0]]),
  R(".pm .thN", [[0, -20], [150, 20], [300, -20], [450, 0], [860, 0], [1000, -26], [1080, -14], [1500, -10]]),
  R(".pm .thF", [[0, 20], [150, -20], [300, 20], [450, 0], [860, 0], [1000, 14], [1080, 26], [1500, 20]]),
  R(".pm .shN", [[0, 6], [150, 24], [300, 6], [450, 2], [1500, 4]]),
  R(".pm .shF", [[0, 24], [150, 6], [300, 24], [450, 2], [1500, 8]]),
  R(".pm .torso", [[0, 3], [860, 0], [960, -12, "cubic-bezier(.6,0,.9,.4)"], [1080, 50, "ease-out"], [1500, 18]]),
  R(".pm .head", [[0, 0], [960, -6], [1080, 22], [1500, 10]]),
  R(".pm .uaN", [[0, 15], [150, -15], [300, 15], [450, 4], [1080, 44], [1500, 12]]),
  R(".pm .uaF", [[0, -15], [150, 15], [300, -15], [450, 4], [1080, 38], [1500, 10]]),
  // the rival talks, then pays for it
  S(".df .flip", [[0, "-1 1"]]),
  T(".df .pos", [[0, 12, 0, "linear"], [450, 0, 0], [1090, 0, 0, "cubic-bezier(.2,.8,.3,1)"], [1300, 8, 22, "ease-in"], [1420, 10, 33], [1500, 10, 33]]),
  R(".df .body", [[0, 0], [1090, 0, "cubic-bezier(.2,.8,.3,1)"], [1420, -78, "ease-out"], [1500, -80]]),
  R(".df .uaN", [[0, -72], [200, -94], [350, -72], [500, -94], [650, -72], [800, -90], [1090, -80], [1300, -170], [1500, -150]]),
  R(".df .faN", [[0, -14]]),
  R(".df .uaF", [[0, 10], [1090, 10], [1300, -150], [1500, -130]]),
  R(".df .thN", [[1090, 0], [1300, -64], [1500, -40]]), R(".df .thF", [[1090, 0], [1300, -34], [1500, -22]]),
  R(".df .head", [[0, -8], [1090, -8], [1200, -32], [1500, -18]]),
  O(".df .m-open", [[0, 1], [120, 0], [240, 1], [360, 0], [480, 1], [600, 0], [720, 1], [840, 0], [1100, 1]]),
  O(".df .m-shut", [[0, 0], [120, 1], [240, 0], [360, 1], [480, 0], [600, 1], [720, 0], [840, 1], [1100, 0]]),
  ...ring(".hit4", 1090),
  // the card
  S(".s2 .zoom", [[1500, "1", "linear"], [2350, "1.08"]]),
  R(".ref .uaR", [[1500, -10, "cubic-bezier(.2,.9,.3,1.15)"], [1680, -176]]),
  R(".ref .faR", [[1500, 0, "cubic-bezier(.2,.9,.3,1.15)"], [1680, -4]]),
  R(".ref .uaL", [[1500, 8]]),
  O(".card-glint", [[0, 0], [1700, 1, "linear"], [1900, 0]]),
  T(".card-glint", [[1700, -14, 0, "ease-out"], [1900, 14, 0]]),
  // the walk past the cup
  S(".pm2 .flip", [[0, "-1 1"]]),
  T(".pm2 .pos", [[2350, 0, 0, "linear"], [DUR, -50, 0]]),
  ...walk(".pm2", 2350, DUR, 360, 14),
  R(".pm2 .torso", [[0, 6]]), R(".pm2 .head", [[0, 26]]),
  O(".s3 .glint", wave(2350, DUR, 500, 0.3, 1).map(([t, v]) => [t, v, "ease-in-out"] as Key)),
];

export function LastAct() {
  return (
    <Scene scope="act" tracks={actTracks}>
      <g className="s1">
        <Stadium />
        <SidePlayer look={CAST.rival} cls="df" x={224} y={205} s={1.3} />
        <SidePlayer look={CAST.maestro} cls="pm" x={146} y={205} s={1.3} />
        <Impact x={210} y={170} cls="hit4" r={12} />
      </g>
      <g className="s2">
        <g className="zoom" style={{ transformOrigin: "200px 150px" }}>
          <CloseBg />
          <FrontBust
            look={CAST.referee} cls="ref" x={190} y={330} s={1.5} face="stern"
            itemR={
              <g>
                <rect x="-11" y="26" width="22" height="32" rx="2" fill="#d6322f" stroke={INK} strokeWidth="1.2" />
                <rect className="card-glint" x="-3" y="27" width="5" height="30" fill="#ffffff" opacity="0" />
              </g>
            }
          />
        </g>
      </g>
      <g className="s3">
        <g className="mourn">
          <Stadium />
          <SidePlayer look={CAST.maestro} cls="pm2" x={264} y={205} s={1.3} />
          <Trophy x={162} y={229} s={1.1} />
        </g>
      </g>
    </Scene>
  );
}

/* ---------------- Shared pieces for the next four ---------------- */

/** The goal seen from in front, with a net that can bulge. */
function GoalFront({ net, bulgeAt = "200px 160px" }: { net: string; bulgeAt?: string }) {
  return (
    <>
      <g className={net} style={{ transformOrigin: bulgeAt }}>
        <path d="M136 120 L264 120 L264 206 L136 206 Z" fill="#ffffff" fillOpacity="0.06" />
        {Array.from({ length: 13 }, (_, i) => <line key={`v${i}`} x1={136 + i * 10.6} y1="120" x2={136 + i * 10.6} y2="206" className="mesh" />)}
        {Array.from({ length: 8 }, (_, i) => <line key={`h${i}`} x1="136" y1={120 + i * 12.3} x2="264" y2={120 + i * 12.3} className="mesh" />)}
        <path d="M130 112 L136 120 M270 112 L264 120 M130 214 L136 206 M270 214 L264 206" className="mesh" />
      </g>
    </>
  );
}
const GoalFrame = () => (
  <>
    <path d="M130 214 L130 112 L270 112 L270 214" fill="none" stroke="#f4f7f5" strokeWidth="5" strokeLinejoin="round" />
    <path d="M110 214 L290 214" stroke="#ffffff" strokeOpacity="0.4" strokeWidth="1.5" />
  </>
);

const bulge = (sel: string, t: number): Track => S(sel, [[0, "1"], [t - 40, "1", "ease-out"], [t, "1.04 1.06"], [t + 200, "1"]]);

/** Hands on head, then both fists into the turf at tHit, face turning from anguish to anger. */
function meltdown(cls: string, t0: number, tHit: number): Track[] {
  const fast = "cubic-bezier(.6,0,1,1)";
  return [
    T(`${cls} .pos`, [[t0, 0, 0], [tHit - 50, 0, 0, "ease-in"], [tHit + 10, 0, 8, "ease-out"], [tHit + 350, 0, 6]]),
    R(`${cls} .uaL`, [[t0, 165], [tHit - 50, 165, fast], [tHit + 10, 18]]),
    R(`${cls} .faL`, [[t0, 62], [tHit - 50, 62, fast], [tHit + 10, 0]]),
    R(`${cls} .uaR`, [[t0, -165], [tHit - 50, -165, fast], [tHit + 10, -18]]),
    R(`${cls} .faR`, [[t0, -62], [tHit - 50, -62, fast], [tHit + 10, 0]]),
    O(`${cls} .f-anguish`, [[0, 1], [tHit, 0]]), O(`${cls} .f-angry`, [[0, 0], [tHit, 1]]),
    R(`${cls} .head`, [[t0, 0], [tHit, 0], [tHit + 100, -6], [tHit + 200, 5], [tHit + 300, -3], [tHit + 450, 0]]),
  ];
}

/* ------------------------------------------------------------------
 * 5. The overhead (goal)
 * Back to goal, a looping cross, upside down, top corner.
 * ------------------------------------------------------------------ */
const overheadTracks: Track[] = [
  cut(".s1", 0, 850), cut(".s2", 850, 1100), cut(".s3", 1100, null),
  S(".nine .flip", [[0, "-1 1"]]),
  T(".nine .pos", [[0, 0, 0], [260, 2, -22, "ease-out"], [520, 4, -40], [620, 4, -38, "ease-in"], [850, 6, 36]]),
  R(".nine .body", [[0, 0], [260, -40], [460, -150], [620, -178, "ease-in"], [850, -96]]),
  R(".nine .thF", [[0, 0], [260, -80], [440, -60], [520, 20], [850, -20]]),
  R(".nine .shF", [[0, 0], [260, 30], [520, 40], [850, 30]]),
  R(".nine .thN", [[0, 0], [260, 20], [440, 34, "cubic-bezier(.5,0,.2,1)"], [520, -30], [620, -70], [850, -30]]),
  R(".nine .shN", [[0, 0], [260, 70], [440, 92], [520, 4], [850, 30]]),
  R(".nine .uaN", [[0, 10], [260, -60], [520, 60], [850, 100]]),
  R(".nine .uaF", [[0, -10], [260, 60], [520, 120], [850, 110]]),
  R(".nine .head", [[0, 0], [520, -24], [850, -10]]),
  O(".nine .shadow", [[0, 1], [100, 0.4, "linear"], [850, 1]]),
  T(".ball5", [[0, 40, 40, "linear"], [260, 130, 34, "linear"], [520, 220, 80, "cubic-bezier(.2,.6,.4,1)"], [700, 430, 40]]),
  R(".ball5", [[0, 0, "linear"], [700, 720]]),
  ...ring(".hit5", 520),
  T(".ball6", [[850, 150, 330, "cubic-bezier(.15,.5,.35,1)"], [1060, 146, 124], [1100, 142, 120]]),
  S(".ball6", [[850, "2.6", "cubic-bezier(.15,.5,.35,1)"], [1060, "0.55"], [1100, "0.5"]]),
  R(".ball6", [[850, 0, "linear"], [1100, -700]]),
  bulge(".net6", 1080),
  R(".gk6 .uaN", [[850, 10]]), R(".gk6 .uaF", [[850, -10]]), R(".gk6 .head", [[850, -20]]),
  // "Can't hear you"
  R(".ninef .uaL", [[1100, 10, "cubic-bezier(.2,.9,.3,1.2)"], [1350, 120]]),
  R(".ninef .faL", [[1100, 0, "cubic-bezier(.2,.9,.3,1.2)"], [1350, 108]]),
  R(".ninef .uaR", [[1100, -10, "cubic-bezier(.2,.9,.3,1.2)"], [1350, -120]]),
  R(".ninef .faR", [[1100, 0, "cubic-bezier(.2,.9,.3,1.2)"], [1350, -108]]),
  R(".ninef .head", [[1100, 0], ...wave(1400, DUR, 700, -6, 6)]),
  S(".ninef .pos", [[1100, "0.92", "linear"], [DUR, "1.03"]]),
];

export function Overhead() {
  return (
    <Scene scope="overhead" tracks={overheadTracks}>
      <g className="s1">
        <Stadium />
        <SidePlayer look={CAST.striker} cls="nine" x={215} y={205} s={1.35} />
        <g className="ball5"><Ball r={10} /></g>
        <Impact x={220} y={80} cls="hit5" />
      </g>
      <g className="s2">
        <Stadium />
        <GoalFront net="net6" bulgeAt="142px 124px" />
        <SidePlayer look={CAST.keeper} cls="gk6" x={205} y={178} s={0.75} />
        <g className="ball6"><Ball r={10} /></g>
        <GoalFrame />
      </g>
      <g className="s3">
        <CloseBg />
        <FrontBust look={CAST.striker} cls="ninef" x={200} y={322} s={1.6} face="smug" />
      </g>
    </Scene>
  );
}

/* ------------------------------------------------------------------
 * 6. The chip (goal)
 * The keeper goes early. The ball floats down the middle.
 * ------------------------------------------------------------------ */
const chipTracks: Track[] = [
  cut(".s1", 0, 1250), cut(".s2", 1250, null),
  T(".gk7 .pos", [[0, 0, 0], [110, 0, -4], [220, 0, 0], [330, 0, -2, "ease-out"], [620, 46, -14, "ease-in"], [880, 54, 22], [1250, 54, 24]]),
  R(".gk7 .body", [[0, 0], [330, 0], [620, 78], [880, 90]]),
  R(".gk7 .uaN", [[0, 30], [330, 40], [600, -170]]), R(".gk7 .uaF", [[0, -30], [330, -40], [600, -160]]),
  R(".gk7 .thN", [[330, 0], [620, 20], [880, 4]]), R(".gk7 .thF", [[330, 0], [620, 40], [880, 10]]),
  R(".gk7 .shF", [[330, 0], [620, 50], [880, 10]]),
  R(".gk7 .head", [[0, 0], [880, 0], [1000, -60]]),
  T(".ball7", [[0, 200, 330], [300, 200, 330, "cubic-bezier(.2,.7,.4,1)"], [760, 200, 132, "cubic-bezier(.5,0,.8,.4)"], [1180, 200, 168], [1250, 200, 170]]),
  S(".ball7", [[300, "2.4", "cubic-bezier(.2,.7,.4,1)"], [760, "0.95", "linear"], [1180, "0.55"]]),
  R(".ball7", [[300, 0, "linear"], [1250, 220]]),
  bulge(".net7", 1180),
  // the shrug
  R(".chipf .uaL", [[1250, 0, "cubic-bezier(.2,.9,.3,1.2)"], [1500, 26]]),
  R(".chipf .faL", [[1250, 0, "cubic-bezier(.2,.9,.3,1.2)"], [1500, 78]]),
  R(".chipf .uaR", [[1250, 0, "cubic-bezier(.2,.9,.3,1.2)"], [1500, -26]]),
  R(".chipf .faR", [[1250, 0, "cubic-bezier(.2,.9,.3,1.2)"], [1500, -78]]),
  T(".chipf .pos", [[1250, 0, 0], [1500, 0, -8], [1900, 0, -8], [2100, 0, 0]]),
  R(".chipf .head", [[1250, 0], [1500, 8], [2200, 8], [2500, -4]]),
];

export function Chip() {
  return (
    <Scene scope="mo-chip" tracks={chipTracks}>
      <g className="s1">
        <Stadium />
        <GoalFront net="net7" bulgeAt="200px 170px" />
        <SidePlayer look={CAST.keeper} cls="gk7" x={200} y={178} s={0.75} />
        <g className="ball7"><Ball r={10} /></g>
        <GoalFrame />
      </g>
      <g className="s2">
        <CloseBg />
        <FrontBust look={CAST.maestro} cls="chipf" x={200} y={322} s={1.6} face="smug" />
      </g>
    </Scene>
  );
}

/* ------------------------------------------------------------------
 * 7. The own goal (concede)
 * A towering header. Perfect technique. Wrong net.
 * ------------------------------------------------------------------ */
const ownGoalTracks: Track[] = [
  cut(".s1", 0, 1500), cut(".s2", 1500, null),
  S(".cb .flip", [[0, "1 1", "steps(1, end)"], [1180, "-1 1"]]),
  T(".cb .pos", [[0, 0, 0], [400, 0, 0, "ease-out"], [620, 0, -24, "ease-in"], [880, 0, 0]]),
  R(".cb .body", [[0, 0], [500, 0], [620, -18], [880, 0]]),
  R(".cb .head", [[0, 0], [540, -10], [620, -34], [880, 0], [1180, 0], [1300, 14]]),
  R(".cb .thN", [[400, 0], [620, -24], [880, 0]]), R(".cb .shN", [[400, 0], [620, 50], [880, 0]]),
  R(".cb .thF", [[400, 0], [620, 10], [880, 0]]), R(".cb .shF", [[400, 0], [620, 60], [880, 0]]),
  R(".cb .uaN", [[0, 0], [620, -130], [880, 10], [1180, 10], [1300, -160]]),
  R(".cb .faN", [[0, 0], [880, 0], [1300, -110]]),
  R(".cb .uaF", [[0, 0], [620, -110], [880, -10], [1180, -10], [1300, -150]]),
  R(".cb .faF", [[0, 0], [880, 0], [1300, -110]]),
  O(".cb .m-shut", [[0, 1], [1180, 0]]), O(".cb .m-open", [[0, 0], [1180, 1]]),
  T(".ball8", [[0, 390, 20, "linear"], [620, 228, 100, "cubic-bezier(.2,.5,.5,1)"], [850, 180, 70, "cubic-bezier(.5,0,.9,.6)"], [1120, 120, 142], [1500, 118, 146]]),
  R(".ball8", [[0, 0, "linear"], [1120, -800]]),
  ...ring(".hit8", 620),
  T(".gk8 .pos", [[0, 0, 0], [850, 0, 0, "ease-out"], [1020, -4, -18, "ease-in"], [1200, -2, 0]]),
  R(".gk8 .body", [[850, 0], [1020, -16], [1200, -4]]),
  R(".gk8 .head", [[0, 0], [700, -20], [900, -40], [1300, -10]]),
  R(".gk8 .uaN", [[850, 20], [1020, -170], [1300, 30]]), R(".gk8 .uaF", [[850, -10], [1020, -160], [1300, -20]]),
  bulge(".net8", 1140),
  ...meltdown(".cbf", 1500, 1960),
  ...burst(".sp8a", 1970, 9, 2.4), ...burst(".sp8b", 1980, 9, 2.4),
];

export function OwnGoal() {
  return (
    <Scene scope="owngoal" tracks={ownGoalTracks}>
      <g className="s1">
        <Stadium />
        <SideGoal x={148} ground={268} bar={104} dir={-1} cls="net8" />
        <SidePlayer look={CAST.homeKeeper} cls="gk8" x={174} y={205} s={1.3} />
        <SidePlayer look={CAST.stopper} cls="cb" x={240} y={205} s={1.3} />
        <g className="ball8"><Ball r={10} /></g>
        <Impact x={228} y={100} cls="hit8" r={12} />
      </g>
      <g className="s2">
        <CloseBg />
        <FrontBust look={CAST.stopper} cls="cbf" x={200} y={336} s={1.6} face="anguish" />
        <Splash x={150} y={300} cls="sp8a" s={2} />
        <Splash x={250} y={300} cls="sp8b" s={2} />
      </g>
    </Scene>
  );
}

/* ------------------------------------------------------------------
 * 8. The scorpion save (concede)
 * Their keeper dives forward and clears it with his heels. Then he lets you know.
 * ------------------------------------------------------------------ */
const scorpionTracks: Track[] = [
  cut(".s1", 0, 1350), cut(".s2", 1350, null),
  S(".sk .flip", [[0, "-1 1"]]),
  T(".sk .pos", [[0, 0, 0], [320, 0, 2, "ease-out"], [640, -20, -30, "ease-in"], [900, -26, 30], [1000, -26, 36]]),
  R(".sk .body", [[0, 0], [320, 10], [640, 80], [900, 88]]),
  R(".sk .thN", [[320, 0], [640, 40], [900, 0]]), R(".sk .thF", [[320, 0], [640, 34], [900, 4]]),
  R(".sk .shN", [[320, 10], [640, 150], [900, 10]]), R(".sk .shF", [[320, 10], [640, 140], [900, 20]]),
  R(".sk .uaN", [[0, -30], [640, -150], [900, -100]]), R(".sk .uaF", [[0, -20], [640, -140], [900, -90]]),
  R(".sk .head", [[0, 0], [640, -30], [900, -40]]),
  T(".ball9", [[0, 50, 40, "linear"], [640, 206, 148, "cubic-bezier(.2,.6,.4,1)"], [1000, 70, 20]]),
  R(".ball9", [[0, 0, "linear"], [640, 400, "linear"], [1000, -200]]),
  ...ring(".hit9", 640),
  // the finger wag
  R(".skf .uaR", [[1350, -10, "cubic-bezier(.2,.9,.3,1.2)"], [1560, -35]]),
  R(".skf .faR", [[1350, 0, "cubic-bezier(.2,.9,.3,1.2)"], [1560, -145], ...wave(1700, DUR, 300, -132, -158)]),
  R(".skf .uaL", [[1350, 8]]),
  R(".skf .head", [[1350, 0], ...wave(1700, DUR, 600, -5, 5)]),
  S(".skf .pos", [[1350, "0.94", "linear"], [DUR, "1.03"]]),
];

export function Scorpion() {
  return (
    <Scene scope="scorpion" tracks={scorpionTracks}>
      <g className="s1">
        <Stadium />
        <SideGoal x={268} ground={268} bar={104} dir={1} />
        <SidePlayer look={CAST.keeper} cls="sk" x={236} y={205} s={1.3} />
        <g className="ball9"><Ball r={10} /></g>
        <Impact x={206} y={148} cls="hit9" r={12} />
      </g>
      <g className="s2">
        <CloseBg />
        <FrontBust look={CAST.keeper} cls="skf" x={200} y={322} s={1.6} face="smug" itemR={<Finger skin="#f4f7f5" />} />
      </g>
    </Scene>
  );
}

export const SCENES: Record<string, () => React.JSX.Element> = {
  thunderbolt: Thunderbolt,
  "rain-slide": RainSlide,
  "the-slip": TheSlip,
  "last-act": LastAct,
  overhead: Overhead,
  "the-chip": Chip,
  "own-goal": OwnGoal,
  scorpion: Scorpion,
};
