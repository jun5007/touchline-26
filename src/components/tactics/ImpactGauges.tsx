import { Badge } from "@/components/common/Badge";
import { DecisionScoreContext } from "@/components/common/DecisionScoreContext";
import type { ImpactGaugeKey } from "@/data/types";
import type { DecisionScoreRelativeContext } from "@/lib/decision/decisionScoreRelativeContext";
import type { DecisionEvaluation } from "@/lib/decision/evaluateDecision";

const gaugeOrder: readonly ImpactGaugeKey[] = [
  "attackThreat",
  "possessionStability",
  "pressingIntensity",
  "defensiveStability",
];

const scoreComponentLabels = {
  ability: "선수 BASE 능력",
  role: "역할·팀 지시",
  fitness: "출전 시간 기반 컨디션 추정",
  matchup: "상대 매치업",
} as const;

export function ImpactGauges({
  evaluation,
  scoreContext,
}: {
  evaluation: DecisionEvaluation | null;
  scoreContext?: DecisionScoreRelativeContext | null;
}) {
  const availableGauges = evaluation
    ? gaugeOrder.flatMap((key) => {
        const gauge = evaluation.impacts[key];
        return gauge.available ? [{ key, gauge }] : [];
      })
    : [];
  const availableScoreComponents = evaluation
    ? Object.entries(evaluation.fit.componentAvailability)
        .filter(([, available]) => available)
        .map(
          ([key]) =>
            scoreComponentLabels[key as keyof typeof scoreComponentLabels],
        )
    : [];
  const excludedScoreComponents = evaluation
    ? Object.entries(evaluation.fit.componentAvailability)
        .filter(([, available]) => !available)
        .map(
          ([key]) =>
            scoreComponentLabels[key as keyof typeof scoreComponentLabels],
        )
    : [];

  return (
    <section aria-labelledby="impact-title">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-black tracking-[.12em] text-[#9aa5b4]">
            LIVE IMPACT
          </p>
          <h2 id="impact-title" className="mt-1 text-sm font-black text-white">
            교체 전후 영향
          </h2>
        </div>
        {evaluation && (
          <div className="text-right">
            <span className="block text-[11px] font-bold text-[#a8b1bf]">
              전술 선택 적합도
            </span>
            <span className="number-tabular text-2xl font-black text-[#f4b860]">
              {evaluation.fit.score}
            </span>
            <span className="block text-[11px] font-bold text-[#7f8b9b]">
              승률·선수 절대 능력치 아님
            </span>
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {availableGauges.length > 0 && (
          <>
            <Badge tone="blue">확인된 BASE + Form 지표</Badge>
            <Badge tone="blue">OUT·IN 공통 지표만 재가중</Badge>
          </>
        )}
        {evaluation ? (
          <>
            <Badge tone={evaluation.instructionFit >= 0 ? "green" : "danger"}>
              지시 적합 {evaluation.instructionFit > 0 ? "+" : ""}
              {evaluation.instructionFit}
            </Badge>
            <Badge>매치업 {evaluation.matchupFit}/100</Badge>
          </>
        ) : (
          <Badge>선수·역할 선택 필요</Badge>
        )}
      </div>
      {evaluation && evaluation.matchupReasons.length > 0 && (
        <p className="mt-2 text-xs leading-5 text-[#a8b1bf]">
          <strong className="text-[#9acbff]">매치업 근거</strong> ·{" "}
          {evaluation.matchupReasons.join(" · ")}
        </p>
      )}
      {scoreContext && (
        <div className="mt-3">
          <DecisionScoreContext context={scoreContext} />
        </div>
      )}
      {evaluation && (
        <dl className="mt-3 grid gap-1 rounded-xl border border-white/[.07] bg-white/[.025] p-3 text-xs leading-5">
          <div>
            <dt className="inline font-black text-[#82e6ac]">점수 반영 · </dt>
            <dd className="inline text-[#b4becb]">
              {availableScoreComponents.join(" · ") || "반영 가능한 구성요소 없음"}
            </dd>
          </div>
          <div>
            <dt className="inline font-black text-[#f7c979]">점수 제외 · </dt>
            <dd className="inline text-[#b4becb]">
              {excludedScoreComponents.join(" · ") || "없음"}
            </dd>
          </div>
          <div>
            <dt className="inline font-black text-[#ff9e90]">위험 패널티 · </dt>
            <dd className="number-tabular inline text-[#b4becb]">
              −{evaluation.risk.totalPenalty}점
            </dd>
          </div>
        </dl>
      )}

      {!evaluation ? (
        <div className="mt-4 rounded-xl border border-dashed border-white/10 bg-white/[.02] p-4 text-center">
          <p className="text-xs font-bold leading-5 text-[#9aa5b4]">
            OUT 선수, IN 선수, 역할을 선택하면 전술 선택 적합도와 영향 근거를
            확인할 수 있습니다.
          </p>
        </div>
      ) : availableGauges.length === 0 ? (
        <div
          className="mt-4 rounded-xl border border-[#75b9ff]/18 bg-[#75b9ff]/[.055] p-4"
          role="status"
        >
          <strong className="text-sm text-[#b9dcff]">
            비교 가능한 선수 성과 데이터가 없어 전후 영향 그래프를 표시하지
            않습니다.
          </strong>
          <p className="mt-1.5 text-xs leading-5 text-[#aebaca]">
            전술 선택 적합도는 포지션 호환성, 역할 적합성, 팀 지시, 경기 상황,
            리스크를 바탕으로 계산됩니다. 승률이나 선수의 절대 능력치를 뜻하지
            않습니다.
          </p>
        </div>
      ) : (
        <div className="mt-4 grid gap-3">
          {availableGauges.map(({ key, gauge }) => {
            const before = gauge.before;
            const after = gauge.after;
            const delta = gauge.delta;
            return (
              <div key={key} data-testid="impact-gauge">
                <div className="mb-1.5 flex items-center justify-between gap-3">
                  <span className="text-xs font-bold text-[#b2bbc7]">
                    {gauge.label}
                  </span>
                  <span
                    className={`number-tabular text-xs font-black ${
                      delta > 0
                        ? "text-[#82e6ac]"
                        : delta < 0
                          ? "text-[#ff9e90]"
                          : "text-[#a8b1bf]"
                    }`}
                  >
                    {before} → {after} ({delta > 0 ? "+" : ""}
                    {delta})
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
                    style={{ width: `${after}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
      {availableGauges.length > 0 && (
        <p className="mt-4 text-xs leading-5 text-[#a8b1bf]">
          게이지는 미션 시점의 확인된 BASE + Form 지표 중 OUT·IN 양쪽에
          존재하는 값만 가중치를 다시 나눠 조합합니다. 공통 데이터가 없으면
          수치를 만들지 않습니다. 팀 지시는 앱 모델 보정값이며 공식 평점이
          아닙니다.
        </p>
      )}
    </section>
  );
}
