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
  return (
    <section aria-labelledby="bench-title">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-black tracking-[.13em] text-[#7f8998]">AVAILABLE</p>
          <h2 id="bench-title" className="mt-1 text-base font-black text-white">벤치 옵션</h2>
        </div>
        <span className="text-[10px] font-bold text-[#9ba5b2]">클릭 또는 드래그</span>
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
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
