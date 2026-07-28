import Link from "next/link";
import { Badge } from "@/components/common/Badge";

export interface TeamCardView {
  id: string;
  name: string;
  nameEn: string;
  code: string;
  fifaRanking: number | null;
  fifaRankingDate: string;
  fifaRankingStatus: "verified" | "derived";
  standing: {
    position: number;
    played: number;
    points: number;
    goalDifference: number;
  };
  missionCount: number;
  verificationStatus: "verified" | "partial" | "incomplete";
}

const teamAccent: Record<string, string> = {
  kor: "from-[#4f83e6]/24",
  cze: "from-[#de5567]/22",
  mex: "from-[#4ebf83]/24",
  rsa: "from-[#f4c85c]/20",
};

function signed(value: number) {
  return `${value > 0 ? "+" : ""}${value}`;
}

export function TeamCard({ team }: { team: TeamCardView }) {
  const accent = teamAccent[team.id] ?? "from-white/[.08]";

  return (
    <Link
      href={`/teams/${team.id}`}
      aria-label={`${team.name} 감독 미션 선택`}
      className="group panel overflow-hidden transition duration-200 hover:-translate-y-1 hover:border-[#f4b860]/35 focus-visible:-translate-y-1"
    >
      <article>
        <div
          className={`border-b border-white/[.07] bg-gradient-to-br ${accent} to-transparent p-5 sm:p-6`}
        >
          <div className="flex items-start justify-between gap-4">
            <span
              aria-hidden="true"
              className="grid h-14 w-14 place-items-center rounded-2xl border border-white/12 bg-[#071018]/65 text-base font-black tracking-[.08em] text-white shadow-lg"
            >
              {team.code}
            </span>
            <div className="flex flex-wrap justify-end gap-2">
              <Badge tone={team.verificationStatus === "verified" ? "green" : "gold"}>
                {team.verificationStatus === "verified" ? "검증 완료" : "부분 검증"}
              </Badge>
              {team.fifaRankingStatus === "derived" && (
                <Badge tone="gold">랭킹 역산</Badge>
              )}
              <Badge tone="gold">A조 {team.standing.position}위</Badge>
            </div>
          </div>
          <p className="mt-8 text-xs font-black tracking-[.13em] text-[#9ba6b4]">
            {team.nameEn}
          </p>
          <h2 className="mt-1 text-3xl font-black tracking-[-.04em] text-white">
            {team.name}
          </h2>
        </div>

        <div className="p-5 sm:p-6">
          <dl className="grid grid-cols-4 gap-2">
            {[
              ["승점", team.standing.points],
              ["경기", team.standing.played],
              ["골득실", signed(team.standing.goalDifference)],
              ["미션", team.missionCount],
            ].map(([label, value]) => (
              <div key={label} className="panel-soft px-2 py-3 text-center">
                <dt className="text-[11px] font-bold text-[#929dab]">{label}</dt>
                <dd className="number-tabular mt-1 text-lg font-black text-white">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
          <div className="mt-5 flex items-end justify-between gap-4 border-t border-white/[.07] pt-4">
            <div>
              <p className="text-[11px] font-bold text-[#929dab]">
                FIFA 랭킹
                {team.fifaRankingStatus === "derived" ? " 참고치" : ""}
              </p>
              <p className="number-tabular mt-1 text-sm font-black text-[#dfe4ea]">
                {team.fifaRanking === null ? "확인 중" : `${team.fifaRanking}위`}
              </p>
              <p className="mt-0.5 text-xs text-[#7f8a99]">
                기준 {team.fifaRankingDate.replaceAll("-", ".")}
              </p>
            </div>
            <span className="text-sm font-black text-[#f4b860] transition group-hover:translate-x-1">
              {team.standing.played}경기 지휘하기{" "}
              <span aria-hidden="true">→</span>
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
