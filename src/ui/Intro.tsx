import { useEffect, useRef } from "react";

export function Intro({ onStart }: { club: string; onStart: () => void }) {
  const ref = useRef<HTMLHeadingElement>(null);
  useEffect(() => ref.current?.focus(), []);
  return (
    <section className="intro" aria-labelledby="intro-title">
      <h2 id="intro-title" ref={ref} tabIndex={-1}>Learn how money works. <span>One match a day.</span></h2>
      <p className="lede">You own a football club. Raise venture capital, run it like an owner, then face a private equity buyout.</p>
      <ol className="steps">
        <li><div><b>Answer to score</b><span>Three chances and a penalty. About 3 minutes.</span></div></li>
        <li><div><b>Make the call</b><span>Use what you learned on your own club.</span></div></li>
        <li><div><b>Grow your wealth</b><span>Your stake, plus what you've banked.</span></div></li>
      </ol>
      <button className="btn block" onClick={onStart}>Start</button>
    </section>
  );
}
