import { Badge } from "@/components/common/Badge";
import type { Player, Role } from "@/data/types";
import { PlayerAttributeList } from "@/components/tactics/PlayerAttributeList";

function PlayerHeader({
  player,
  label,
  tone,
}: {
  player: Player;
  label: string;
  tone: "out" | "in";
}) {
  return (
    <div className="flex items-center gap-3">
      <span
        className={`grid h-10 w-10 place-items-center rounded-full border text-sm font-black ${
          tone === "in"
            ? "border-[#65d89a]/55 bg-[#65d89a]/10 text-[#82e6ac]"
            : "border-[#ff806d]/45 bg-[#ff806d]/9 text-[#ff9e90]"
        }`}
      >
        {player.shirtNumber}
      </span>
      <div className="min-w-0">
        <span className="block text-[9px] font-black tracking-[.12em] text-[#778393]">{label}</span>
        <strong className="block truncate text-sm text-white">{player.name}</strong>
        <span className="block truncate text-[10px] text-[#8994a3]">{player.position}</span>
      </div>
    </div>
  );
}

export function PlayerComparison({
  outgoing,
  incoming,
  role,
}: {
  outgoing: Player | null;
  incoming: Player | null;
  role: Role | null;
}) {
  if (!outgoing || !incoming) {
    return (
      <section className="panel-soft p-4" aria-label="선수 비교">
        <p className="text-[10px] font-black tracking-[.13em] text-[#7f8998]">PLAYER COMPARE</p>
        <div className="mt-4 rounded-xl border border-dashed border-white/10 px-4 py-8 text-center">
          <span className="text-2xl text-white/25">↔</span>
          <p className="mt-2 text-xs font-bold leading-5 text-[#7f8998]">
            필드에서 OUT 선수를 고르고
            <br />
            벤치에서 IN 선수를 선택하세요.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="panel-soft p-4" aria-labelledby="compare-title">
      <div className="flex items-center justify-between gap-3">
        <p id="compare-title" className="text-[10px] font-black tracking-[.13em] text-[#7f8998]">
          PLAYER COMPARE
        </p>
        <Badge tone="blue">경기 종료 후 회고 지표</Badge>
      </div>
      <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <PlayerHeader player={outgoing} label="OUT" tone="out" />
        <span className="text-white/25">→</span>
        <PlayerHeader player={incoming} label="IN" tone="in" />
      </div>
      <div className="mt-5 border-t border-white/[.07] pt-4">
        <PlayerAttributeList
          player={incoming}
          compareWith={outgoing}
          emphasized={role?.preferredAttributes ?? []}
        />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Badge tone={incoming.confidenceLabel === "낮음" ? "danger" : "green"}>
          신뢰도 {incoming.confidenceLabel}
        </Badge>
        <Badge>표본 {incoming.minutesPlayed}분</Badge>
        <Badge tone="gold">체력 {incoming.fitness}</Badge>
      </div>
      <p className="mt-3 text-[10px] leading-4 text-[#748091]">{incoming.performanceContext}</p>
    </section>
  );
}

