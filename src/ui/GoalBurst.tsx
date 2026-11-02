import { useEffect, useState } from "react";

/** Big "GOAL" moment. Shown briefly, never blocks input, skipped with reduced motion. */
export function GoalBurst({ trigger, text }: { trigger: number; text: string }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (!trigger) return;
    setShow(true);
    const id = setTimeout(() => setShow(false), 1300);
    return () => clearTimeout(id);
  }, [trigger]);
  if (!show) return null;
  return <div className="burst" aria-hidden="true"><span>{text}</span></div>;
}
