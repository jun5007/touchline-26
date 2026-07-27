import { Badge } from "@/components/common/Badge";
import { ButtonLink } from "@/components/common/Button";
import type { Scenario } from "@/data/types";

export function MissionCard({
  scenario,
  index,
}: {
  scenario: Scenario;
  index: number;
}) {
  return (
    <article className="panel grid overflow-hidden md:grid-cols-[130px_1fr_auto] md:items-stretch">
      <div className="flex items-center justify-between border-b border-white/[.07] bg-white/[.025] px-5 py-4 md:flex-col md:items-start md:justify-center md:border-b-0 md:border-r">
        <span className="text-[10px] font-black tracking-[.14em] text-[#7f8998]">
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
          <Badge tone={scenario.order === 1 ? "gold" : "blue"}>{scenario.difficulty}</Badge>
          <Badge>{scenario.opponentShape.split(" · ")[0]}</Badge>
        </div>
        <h2 className="mt-3 text-xl font-black tracking-[-.03em] text-white">{scenario.title}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#aeb6c2]">{scenario.shortMission}</p>
      </div>
      <div className="flex items-center px-5 pb-5 md:px-6 md:pb-0">
        <ButtonLink
          href={`/matches/${scenario.matchId}/scenarios/${scenario.id}/briefing`}
          variant={scenario.order === 1 ? "primary" : "secondary"}
          className="w-full md:w-auto"
        >
          브리핑 열기 <span aria-hidden="true">→</span>
        </ButtonLink>
      </div>
    </article>
  );
}

