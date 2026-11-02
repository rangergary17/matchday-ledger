import { useEffect, useRef } from "react";

export function Intro({ club, onStart }: { club: string; onStart: () => void }) {
  const ref = useRef<HTMLHeadingElement>(null);
  useEffect(() => ref.current?.focus(), []);
  return (
    <section className="intro" aria-labelledby="intro-title">
      <p className="eyebrow">Welcome, Chairman</p>
      <h2 id="intro-title" ref={ref} tabIndex={-1}>You've just bought {club}</h2>
      <p>8,000 fans. $2M in the bank. A board that wants a top 10 finish and no money lost.</p>
      <ul className="intro-list">
        <li><b>One match a day.</b> Same match for everyone. About 3 minutes.</li>
        <li><b>Get the numbers right to score.</b> 3 chances, then a penalty where you type the answer.</li>
        <li><b>Then make the Chairman's call.</b> Use today's idea on your own club. Good calls grow it.</li>
        <li><b>Train your weak spots.</b> Missed topics come back with fresh numbers and raise your rating.</li>
      </ul>
      <button className="btn" onClick={onStart}>Take your seat</button>
    </section>
  );
}
