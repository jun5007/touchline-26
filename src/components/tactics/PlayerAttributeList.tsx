import type { Player } from "@/data/types";
import { ATTRIBUTE_LABELS } from "@/lib/decision/evaluateDecision";

const keys = [
  "finishing",
  "chanceCreation",
  "dribbling",
  "passing",
  "pressing",
  "defending",
  "aerial",
  "impact",
] as const;

export function PlayerAttributeList({
  player,
  compareWith,
  emphasized = [],
}: {
  player: Player;
  compareWith?: Player;
  emphasized?: string[];
}) {
  return (
    <dl className="grid gap-2.5">
      {keys.map((key) => {
        const value = player.attributes[key];
        const delta = compareWith ? value - compareWith.attributes[key] : 0;
        const isEmphasized = emphasized.includes(key);
        return (
          <div key={key} className="grid grid-cols-[82px_1fr_28px_38px] items-center gap-2">
            <dt className={`text-[10px] font-bold ${isEmphasized ? "text-[#f7c979]" : "text-[#8994a3]"}`}>
              {ATTRIBUTE_LABELS[key]}
            </dt>
            <dd className="h-1.5 overflow-hidden rounded-full bg-white/[.07]">
              <span
                className={`block h-full rounded-full ${isEmphasized ? "bg-[#f4b860]" : "bg-[#65d89a]"}`}
                style={{ width: `${Math.max(5, value * 5)}%` }}
              />
            </dd>
            <dd className="number-tabular text-right text-xs font-black text-white">{value}</dd>
            <dd
              className={`number-tabular text-right text-[10px] font-black ${
                delta > 0 ? "text-[#82e6ac]" : delta < 0 ? "text-[#ff9e90]" : "text-[#677486]"
              }`}
            >
              {compareWith ? (delta > 0 ? `+${delta}` : `${delta}`) : ""}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}

