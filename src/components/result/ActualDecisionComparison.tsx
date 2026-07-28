import { Badge } from "@/components/common/Badge";
import type { Player, Scenario } from "@/data/types";

export function ActualDecisionComparison({
  scenario,
  userOut,
  userIn,
  actualOut,
  actualIn,
  userRiskPenalty,
  userRisks,
  actualRiskPenalty,
  actualRisks,
}: {
  scenario: Scenario;
  userOut: Player;
  userIn: Player;
  actualOut: Player;
  actualIn: Player;
  userRiskPenalty: number;
  userRisks: string[];
  actualRiskPenalty?: number;
  actualRisks?: readonly string[];
}) {
  const sameChoice = userOut.id === actualOut.id && userIn.id === actualIn.id;

  return (
    <section className="panel overflow-hidden" aria-labelledby="actual-title">
      <div className="border-b border-white/[.07] bg-white/[.025] p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black tracking-[.13em] text-[#f4b860]">ACTUAL TOUCHLINE</p>
            <h2 id="actual-title" className="mt-2 text-xl font-black text-white">실제 감독의 선택과 비교</h2>
          </div>
          <Badge tone="blue">사실 + 전술적 추론 분리</Badge>
        </div>
      </div>
      <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-2">
        <article className="panel-soft p-4">
          <span className="text-xs font-black tracking-[.12em] text-[#75b9ff]">공식 경기 사실</span>
          <p className="mt-2 text-sm font-black text-white">
            {scenario.actualDecision.minute}′ · {actualOut.name} OUT → {actualIn.name} IN
          </p>
          <p className="mt-2 text-xs leading-5 text-[#9fa8b5]">
            당시 스코어 {scenario.actualDecision.scoreAtDecision}. {scenario.actualDecision.parallelDecision}
          </p>
        </article>
        <article className="panel-soft p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-black tracking-[.12em] text-[#f4b860]">
              제작진의 전술적 해석
            </span>
            <Badge tone="gold">추론</Badge>
          </div>
          <p className="mt-2 text-sm font-black text-white">{scenario.actualDecision.interpretedRole}</p>
          <p className="mt-2 text-xs leading-5 text-[#9fa8b5]">{scenario.actualDecision.note}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge tone={sameChoice ? "green" : "neutral"}>
              {sameChoice ? "선수 교체는 실제 선택과 같음" : "사용자는 다른 장점을 선택"}
            </Badge>
          </div>
        </article>
      </div>
      <div className="grid gap-3 border-t border-white/[.07] px-5 py-4 text-xs leading-5 text-[#9ca6b4] sm:px-6 lg:grid-cols-2">
        <article className="rounded-lg border border-[#75b9ff]/14 bg-[#75b9ff]/7 p-3">
          <p className="font-black text-[#9acbff]">사용자 선택 위험</p>
          <p className="mt-1 text-[#c9d2dd]">
            강점 · {userIn.tags.slice(0, 2).join(" · ") || userIn.position}
          </p>
          <p className="mt-1">
            모델 위험 감점 −{userRiskPenalty} ·{" "}
            {userRisks[0] ?? "명시적으로 발동한 위험 규칙이 없습니다."}
          </p>
        </article>
        <article className="rounded-lg border border-[#f4b860]/14 bg-[#f4b860]/7 p-3">
          <p className="font-black text-[#f7c979]">실제 교체 위험</p>
          <p className="mt-1 text-[#d9cfbc]">
            강점 · {actualIn.tags.slice(0, 2).join(" · ") || actualIn.position}
          </p>
          <p className="mt-1">
            모델 참고 감점 {actualRiskPenalty === undefined ? "—" : `−${actualRiskPenalty}`} ·{" "}
            {actualRisks?.[0] ??
              "실제 팀 지시가 공개 기록으로 확인되지 않아 위험을 계산하지 않았습니다."}
          </p>
        </article>
        <p className="lg:col-span-2">
          <strong className="text-[#c9cfd8]">비교 기준:</strong> 실제 교체는 공식 경기 사실이지만,
          그 역할과 위험은 정답지가 아닙니다. 실제 교체의 위험은 시나리오 기본 팀 지시와 동일한
          자체 모델을 적용한 참고 추론입니다.
        </p>
      </div>
    </section>
  );
}
