import { Badge } from "@/components/common/Badge";
import { ButtonLink } from "@/components/common/Button";

export interface MissionCardView {
  id: string;
  matchId: string;
  title: string;
  minute: number;
  currentScore: string;
  difficulty: "입문" | "보통" | "어려움";
  opponentShape: string;
  shortMission: string;
}

export function MissionCard({
  scenario,
  index,
  team,
  opponent,
}: {
  scenario: MissionCardView;
  index: number;
  team?: { name: string; code: string };
  opponent?: { name: string; code: string };
}) {
  return (
    <article className="panel grid overflow-hidden md:grid-cols-[130px_1fr_auto] md:items-stretch">
      <div className="flex items-center justify-between border-b border-white/[.07] bg-white/[.025] px-5 py-4 md:flex-col md:items-start md:justify-center md:border-b-0 md:border-r">
        <span className="text-xs font-black tracking-[.14em] text-[#9aa5b4]">
          MISSION {String(index + 1).padStart(2, "0")}
        </span>
        <div className="md:mt-3">
          <span className="number-tabular text-3xl font-black tracking-tight text-[#f4b860]">
            {scenario.minute}′
          </span>
          <span className="ml-2 text-lg font-black text-white md:ml-0 md:block">
            {scenario.currentScore}
          </span>
        </div>
      </div>
      <div className="p-5 md:p-6">
        <div className="flex flex-wrap gap-2">
          {team && <Badge tone="green">{team.code} 감독 관점</Badge>}
          <Badge tone={index === 0 ? "gold" : "blue"}>{scenario.difficulty}</Badge>
          <Badge tone="blue">전술적 관찰 · {scenario.opponentShape.split(" · ")[0]}</Badge>
        </div>
        <h2 className="mt-3 text-xl font-black tracking-[-.03em] text-white">{scenario.title}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#aeb6c2]">{scenario.shortMission}</p>
        {team && opponent && (
          <p className="mt-3 text-xs font-bold text-[#84909f]">
            {team.name} vs {opponent.name} · 결정 당시 이용 가능한 데이터
          </p>
        )}
      </div>
      <div className="flex items-center px-5 pb-5 md:px-6 md:pb-0">
        <ButtonLink
          href={`/matches/${scenario.matchId}/scenarios/${scenario.id}/briefing`}
          variant={index === 0 ? "primary" : "secondary"}
          className="w-full md:w-auto"
        >
          브리핑 열기 <span aria-hidden="true">→</span>
        </ButtonLink>
      </div>
    </article>
  );
}
