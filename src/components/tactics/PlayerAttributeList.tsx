import type {
  AttributeKey,
  GoalkeeperAttributeKey,
  Player,
} from "@/data/types";
import { calculateEffectiveAttribute } from "@/lib/attributes/baseProfile";
import { ATTRIBUTE_LABELS } from "@/lib/decision/evaluateDecision";

const fieldKeys: readonly AttributeKey[] = [
  "finishing",
  "chanceCreation",
  "dribbling",
  "passing",
  "pressing",
  "defending",
  "aerial",
  "impact",
];

const goalkeeperKeys: readonly GoalkeeperAttributeKey[] = [
  "shotStopping",
  "distribution",
  "aerialCommand",
  "sweeping",
  "penaltySaving",
  "stability",
  "buildUp",
  "impact",
];

const goalkeeperLabels: Record<GoalkeeperAttributeKey, string> = {
  shotStopping: "선방",
  distribution: "배급",
  aerialCommand: "공중볼 장악",
  sweeping: "스위핑",
  penaltySaving: "페널티 대응",
  stability: "안정성",
  buildUp: "빌드업",
  impact: "임팩트",
};

export function PlayerAttributeList({
  player,
  compareWith,
  emphasized = [],
}: {
  player: Player;
  compareWith?: Player;
  emphasized?: string[];
}) {
  const model = player.activeAttributeModel;
  const keys = model === "goalkeeper" ? goalkeeperKeys : fieldKeys;

  return (
    <dl className="grid gap-2.5">
      {keys.map((key) => {
        const isGoalkeeperAttribute = model === "goalkeeper";
        const baseValue = isGoalkeeperAttribute
          ? player.goalkeeperAttributes[key as GoalkeeperAttributeKey]
          : player.attributes[key as AttributeKey];
        const comparedBaseValue =
          compareWith?.activeAttributeModel === model
            ? isGoalkeeperAttribute
              ? compareWith.goalkeeperAttributes[
                  key as GoalkeeperAttributeKey
                ]
              : compareWith.attributes[key as AttributeKey]
            : null;
        const value = calculateEffectiveAttribute(
          baseValue,
          player.tournamentForm?.adjustment ?? 0,
        );
        const comparedValue = calculateEffectiveAttribute(
          comparedBaseValue,
          compareWith?.tournamentForm?.adjustment ?? 0,
        );
        const hasValue = typeof value === "number" && Number.isFinite(value);
        const hasComparedValue =
          typeof comparedValue === "number" && Number.isFinite(comparedValue);
        const delta =
          compareWith && hasValue && hasComparedValue
            ? value - comparedValue
            : null;
        const isEmphasized = emphasized.includes(key);
        return (
          <div key={key} className="grid grid-cols-[82px_1fr_70px_38px] items-center gap-2">
            <dt className={`text-xs font-bold ${isEmphasized ? "text-[#f7c979]" : "text-[#a8b1bf]"}`}>
              {isGoalkeeperAttribute
                ? goalkeeperLabels[key as GoalkeeperAttributeKey]
                : ATTRIBUTE_LABELS[key as AttributeKey]}
            </dt>
            <dd className="h-1.5 overflow-hidden rounded-full bg-white/[.07]">
              <span
                className={`block h-full rounded-full ${isEmphasized ? "bg-[#f4b860]" : "bg-[#65d89a]"}`}
                style={{ width: `${hasValue ? Math.max(5, value * 5) : 0}%` }}
              />
            </dd>
            <dd
              className="number-tabular text-right text-[11px] font-black text-white"
              aria-label={hasValue ? undefined : "데이터 없음"}
              title={hasValue ? undefined : "데이터 없음"}
            >
              {hasValue ? (
                <>
                  <span className="text-[#9aa5b4]">{baseValue}</span>
                  <span aria-hidden="true"> → </span>
                  <span>{value}</span>
                </>
              ) : (
                "—"
              )}
            </dd>
            <dd
              className={`number-tabular text-right text-xs font-black ${
                delta !== null && delta > 0
                  ? "text-[#82e6ac]"
                  : delta !== null && delta < 0
                    ? "text-[#ff9e90]"
                    : "text-[#677486]"
              }`}
              aria-label={
                compareWith && delta === null ? "비교 데이터 없음" : undefined
              }
              title={
                compareWith && delta === null ? "비교 데이터 없음" : undefined
              }
            >
              {compareWith
                ? delta === null
                  ? "—"
                  : delta > 0
                    ? `+${delta}`
                    : `${delta}`
                : ""}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
