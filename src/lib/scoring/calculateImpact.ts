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
      finishing: 0.3,
      chanceCreation: 0.25,
      dribbling: 0.2,
      impact: 0.25,
    },
  },
  possessionStability: {
    label: "점유 안정",
    attributeWeights: {
      passing: 0.5,
      chanceCreation: 0.2,
      dribbling: 0.15,
      pressing: 0.15,
    },
  },
  defensiveStability: {
    label: "수비 안정",
    attributeWeights: {
      defending: 0.5,
      pressing: 0.25,
      aerial: 0.25,
    },
  },
  pressingIntensity: {
    label: "압박 강도",
    attributeWeights: {
      pressing: 0.55,
      defending: 0.2,
      impact: 0.25,
    },
  },
};

export const SUPPORTED_IMPACT_ATTRIBUTES = [
  "finishing",
  "chanceCreation",
  "dribbling",
  "passing",
  "pressing",
  "defending",
  "aerial",
  "impact",
] as const;

const supportedImpactAttributes = new Set<string>(
  SUPPORTED_IMPACT_ATTRIBUTES,
);

function assertSupportedAttributes(
  gaugeId: string,
  definition: ImpactGaugeDefinition,
) {
  const unsupported = Object.keys(definition.attributeWeights).filter(
    (attribute) => !supportedImpactAttributes.has(attribute),
  );
  if (unsupported.length > 0) {
    throw new Error(
      `${gaugeId} 영향 게이지에 지원하지 않는 속성이 있습니다: ${unsupported.join(", ")}`,
    );
  }
}

interface GaugeCalculation {
  score: number;
  normalizedAttributes: Readonly<Record<string, number>>;
  totalWeight: number;
}

function calculateGauge(
  gaugeId: string,
  snapshot: ImpactSnapshot,
  definition: ImpactGaugeDefinition,
  availableAttributes: ReadonlySet<string>,
): GaugeCalculation {
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
    if (!availableAttributes.has(attribute)) {
      continue;
    }

    const attributeValue = snapshot.attributes[attribute];
    if (!isFiniteNumber(attributeValue)) {
      continue;
    }
    const normalized = attributeScoreToPercent(attributeValue);
    normalizedAttributes[attribute] = normalized;
    total += normalized * weight;
    totalWeight += weight;
  }

  const baseScore = totalWeight > 0 ? total / totalWeight : 0;
  const modifier = snapshot.gaugeModifiers?.[gaugeId];
  const score = clampPercent(
    baseScore + (isFiniteNumber(modifier) ? modifier : 0),
    0,
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
      const beforeValue = before.normalizedAttributes[attribute];
      const afterValue = after.normalizedAttributes[attribute];
      if (!isFiniteNumber(beforeValue) || !isFiniteNumber(afterValue)) {
        continue;
      }
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
      label: "팀 지시",
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
  const availableAttributes = Object.entries(definition.attributeWeights)
    .filter(
      ([attribute, configuredWeight]) =>
        isFiniteNumber(configuredWeight) &&
        configuredWeight > 0 &&
        isFiniteNumber(beforeSnapshot.attributes[attribute]) &&
        isFiniteNumber(afterSnapshot.attributes[attribute]),
    )
    .map(([attribute]) => attribute);
  const availableAttributeSet = new Set(availableAttributes);

  if (availableAttributes.length === 0) {
    return {
      id: gaugeId,
      label: definition.label,
      before: 0,
      after: 0,
      delta: 0,
      available: false,
      availableAttributes,
      direction: "unchanged",
      reason: "OUT·IN 공통 능력치 데이터 없음",
      drivers: [],
    };
  }

  const beforeCalculation = calculateGauge(
    gaugeId,
    beforeSnapshot,
    definition,
    availableAttributeSet,
  );
  const afterCalculation = calculateGauge(
    gaugeId,
    afterSnapshot,
    definition,
    availableAttributeSet,
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
    available: true,
    availableAttributes,
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
    assertSupportedAttributes(gaugeId, definition);
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
