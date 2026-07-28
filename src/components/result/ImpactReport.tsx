import { Badge } from "@/components/common/Badge";
import type { ImpactGaugeKey } from "@/data/types";

const order: ReadonlyArray<[ImpactGaugeKey, string]> = [
  ["attackThreat", "공격 위협"],
  ["possessionStability", "점유 안정"],
  ["pressingIntensity", "압박 강도"],
  ["defensiveStability", "수비 안정"],
];

export function ImpactReport({
  before,
  after,
}: {
  before: Record<string, number | null>;
  after: Record<string, number | null>;
}) {
  const availableGauges = order.filter(([key]) => {
    const start = before[key];
    const end = after[key];
    return (
      typeof start === "number" &&
      Number.isFinite(start) &&
      typeof end === "number" &&
      Number.isFinite(end)
    );
  });

  if (availableGauges.length === 0) {
    return (
      <section className="panel p-5 sm:p-6" aria-labelledby="impact-report-title">
        <p className="text-xs font-black tracking-[.13em] text-[#75b9ff]">
          BEFORE / AFTER
        </p>
        <h2 id="impact-report-title" className="mt-2 text-lg font-black text-white">
          교체 전후 영향
        </h2>
        <div className="mt-5 rounded-xl border border-[#75b9ff]/16 bg-[#75b9ff]/7 p-4 text-sm leading-6 text-[#b8c8da]">
          <p>
            선수별 공통 성과 지표가 없어 교체 전후 영향 게이지를 산정하지
            않았습니다.
          </p>
          <p className="mt-2">
            역할·팀 지시에 따른 전술 적합도는 위 점수와 설명에서 확인할 수
            있습니다.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="panel p-5 sm:p-6" aria-labelledby="impact-report-title">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black tracking-[.13em] text-[#75b9ff]">
            BEFORE / AFTER
          </p>
          <h2 id="impact-report-title" className="mt-2 text-lg font-black text-white">
            교체 전후 영향
          </h2>
        </div>
        <Badge tone="blue">앱 파생값 · OUT·IN 공통 속성만 재가중</Badge>
      </div>
      <div className="mt-5 grid gap-4">
        {availableGauges.map(([key, label]) => {
          const rawStart = before[key];
          const rawEnd = after[key];
          const start = Math.max(0, Math.min(100, rawStart as number));
          const end = Math.max(0, Math.min(100, rawEnd as number));
          const delta = Math.round(end - start);
          return (
            <div key={key}>
              <div className="flex items-center justify-between gap-3 text-xs">
                <span className="font-bold text-[#b2bbc7]">{label}</span>
                <span
                  className={`number-tabular font-black ${
                    delta > 0
                      ? "text-[#82e6ac]"
                      : delta < 0
                        ? "text-[#ff9e90]"
                        : "text-[#a8b1bf]"
                  }`}
                >
                  {`${Math.round(start)} → ${Math.round(end)} (${delta > 0 ? "+" : ""}${delta})`}
                </span>
              </div>
              <div className="relative mt-2 h-2 overflow-hidden rounded-full bg-white/[.06]">
                <span
                  className="absolute inset-y-0 left-0 rounded-full bg-white/15"
                  style={{ width: `${start}%` }}
                />
                <span
                  className={`absolute inset-y-0 left-0 rounded-full ${
                    delta >= 0 ? "bg-[#65d89a]" : "bg-[#ff806d]"
                  }`}
                  style={{ width: `${end}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
