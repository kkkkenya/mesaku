const stats = [
  { value: "2022", label: "Year Founded" },
  { value: "200+", label: "Members" },
  { value: "30+", label: "Events Held" },
  { value: "10+", label: "Projects Completed" },
];

const StatsStrip = () => (
  <div className="w-full bg-[#1E3A8A] py-6">
    <div className="max-w-6xl mx-auto px-4 md:px-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
      {stats.map((s) => (
        <div key={s.label}>
          <p className="text-3xl font-bold text-white">{s.value}</p>
          <p className="text-sm text-blue-200 mt-1">{s.label}</p>
        </div>
      ))}
    </div>
  </div>
);

export default StatsStrip;