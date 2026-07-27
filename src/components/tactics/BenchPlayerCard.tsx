"use client";

import { useDraggable } from "@dnd-kit/core";
import type { Player } from "@/data/types";
import { Badge } from "@/components/common/Badge";

export function BenchPlayerCard({
  player,
  selected,
  fitScore,
  onSelect,
}: {
  player: Player;
  selected: boolean;
  fitScore?: number;
  onSelect: (playerId: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `bench-${player.id}`,
    data: { playerId: player.id, type: "bench-player" },
  });
  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  return (
    <button
      ref={setNodeRef}
      type="button"
      style={style}
      onClick={() => onSelect(player.id)}
      {...listeners}
      {...attributes}
      aria-pressed={selected}
      aria-label={`${player.name}, ${player.position}. 투입 선수로 선택하거나 드래그`}
      className={`relative z-10 w-full rounded-xl border p-3 text-left transition ${
        selected
          ? "border-[#65d89a]/65 bg-[#65d89a]/10 shadow-[0_8px_24px_rgba(20,110,72,.18)]"
          : "border-white/[.08] bg-white/[.035] hover:border-white/20 hover:bg-white/[.06]"
      } ${isDragging ? "opacity-55" : ""}`}
    >
      <div className="flex items-start gap-3">
        <span
          className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border text-xs font-black ${
            selected
              ? "border-[#65d89a] bg-[#0a3c2c] text-[#8cebb4]"
              : "border-white/25 bg-[#0a1422] text-white"
          }`}
        >
          {player.shirtNumber}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center justify-between gap-2">
            <span className="truncate text-sm font-black text-white">{player.name}</span>
            {typeof fitScore === "number" && (
              <span className="number-tabular text-sm font-black text-[#f4b860]">{fitScore}</span>
            )}
          </span>
          <span className="mt-0.5 block truncate text-[10px] font-medium text-[#8f99a8]">
            {player.position} · 체력 {player.fitness}
          </span>
        </span>
      </div>
      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
        <Badge tone={player.confidenceLabel === "낮음" ? "danger" : "neutral"}>
          신뢰도 {player.confidenceLabel}
        </Badge>
        {player.tags.slice(0, 1).map((tag) => (
          <Badge key={tag} tone="green">{tag}</Badge>
        ))}
      </div>
      <span className="absolute right-2 top-1/2 hidden -translate-y-1/2 text-[11px] text-white/20 lg:block" aria-hidden="true">
        ⠿
      </span>
    </button>
  );
}
