import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/common/Badge";
import { ButtonLink } from "@/components/common/Button";
import { GroupResults } from "@/components/group/GroupResults";
import { StandingsTable } from "@/components/group/StandingsTable";
import {
  getGroupAMatches,
  getGroupAScenariosForMatch,
  getGroupAStandings,
  getGroupATeam,
  getGroupATeams,
} from "@/data/group-a/catalog";

export const metadata: Metadata = {
  title: "A조 순위",
  description: "2026 월드컵 A조 실제 최종 순위와 6경기 결과를 확인하세요.",
};

export default async function GroupAPage({
  searchParams,
}: {
  searchParams: Promise<{ team?: string | string[] }>;
}) {
  const query = await searchParams;
  const requestedTeamId =
    typeof query.team === "string" ? query.team : undefined;
  const selectedTeam = requestedTeamId
    ? getGroupATeam(requestedTeamId)
    : undefined;
  const teams = getGroupATeams();
  const standings = getGroupAStandings();
  const matches = getGroupAMatches();

  return (
    <div className="page-wrap py-10 sm:py-14">
      <header className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="green">
              <span className="data-dot" />
              FIFA 공식 결과
            </Badge>
            <Badge tone="gold">GROUP A</Badge>
          </div>
          <p className="eyebrow mt-8">Final group table</p>
          <h1 className="text-balance mt-4 text-4xl font-black tracking-[-.05em] text-white sm:text-6xl">
            A조의 실제 여정,
            <br />
            {matches.length}경기로 읽습니다.
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-[#aeb6c2]">
            공식 최종 순위와 경기 결과입니다. 국가를 선택하면 그 팀의 세 경기를
            강조해 볼 수 있으며, 감독 미션 점수가 이 순위를 바꾸지는 않습니다.
          </p>
        </div>
        <ButtonLink href="/teams" variant="secondary" className="lg:min-w-44">
          국가 선택 <span aria-hidden="true">→</span>
        </ButtonLink>
      </header>

      <nav
        aria-label="순위에서 강조할 국가"
        className="hide-scrollbar mt-9 flex gap-2 overflow-x-auto pb-2"
      >
        <Link
          href="/group-a"
          aria-current={!selectedTeam ? "page" : undefined}
          className={`shrink-0 rounded-full border px-4 py-2.5 text-sm font-black transition ${
            !selectedTeam
              ? "border-[#f4b860]/45 bg-[#f4b860]/12 text-[#f7c979]"
              : "border-white/10 bg-white/[.035] text-[#aeb6c2] hover:text-white"
          }`}
        >
          전체
        </Link>
        {teams.map((team) => {
          const active = selectedTeam?.id === team.id;
          return (
            <Link
              key={team.id}
              href={`/group-a?team=${team.id}`}
              aria-current={active ? "page" : undefined}
              className={`shrink-0 rounded-full border px-4 py-2.5 text-sm font-black transition ${
                active
                  ? "border-[#f4b860]/45 bg-[#f4b860]/12 text-[#f7c979]"
                  : "border-white/10 bg-white/[.035] text-[#aeb6c2] hover:text-white"
              }`}
            >
              {team.code} · {team.nameKo}
            </Link>
          );
        })}
      </nav>

      <section className="mt-7" aria-labelledby="standings-title">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="eyebrow">Standings</p>
            <h2
              id="standings-title"
              className="mt-2 text-2xl font-black text-white sm:text-3xl"
            >
              실제 최종 순위
            </h2>
          </div>
          {selectedTeam && (
            <Link
              href={`/teams/${selectedTeam.id}`}
              className="text-sm font-black text-[#f4b860] hover:text-[#ffd08a]"
            >
              {selectedTeam.nameKo} 3경기 보기 →
            </Link>
          )}
        </div>
        <StandingsTable
          selectedTeamId={selectedTeam?.id}
          rows={standings.flatMap((standing) => {
            const team = getGroupATeam(standing.teamId);
            return team
              ? [
                  {
                    teamId: team.id,
                    teamName: team.nameKo,
                    teamCode: team.code,
                    position: standing.position,
                    played: standing.played,
                    won: standing.won,
                    drawn: standing.drawn,
                    lost: standing.lost,
                    goalsFor: standing.goalsFor,
                    goalsAgainst: standing.goalsAgainst,
                    goalDifference: standing.goalDifference,
                    points: standing.points,
                  },
                ]
              : [];
          })}
        />
      </section>

      <section className="mt-12" aria-labelledby="results-title">
        <div className="mb-4">
          <p className="eyebrow">Official matches · {matches.length}</p>
          <h2
            id="results-title"
            className="mt-2 text-2xl font-black text-white sm:text-3xl"
          >
            A조 전체 경기 결과
          </h2>
        </div>
        <GroupResults
          selectedTeamId={selectedTeam?.id}
          matches={matches.flatMap((match) => {
            const homeTeam = getGroupATeam(match.homeTeamId);
            const awayTeam = getGroupATeam(match.awayTeamId);
            if (!homeTeam || !awayTeam) return [];
            return [
              {
                id: match.id,
                matchNumber: match.matchNumber,
                date: match.date,
                city: match.city,
                homeTeam: {
                  id: homeTeam.id,
                  name: homeTeam.nameKo,
                  code: homeTeam.code,
                },
                awayTeam: {
                  id: awayTeam.id,
                  name: awayTeam.nameKo,
                  code: awayTeam.code,
                },
                finalScore: match.finalScore,
                missionCount: getGroupAScenariosForMatch(match.id).length,
              },
            ];
          })}
        />
      </section>
    </div>
  );
}
