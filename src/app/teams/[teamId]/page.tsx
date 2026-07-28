import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/common/Badge";
import { ButtonLink } from "@/components/common/Button";
import { TeamJourney } from "@/components/team/TeamJourney";
import {
  getGroupAMatchesForTeam,
  getGroupAPlayers,
  getGroupAScenariosForMatch,
  getGroupATeam,
} from "@/data/group-a/catalog";
import {
  getMatch,
  getPlayersByIds,
  getRolesForPlayer,
  getScenario,
} from "@/data/repository";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ teamId: string }>;
}): Promise<Metadata> {
  const { teamId } = await params;
  const team = getGroupATeam(teamId);
  return {
    title: team ? `${team.nameKo} 감독 여정` : "지원하지 않는 국가",
    description: team
      ? `${team.nameKo}의 2026 월드컵 A조 실제 ${getGroupAMatchesForTeam(team.id).length}경기에서 감독 미션을 플레이하세요.`
      : undefined,
  };
}

export default async function TeamDetailPage({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = await params;
  const team = getGroupATeam(teamId);
  if (!team) notFound();

  const matches = getGroupAMatchesForTeam(team.id);
  const players = getGroupAPlayers(team.id);
  const missionCount = matches.reduce(
    (sum, match) =>
      sum + getGroupAScenariosForMatch(match.id, team.id).length,
    0,
  );

  const journeyMatches = matches.flatMap((match) => {
    const isHome = match.homeTeamId === team.id;
    const opponent = getGroupATeam(
      isHome ? match.awayTeamId : match.homeTeamId,
    );
    if (!opponent) return [];
    const missions = getGroupAScenariosForMatch(match.id, team.id);

    return [
      {
        id: match.id,
        matchNumber: match.matchNumber,
        date: match.date,
        venue: match.venue,
        opponentName: opponent.nameKo,
        opponentCode: opponent.code,
        scoreFor: isHome ? match.finalScore.home : match.finalScore.away,
        scoreAgainst: isHome ? match.finalScore.away : match.finalScore.home,
        missions: missions.flatMap((groupScenario) => {
          const decisionMatch = getMatch(match.id);
          const decisionScenario = getScenario(match.id, groupScenario.id);
          if (!decisionMatch || !decisionScenario) return [];
          const scenarioPlayers = getPlayersByIds(
            decisionScenario.benchOptions,
            decisionScenario,
          );
          const roleIdsByIncomingPlayerId = Object.fromEntries(
            scenarioPlayers
              .filter((player) =>
                decisionScenario.benchOptions.includes(player.id),
              )
              .map((player) => [
                player.id,
                getRolesForPlayer(player).map((role) => role.roleId),
              ]),
          );

          return [{
            id: groupScenario.id,
            title: groupScenario.title,
            minute: groupScenario.minute,
            currentScore: isHome
              ? `${groupScenario.currentScore.home}–${groupScenario.currentScore.away}`
              : `${groupScenario.currentScore.away}–${groupScenario.currentScore.home}`,
            difficulty: groupScenario.difficulty,
            href: `/matches/${match.id}/scenarios/${groupScenario.id}/briefing`,
            decisionModel: {
              substitutionsRemaining: decisionScenario.substitutionsRemaining,
              lineupPlayerIds: decisionScenario.currentLineup.map(
                ({ playerId }) => playerId,
              ),
              benchPlayerIds: [...decisionScenario.benchOptions],
              roleIdsByIncomingPlayerId,
            },
          }];
        }),
      },
    ];
  });

  return (
    <div className="page-wrap py-10 sm:py-14">
      <nav aria-label="국가 탐색" className="text-sm font-bold text-[#9da7b4]">
        <Link className="hover:text-white" href="/teams">
          국가 선택
        </Link>
        <span className="mx-2 text-white/25" aria-hidden="true">
          /
        </span>
        <span className="text-white">{team.code}</span>
      </nav>

      <header className="panel mt-6 overflow-hidden">
        <div className="grid gap-8 bg-gradient-to-br from-[#0c6547]/24 to-transparent p-6 sm:p-9 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <div className="flex flex-wrap gap-2">
              <Badge tone="green">
                <span className="data-dot" />
                공식 최종 명단 {players.length}명
              </Badge>
              <Badge tone="gold">A조 {team.standing.position}위</Badge>
              <Badge>랭킹 참고치 · 역산</Badge>
            </div>
            <p className="mt-7 text-xs font-black tracking-[.16em] text-[#f4b860]">
              {team.code} · {team.confederation}
            </p>
            <h1 className="mt-2 text-4xl font-black tracking-[-.05em] text-white sm:text-6xl">
              {team.nameKo}
            </h1>
            <p className="mt-2 text-lg font-bold text-[#b7c0cc]">
              {team.nameEn}
            </p>
            <p className="mt-5 text-sm leading-6 text-[#9fa9b7]">
              감독 {team.headCoach.nameKo} · {team.headCoach.nameEn}
            </p>
          </div>
          <dl className="grid grid-cols-3 gap-2 lg:min-w-[360px]">
            {[
              ["FIFA 랭킹", `${team.fifaRanking.rank}위*`],
              ["실제 승점", team.standing.points],
              ["감독 미션", missionCount],
            ].map(([label, value]) => (
              <div key={label} className="panel-soft p-3 text-center">
                <dt className="text-[11px] font-bold text-[#9aa5b4]">
                  {label}
                </dt>
                <dd className="number-tabular mt-1 text-lg font-black text-white">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="grid gap-4 border-t border-white/[.07] px-6 py-4 text-xs leading-5 text-[#8994a3] sm:px-9 lg:grid-cols-[1fr_auto]">
          <p>
            * {team.fifaRanking.referenceDate.replaceAll("-", ".")} 기준 참고
            순위는 FIFA의 월드컵 후 발표 순위와 변동 폭을 역산한 파생값입니다.
          </p>
          <p className="font-bold text-[#b3bdc9]">
            평가는 역할·팀 지시·경기 시점 컨디션 추정을 사용합니다.
          </p>
        </div>
      </header>

      <section className="mt-10" aria-labelledby="journey-title">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Group-stage journey</p>
            <h2
              id="journey-title"
              className="mt-3 text-2xl font-black tracking-[-.03em] text-white sm:text-3xl"
            >
              실제 조별리그 {matches.length}경기
            </h2>
          </div>
          <div className="flex gap-2">
            <ButtonLink
              href={`/group-a?team=${team.id}`}
              variant="secondary"
              className="min-h-10 px-4 py-2"
            >
              순위에서 보기
            </ButtonLink>
            <ButtonLink
              href="/matches"
              variant="ghost"
              className="min-h-10 px-4 py-2"
            >
              6경기 전체
            </ButtonLink>
          </div>
        </div>
        <TeamJourney
          teamId={team.id}
          teamName={team.nameKo}
          matches={journeyMatches}
        />
      </section>
    </div>
  );
}
