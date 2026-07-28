import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/common/Badge";
import { TeamCard } from "@/components/team/TeamCard";
import {
  getGroupAMatches,
  getGroupAMatchesForTeam,
  getGroupAPlayers,
  getGroupAScenarios,
  getGroupAScenariosForTeam,
  getGroupATeams,
} from "@/data/group-a/catalog";

export const metadata: Metadata = {
  title: "국가 선택",
  description:
    "2026 월드컵 A조 네 팀 중 한 국가를 선택해 실제 경기 시점의 전술 결정을 다시 설계해 보세요.",
};

export default function TeamsPage() {
  const teams = getGroupATeams();
  const matches = getGroupAMatches();
  const scenarios = getGroupAScenarios();
  const players = getGroupAPlayers();
  const matchesPerTeam = teams[0]
    ? getGroupAMatchesForTeam(teams[0].id).length
    : 0;

  return (
    <div className="page-wrap py-10 sm:py-14">
      <header className="max-w-4xl">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="green">
            <span className="data-dot" />
            실제 최종 명단
          </Badge>
          <Badge tone="gold">A조 전용</Badge>
        </div>
        <p className="eyebrow mt-8">Choose your nation</p>
        <h1 className="text-balance mt-4 text-4xl font-black tracking-[-.05em] text-white sm:text-6xl">
          한 경기의 터치라인,
          <br />
          어느 국가에서 시작할까요?
        </h1>
        <p className="mt-5 max-w-3xl text-base leading-7 text-[#aeb6c2]">
          실제 월드컵 경기의 특정 시점으로 돌아가 공식 명단·라인업·교체
          타임라인과 경기 상황을 확인하고, 교체·역할·팀 지시를 선택한 뒤
          장점과 위험을 분석하는 회고형 감독 시뮬레이션입니다.
        </p>
        <dl className="mt-7 flex flex-wrap gap-x-8 gap-y-3 border-t border-white/[.08] pt-5">
          <div>
            <dt className="text-[11px] font-black tracking-[.1em] text-[#8f99a8]">
              NATIONS
            </dt>
            <dd className="number-tabular mt-1 text-lg font-black text-white">
              {teams.length}개국
            </dd>
          </div>
          <div>
            <dt className="text-[11px] font-black tracking-[.1em] text-[#8f99a8]">
              MATCHES
            </dt>
            <dd className="number-tabular mt-1 text-lg font-black text-white">
              {matches.length}경기 · 국가별 {matchesPerTeam}경기
            </dd>
          </div>
          <div>
            <dt className="text-[11px] font-black tracking-[.1em] text-[#8f99a8]">
              MISSIONS
            </dt>
            <dd className="number-tabular mt-1 text-lg font-black text-white">
              {scenarios.length}개
            </dd>
          </div>
        </dl>
      </header>

      <section className="mt-10 grid gap-5 md:grid-cols-2">
        {teams.map((team) => (
          <TeamCard
            key={team.id}
            team={{
              id: team.id,
              name: team.nameKo,
              nameEn: team.nameEn,
              code: team.code,
              fifaRanking: team.fifaRanking.rank,
              fifaRankingDate: team.fifaRanking.referenceDate,
              fifaRankingStatus: team.fifaRanking.verificationStatus,
              standing: team.standing,
              missionCount: getGroupAScenariosForTeam(team.id).length,
              verificationStatus:
                team.fifaRanking.verificationStatus === "derived"
                  ? "partial"
                  : "verified",
            }}
          />
        ))}
      </section>

      <aside className="panel-soft mt-6 flex flex-col gap-3 p-5 text-sm leading-6 text-[#9fa9b7] sm:flex-row sm:items-start sm:justify-between">
        <p className="max-w-3xl">
          <strong className="text-white">현재 데이터 범위</strong>{" "}
          공식 경기 기록과 실제 최종 명단 {players.length}명을 사용합니다.
          미션 시점의 선수 컨디션은 공식 체력 수치가 아니라 출전 시간으로
          추정하며, 확인하지 못한 최근 1년 능력치·Form·리그 보정값은 적용하지
          않습니다.
        </p>
        <Link
          href="/about-data"
          className="shrink-0 font-black text-[#f4b860] hover:text-[#ffd08a]"
        >
          데이터 원칙 →
        </Link>
      </aside>
    </div>
  );
}
