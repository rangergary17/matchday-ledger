import { useEffect } from "react";
import { SCENES } from "./moments/scenes";
import type { MomentDef } from "../lib/moments";

/*
 * Broadcast-style goal and concede moments: a full-screen takeover with
 * a scene from ./moments, a camera that pushes in for joy and shakes for
 * anger, confetti, and the slam text.
 */

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
    <div className={`moment ${moment.kind} m-${moment.id}`} onClick={onDone} role="status">
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
