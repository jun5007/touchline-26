"use client";

import type { Player } from "@/data/types";
import { BenchPlayerCard } from "@/components/tactics/BenchPlayerCard";

export function BenchPanel({
  players,
  selectedId,
  fitScores,
  onSelect,
}: {
  players: Player[];
  selectedId: string | null;
  fitScores: Record<string, number | undefined>;
  onSelect: (playerId: string) => void;
}) {
  const missingPerformanceCount = players.filter(
    (player) => player.sourceStatus === "incomplete",
  ).length;

  return (
    <section aria-labelledby="bench-title">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-black tracking-[.13em] text-[#9aa5b4]">AVAILABLE</p>
          <h2 id="bench-title" className="mt-1 text-base font-black text-white">벤치 옵션</h2>
        </div>
        <span className="text-xs font-bold text-[#b2bbc7]">
          선수를 클릭해 교체
          <span className="hidden lg:inline"> · 드래그 실험적</span>
        </span>
      </div>
      {missingPerformanceCount > 0 && (
        <div
          className="mt-3 rounded-lg border border-[#75b9ff]/18 bg-[#75b9ff]/[.055] px-3 py-2 text-xs leading-5 text-[#b9dcff]"
          role="status"
        >
          벤치 {missingPerformanceCount}명의 공식 명단·현재 경기 상태는
          확인했지만, 비교 가능한 최근 1년 선수별 성과 지표는 미산정입니다.
          아래 적합도는 선수 절대 능력이나 승률이 아닙니다.
        </div>
      )}
      <div className="mt-3 grid min-w-0 grid-cols-[minmax(0,1fr)] gap-2 sm:grid-cols-2 lg:grid-cols-1">
        {players.map((player) => (
          <BenchPlayerCard
            key={player.id}
            player={player}
            selected={selectedId === player.id}
            fitScore={fitScores[player.id]}
            onSelect={onSelect}
          />
        ))}
      </div>
    </section>
  );
}
