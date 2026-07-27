import type { DecisionEvaluation } from "@/lib/decision/evaluateDecision";

const gaugeOrder = [
  "attackThreat",
  "possessionStability",
  "pressingIntensity",
  "defensiveStability",
] as const;

export function ImpactGauges({
  evaluation,
}: {
  evaluation: DecisionEvaluation | null;
}) {
  return (
    <section aria-labelledby="impact-title">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-black tracking-[.12em] text-[#7f8998]">LIVE IMPACT</p>
          <h2 id="impact-title" className="mt-1 text-sm font-black text-white">교체 전후 영향</h2>
        </div>
        {evaluation && (
          <div className="text-right">
            <span className="block text-[9px] font-bold text-[#7f8998]">상황 적합도</span>
            <span className="number-tabular text-2xl font-black text-[#f4b860]">{evaluation.fit.score}</span>
          </div>
        )}
      </div>
      <div className="mt-4 grid gap-3">
        {gaugeOrder.map((key) => {
          const gauge = evaluation?.impacts[key];
          const before = gauge?.before ?? 50;
          const after = gauge?.after ?? 50;
          const delta = gauge?.delta ?? 0;
          return (
            <div key={key}>
              <div className="mb-1.5 flex items-center justify-between gap-3">
                <span className="text-[10px] font-bold text-[#9ba5b2]">
                  {gauge?.label ??
                    {
                      attackThreat: "공격 위협",
                      possessionStability: "점유 안정",
                      pressingIntensity: "압박 강도",
                      defensiveStability: "수비 안정",
                    }[key]}
                </span>
                <span
                  className={`number-tabular text-[10px] font-black ${
                    delta > 0 ? "text-[#82e6ac]" : delta < 0 ? "text-[#ff9e90]" : "text-[#9ba5b2]"
                  }`}
                >
                  {evaluation ? `${before} → ${after} (${delta > 0 ? "+" : ""}${delta})` : "선수·역할 선택 필요"}
                </span>
              </div>
              <div className="relative h-2 overflow-hidden rounded-full bg-white/[.07]">
                <span
                  className="absolute inset-y-0 left-0 rounded-full bg-white/18 transition-all duration-300"
                  style={{ width: `${before}%` }}
                />
                <span
                  className={`absolute inset-y-0 left-0 rounded-full transition-all duration-300 ${
                    delta >= 0 ? "bg-[#65d89a]" : "bg-[#ff806d]"
                  }`}
                  style={{ width: `${evaluation ? after : 0}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
