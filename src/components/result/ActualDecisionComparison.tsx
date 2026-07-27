import { Badge } from "@/components/common/Badge";
import type { Player, Scenario } from "@/data/types";

export function ActualDecisionComparison({
  scenario,
  userOut,
  userIn,
  actualOut,
  actualIn,
}: {
  scenario: Scenario;
  userOut: Player;
  userIn: Player;
  actualOut: Player;
  actualIn: Player;
}) {
  const sameChoice = userOut.id === actualOut.id && userIn.id === actualIn.id;

  return (
    <section className="panel overflow-hidden" aria-labelledby="actual-title">
      <div className="border-b border-white/[.07] bg-white/[.025] p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-black tracking-[.13em] text-[#f4b860]">ACTUAL TOUCHLINE</p>
            <h2 id="actual-title" className="mt-2 text-xl font-black text-white">실제 감독의 선택과 비교</h2>
          </div>
          <Badge tone="blue">사실 + 전술적 추론 분리</Badge>
        </div>
      </div>
      <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-2">
        <article className="panel-soft p-4">
          <span className="text-[9px] font-black tracking-[.12em] text-[#75b9ff]">확인된 사실</span>
          <p className="mt-2 text-sm font-black text-white">
            {scenario.actualDecision.minute}′ · {actualOut.name} OUT → {actualIn.name} IN
          </p>
          <p className="mt-2 text-xs leading-5 text-[#9fa8b5]">
            당시 스코어 {scenario.actualDecision.scoreAtDecision}. {scenario.actualDecision.parallelDecision}
          </p>
          {scenario.id === "level-69-find-nine" && (
            <div className="mt-4 rounded-lg border border-[#65d89a]/14 bg-[#65d89a]/7 p-3 text-xs leading-5 text-[#a8cbb8]">
              이후 확인된 경기 사실: 80분 오현규가 황인범의 크로스를 득점으로 연결했습니다.
              교체와 득점의 인과를 단정하지 않습니다.
            </div>
          )}
        </article>
        <article className="panel-soft p-4">
          <span className="text-[9px] font-black tracking-[.12em] text-[#f4b860]">전술적 추론</span>
          <p className="mt-2 text-sm font-black text-white">{scenario.actualDecision.interpretedRole}</p>
          <p className="mt-2 text-xs leading-5 text-[#9fa8b5]">{scenario.actualDecision.note}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge tone={sameChoice ? "green" : "neutral"}>
              {sameChoice ? "선수 교체는 실제 선택과 같음" : "사용자는 다른 장점을 선택"}
            </Badge>
          </div>
        </article>
      </div>
      <div className="border-t border-white/[.07] px-5 py-4 text-xs leading-5 text-[#8792a1] sm:px-6">
        <strong className="text-[#c9cfd8]">비교의 기준:</strong> 실제 선택은 정답지가 아닙니다.
        사용자 선택의 강점은 {userIn.tags.slice(0, 2).join("·") || userIn.position}, 실제 선택의
        강점은 {actualIn.tags.slice(0, 2).join("·") || actualIn.position}에 있습니다.
      </div>
    </section>
  );
}

