import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Badge } from "@/components/common/Badge";
import { StepIndicator } from "@/components/layout/StepIndicator";
import { MissionCard } from "@/components/match/MissionCard";
import { getMatch, getScenariosForMatch } from "@/data/repository";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ matchId: string }>;
}): Promise<Metadata> {
  const { matchId } = await params;
  const match = getMatch(matchId);
  return { title: match ? `${match.homeTeam.name} vs ${match.awayTeam.name}` : "경기 없음" };
}

export default async function MatchDetailPage({
  params,
}: {
  params: Promise<{ matchId: string }>;
}) {
  const { matchId } = await params;
  const match = getMatch(matchId);
  if (!match) notFound();
  const scenarios = getScenariosForMatch(match.id);

  return (
    <div className="page-wrap py-10 sm:py-14">
      <StepIndicator current="match" matchId={match.id} />
      <header className="mt-10 panel overflow-hidden">
        <div className="grid gap-8 bg-gradient-to-br from-[#0c6547]/24 to-transparent p-6 sm:p-9 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <div className="flex flex-wrap gap-2">
              <Badge tone="green">
                <span className="data-dot" /> 실제 데이터
              </Badge>
              <Badge>{match.stage}</Badge>
              <Badge tone="gold">{match.group}</Badge>
            </div>
            <p className="mt-6 text-xs font-black tracking-[.15em] text-[#8c98a7]">
              {match.competition} · MATCH {match.matchNumber}
            </p>
            <h1 className="mt-2 text-4xl font-black tracking-[-.05em] text-white sm:text-6xl">
              {match.homeTeam.name} <span className="text-[#f4b860]">2–1</span> {match.awayTeam.name}
            </h1>
            <p className="mt-4 text-sm leading-6 text-[#adb6c2]">
              {match.date} · {match.venue}, {match.city} · 관중 {match.attendance.toLocaleString("ko-KR")}명
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 lg:min-w-[310px]">
            {[
              ["대한민국", match.startingFormation],
              ["체코", match.opponentFormation],
              ["미션", `${scenarios.length}개`],
            ].map(([label, value]) => (
              <div key={label} className="panel-soft p-3 text-center">
                <span className="block text-[9px] font-bold text-[#7f8998]">{label}</span>
                <span className="mt-1 block text-sm font-black text-white">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </header>
      <section className="mt-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Decision windows</p>
            <h2 className="mt-3 text-2xl font-black tracking-[-.03em] text-white sm:text-3xl">
              결정적 순간을 선택하세요
            </h2>
          </div>
          <p className="max-w-md text-sm leading-6 text-[#8f99a8]">
            같은 경기라도 필요한 선수는 달라집니다. 동점을 깰 때와 리드를 닫을 때의 기준을 비교해 보세요.
          </p>
        </div>
        <div className="mt-6 grid gap-4">
          {scenarios.map((scenario, index) => (
            <MissionCard key={scenario.id} scenario={scenario} index={index} />
          ))}
        </div>
      </section>
    </div>
  );
}

