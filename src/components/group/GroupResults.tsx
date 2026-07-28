import Link from "next/link";
import { Badge } from "@/components/common/Badge";

export interface GroupResultView {
  id: string;
  matchNumber: number;
  date: string;
  city: string;
  homeTeam: { id: string; name: string; code: string };
  awayTeam: { id: string; name: string; code: string };
  finalScore: { home: number; away: number };
  missionCount: number;
}

export function GroupResults({
  matches,
  selectedTeamId,
}: {
  matches: GroupResultView[];
  selectedTeamId?: string;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {matches.map((match) => {
        const selected =
          match.homeTeam.id === selectedTeamId ||
          match.awayTeam.id === selectedTeamId;

        return (
          <Link
            key={match.id}
            href={`/matches/${match.id}`}
            className={`panel group overflow-hidden transition hover:-translate-y-0.5 hover:border-[#f4b860]/30 ${
              selected ? "border-[#f4b860]/35 bg-[#f4b860]/[.055]" : ""
            }`}
          >
            <article>
              <div className="flex items-center justify-between border-b border-white/[.07] px-5 py-3">
                <span className="text-[11px] font-black tracking-[.12em] text-[#8f99a8]">
                  MATCH {match.matchNumber}
                </span>
                <div className="flex items-center gap-2">
                  {selected && <Badge tone="gold">선택 국가 경기</Badge>}
                  <Badge tone="green">미션 {match.missionCount}개</Badge>
                </div>
              </div>
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 p-5">
                <div>
                  <span className="text-[11px] font-black tracking-[.12em] text-[#929dab]">
                    {match.homeTeam.code}
                  </span>
                  <h3 className="mt-1 font-black text-white">
                    {match.homeTeam.name}
                  </h3>
                </div>
                <div className="number-tabular text-2xl font-black text-[#f4b860]">
                  {match.finalScore.home}
                  <span className="mx-1.5 text-[#647082]">:</span>
                  {match.finalScore.away}
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-black tracking-[.12em] text-[#929dab]">
                    {match.awayTeam.code}
                  </span>
                  <h3 className="mt-1 font-black text-white">
                    {match.awayTeam.name}
                  </h3>
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-white/[.07] px-5 py-3 text-xs font-bold text-[#8f99a8]">
                <span>
                  {match.date.replaceAll("-", ".")} · {match.city}
                </span>
                <span className="text-[#f4b860] transition group-hover:translate-x-1">
                  양 팀 감독석 <span aria-hidden="true">→</span>
                </span>
              </div>
            </article>
          </Link>
        );
      })}
    </div>
  );
}
