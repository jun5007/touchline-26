import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/common/Badge";
import { StepIndicator } from "@/components/layout/StepIndicator";
import { MatchCard } from "@/components/match/MatchCard";
import {
  getGroupAMatches,
  getGroupAScenarios,
  getGroupAScenariosForMatch,
  getGroupATeam,
  getGroupATeams,
} from "@/data/group-a/catalog";

export const metadata: Metadata = {
  title: "경기 선택",
  description:
    "2026 월드컵 A조 실제 6경기에서 양 팀 감독 관점의 미션을 선택하세요.",
};

export default async function MatchesPage({
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
  const allMatches = getGroupAMatches();
  const allScenarios = getGroupAScenarios();
  const matches = selectedTeam
    ? allMatches.filter((match) =>
        match.playableTeamIds.includes(selectedTeam.id),
      )
    : allMatches;

  return (
    <div className="page-wrap py-10 sm:py-14">
      <StepIndicator current="match" />
      <header className="mt-12 max-w-4xl">
        <div className="flex flex-wrap gap-2">
          <Badge tone="green">
            <span className="data-dot" />
            공식 A조 {allMatches.length}경기
          </Badge>
          <Badge tone="gold">양 팀 감독 관점</Badge>
        </div>
        <p className="eyebrow mt-7">Choose the match</p>
        <h1 className="text-balance mt-4 text-4xl font-black tracking-[-.05em] text-white sm:text-6xl">
          한 경기의 양쪽,
          <br />
          어느 터치라인에 설까요?
        </h1>
        <p className="mt-5 text-base leading-7 text-[#aeb6c2]">
          A조 실제 {allMatches.length}경기를 모두 제공합니다. 각 경기에서 지휘할 국가를
          고르면 해당 시점의 라인업·벤치·스코어와 실제 감독 선택이 별도로
          적용됩니다.
        </p>
        <dl className="mt-7 flex flex-wrap gap-x-8 gap-y-3 border-t border-white/[.08] pt-5">
          <div>
            <dt className="text-[11px] font-black tracking-[.1em] text-[#8f99a8]">
              OFFICIAL MATCHES
            </dt>
            <dd className="number-tabular mt-1 text-lg font-black text-white">
              {allMatches.length}
            </dd>
          </div>
          <div>
            <dt className="text-[11px] font-black tracking-[.1em] text-[#8f99a8]">
              MANAGER MISSIONS
            </dt>
            <dd className="number-tabular mt-1 text-lg font-black text-white">
              {allScenarios.length}
            </dd>
          </div>
          <div>
            <dt className="text-[11px] font-black tracking-[.1em] text-[#8f99a8]">
              SELECTED VIEW
            </dt>
            <dd className="mt-1 text-lg font-black text-white">
              {selectedTeam
                ? `${selectedTeam.code} · ${matches.length}경기`
                : "A조 전체"}
            </dd>
          </div>
        </dl>
      </header>

      <nav
        aria-label="국가별 경기 필터"
        className="hide-scrollbar mt-9 flex gap-2 overflow-x-auto pb-2"
      >
        <Link
          href="/matches"
          aria-current={!selectedTeam ? "page" : undefined}
          className={`shrink-0 rounded-full border px-4 py-2.5 text-sm font-black ${
            !selectedTeam
              ? "border-[#f4b860]/45 bg-[#f4b860]/12 text-[#f7c979]"
              : "border-white/10 bg-white/[.035] text-[#aeb6c2] hover:text-white"
          }`}
        >
          전체 {allMatches.length}경기
        </Link>
        {teams.map((team) => {
          const active = selectedTeam?.id === team.id;
          return (
            <Link
              key={team.id}
              href={`/matches?team=${team.id}`}
              aria-current={active ? "page" : undefined}
              className={`shrink-0 rounded-full border px-4 py-2.5 text-sm font-black ${
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

      <section className="mt-6 grid max-w-5xl gap-5" aria-live="polite">
        {matches.map((match) => {
          const homeTeam = getGroupATeam(match.homeTeamId);
          const awayTeam = getGroupATeam(match.awayTeamId);
          if (!homeTeam || !awayTeam) return null;
          const perspectives = match.playableTeamIds.flatMap((teamId) => {
            const team = getGroupATeam(teamId);
            const scenarios = getGroupAScenariosForMatch(match.id, teamId);
            const firstScenario = scenarios[0];
            if (!team || !firstScenario) return [];
            return [
              {
                teamId: team.id,
                teamName: team.nameKo,
                teamCode: team.code,
                missionCount: scenarios.length,
                formation: match.formationsByTeam[team.id],
                firstMissionHref: `/matches/${match.id}/scenarios/${firstScenario.id}/briefing`,
              },
            ];
          });

          return (
            <MatchCard
              key={match.id}
              match={{
                id: match.id,
                matchNumber: match.matchNumber,
                group: "A조",
                stage: "조별리그",
                date: match.date,
                localKickoff: match.localKickoff,
                venue: match.venue,
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
                verificationStatus: "verified",
                perspectives,
              }}
            />
          );
        })}
      </section>
    </div>
  );
}
