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
    const file = new File([blob], "chairman-card.png", { type: "image/png" });
    try {
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], text: `My Matchday Ledger chairman rating: ${p.overall}. ${SITE_URL}` });
        return;
      }
    } catch { /* user cancelled or not allowed: fall back to download */ }
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "chairman-card.png";
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    setMsg("Card saved as an image.");
  }

  return (
    <div>
      <h2 ref={ref} tabIndex={-1} className="page-title">Chairman card</h2>
      <div className={`fut ${t}`}>
        <div className="fut-top">
          <span className="fut-ovr">{p.overall}</span>
          <span className="fut-pos">Chairman</span>
        </div>
        <div className="fut-name">{p.name || "The Chairman"}</div>
        <div className="fut-club">{p.club}</div>
        <dl className="fut-stats">
          {p.skills.map((s) => (
            <div key={s.key}><dt>{s.key}</dt><dd>{s.rating}</dd></div>
          ))}
        </dl>
      </div>
      <label className="name-field">
        <span>Name on your card</span>
        <input value={p.name} maxLength={16} onChange={(e) => p.onName(e.target.value)} placeholder="The Chairman" autoComplete="nickname" />
      </label>
      <div className="btn-row">
        <button className="btn" onClick={share}>Share my card</button>
      </div>
      <p className="toast" role="status">{msg}</p>
      <p className="dim small">Ratings run from 40 to 99. Each match sets a topic's score, and training drills move it up or down. Gold from 70.</p>

      <h3 className="section-title">Skills</h3>
      <ul className="skills">
        {p.skills.map((s) => (
          <li key={s.key}>
            <button className="skill-head" aria-expanded={open === s.key} onClick={() => setOpen(open === s.key ? null : s.key)}>
              <span className="sk-key">{s.key}</span><span className="sk-name">{s.name}</span><span className="sk-r">{s.rating}</span>
            </button>
            {open === s.key && (
              <ul className="topics">
                {s.topics.map((tp) => (
                  <li key={tp.number}>
                    <span className="tp-name">{tp.topic}</span>
                    <span className="bar" aria-label={tp.score === null ? "Not played yet" : `${Math.round(tp.score * 100)}% mastered`}><span style={{ width: `${(tp.score ?? 0) * 100}%` }} /></span>
                    {tp.score !== null ? (
                      <span className="tp-act"><button onClick={() => p.onTrain(tp.number)}>Train</button><button onClick={() => p.onReplay(tp.number)}>Replay</button></span>
                    ) : <span className="tp-act dim small">Not played</span>}
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
});
