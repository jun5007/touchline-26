"use client";

import { useDroppable } from "@dnd-kit/core";
import type { CSSProperties } from "react";
import type { LineupSpot, Player } from "@/data/types";

export function PitchPlayer({
  player,
  spot,
  selected,
  previewPlayer,
  onSelect,
}: {
  player: Player;
  spot: LineupSpot;
  selected: boolean;
  previewPlayer?: Player;
  onSelect: (playerId: string) => void;
}) {
  const { isOver, setNodeRef } = useDroppable({
    id: `pitch-${player.id}`,
    data: { playerId: player.id, type: "field-player" },
  });
  const style: CSSProperties = {
    left: `${spot.x}%`,
    top: `${spot.y}%`,
    transform: "translate(-50%, -50%)",
  };

  return (
    <button
      ref={setNodeRef}
      type="button"
      style={style}
      onClick={() => onSelect(player.id)}
      aria-pressed={selected}
      aria-label={`${player.name}, ${player.position}. 교체할 선수로 선택`}
      className="group absolute z-10 flex w-[72px] flex-col items-center"
    >
      <span
        className={`relative grid h-11 w-11 place-items-center rounded-full border-2 text-sm font-black shadow-[0_8px_20px_rgba(0,0,0,.35)] transition sm:h-12 sm:w-12 ${
          previewPlayer
            ? "border-[#65d89a] bg-[#0a3c2c] text-[#8cebb4]"
            : selected
              ? "scale-110 border-[#ff806d] bg-[#421d22] text-[#ffab9f]"
              : isOver
                ? "scale-110 border-[#f4b860] bg-[#42331c] text-[#f7c979]"
                : "border-white/80 bg-[#0c1b2c] text-white hover:scale-105 hover:border-[#f4b860]"
        }`}
      >
        {previewPlayer ? previewPlayer.shirtNumber : player.shirtNumber}
        {previewPlayer && (
          <span className="absolute -right-2 -top-2 rounded-full bg-[#65d89a] px-1.5 py-0.5 text-[7px] font-black text-[#062015]">
            IN
          </span>
        )}
        {selected && !previewPlayer && (
          <span className="absolute -right-2 -top-2 rounded-full bg-[#ff806d] px-1.5 py-0.5 text-[7px] font-black text-[#2a0e12]">
            OUT
          </span>
        )}
      </span>
      <span className="mt-1.5 max-w-[76px] truncate rounded-md bg-[#06110d]/84 px-2 py-1 text-[9px] font-black leading-none text-white shadow">
        {previewPlayer ? previewPlayer.name : player.name}
      </span>
      <span className="mt-0.5 text-[8px] font-bold text-white/55">{spot.slot}</span>
    </button>
  );
}

