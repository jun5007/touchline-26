"use client";

import type { LineupSpot, Player } from "@/data/types";
import { PitchPlayer } from "@/components/tactics/PitchPlayer";

export function FootballPitch({
  lineup,
  players,
  selectedOutId,
  selectedIn,
  onSelectOut,
}: {
  lineup: LineupSpot[];
  players: Player[];
  selectedOutId: string | null;
  selectedIn: Player | null;
  onSelectOut: (playerId: string) => void;
}) {
  return (
    <section aria-label="현재 전술 보드" className="relative mx-auto aspect-[7/9] w-full max-w-[560px] overflow-hidden rounded-[22px] border border-[#65d89a]/28 bg-[#0b6847] shadow-[inset_0_0_70px_rgba(2,28,19,.34)]">
      <div className="absolute inset-[4.5%] border border-white/25" />
      <div className="absolute left-[25%] right-[25%] top-[4.5%] h-[15%] border border-t-0 border-white/25" />
      <div className="absolute bottom-[4.5%] left-[25%] right-[25%] h-[15%] border border-b-0 border-white/25" />
      <div className="absolute left-0 right-0 top-1/2 h-px bg-white/25" />
      <div className="absolute left-1/2 top-1/2 h-[18%] w-[24%] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border border-white/25" />
      <div className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/35" />
      <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,rgba(255,255,255,.018)_0,rgba(255,255,255,.018)_12.5%,transparent_12.5%,transparent_25%)]" />
      {lineup.map((spot) => {
        const player = players.find((candidate) => candidate.id === spot.playerId);
        if (!player) return null;
        return (
          <PitchPlayer
            key={spot.playerId}
            player={player}
            spot={spot}
            selected={selectedOutId === player.id}
            previewPlayer={selectedOutId === player.id ? selectedIn ?? undefined : undefined}
            onSelect={onSelectOut}
          />
        );
      })}
      <div className="pointer-events-none absolute bottom-3 left-3 rounded-lg border border-white/10 bg-[#04110c]/75 px-2.5 py-1.5 text-[11px] font-bold text-white/75 backdrop-blur">
        공식 선발 명단과 포지션군을 바탕으로 한 분석적 위치 도식
      </div>
    </section>
  );
}
