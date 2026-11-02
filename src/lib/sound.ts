/**
 * Crowd and whistle sounds, made in the browser (no audio files to load).
 * Off by default. Never throws.
 */
let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  try {
    if (!ctx) {
      const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function noise(c: AudioContext, seconds: number): AudioBufferSourceNode {
  const buf = c.createBuffer(1, Math.floor(c.sampleRate * seconds), c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource();
  src.buffer = buf;
  return src;
}

function crowd(c: AudioContext, seconds: number, peak: number, freq: number) {
  const src = noise(c, seconds);
  const filter = c.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = freq;
  filter.Q.value = 0.6;
  const gain = c.createGain();
  const t = c.currentTime;
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(peak, t + 0.15);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + seconds);
  src.connect(filter).connect(gain).connect(c.destination);
  src.start();
}

function whistle(c: AudioContext, length = 0.35) {
  const osc = c.createOscillator();
  const lfo = c.createOscillator();
  const lfoGain = c.createGain();
  const gain = c.createGain();
  osc.frequency.value = 2900;
  lfo.frequency.value = 28;
  lfoGain.gain.value = 120;
  lfo.connect(lfoGain).connect(osc.frequency);
  const t = c.currentTime;
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(0.08, t + 0.02);
  gain.gain.setValueAtTime(0.08, t + length - 0.05);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + length);
  osc.connect(gain).connect(c.destination);
  osc.start(); lfo.start();
  osc.stop(t + length); lfo.stop(t + length);
}

export function playSound(kind: "goal" | "conceded" | "whistle" | "saved", enabled: boolean): void {
  if (!enabled) return;
  try {
    const c = audio();
    if (!c) return;
    if (kind === "goal") crowd(c, 2.2, 0.5, 900);
    else if (kind === "conceded") crowd(c, 1.0, 0.18, 300);
    else if (kind === "saved") crowd(c, 1.2, 0.25, 500);
    else whistle(c);
  } catch {
    /* sound is a nice-to-have */
  }
}

export function buzz(pattern: number[]): void {
  try {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    navigator.vibrate?.(pattern);
  } catch {
    /* not supported */
  }
}
