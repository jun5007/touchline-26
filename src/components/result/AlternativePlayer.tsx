import { Badge } from "@/components/common/Badge";
import type { Player, Role } from "@/data/types";

export function AlternativePlayer({
  player,
  role,
  score,
  selectedScore,
}: {
  player: Player;
  role: Role;
  score: number;
  selectedScore: number;
}) {
  const delta = score - selectedScore;
  return (
    <section className="panel p-5 sm:p-6">
      <p className="text-xs font-black tracking-[.13em] text-[#9aa5b4]">ALTERNATIVE</p>
      <h2 className="mt-2 text-lg font-black text-white">다른 선택의 가능성</h2>
      <div className="mt-4 flex items-center gap-3 rounded-xl border border-white/[.08] bg-white/[.03] p-4">
        <span className="grid h-11 w-11 place-items-center rounded-full border border-[#75b9ff]/40 bg-[#75b9ff]/8 text-sm font-black text-[#9acbff]">
          {player.shirtNumber}
        </span>
        <div className="min-w-0 flex-1">
          <strong className="block text-sm text-white">{player.name}</strong>
          <span className="block text-xs text-[#a8b1bf]">{role.name} · {player.position}</span>
        </div>
        <div className="text-right">
          <span className="number-tabular block text-xl font-black text-white">{score}</span>
          <span className={`number-tabular text-xs font-bold ${delta > 0 ? "text-[#82e6ac]" : "text-[#ff9e90]"}`}>
            선택 대비 {delta > 0 ? "+" : ""}{delta}
          </span>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {player.tags.slice(0, 3).map((tag) => (
          <Badge key={tag}>{tag}</Badge>
        ))}
      </div>
      <p className="mt-4 text-xs leading-5 text-[#8f99a8]">
        더 높은 점수가 정답을 뜻하지는 않습니다. 이 대안은 {player.tags[0] ?? "다른 강점"}을
        우선하지만, 현재 선택과 다른 위험을 가져옵니다.
      </p>
    </section>
  );
}
