import { Badge } from "@/components/common/Badge";
import type {
  DecisionMatchView,
  DecisionScenarioContext,
} from "@/data/types";

export function MatchStatePanel({
  match,
  scenario,
}: {
  match: DecisionMatchView;
  scenario: DecisionScenarioContext;
}) {
  return (
    <section className="panel p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black tracking-[.13em] text-[#9aa5b4]">LIVE STATE</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="number-tabular text-4xl font-black tracking-[-.05em] text-[#f4b860]">{scenario.minute}′</span>
            <span className="number-tabular text-2xl font-black text-white">{scenario.currentScore}</span>
          </div>
        </div>
        <Badge tone="green">
          <span className="data-dot" /> 공식 경기 사실
        </Badge>
      </div>
      <p className="mt-4 text-sm font-bold leading-6 text-[#d5dae2]">{scenario.shortMission}</p>
      <dl className="mt-4 grid gap-2 border-t border-white/[.07] pt-4 text-xs">
        <div className="flex justify-between gap-4">
          <dt className="text-[#a8b1bf]">경기</dt>
          <dd className="font-bold text-[#cbd1da]">{match.homeTeam.code} vs {match.awayTeam.code}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-[#a8b1bf]">상대 형태</dt>
          <dd className="max-w-[70%] text-right font-bold text-[#cbd1da]">
            {scenario.opponentShape}
            <span className="mt-1 block text-[11px] font-bold text-[#9acbff]">
              전술적 관찰
            </span>
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="max-w-[65%] text-[#a8b1bf]">이 시점 기준 남은 교체 가능 인원</dt>
          <dd className="font-bold text-[#cbd1da]">{scenario.substitutionsRemaining}명</dd>
        </div>
      </dl>
      <p className="mt-3 rounded-lg border border-white/[.07] bg-white/[.025] p-2.5 text-xs leading-5 text-[#a8b1bf]">
        공식 경기의 이 시점 직전 기록입니다. 이 미션에서는 교체 1건만 결정하며 다른
        미션의 가상 타임라인에 누적하지 않습니다.
      </p>
      <p className="mt-4 text-xs font-black text-[#9acbff]">모델 입력 · 매치업 맥락</p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {scenario.matchupTags.map((tag) => (
          <Badge key={tag}>{tag}</Badge>
        ))}
      </div>
    </section>
  );
}
