import { forwardRef } from "react";
import type { Club } from "../lib/club";
import { cfgOf, clubValue, equityValue, matchdayProfit, wealth } from "../lib/club";
import { ordinal } from "../lib/league";
import type { Season } from "../lib/types";
import { count, money, signedCount, signedMoney } from "./fmt";

interface Props {
  club: Club;
  season: Season;
  position: number;
  teams: number;
}

const pct = (x: number) => `${Math.round(x * 1000) / 10}%`;

export const ClubView = forwardRef<HTMLHeadingElement, Props>(function ClubView({ club, season, position, teams }, ref) {
  const c = cfgOf(season);
  const s = club.state;
  const start = season.club.start;
  const profit = matchdayProfit(s);
  const value = clubValue(s, c);
  const equity = equityValue(s, c);
  const w = wealth(s, c);
  const w0 = wealth(start, c);
  const mood = s.board >= 75 ? "Delighted" : s.board >= 55 ? "Happy" : s.board >= 35 ? "Uneasy" : "Furious";
  const news = [...club.news].reverse().slice(0, 30);
  return (
    <div className="club">
      <h2 ref={ref} tabIndex={-1} className="page-title">{season.club.name}</h2>

      <section className="wealth" aria-label="Your wealth">
        <span>Your wealth</span>
        <b>{money(w)}</b>
        <small className={w >= w0 ? "pos" : "neg"}>{signedMoney(w - w0)} since you took over</small>
        <p className="equation small">
          {s.banked > 0 && <>{money(s.banked)} banked + </>}{pct(s.stake)} of {money(equity)}
        </p>
      </section>

      <div className="stats-grid">
        <div className="stat"><span>Your stake</span><b>{pct(s.stake)}</b><small>{s.stake < 1 ? "Diluted by investors" : "You own it all"}</small></div>
        <div className="stat"><span>League</span><b>{ordinal(position)}</b><small>of {teams}</small></div>
        <div className="stat"><span>Cash</span><b className={s.cash < 0 ? "neg" : ""}>{money(s.cash)}</b><small>{signedMoney(s.cash - start.cash)}</small></div>
        <div className="stat"><span>Debt</span><b>{money(s.debt)}</b><small>{s.debt > start.debt ? "Up since you arrived" : s.debt < start.debt ? "Paid down" : "Unchanged"}</small></div>
        <div className="stat"><span>Crowd</span><b>{count(s.fans)}</b><small>{signedCount(s.fans - start.fans)} since you arrived</small></div>
        <div className="stat"><span>Board</span><b>{s.board}%</b><small>{mood}</small></div>
      </div>
      <div className="meter" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={s.board} aria-label="Board confidence"><span style={{ width: `${s.board}%` }} /></div>

      <section className="panel">
        <h3>What the club is worth</h3>
        <p className="equation">{count(s.fans)} fans x {money(s.contrib)} - {money(s.fixed)} = <b className={profit >= 0 ? "pos" : "neg"}>{money(profit)}</b> a matchday</p>
        <p className="equation">{money(profit)} x {c.matchdaysPerYear} matchdays x {c.multiple} = <b>{money(value)}</b></p>
        <p className="equation">{money(value)} + {money(s.cash)} cash - {money(s.debt)} debt = <b>{money(equity)}</b> for the owners</p>
        <p className="dim small">Buyers pay a multiple of yearly profit, then lenders are paid first. Grow profit, keep debt sensible, and don't sell slices of the club cheaply.</p>
      </section>

      <section className="panel">
        <h3>Board targets</h3>
        <ul className="targets">
          <li className={position <= 10 ? "met" : ""}>Finish in the top 10 <span>{position <= 10 ? "On track" : "Not yet"}</span></li>
          <li className={w > w0 ? "met" : ""}>Grow your wealth above {money(w0)} <span>{w > w0 ? "On track" : "Not yet"}</span></li>
          <li className={s.fans > start.fans ? "met" : ""}>Grow the crowd above {count(start.fans)} <span>{s.fans > start.fans ? "On track" : "Not yet"}</span></li>
        </ul>
      </section>

      <section className="panel">
        <h3>Club news</h3>
        {news.length === 0 ? <p className="dim small">Nothing yet. Play today's match.</p> : (
          <ul className="news">
            {news.map((n, i) => (
              <li key={i} className={n.kind}>
                <span className="md">MD {n.day}</span>
                <span className="txt">{n.text}</span>
                <span className="amt">
                  {n.cash !== undefined && n.cash !== 0 && <b className={n.cash >= 0 ? "pos" : "neg"}>{signedMoney(n.cash)}</b>}
                  {n.fans !== undefined && n.fans !== 0 && <b className={n.fans >= 0 ? "pos" : "neg"}>{signedCount(n.fans)} fans</b>}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
});
