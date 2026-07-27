import { Badge } from "@/components/common/Badge";
import type { Match, Scenario } from "@/data/types";

export function MatchStatePanel({
  match,
  scenario,
}: {
  match: Match;
  scenario: Scenario;
}) {
  return (
    <section className="panel p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-black tracking-[.13em] text-[#7f8998]">LIVE STATE</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="number-tabular text-4xl font-black tracking-[-.05em] text-[#f4b860]">{scenario.minute}′</span>
            <span className="number-tabular text-2xl font-black text-white">{scenario.currentScore}</span>
          </div>
        </div>
        <Badge tone="green">
          <span className="data-dot" /> 확인된 장면
        </Badge>
      </div>
      <p className="mt-4 text-sm font-bold leading-6 text-[#d5dae2]">{scenario.shortMission}</p>
      <dl className="mt-4 grid gap-2 border-t border-white/[.07] pt-4 text-xs">
        <div className="flex justify-between gap-4">
          <dt className="text-[#7f8998]">경기</dt>
          <dd className="font-bold text-[#cbd1da]">{match.homeTeam.code} vs {match.awayTeam.code}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-[#7f8998]">상대</dt>
          <dd className="max-w-[70%] text-right font-bold text-[#cbd1da]">{scenario.opponentShape}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-[#7f8998]">남은 교체</dt>
          <dd className="font-bold text-[#cbd1da]">{scenario.substitutionsRemaining}회</dd>
        </div>
      </dl>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {scenario.matchupTags.map((tag) => (
          <Badge key={tag}>{tag}</Badge>
        ))}
      </div>
    </section>
  );
}

