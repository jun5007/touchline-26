import Link from "next/link";

export interface StandingRowView {
  teamId: string;
  teamName: string;
  teamCode: string;
  position: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

function signed(value: number) {
  return `${value > 0 ? "+" : ""}${value}`;
}

export function StandingsTable({
  rows,
  selectedTeamId,
}: {
  rows: StandingRowView[];
  selectedTeamId?: string;
}) {
  return (
    <div className="panel overflow-hidden">
      <div className="hide-scrollbar overflow-x-auto">
        <table className="w-full min-w-[680px] border-collapse text-sm">
          <caption className="sr-only">
            2026 FIFA 월드컵 A조 실제 최종 순위
          </caption>
          <thead className="border-b border-white/[.08] bg-white/[.025] text-[11px] font-black tracking-[.08em] text-[#929dab]">
            <tr>
              <th scope="col" className="w-16 px-5 py-4 text-center">
                순위
              </th>
              <th scope="col" className="px-3 py-4 text-left">
                국가
              </th>
              <th scope="col" className="px-3 py-4 text-center">
                경기
              </th>
              <th scope="col" className="px-3 py-4 text-center">
                승
              </th>
              <th scope="col" className="px-3 py-4 text-center">
                무
              </th>
              <th scope="col" className="px-3 py-4 text-center">
                패
              </th>
              <th scope="col" className="px-3 py-4 text-center">
                득실
              </th>
              <th scope="col" className="px-3 py-4 text-center">
                골득실
              </th>
              <th scope="col" className="px-5 py-4 text-center">
                승점
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const isSelected = row.teamId === selectedTeamId;
              return (
                <tr
                  key={row.teamId}
                  className={`border-b border-white/[.065] last:border-b-0 ${
                    isSelected ? "bg-[#f4b860]/10" : "hover:bg-white/[.025]"
                  }`}
                >
                  <td className="px-5 py-4 text-center">
                    <span
                      className={`number-tabular inline-grid h-8 w-8 place-items-center rounded-full text-sm font-black ${
                        row.position <= 2
                          ? "bg-[#65d89a]/12 text-[#82e6ac]"
                          : "bg-white/[.045] text-[#aeb7c4]"
                      }`}
                    >
                      {row.position}
                    </span>
                  </td>
                  <th scope="row" className="px-3 py-4 text-left">
                    <Link
                      href={`/teams/${row.teamId}`}
                      className="inline-flex items-center gap-3 rounded-lg hover:text-[#f4b860]"
                    >
                      <span className="grid h-8 min-w-11 place-items-center rounded-lg border border-white/10 bg-[#071018]/55 px-2 text-[11px] font-black tracking-[.08em] text-[#f4b860]">
                        {row.teamCode}
                      </span>
                      <span className="font-black text-white">
                        {row.teamName}
                      </span>
                      {isSelected && (
                        <span className="text-xs font-black text-[#f4b860]">
                          선택
                        </span>
                      )}
                    </Link>
                  </th>
                  {[
                    row.played,
                    row.won,
                    row.drawn,
                    row.lost,
                    `${row.goalsFor}:${row.goalsAgainst}`,
                    signed(row.goalDifference),
                  ].map((value, index) => (
                    <td
                      key={index}
                      className="number-tabular px-3 py-4 text-center font-bold text-[#c7ced8]"
                    >
                      {value}
                    </td>
                  ))}
                  <td className="number-tabular px-5 py-4 text-center text-lg font-black text-white">
                    {row.points}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="border-t border-white/[.07] px-5 py-4 text-xs leading-5 text-[#8f99a8]">
        실제 대회 최종 결과입니다. 감독 미션의 선택 점수와 공식 순위는 서로
        독립적으로 표시됩니다.
      </p>
    </div>
  );
}
