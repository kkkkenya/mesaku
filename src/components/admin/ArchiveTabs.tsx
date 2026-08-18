interface ArchiveTabsProps {
  view: "active" | "archived";
  onChange: (view: "active" | "archived") => void;
  activeCount: number;
  archivedCount: number;
}

const tabs = [
  { key: "active" as const, label: "Active" },
  { key: "archived" as const, label: "Archive" },
];

export default function ArchiveTabs({ view, onChange, activeCount, archivedCount }: ArchiveTabsProps) {
  return (
    <div role="tablist" aria-label="Filter items" className="inline-flex p-1 mb-5 rounded-lg bg-slate-100">
      {tabs.map((t) => {
        const selected = view === t.key;
        const count = t.key === "active" ? activeCount : archivedCount;
        return (
          <button
            key={t.key}
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(t.key)}
            className={`h-9 px-4 rounded-md text-sm font-semibold transition-colors ${
              selected ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            {t.label} <span className="opacity-60">({count})</span>
          </button>
        );
      })}
    </div>
  );
}
