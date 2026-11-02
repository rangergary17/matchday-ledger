/** Display helpers for the club dashboard (not used in lesson maths). */
export function money(n: number): string {
  const sign = n < 0 ? "-" : "";
  const a = Math.abs(n);
  if (a >= 1e6) return `${sign}$${(a / 1e6).toFixed(2).replace(/\.?0+$/, "")}M`;
  return `${sign}$${Math.round(a).toLocaleString("en-US")}`;
}
export function signedMoney(n: number): string {
  return (n >= 0 ? "+" : "") + money(n);
}
export function count(n: number): string {
  return Math.round(n).toLocaleString("en-US");
}
export function signedCount(n: number): string {
  return (n >= 0 ? "+" : "-") + count(Math.abs(n));
}
export function reducedMotion(): boolean {
  try {
    return matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}
