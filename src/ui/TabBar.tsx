export type Tab = "match" | "club" | "table" | "card";

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: "match", label: "Match", icon: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 3.2 2.9 2.1-1.1 3.4H10.2L9.1 7.3 12 5.2Z" },
  { key: "club", label: "Club", icon: "M4 20V9l8-5 8 5v11h-5v-6H9v6H4Z" },
  { key: "table", label: "Table", icon: "M4 5h16v3H4V5Zm0 5.5h16v3H4v-3Zm0 5.5h16v3H4v-3Z" },
  { key: "card", label: "Card", icon: "M7 3h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm1 4v4h4V7H8Zm0 7v2h8v-2H8Z" },
];

export function TabBar({ tab, onTab, badges }: { tab: Tab; onTab: (t: Tab) => void; badges: Partial<Record<Tab, boolean>> }) {
  return (
    <nav className="tabbar" aria-label="Sections">
      {TABS.map((t) => (
        <button key={t.key} className={tab === t.key ? "on" : ""} aria-current={tab === t.key ? "page" : undefined} onClick={() => onTab(t.key)}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d={t.icon} /></svg>
          <span>{t.label}</span>
          {badges[t.key] && <i className="dot" aria-label="needs attention" />}
        </button>
      ))}
    </nav>
  );
}
