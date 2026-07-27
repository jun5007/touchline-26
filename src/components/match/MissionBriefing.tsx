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
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#f4b860]/12 text-[10px] font-black text-[#f4b860]">
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
              <p className="text-[10px] font-black tracking-[.14em] text-[#7f8998]">MATCH STATE</p>
              <h2 className="mt-2 text-lg font-black text-white">
                {match.homeTeam.name} <span className="text-[#f4b860]">{scenario.currentScore}</span> {match.awayTeam.name}
              </h2>
            </div>
            <div className="rounded-xl border border-[#65d89a]/20 bg-[#65d89a]/8 px-3 py-2 text-right">
              <span className="block text-[9px] font-bold text-[#8fa99a]">교체 카드</span>
              <span className="number-tabular text-lg font-black text-[#82e6ac]">{scenario.substitutionsRemaining}</span>
            </div>
          </div>
          <dl className="mt-5 grid gap-3 text-sm">
            <div className="flex items-start justify-between gap-5 border-t border-white/[.07] pt-3">
              <dt className="text-[#7f8998]">상대 형태</dt>
              <dd className="max-w-[65%] text-right font-bold text-[#dce1e8]">{scenario.opponentShape}</dd>
            </div>
            <div className="flex items-start justify-between gap-5 border-t border-white/[.07] pt-3">
              <dt className="text-[#7f8998]">현재 포메이션</dt>
              <dd className="font-bold text-[#dce1e8]">{match.startingFormation}</dd>
            </div>
            <div className="flex items-start justify-between gap-5 border-t border-white/[.07] pt-3">
              <dt className="text-[#7f8998]">데이터 상태</dt>
              <dd className="flex items-center gap-2 font-bold text-[#82e6ac]">
                <span className="data-dot" /> 공식 기록 검증
              </dd>
            </div>
          </dl>
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
          <strong className="text-[#9acbff]">회고 플레이 안내</strong>
          <br />
          선수의 1–20 스탯은 경기 종료 후 FIFA 공식 데이터를 변환한 회고 지표입니다.
          당시 실시간 예측값이 아닙니다.
        </div>
      </aside>
    </div>
  );
}

