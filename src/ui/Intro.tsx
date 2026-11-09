import { useEffect, useRef } from "react";

export function Intro({ club, onStart }: { club: string; onStart: () => void }) {
  const ref = useRef<HTMLHeadingElement>(null);
  useEffect(() => ref.current?.focus(), []);
  return (
    <section className="intro" aria-labelledby="intro-title">
      <p className="eyebrow">Welcome, Chairman</p>
      <h2 id="intro-title" ref={ref} tabIndex={-1}>You've just bought {club}</h2>
      <p>8,000 fans, $2M in the bank, a $3M loan and big plans. You own 100% of it. For now.</p>
      <ul className="intro-list">
        <li><b>Act 1, The Raise.</b> Sell slices of the club to venture investors without giving it away.</li>
        <li><b>Act 2, Run It Like an Owner.</b> The numbers every investor checks.</li>
        <li><b>Act 3, The Buyout.</b> A private equity firm comes calling. Debt, multiples, the exit.</li>
        <li><b>One match a day.</b> Get the numbers right to score: 3 chances, then a penalty where you type the answer. Then make the Chairman's call on your own club.</li>
      </ul>
      <p className="dim small">Your score is your wealth: what you've banked, plus your stake of what the club is worth.</p>
      <button className="btn" onClick={onStart}>Take your seat</button>
    </section>
  );
}
