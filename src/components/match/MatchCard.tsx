import Link from "next/link";
import { Badge } from "@/components/common/Badge";

export interface MatchPerspectiveView {
  teamId: string;
  teamName: string;
  teamCode: string;
  missionCount: number;
  firstMissionHref: string;
  formation?: string;
}

export interface MatchCardView {
  id: string;
  matchNumber: number;
  group: string;
  stage: string;
  date: string;
  localKickoff: string;
  venue: string;
  city: string;
  homeTeam: { id: string; name: string; code: string };
  awayTeam: { id: string; name: string; code: string };
  finalScore: { home: number; away: number };
  verificationStatus: "verified" | "partial";
  perspectives: MatchPerspectiveView[];
}

export function MatchCard({ match }: { match: MatchCardView }) {
  return (
    <article className="panel group overflow-hidden">
      <div className="border-b border-white/[.07] bg-gradient-to-r from-[#0f7150]/22 to-transparent px-5 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={match.verificationStatus === "verified" ? "green" : "gold"}>
              <span className="data-dot" />
              {match.verificationStatus === "verified" ? "공식 기록 검증" : "부분 검증"}
            </Badge>
            <Badge>{match.stage}</Badge>
            <Badge tone="gold">{match.group}</Badge>
          </div>
          <span className="text-[11px] font-bold text-[#8994a3]">
            MATCH {match.matchNumber}
          </span>
        </div>
      </div>

      <div className="p-5 sm:p-6">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <div>
            <span className="text-[11px] font-black tracking-[.13em] text-[#8f99a8]">
              {match.homeTeam.code}
            </span>
            <h2 className="mt-1 text-xl font-black text-white">
              {match.homeTeam.name}
            </h2>
          </div>
          <div className="text-center">
            <div className="number-tabular text-3xl font-black tracking-tight text-[#f4b860]">
              {match.finalScore.home}
              <span className="mx-1.5 text-[#647082]">:</span>
              {match.finalScore.away}
            </div>
            <p className="mt-1 text-xs font-bold text-[#9aa5b4]">
              공식 최종 스코어
            </p>
          </div>
          <div className="text-right">
            <span className="text-[11px] font-black tracking-[.13em] text-[#8f99a8]">
              {match.awayTeam.code}
            </span>
            <h2 className="mt-1 text-xl font-black text-white">
              {match.awayTeam.name}
            </h2>
          </div>
        </div>

        <dl className="mt-6 grid gap-3 border-y border-white/[.07] py-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs font-bold tracking-[.1em] text-[#9aa5b4]">
              현지 일시
            </dt>
            <dd className="mt-1 font-bold text-[#dce1e8]">
              {match.date.replaceAll("-", ".")} · {match.localKickoff}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-bold tracking-[.1em] text-[#9aa5b4]">
              경기장
            </dt>
            <dd className="mt-1 font-bold text-[#dce1e8]">
              {match.venue} · {match.city}
            </dd>
          </div>
        </dl>

        <div className="mt-5">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <p className="text-[11px] font-black tracking-[.12em] text-[#f4b860]">
                CHOOSE YOUR TOUCHLINE
              </p>
              <p className="mt-1 text-sm leading-6 text-[#aeb6c2]">
                같은 경기, 서로 다른 감독의 조건과 선택을 경험하세요.
              </p>
            </div>
            <Link
              href={`/matches/${match.id}`}
              className="rounded-lg px-2 py-1 text-xs font-bold text-[#aeb6c2] hover:bg-white/[.05] hover:text-white"
            >
              경기 전체 보기
            </Link>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {match.perspectives.map((perspective) => (
              <Link
                key={perspective.teamId}
                href={perspective.firstMissionHref}
                className="panel-soft flex min-h-24 items-center justify-between gap-4 p-4 transition hover:border-[#f4b860]/30 hover:bg-[#f4b860]/[.06]"
                aria-label={`${perspective.teamName} 감독 관점 첫 미션 열기`}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="grid h-11 min-w-14 place-items-center rounded-xl border border-white/10 bg-[#071018]/55 px-2 text-xs font-black tracking-[.08em] text-[#f4b860]">
                    {perspective.teamCode}
                  </span>
                  <div className="min-w-0">
                    <p className="font-black text-white">
                      {perspective.teamName} 감독
                    </p>
                    <p className="mt-1 text-xs text-[#919cab]">
                      {perspective.formation
                        ? `${perspective.formation} · `
                        : ""}
                      미션 {perspective.missionCount}개
                    </p>
                  </div>
                </div>
                <span
                  aria-hidden="true"
                  className="text-lg font-black text-[#f4b860]"
                >
                  →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}
