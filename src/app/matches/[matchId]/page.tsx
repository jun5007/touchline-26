import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/common/Badge";
import { StepIndicator } from "@/components/layout/StepIndicator";
import { MissionCard } from "@/components/match/MissionCard";
import {
  getGroupAMatch,
  getGroupAScenariosForMatch,
  getGroupATeam,
} from "@/data/group-a/catalog";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ matchId: string }>;
}): Promise<Metadata> {
  const { matchId } = await params;
  const match = getGroupAMatch(matchId);
  if (!match) return { title: "경기 없음" };
  const homeTeam = getGroupATeam(match.homeTeamId);
  const awayTeam = getGroupATeam(match.awayTeamId);
  return {
    title:
      homeTeam && awayTeam
        ? `${homeTeam.nameKo} vs ${awayTeam.nameKo}`
        : "A조 경기",
  };
}

export default async function MatchDetailPage({
  params,
}: {
  params: Promise<{ matchId: string }>;
}) {
  const { matchId } = await params;
  const match = getGroupAMatch(matchId);
  if (!match) notFound();
  const homeTeam = getGroupATeam(match.homeTeamId);
  const awayTeam = getGroupATeam(match.awayTeamId);
  if (!homeTeam || !awayTeam) notFound();
  const scenarios = getGroupAScenariosForMatch(match.id);

  const perspectives = match.playableTeamIds.flatMap((teamId) => {
    const team = getGroupATeam(teamId);
    const opponent = getGroupATeam(
      teamId === match.homeTeamId ? match.awayTeamId : match.homeTeamId,
    );
    const teamScenarios = getGroupAScenariosForMatch(match.id, teamId);
    if (!team || !opponent || teamScenarios.length === 0) return [];
    return [{ team, opponent, scenarios: teamScenarios }];
  });

  return (
    <div className="page-wrap py-10 sm:py-14">
      <StepIndicator current="match" matchId={match.id} />
      <nav
        aria-label="경기 탐색"
        className="mt-8 text-sm font-bold text-[#9da7b4]"
      >
        <Link className="hover:text-white" href="/matches">
          A조 경기
        </Link>
        <span className="mx-2 text-white/25" aria-hidden="true">
          /
        </span>
        <span className="text-white">MATCH {match.matchNumber}</span>
      </nav>

      <header className="panel mt-5 overflow-hidden">
        <div className="grid gap-8 bg-gradient-to-br from-[#0c6547]/24 to-transparent p-6 sm:p-9 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <div className="flex flex-wrap gap-2">
              <Badge tone="green">
                <span className="data-dot" /> 공식 경기 사실 검증
              </Badge>
              <Badge>조별리그</Badge>
              <Badge tone="gold">A조</Badge>
            </div>
            <p className="mt-6 text-xs font-black tracking-[.15em] text-[#8c98a7]">
              {match.competition} · MATCH {match.matchNumber}
            </p>
            <h1 className="mt-2 text-balance text-4xl font-black tracking-[-.05em] text-white sm:text-6xl">
              {homeTeam.nameKo}{" "}
              <span className="number-tabular text-[#f4b860]">
                {match.finalScore.home}–{match.finalScore.away}
              </span>{" "}
              {awayTeam.nameKo}
            </h1>
            <p className="mt-4 text-sm leading-6 text-[#adb6c2]">
              {match.date.replaceAll("-", ".")} · {match.localKickoff} ·{" "}
              {match.venue}, {match.city} · 관중{" "}
              {match.attendance.toLocaleString("ko-KR")}명
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 lg:min-w-[350px]">
            {[
              [homeTeam.code, match.formationsByTeam[homeTeam.id] ?? "—"],
              [awayTeam.code, match.formationsByTeam[awayTeam.id] ?? "—"],
              ["미션", `${scenarios.length}개`],
            ].map(([label, value]) => (
              <div key={label} className="panel-soft p-3 text-center">
                <span className="block text-[11px] font-bold text-[#9aa5b4]">
                  {label}
                </span>
                <span className="mt-1 block text-sm font-black text-white">
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </header>

      <section className="mt-8" aria-labelledby="perspective-title">
        <div>
          <p className="eyebrow">Choose your touchline</p>
          <h2
            id="perspective-title"
            className="mt-3 text-2xl font-black tracking-[-.03em] text-white sm:text-3xl"
          >
            지휘할 감독석을 선택하세요
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#929dab]">
            같은 경기라도 필드·벤치, 미션, 적합도 가중치와 실제 감독 선택이
            국가별로 달라집니다.
          </p>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {perspectives.map(({ team, opponent, scenarios: teamScenarios }) => (
            <Link
              key={team.id}
              href={`/matches/${match.id}/scenarios/${teamScenarios[0].id}/briefing`}
              className="panel group flex items-center justify-between gap-5 p-5 transition hover:-translate-y-0.5 hover:border-[#f4b860]/35 sm:p-6"
              aria-label={`${team.nameKo} 감독의 첫 미션 열기`}
            >
              <div className="flex items-center gap-4">
                <span className="grid h-14 min-w-16 place-items-center rounded-2xl border border-[#f4b860]/25 bg-[#f4b860]/10 px-2 text-sm font-black tracking-[.1em] text-[#f4b860]">
                  {team.code}
                </span>
                <div>
                  <p className="text-xl font-black text-white">
                    {team.nameKo} 감독
                  </p>
                  <p className="mt-1 text-xs leading-5 text-[#929dab]">
                    상대 {opponent.code} ·{" "}
                    {match.formationsByTeam[team.id] ?? "포메이션 확인 중"} ·
                    미션 {teamScenarios.length}개
                  </p>
                </div>
              </div>
              <span
                aria-hidden="true"
                className="text-2xl font-black text-[#f4b860] transition group-hover:translate-x-1"
              >
                →
              </span>
            </Link>
          ))}
        </div>
      </section>

      <div className="mt-12 space-y-12">
        {perspectives.map(({ team, opponent, scenarios: teamScenarios }) => (
          <section key={team.id} aria-labelledby={`${team.id}-missions`}>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="eyebrow">{team.code} decision windows</p>
                <h2
                  id={`${team.id}-missions`}
                  className="mt-3 text-2xl font-black tracking-[-.03em] text-white sm:text-3xl"
                >
                  {team.nameKo} 감독 미션
                </h2>
              </div>
              <Link
                href={`/teams/${team.id}`}
                className="text-sm font-black text-[#f4b860] hover:text-[#ffd08a]"
              >
                {team.nameKo}의 3경기 →
              </Link>
            </div>
            <div className="mt-6 grid gap-4">
              {teamScenarios.map((scenario, index) => {
                const selectedTeamIsHome =
                  scenario.selectedTeamId === match.homeTeamId;
                const scoreFor = selectedTeamIsHome
                  ? scenario.currentScore.home
                  : scenario.currentScore.away;
                const scoreAgainst = selectedTeamIsHome
                  ? scenario.currentScore.away
                  : scenario.currentScore.home;
                return (
                  <MissionCard
                    key={scenario.id}
                    index={index}
                    team={{ name: team.nameKo, code: team.code }}
                    opponent={{
                      name: opponent.nameKo,
                      code: opponent.code,
                    }}
                    scenario={{
                      id: scenario.id,
                      matchId: scenario.matchId,
                      title: scenario.title,
                      minute: scenario.minute,
                      currentScore: `${scoreFor}–${scoreAgainst}`,
                      difficulty: scenario.difficulty,
                      opponentShape: scenario.opponentShape,
                      shortMission: scenario.shortMission,
                    }}
                  />
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
