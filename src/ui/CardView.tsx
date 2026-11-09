import { forwardRef, useState } from "react";
import type { SkillRating } from "../lib/skills";
import { tier } from "../lib/skills";
import { cardPng } from "./cardImage";
import { SITE_URL } from "../config";

interface Props {
  name: string;
  club: string;
  overall: number;
  skills: SkillRating[];
  sound: boolean;
  onSound: (on: boolean) => void;
  onName: (n: string) => void;
  onTrain: (match: number) => void;
  onReplay: (match: number) => void;
}

export const CardView = forwardRef<HTMLHeadingElement, Props>(function CardView(p, ref) {
  const t = tier(p.overall);
  const [msg, setMsg] = useState("");
  const [open, setOpen] = useState<string | null>(null);

  async function share() {
    const blob = await cardPng({ name: p.name, club: p.club, overall: p.overall, tier: t, skills: p.skills, site: SITE_URL });
    if (!blob) { setMsg("Couldn't make the image on this browser."); return; }
    const file = new File([blob], "bizball-card.png", { type: "image/png" });
    try {
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], text: `My BizBall rating: ${p.overall}. ${SITE_URL}` });
        return;
      }
    } catch { /* cancelled or not allowed: fall back to download */ }
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "bizball-card.png";
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    setMsg("Saved as an image.");
  }

  return (
    <div className="club">
      <h2 ref={ref} tabIndex={-1} className="page-title">Your card</h2>
      <div className="fut" aria-label={`Rating ${p.overall}, ${t}`}>
        <div className="fut-top">
          <div><div className="fut-ovr">{p.overall}</div><span className="fut-tier">{t}</span></div>
          <span className="fut-pos">BizBall<br />Chairman</span>
        </div>
        <div className="fut-name">{p.name || "The Chairman"}</div>
        <div className="fut-club">{p.club}</div>
        <dl className="fut-stats">
          {p.skills.map((s) => (
            <div key={s.key}><dt>{s.key}</dt><dd>{s.rating}</dd></div>
          ))}
        </dl>
      </div>
      <button className="btn block" onClick={share}>Share card</button>
      <p className="toast" role="status" style={msg ? undefined : { minHeight: 0, margin: "-16px 0 0" }}>{msg}</p>

      <p className="section-title">Skills</p>
      <ul className="skills">
        {p.skills.map((s) => (
          <li key={s.key}>
            <button className="skill-head" aria-expanded={open === s.key} onClick={() => setOpen(open === s.key ? null : s.key)}>
              <span className="sk-name">{s.name}</span><span className="sk-r">{s.rating}</span>
            </button>
            {open === s.key && (
              <ul className="topics">
                {s.topics.map((tp) => (
                  <li key={tp.number}>
                    <span>{tp.topic}</span>
                    <span className="bar" aria-label={tp.score === null ? "Not played yet" : `${Math.round(tp.score * 100)}% mastered`}><span style={{ width: `${(tp.score ?? 0) * 100}%` }} /></span>
                    {tp.score !== null && (
                      <span className="tp-act"><button onClick={() => p.onTrain(tp.number)}>Train</button><button onClick={() => p.onReplay(tp.number)}>Replay</button></span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
      <p className="dim small">Ratings run from 40 to 99. Matches set them, training moves them.</p>

      <p className="section-title">Settings</p>
      <label className="name-field">
        <span>Name on your card</span>
        <input value={p.name} maxLength={16} onChange={(e) => p.onName(e.target.value)} placeholder="The Chairman" autoComplete="nickname" />
      </label>
      <div className="setting">
        <span>Sound</span>
        <button className="switch" role="switch" aria-checked={p.sound} aria-label="Sound" onClick={() => p.onSound(!p.sound)} />
      </div>
      <p className="dim small">A new match every day at midnight, your time. Your club lives on this device. No account, no ads.</p>
    </div>
  );
});
