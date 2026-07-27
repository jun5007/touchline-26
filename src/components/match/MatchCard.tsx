import { Badge } from "@/components/common/Badge";
import { ButtonLink } from "@/components/common/Button";
import type { Match } from "@/data/types";

export function MatchCard({ match }: { match: Match }) {
  return (
    <article className="panel group overflow-hidden">
      <div className="border-b border-white/[.07] bg-gradient-to-r from-[#0f7150]/22 to-transparent px-5 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Badge tone="green">
              <span className="data-dot" />
              실제 데이터 검증
            </Badge>
            <Badge>{match.stage}</Badge>
            <Badge tone="gold">{match.group}</Badge>
          </div>
          <span className="text-[11px] font-bold text-[#8994a3]">MATCH {match.matchNumber}</span>
        </div>
      </div>
      <div className="p-5 sm:p-6">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <div>
            <span className="text-[11px] font-black tracking-[.13em] text-[#8f99a8]">
              {match.homeTeam.code}
            </span>
            <h2 className="mt-1 text-xl font-black text-white">{match.homeTeam.name}</h2>
          </div>
          <div className="text-center">
            <div className="number-tabular text-3xl font-black tracking-tight text-[#f4b860]">
              {match.finalScore.home}
              <span className="mx-1.5 text-[#647082]">:</span>
              {match.finalScore.away}
            </div>
            <p className="mt-1 text-[10px] font-bold text-[#7f8998]">실제 최종</p>
          </div>
          <div className="text-right">
            <span className="text-[11px] font-black tracking-[.13em] text-[#8f99a8]">
              {match.awayTeam.code}
            </span>
            <h2 className="mt-1 text-xl font-black text-white">{match.awayTeam.name}</h2>
          </div>
        </div>
        <dl className="mt-6 grid gap-3 border-y border-white/[.07] py-4 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-[10px] font-bold tracking-[.1em] text-[#7f8998]">일시</dt>
            <dd className="mt-1 font-bold text-[#dce1e8]">2026.06.11 · 20:00</dd>
          </div>
          <div>
            <dt className="text-[10px] font-bold tracking-[.1em] text-[#7f8998]">장소</dt>
            <dd className="mt-1 font-bold text-[#dce1e8]">{match.city}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-bold tracking-[.1em] text-[#7f8998]">플레이 팀</dt>
            <dd className="mt-1 font-bold text-[#dce1e8]">{match.homeTeam.name} · {match.startingFormation}</dd>
          </div>
        </dl>
        <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-black tracking-[.12em] text-[#f4b860]">대표 미션</p>
            <p className="mt-1 max-w-md text-sm font-bold leading-6 text-[#e4e7ec]">
              69분 1–1. 캡틴을 남길 것인가, 박스 안 9번을 세울 것인가.
            </p>
          </div>
          <ButtonLink href={`/matches/${match.id}`} className="shrink-0">
            이 경기 지휘하기 <span aria-hidden="true">→</span>
          </ButtonLink>
        </div>
      </div>
    </article>
  );
}

