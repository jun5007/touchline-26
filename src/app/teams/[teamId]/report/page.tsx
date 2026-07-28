import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  GroupStageReportWorkspace,
  type ReportMatchModel,
} from "@/components/report/GroupStageReportWorkspace";
import {
  getGroupAMatchesForTeam,
  getGroupAScenariosForMatch,
  getGroupATeam,
} from "@/data/group-a/catalog";
import {
  getDecisionScenarioContext,
  getMatch,
  getPlayersByIds,
  getRoles,
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
    title: team ? `${team.nameKo} 조별리그 감독 리포트` : "감독 리포트",
    description: team
      ? `${team.nameKo}의 세 경기 감독 결정을 경기 동일 비중으로 분석한 TOUCHLINE 26 리포트`
      : undefined,
  };
}

export default async function TeamReportPage({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = await params;
  const team = getGroupATeam(teamId);
  if (!team) notFound();

  const matches: ReportMatchModel[] = getGroupAMatchesForTeam(team.id).flatMap(
    (groupMatch) => {
      const match = getMatch(groupMatch.id);
      if (!match) return [];
      const isHome = groupMatch.homeTeamId === team.id;
      const opponent = getGroupATeam(
        isHome ? groupMatch.awayTeamId : groupMatch.homeTeamId,
      );
      if (!opponent) return [];

      const scenarios = getGroupAScenariosForMatch(
        groupMatch.id,
        team.id,
      ).flatMap((groupScenario) => {
        const scenario = getScenario(groupMatch.id, groupScenario.id);
        return scenario
          ? [{
              scenario: {
                ...getDecisionScenarioContext(scenario),
                title: scenario.title,
              },
              players: getPlayersByIds(
                [
                  ...new Set([
                    ...scenario.currentLineup.map((spot) => spot.playerId),
                    ...scenario.benchOptions,
                  ]),
                ],
                scenario,
              ),
            }]
          : [];
      });

      return [
        {
          match: {
            id: match.id,
            matchNumber: match.matchNumber,
            date: match.date,
          },
          opponentName: opponent.nameKo,
          opponentCode: opponent.code,
          scoreFor: isHome
            ? groupMatch.finalScore.home
            : groupMatch.finalScore.away,
          scoreAgainst: isHome
            ? groupMatch.finalScore.away
            : groupMatch.finalScore.home,
          scenarios,
        },
      ];
    },
  );

  if (matches.length !== 3 || matches.some((match) => match.scenarios.length === 0)) {
    notFound();
  }

  return (
    <div className="page-wrap py-10 sm:py-14">
      <nav
        aria-label="감독 리포트 탐색"
        className="mb-7 text-sm font-bold text-[#9da7b4]"
      >
        <Link className="hover:text-white" href="/teams">
          국가 선택
        </Link>
        <span className="mx-2 text-white/25" aria-hidden="true">
          /
        </span>
        <Link className="hover:text-white" href={`/teams/${team.id}`}>
          {team.code}
        </Link>
        <span className="mx-2 text-white/25" aria-hidden="true">
          /
        </span>
        <span className="text-white">감독 리포트</span>
      </nav>
      <GroupStageReportWorkspace
        team={{
          id: team.id,
          code: team.code,
          nameKo: team.nameKo,
          standing: {
            position: team.standing.position,
            points: team.standing.points,
            goalDifference: team.standing.goalDifference,
          },
        }}
        matches={matches}
        roles={getRoles()}
      />
    </div>
  );
}
