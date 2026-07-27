import {
  attributeScoreToPercent,
  clampPercent,
  isFiniteNumber,
  roundTo,
} from "../attributes";
import type {
  CalculateImpactInput,
  CanonicalImpactGauge,
  ImpactComparison,
  ImpactDriver,
  ImpactGaugeDefinition,
  ImpactGaugeResult,
  ImpactSnapshot,
} from "./types";

export const DEFAULT_IMPACT_GAUGE_DEFINITIONS: Readonly<
  Record<CanonicalImpactGauge, ImpactGaugeDefinition>
> = {
  attackThreat: {
    label: "공격 위협",
    attributeWeights: {
      finishing: 0.25,
      chanceCreation: 0.2,
      dribbling: 0.2,
      speed: 0.15,
      impact: 0.2,
    },
  },
  possessionStability: {
    label: "점유 안정",
    attributeWeights: {
      passing: 0.35,
      chanceCreation: 0.15,
      dribbling: 0.1,
      composure: 0.2,
      ballRetention: 0.2,
    },
  },
  defensiveStability: {
    label: "수비 안정",
    attributeWeights: {
      defending: 0.4,
      pressing: 0.15,
      aerial: 0.2,
      composure: 0.1,
      stamina: 0.15,
    },
  },
  pressingIntensity: {
    label: "압박 강도",
    attributeWeights: {
      pressing: 0.4,
      stamina: 0.25,
      speed: 0.15,
      defending: 0.1,
      impact: 0.1,
    },
  },
};

interface GaugeCalculation {
  score: number;
  normalizedAttributes: Readonly<Record<string, number>>;
  totalWeight: number;
}

function calculateGauge(
  gaugeId: string,
  snapshot: ImpactSnapshot,
  definition: ImpactGaugeDefinition,
): GaugeCalculation {
  const fallback = clampPercent(definition.fallbackScore);
  let total = 0;
  let totalWeight = 0;
  const normalizedAttributes: Record<string, number> = {};

  for (const [attribute, configuredWeight] of Object.entries(
    definition.attributeWeights,
  )) {
    const weight =
      isFiniteNumber(configuredWeight) && configuredWeight > 0
        ? configuredWeight
        : 0;
    if (weight === 0) {
      continue;
    }

    const attributeValue = snapshot.attributes[attribute];
    const normalized = isFiniteNumber(attributeValue)
      ? attributeScoreToPercent(attributeValue)
      : fallback;
    normalizedAttributes[attribute] = normalized;
    total += normalized * weight;
    totalWeight += weight;
  }

  const baseScore = totalWeight > 0 ? total / totalWeight : fallback;
  const modifier = snapshot.gaugeModifiers?.[gaugeId];
  const score = clampPercent(
    baseScore + (isFiniteNumber(modifier) ? modifier : 0),
    fallback,
  );

  return { score, normalizedAttributes, totalWeight };
}

function calculateDrivers(
  before: GaugeCalculation,
  after: GaugeCalculation,
  definition: ImpactGaugeDefinition,
  attributeLabels: Readonly<Record<string, string | undefined>>,
  modifierDelta: number,
): ImpactDriver[] {
  const totalWeight =
    after.totalWeight > 0 ? after.totalWeight : before.totalWeight;
  const drivers: ImpactDriver[] = [];

  if (totalWeight > 0) {
    for (const [attribute, configuredWeight] of Object.entries(
      definition.attributeWeights,
    )) {
      if (!isFiniteNumber(configuredWeight) || configuredWeight <= 0) {
        continue;
      }
      const beforeValue =
        before.normalizedAttributes[attribute] ??
        clampPercent(definition.fallbackScore);
      const afterValue =
        after.normalizedAttributes[attribute] ??
        clampPercent(definition.fallbackScore);
      const delta =
        ((afterValue - beforeValue) * configuredWeight) / totalWeight;

      if (Math.abs(delta) >= 0.05) {
        drivers.push({
          key: attribute,
          label: attributeLabels[attribute] ?? attribute,
          delta: roundTo(delta, 1),
        });
      }
    }
  }

  if (Math.abs(modifierDelta) >= 0.05) {
    drivers.push({
      key: "tacticalModifier",
      label: "역할·팀 지시",
      delta: roundTo(modifierDelta, 1),
    });
  }

  return drivers.sort(
    (left, right) => Math.abs(right.delta) - Math.abs(left.delta),
  );
}

function describeGaugeChange(
  delta: number,
  drivers: readonly ImpactDriver[],
): string {
  if (delta === 0) {
    return "뚜렷한 변화 없음";
  }

  const leadingDriver = drivers[0];
  if (!leadingDriver) {
    return delta > 0 ? "종합 지표 상승" : "종합 지표 하락";
  }

  return `${leadingDriver.label} ${
    leadingDriver.delta >= 0 ? "상승" : "하락"
  } 영향`;
}

function buildGaugeResult(
  gaugeId: string,
  definition: ImpactGaugeDefinition,
  beforeSnapshot: ImpactSnapshot,
  afterSnapshot: ImpactSnapshot,
  attributeLabels: Readonly<Record<string, string | undefined>>,
): ImpactGaugeResult {
  const beforeCalculation = calculateGauge(
    gaugeId,
    beforeSnapshot,
    definition,
  );
  const afterCalculation = calculateGauge(
    gaugeId,
    afterSnapshot,
    definition,
  );
  const before = Math.round(beforeCalculation.score);
  const after = Math.round(afterCalculation.score);
  const delta = after - before;
  const beforeModifier = beforeSnapshot.gaugeModifiers?.[gaugeId];
  const afterModifier = afterSnapshot.gaugeModifiers?.[gaugeId];
  const modifierDelta =
    (isFiniteNumber(afterModifier) ? afterModifier : 0) -
    (isFiniteNumber(beforeModifier) ? beforeModifier : 0);
  const drivers = calculateDrivers(
    beforeCalculation,
    afterCalculation,
    definition,
    attributeLabels,
    modifierDelta,
  );

  return {
    id: gaugeId,
    label: definition.label,
    before,
    after,
    delta,
    direction:
      delta > 0 ? "increase" : delta < 0 ? "decrease" : "unchanged",
    reason: describeGaugeChange(delta, drivers),
    drivers,
  };
}

export function calculateImpact(
  input: CalculateImpactInput<CanonicalImpactGauge> & {
    definitions?: undefined;
  },
): ImpactComparison<CanonicalImpactGauge>;
export function calculateImpact<GaugeId extends string>(
  input: CalculateImpactInput<GaugeId> & {
    definitions: Readonly<Record<GaugeId, ImpactGaugeDefinition>>;
  },
): ImpactComparison<GaugeId>;
export function calculateImpact<GaugeId extends string>(
  input: CalculateImpactInput<GaugeId>,
): ImpactComparison<GaugeId> {
  const definitions =
    input.definitions ??
    (DEFAULT_IMPACT_GAUGE_DEFINITIONS as Readonly<
      Record<GaugeId, ImpactGaugeDefinition>
    >);
  const results = {} as ImpactComparison<GaugeId>;

  for (const [gaugeId, definition] of Object.entries(definitions) as Array<
    [GaugeId, ImpactGaugeDefinition]
  >) {
    results[gaugeId] = buildGaugeResult(
      gaugeId,
      definition,
      input.before,
      input.after,
      input.attributeLabels ?? {},
    );
  }

  return results;
}

