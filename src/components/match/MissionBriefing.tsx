import { Badge } from "@/components/common/Badge";
import type { Match, Scenario } from "@/data/types";

export function MissionBriefing({
  match,
  scenario,
}: {
  match: Match;
  scenario: Scenario;
}) {
  return (
    <div className="grid gap-5 lg:grid-cols-[1.15fr_.85fr]">
      <section className="panel overflow-hidden">
        <div className="border-b border-white/[.07] bg-gradient-to-br from-[#0d6d4b]/28 to-transparent p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="gold">{scenario.minute}분</Badge>
            <Badge tone={scenario.scoreState === "leading" ? "green" : "blue"}>
              {scenario.currentScore}
            </Badge>
            <Badge>{scenario.difficulty}</Badge>
          </div>
          <p className="mt-6 text-[11px] font-black tracking-[.15em] text-[#f4b860]">감독 미션</p>
          <h1 className="text-balance mt-2 text-3xl font-black tracking-[-.045em] text-white sm:text-4xl">
            {scenario.title}
          </h1>
          <p className="mt-5 max-w-2xl text-base font-medium leading-7 text-[#c4cad4]">
            {scenario.mission}
          </p>
        </div>
        <div className="p-6 sm:p-8">
          <h2 className="text-sm font-black text-white">현장에서 들어온 관찰</h2>
          <ul className="mt-4 grid gap-3">
            {scenario.observations.map((observation, index) => (
              <li key={observation} className="panel-soft flex gap-3 p-4 text-sm leading-6 text-[#cbd1da]">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#f4b860]/12 text-[11px] font-black text-[#f4b860]">
                  {index + 1}
                </span>
                {observation}
              </li>
            ))}
          </ul>
        </div>
      </section>
      <aside className="grid gap-5">
        <section className="panel p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black tracking-[.14em] text-[#9aa5b4]">MATCH STATE</p>
              <h2 className="mt-2 text-lg font-black text-white">
                {match.homeTeam.name} <span className="text-[#f4b860]">{scenario.currentScore}</span> {match.awayTeam.name}
              </h2>
            </div>
            <div className="rounded-xl border border-[#65d89a]/20 bg-[#65d89a]/8 px-3 py-2 text-right">
              <span className="block max-w-28 text-[11px] font-bold leading-4 text-[#a8c3b2]">이 시점 기준 남은 교체 가능 인원</span>
              <span className="number-tabular text-lg font-black text-[#82e6ac]">{scenario.substitutionsRemaining}명</span>
            </div>
          </div>
          <dl className="mt-5 grid gap-3 text-sm">
            <div className="flex items-start justify-between gap-5 border-t border-white/[.07] pt-3">
              <dt className="text-[#a8b1bf]">상대 형태</dt>
              <dd className="max-w-[65%] text-right font-bold text-[#dce1e8]">
                {scenario.opponentShape}
                <span className="mt-1 block text-[11px] text-[#9acbff]">전술적 관찰</span>
              </dd>
            </div>
            <div className="flex items-start justify-between gap-5 border-t border-white/[.07] pt-3">
              <dt className="text-[#a8b1bf]">현재 포메이션</dt>
              <dd className="text-right font-bold text-[#dce1e8]">
                {match.formationsByTeam?.[scenario.selectedTeamId] ??
                  match.startingFormation}
                <span className="mt-1 block text-[11px] text-[#9acbff]">
                  공식 선발 형태 · 현재 배치는 포지션군 도식
                </span>
              </dd>
            </div>
            <div className="flex items-start justify-between gap-5 border-t border-white/[.07] pt-3">
              <dt className="text-[#a8b1bf]">데이터 상태</dt>
              <dd className="flex items-center gap-2 font-bold text-[#82e6ac]">
                <span className="data-dot" /> 공식 경기 사실
              </dd>
            </div>
          </dl>
          <p className="mt-4 text-xs leading-5 text-[#a8b1bf]">
            이 수치는 공식 경기에서 해당 시점 직전의 기록입니다. 체험에서는 교체 1건만
            확정합니다.
          </p>
        </section>
        <section className="panel p-6">
          <h2 className="text-sm font-black text-white">직전 흐름</h2>
          <ol className="mt-5 grid gap-0">
            {scenario.contextTimeline.map((event, index) => (
              <li key={`${event.minute}-${event.label}`} className="relative grid grid-cols-[42px_14px_1fr] gap-2 pb-5 last:pb-0">
                <span className="number-tabular pt-0.5 text-xs font-black text-[#8994a3]">{event.minute}</span>
                <span
                  className={`relative z-10 mt-1 h-2.5 w-2.5 rounded-full ${
                    event.tone === "danger"
                      ? "bg-[#ff806d]"
                      : event.tone === "positive"
                        ? "bg-[#65d89a]"
                        : "bg-[#75b9ff]"
                  }`}
                />
                {index < scenario.contextTimeline.length - 1 && (
                  <span className="absolute bottom-0 left-[48px] top-3 w-px bg-white/10" aria-hidden="true" />
                )}
                <span className="text-sm font-bold text-[#cbd1da]">{event.label}</span>
              </li>
            ))}
          </ol>
        </section>
        <div className="rounded-xl border border-[#75b9ff]/15 bg-[#75b9ff]/7 p-4 text-xs leading-5 text-[#aebfd1]">
          <strong className="text-[#9acbff]">시점 안전 데이터 안내</strong>
          <br />
          이 브리핑과 전술 점수에는 미션 시점 이후의 사건·최종 결과·실제 교체를
          넣지 않습니다. 최근 1년 선수 지표를 검증하지 못한 항목은 null로 남기며
          평가 가중치에서 제외합니다.
        </div>
      </aside>
    </div>
  );
}
