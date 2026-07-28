import type { TacticalInstructions } from "@/data/types";
import type {
  ManagerTendency,
  RecalculatedReportDecision,
  TendencyAxes,
  TendencyAxisKey,
} from "@/lib/report/types";

type RoleSignals = Record<TendencyAxisKey, number>;

const AXIS_ORDER: readonly TendencyAxisKey[] = [
  "aggression",
  "stability",
  "pressing",
  "control",
  "width",
  "central",
  "riskTaking",
];

const ROLE_SIGNALS: Record<string, RoleSignals> = {
  "inside-forward": {
    aggression: 90,
    stability: 25,
    pressing: 75,
    control: 45,
    width: 65,
    central: 85,
    riskTaking: 80,
  },
  winger: {
    aggression: 80,
    stability: 30,
    pressing: 60,
    control: 40,
    width: 100,
    central: 15,
    riskTaking: 70,
  },
  "target-striker": {
    aggression: 90,
    stability: 25,
    pressing: 45,
    control: 30,
    width: 10,
    central: 100,
    riskTaking: 75,
  },
  "advanced-forward": {
    aggression: 100,
    stability: 15,
    pressing: 80,
    control: 25,
    width: 20,
    central: 100,
    riskTaking: 90,
  },
  playmaker: {
    aggression: 50,
    stability: 70,
    pressing: 40,
    control: 100,
    width: 35,
    central: 90,
    riskTaking: 40,
  },
  "box-to-box": {
    aggression: 65,
    stability: 55,
    pressing: 80,
    control: 70,
    width: 35,
    central: 90,
    riskTaking: 55,
  },
  "holding-midfielder": {
    aggression: 20,
    stability: 100,
    pressing: 55,
    control: 90,
    width: 20,
    central: 100,
    riskTaking: 15,
  },
  "attacking-fullback": {
    aggression: 80,
    stability: 35,
    pressing: 70,
    control: 45,
    width: 100,
    central: 10,
    riskTaking: 80,
  },
  "defensive-fullback": {
    aggression: 15,
    stability: 100,
    pressing: 45,
    control: 65,
    width: 90,
    central: 20,
    riskTaking: 10,
  },
  "centre-back": {
    aggression: 10,
    stability: 100,
    pressing: 40,
    control: 60,
    width: 10,
    central: 100,
    riskTaking: 10,
  },
  "ball-playing-centre-back": {
    aggression: 25,
    stability: 85,
    pressing: 45,
    control: 90,
    width: 15,
    central: 100,
    riskTaking: 35,
  },
};

const DEFAULT_ROLE_SIGNALS: RoleSignals = {
  aggression: 50,
  stability: 50,
  pressing: 50,
  control: 50,
  width: 50,
  central: 50,
  riskTaking: 50,
};

const mentalityAggression: Record<TacticalInstructions["mentality"], number> = {
  safe: 10,
  balanced: 50,
  attacking: 100,
};
const mentalityStability: Record<TacticalInstructions["mentality"], number> = {
  safe: 100,
  balanced: 75,
  attacking: 15,
};
const mentalityControl: Record<TacticalInstructions["mentality"], number> = {
  safe: 70,
  balanced: 100,
  attacking: 25,
};
const lineAggression: Record<TacticalInstructions["defensiveLine"], number> = {
  low: 10,
  medium: 50,
  high: 100,
};
const lineStability: Record<TacticalInstructions["defensiveLine"], number> = {
  low: 85,
  medium: 100,
  high: 25,
};
const lineControl: Record<TacticalInstructions["defensiveLine"], number> = {
  low: 45,
  medium: 100,
  high: 45,
};
const pressIntensity: Record<TacticalInstructions["pressing"], number> = {
  low: 10,
  medium: 50,
  high: 100,
};
const pressStability: Record<TacticalInstructions["pressing"], number> = {
  low: 85,
  medium: 100,
  high: 30,
};
const pressControl: Record<TacticalInstructions["pressing"], number> = {
  low: 70,
  medium: 100,
  high: 35,
};
const directionWidth: Record<
  TacticalInstructions["attackDirection"],
  number
> = {
  left: 100,
  centre: 0,
  right: 100,
  balanced: 55,
};
const directionCentral: Record<
  TacticalInstructions["attackDirection"],
  number
> = {
  left: 0,
  centre: 100,
  right: 0,
  balanced: 55,
};
const directionControl: Record<
  TacticalInstructions["attackDirection"],
  number
> = {
  left: 45,
  centre: 65,
  right: 45,
  balanced: 100,
};

function weightedAverage(
  parts: ReadonlyArray<readonly [value: number, weight: number]>,
): number {
  const totalWeight = parts.reduce((sum, [, weight]) => sum + weight, 0);
  const total = parts.reduce(
    (sum, [value, weight]) => sum + value * weight,
    0,
  );
  return Math.round(Math.max(0, Math.min(100, total / totalWeight)));
}

function riskSignal(riskPenalty: number): number {
  return Math.max(0, Math.min(100, riskPenalty * 8));
}

function fitSignal(score: number): number {
  return Math.max(0, Math.min(100, score));
}

function decisionAxes(
  decision: RecalculatedReportDecision,
): TendencyAxes {
  const { instructions } = decision;
  const role = ROLE_SIGNALS[decision.roleId] ?? DEFAULT_ROLE_SIGNALS;
  const risk = riskSignal(decision.riskPenalty);
  const fit = fitSignal(decision.score);

  return {
    aggression: weightedAverage([
      [mentalityAggression[instructions.mentality], 45],
      [lineAggression[instructions.defensiveLine], 20],
      [pressIntensity[instructions.pressing], 10],
      [role.aggression, 25],
    ]),
    stability: weightedAverage([
      [mentalityStability[instructions.mentality], 30],
      [lineStability[instructions.defensiveLine], 20],
      [pressStability[instructions.pressing], 10],
      [role.stability, 20],
      [100 - risk, 15],
      [fit, 5],
    ]),
    pressing: weightedAverage([
      [pressIntensity[instructions.pressing], 80],
      [lineAggression[instructions.defensiveLine], 15],
      [role.pressing, 5],
    ]),
    control: weightedAverage([
      [mentalityControl[instructions.mentality], 20],
      [lineControl[instructions.defensiveLine], 20],
      [pressControl[instructions.pressing], 15],
      [directionControl[instructions.attackDirection], 15],
      [role.control, 25],
      [fit, 5],
    ]),
    width: weightedAverage([
      [directionWidth[instructions.attackDirection], 70],
      [role.width, 30],
    ]),
    central: weightedAverage([
      [directionCentral[instructions.attackDirection], 70],
      [role.central, 30],
    ]),
    riskTaking: weightedAverage([
      [mentalityAggression[instructions.mentality], 25],
      [lineAggression[instructions.defensiveLine], 15],
      [pressIntensity[instructions.pressing], 15],
      [role.riskTaking, 25],
      [risk, 20],
    ]),
  };
}

function emptyAxes(): TendencyAxes {
  return {
    aggression: 0,
    stability: 0,
    pressing: 0,
    control: 0,
    width: 0,
    central: 0,
    riskTaking: 0,
  };
}

function labelFor(
  axes: TendencyAxes,
  topAxes: readonly TendencyAxisKey[],
): string {
  const [first, second] = topAxes;
  if (!first) return "결정 기록 없음";

  const values = AXIS_ORDER.map((axis) => axes[axis]);
  const highest = Math.max(...values);
  const lowest = Math.min(...values);
  if (highest < 58 || highest - lowest < 12) return "균형형";

  const topPair = new Set([first, second]);
  if (
    (topPair.has("aggression") && topPair.has("pressing")) ||
    (axes.aggression >= 85 && axes.pressing >= 85)
  ) {
    return "공격적 압박형";
  }
  if (
    (topPair.has("stability") && topPair.has("control")) ||
    (axes.stability >= 80 && axes.control >= 80)
  ) {
    return "안정적 통제형";
  }
  if (first === "riskTaking" && axes.riskTaking >= 65) {
    return "위험 감수형";
  }
  if (first === "width" && axes.width >= 65) return "측면 공략형";
  if (first === "central" && axes.central >= 65) return "중앙 집중형";

  const singleLabels: Record<TendencyAxisKey, string> = {
    aggression: "공격 지향형",
    stability: "안정 지향형",
    pressing: "적극 압박형",
    control: "경기 통제형",
    width: "측면 공략형",
    central: "중앙 집중형",
    riskTaking: "위험 감수형",
  };
  const secondValue = second ? axes[second] : 0;
  if (!second || axes[first] - secondValue >= 15) {
    return singleLabels[first];
  }

  const pairLabels: Record<TendencyAxisKey, string> = {
    aggression: "공격",
    stability: "안정",
    pressing: "압박",
    control: "통제",
    width: "측면",
    central: "중앙",
    riskTaking: "위험 감수",
  };
  return `${pairLabels[first]}·${pairLabels[second]}형`;
}

export function calculateManagerTendency(
  decisions: readonly RecalculatedReportDecision[],
): ManagerTendency {
  if (decisions.length === 0) {
    return {
      axes: emptyAxes(),
      topAxes: [],
      label: "결정 기록 없음",
      decisionCount: 0,
      basis: "no-decisions",
      note: "완료한 결정이 생기면 역할과 팀 지시 선택 패턴으로 계산합니다.",
    };
  }

  const perDecision = decisions.map(decisionAxes);
  const axes = Object.fromEntries(
    AXIS_ORDER.map((axis) => [
      axis,
      Math.round(
        perDecision.reduce((sum, values) => sum + values[axis], 0) /
          perDecision.length,
      ),
    ]),
  ) as TendencyAxes;
  const topAxes = [...AXIS_ORDER]
    .sort(
      (left, right) =>
        axes[right] - axes[left] ||
        AXIS_ORDER.indexOf(left) - AXIS_ORDER.indexOf(right),
    )
    .slice(0, 2);

  return {
    axes,
    topAxes,
    label: labelFor(axes, topAxes),
    decisionCount: decisions.length,
    basis: "tactical-choice-pattern",
    note: "선수 능력치가 아니라 사용자의 역할·팀 지시·위험 선택 패턴으로 계산한 자체 분석입니다.",
  };
}
