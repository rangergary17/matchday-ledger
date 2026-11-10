import { useEffect, useRef, useState } from "react";
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
  const Scene = SCENES[moment.id];
  const clip = useClip(moment.video);
  const goal = moment.kind === "goal";
  // With a clip, the overlay waits for the clip's own beat (the ball hitting the net),
  // then mounts fresh so its CSS timings (tuned for a beat at 1.1s) line up.
  const [fx, setFx] = useState<"show" | "hold">("show");
  const [fxKey, setFxKey] = useState(0);
  useEffect(() => {
    if (!clip.ready) return;
    setFx("hold");
    const id = setTimeout(() => { setFx("show"); setFxKey((k) => k + 1); }, Math.max(0, (moment.beat ?? 1100) - 1100));
    return () => clearTimeout(id);
  }, [clip.ready, moment.beat]);
  useEffect(() => {
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ms = reduced ? 2000 : clip.ready ? moment.length ?? 3400 : 3400;
    const id = setTimeout(onDone, ms);
    const key = (e: KeyboardEvent) => { if (e.key === "Escape" || e.key === "Enter" || e.key === " ") onDone(); };
    window.addEventListener("keydown", key);
    return () => { clearTimeout(id); window.removeEventListener("keydown", key); };
  }, [onDone, clip.ready, moment.length]);
  return (
    <div className={`moment ${moment.kind} m-${moment.id}${clip.ready ? " has-clip" : ""}`} onClick={onDone} role="status">
      <div className="cam">
        {Scene ? <Scene /> : moment.poster && <img className="moment-poster" src={`/moments/${moment.poster}`} alt="" />}
        {clip.src && <video ref={clip.ref} className={`moment-video${clip.ready ? " on" : ""}`} src={clip.src} muted playsInline autoPlay preload="auto" onPlaying={clip.onPlaying} onError={clip.fail} />}
      </div>
      <div className="vignette" />
      {fx === "show" && (
        <div className="moment-fx" key={fxKey}>
          <div className="flash" />
          {goal && <Confetti />}
          <div className="moment-text">
            <span className="slam" data-text={goal ? "Goal" : "Conceded"}>{goal ? "Goal" : "Conceded"}</span>
            <div className="moment-cap">
              <b>{moment.title}</b>
              <span>{moment.quip}</span>
            </div>
          </div>
        </div>
      )}
      <span className="moment-skip" aria-hidden="true">Tap to skip</span>
    </div>
  );
}

function useClip(video?: string) {
  const ref = useRef<HTMLVideoElement>(null);
  const [state, setState] = useState<"wait" | "on" | "off">("wait");
  const skip = !video || typeof window === "undefined" || matchMedia("(prefers-reduced-motion: reduce)").matches
    || Boolean((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData);
  useEffect(() => {
    if (skip) return;
    const id = setTimeout(() => setState((s) => (s === "wait" ? "off" : s)), 300);
    return () => clearTimeout(id);
  }, [skip]);
  useEffect(() => { if (state === "off") ref.current?.pause(); }, [state]);
  return {
    ref,
    src: skip || state === "off" ? undefined : `/moments/${video}`,
    ready: state === "on",
    onPlaying: () => setState((s) => (s === "wait" ? "on" : s)),
    fail: () => setState("off"),
  };
}
