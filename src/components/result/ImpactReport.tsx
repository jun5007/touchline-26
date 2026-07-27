const order = [
  ["attackThreat", "공격 위협"],
  ["possessionStability", "점유 안정"],
  ["pressingIntensity", "압박 강도"],
  ["defensiveStability", "수비 안정"],
] as const;

export function ImpactReport({
  before,
  after,
}: {
  before: Record<string, number>;
  after: Record<string, number>;
}) {
  return (
    <section className="panel p-5 sm:p-6" aria-labelledby="impact-report-title">
      <p className="text-[10px] font-black tracking-[.13em] text-[#75b9ff]">BEFORE / AFTER</p>
      <h2 id="impact-report-title" className="mt-2 text-lg font-black text-white">교체 전후 영향</h2>
      <div className="mt-5 grid gap-4">
        {order.map(([key, label]) => {
          const start = Math.max(0, Math.min(100, before[key] ?? 50));
          const end = Math.max(0, Math.min(100, after[key] ?? 50));
          const delta = Math.round(end - start);
          return (
            <div key={key}>
              <div className="flex items-center justify-between gap-3 text-xs">
                <span className="font-bold text-[#9ba5b2]">{label}</span>
                <span className={`number-tabular font-black ${delta > 0 ? "text-[#82e6ac]" : delta < 0 ? "text-[#ff9e90]" : "text-[#7f8998]"}`}>
                  {Math.round(start)} → {Math.round(end)} ({delta > 0 ? "+" : ""}{delta})
                </span>
              </div>
              <div className="relative mt-2 h-2 overflow-hidden rounded-full bg-white/[.06]">
                <span className="absolute inset-y-0 left-0 rounded-full bg-white/15" style={{ width: `${start}%` }} />
                <span className={`absolute inset-y-0 left-0 rounded-full ${delta >= 0 ? "bg-[#65d89a]" : "bg-[#ff806d]"}`} style={{ width: `${end}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

