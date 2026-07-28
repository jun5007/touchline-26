import type {
  AttributeKey,
  Player,
  PlayerAttributes,
  PositionGroup,
  RawMetrics,
} from "@/data/types";

import {
  calculateAttributes,
  getAttributeScores,
} from "./calculateAttributes";
import { isFiniteNumber } from "./numeric";
import { normalizeMetrics } from "./normalizeMetrics";
import type {
  AttributeDefinition,
  AttributeResultMap,
  MetricDefinition,
} from "./types";

export const ATTRIBUTE_MODEL_VERSION =
  "match-report-position-group-v2-aerial";

const COUNT_METRICS = [
  "passesAttempted",
  "passesCompleted",
  "lineBreaksAttempted",
  "lineBreaksCompleted",
  "ballProgressions",
  "takeOns",
  "shots",
  "shotsOnTarget",
  "goals",
  "assists",
  "directPressures",
  "possessionRegains",
  "aerialDuelsWon",
  "crossesAttempted",
  "crossesCompleted",
] as const;

type CountMetric = (typeof COUNT_METRICS)[number];
type DerivedRateMetric =
  | "passCompletionRate"
  | "lineBreakCompletionRate"
  | "crossCompletionRate";
type ModelMetric = CountMetric | DerivedRateMetric;

const ATTRIBUTE_KEYS: readonly AttributeKey[] = [
  "finishing",
  "chanceCreation",
  "dribbling",
  "passing",
  "pressing",
  "defending",
  "aerial",
  "impact",
];

/**
 * All report counts are compared per 90 minutes. Completion rates stay in
 * their native 0-1 unit. The exact same definitions are used for a player and
 * every member of that player's position-group comparison sample.
 */
export const PLAYER_ATTRIBUTE_METRIC_DEFINITIONS: Readonly<
  Record<ModelMetric, MetricDefinition>
> = {
  passesAttempted: { normalization: "per90", direction: "higher" },
  passesCompleted: { normalization: "per90", direction: "higher" },
  lineBreaksAttempted: { normalization: "per90", direction: "higher" },
  lineBreaksCompleted: { normalization: "per90", direction: "higher" },
  ballProgressions: { normalization: "per90", direction: "higher" },
  takeOns: { normalization: "per90", direction: "higher" },
  shots: { normalization: "per90", direction: "higher" },
  shotsOnTarget: { normalization: "per90", direction: "higher" },
  goals: { normalization: "per90", direction: "higher" },
  assists: { normalization: "per90", direction: "higher" },
  directPressures: { normalization: "per90", direction: "higher" },
  possessionRegains: { normalization: "per90", direction: "higher" },
  aerialDuelsWon: { normalization: "per90", direction: "higher" },
  crossesAttempted: { normalization: "per90", direction: "higher" },
  crossesCompleted: { normalization: "per90", direction: "higher" },
  passCompletionRate: { normalization: "raw", direction: "higher" },
  lineBreakCompletionRate: { normalization: "raw", direction: "higher" },
  crossCompletionRate: { normalization: "raw", direction: "higher" },
};

function attribute(
  metricWeights: Readonly<Partial<Record<ModelMetric, number>>>,
): AttributeDefinition {
  return { metricWeights: metricWeights as Readonly<Record<string, number>> };
}

function definitions(
  values: Readonly<Record<AttributeKey, AttributeDefinition>>,
): Readonly<Record<AttributeKey, AttributeDefinition>> {
  return values;
}

/**
 * Metric weights are product-model choices, not FIFA ratings. They are
 * intentionally explicit per tactical position group. calculateAttributes
 * re-normalizes the weights over the evidence available for each attribute.
 *
 * `aerial` maps FIFA PMSR page 47's player-level "Duels Won - Aerial" count
 * through the same per-90, position-group percentile and confidence-shrinkage
 * pipeline as the other report-derived attributes.
 */
export const ATTRIBUTE_METRIC_WEIGHTS_BY_POSITION_GROUP: Readonly<
  Record<PositionGroup, Readonly<Record<AttributeKey, AttributeDefinition>>>
> = {
  GK: definitions({
    finishing: attribute({}),
    chanceCreation: attribute({}),
    dribbling: attribute({}),
    passing: attribute({
      passCompletionRate: 0.65,
      passesCompleted: 0.35,
    }),
    pressing: attribute({}),
    defending: attribute({}),
    aerial: attribute({ aerialDuelsWon: 1 }),
    impact: attribute({}),
  }),
  CB: definitions({
    finishing: attribute({
      shotsOnTarget: 0.5,
      goals: 0.35,
      shots: 0.15,
    }),
    chanceCreation: attribute({
      lineBreaksCompleted: 0.5,
      ballProgressions: 0.3,
      assists: 0.2,
    }),
    dribbling: attribute({
      ballProgressions: 0.7,
      takeOns: 0.3,
    }),
    passing: attribute({
      passCompletionRate: 0.4,
      passesCompleted: 0.25,
      lineBreaksCompleted: 0.25,
      lineBreakCompletionRate: 0.1,
    }),
    pressing: attribute({
      directPressures: 0.7,
      possessionRegains: 0.3,
    }),
    defending: attribute({
      possessionRegains: 0.75,
      directPressures: 0.25,
    }),
    aerial: attribute({ aerialDuelsWon: 1 }),
    impact: attribute({
      goals: 0.25,
      assists: 0.15,
      shotsOnTarget: 0.1,
      ballProgressions: 0.15,
      possessionRegains: 0.35,
    }),
  }),
  FB_WB: definitions({
    finishing: attribute({
      goals: 0.45,
      shotsOnTarget: 0.35,
      shots: 0.2,
    }),
    chanceCreation: attribute({
      crossesCompleted: 0.4,
      lineBreaksCompleted: 0.25,
      ballProgressions: 0.2,
      assists: 0.15,
    }),
    dribbling: attribute({
      takeOns: 0.55,
      ballProgressions: 0.45,
    }),
    passing: attribute({
      passCompletionRate: 0.4,
      passesCompleted: 0.2,
      lineBreaksCompleted: 0.2,
      lineBreakCompletionRate: 0.1,
      crossCompletionRate: 0.1,
    }),
    pressing: attribute({
      directPressures: 0.65,
      possessionRegains: 0.35,
    }),
    defending: attribute({
      possessionRegains: 0.65,
      directPressures: 0.35,
    }),
    aerial: attribute({ aerialDuelsWon: 1 }),
    impact: attribute({
      assists: 0.2,
      crossesCompleted: 0.2,
      ballProgressions: 0.2,
      directPressures: 0.15,
      possessionRegains: 0.25,
    }),
  }),
  DM: definitions({
    finishing: attribute({
      goals: 0.5,
      shotsOnTarget: 0.3,
      shots: 0.2,
    }),
    chanceCreation: attribute({
      assists: 0.25,
      lineBreaksCompleted: 0.45,
      ballProgressions: 0.2,
      crossesCompleted: 0.1,
    }),
    dribbling: attribute({
      takeOns: 0.55,
      ballProgressions: 0.45,
    }),
    passing: attribute({
      passCompletionRate: 0.35,
      passesCompleted: 0.25,
      lineBreaksCompleted: 0.25,
      lineBreakCompletionRate: 0.15,
    }),
    pressing: attribute({
      directPressures: 0.55,
      possessionRegains: 0.45,
    }),
    defending: attribute({
      possessionRegains: 0.7,
      directPressures: 0.3,
    }),
    aerial: attribute({ aerialDuelsWon: 1 }),
    impact: attribute({
      goals: 0.15,
      assists: 0.15,
      lineBreaksCompleted: 0.2,
      directPressures: 0.2,
      possessionRegains: 0.3,
    }),
  }),
  CM_AM: definitions({
    finishing: attribute({
      goals: 0.45,
      shotsOnTarget: 0.35,
      shots: 0.2,
    }),
    chanceCreation: attribute({
      assists: 0.4,
      lineBreaksCompleted: 0.3,
      ballProgressions: 0.2,
      crossesCompleted: 0.1,
    }),
    dribbling: attribute({
      takeOns: 0.55,
      ballProgressions: 0.45,
    }),
    passing: attribute({
      passCompletionRate: 0.35,
      passesCompleted: 0.25,
      lineBreaksCompleted: 0.25,
      lineBreakCompletionRate: 0.15,
    }),
    pressing: attribute({
      directPressures: 0.7,
      possessionRegains: 0.3,
    }),
    defending: attribute({
      possessionRegains: 0.65,
      directPressures: 0.35,
    }),
    aerial: attribute({ aerialDuelsWon: 1 }),
    impact: attribute({
      goals: 0.3,
      assists: 0.3,
      shotsOnTarget: 0.1,
      lineBreaksCompleted: 0.1,
      possessionRegains: 0.2,
    }),
  }),
  WINGER: definitions({
    finishing: attribute({
      goals: 0.45,
      shotsOnTarget: 0.35,
      shots: 0.2,
    }),
    chanceCreation: attribute({
      assists: 0.35,
      crossesCompleted: 0.25,
      lineBreaksCompleted: 0.2,
      ballProgressions: 0.2,
    }),
    dribbling: attribute({
      takeOns: 0.65,
      ballProgressions: 0.35,
    }),
    passing: attribute({
      passCompletionRate: 0.35,
      passesCompleted: 0.2,
      lineBreaksCompleted: 0.2,
      lineBreakCompletionRate: 0.1,
      crossCompletionRate: 0.15,
    }),
    pressing: attribute({
      directPressures: 0.75,
      possessionRegains: 0.25,
    }),
    defending: attribute({
      possessionRegains: 0.6,
      directPressures: 0.4,
    }),
    aerial: attribute({ aerialDuelsWon: 1 }),
    impact: attribute({
      goals: 0.25,
      assists: 0.3,
      shotsOnTarget: 0.15,
      ballProgressions: 0.15,
      directPressures: 0.15,
    }),
  }),
  STRIKER: definitions({
    finishing: attribute({
      goals: 0.5,
      shotsOnTarget: 0.35,
      shots: 0.15,
    }),
    chanceCreation: attribute({
      assists: 0.3,
      lineBreaksCompleted: 0.3,
      ballProgressions: 0.25,
      crossesCompleted: 0.15,
    }),
    dribbling: attribute({
      takeOns: 0.65,
      ballProgressions: 0.35,
    }),
    passing: attribute({
      passCompletionRate: 0.4,
      passesCompleted: 0.2,
      lineBreaksCompleted: 0.25,
      lineBreakCompletionRate: 0.15,
    }),
    pressing: attribute({
      directPressures: 0.75,
      possessionRegains: 0.25,
    }),
    defending: attribute({
      possessionRegains: 0.6,
      directPressures: 0.4,
    }),
    aerial: attribute({ aerialDuelsWon: 1 }),
    impact: attribute({
      goals: 0.4,
      assists: 0.2,
      shotsOnTarget: 0.15,
      ballProgressions: 0.1,
      possessionRegains: 0.15,
    }),
  }),
};

function safeRatio(
  completed: number | undefined,
  attempted: number | undefined,
): number | undefined {
  if (
    !isFiniteNumber(completed) ||
    !isFiniteNumber(attempted) ||
    attempted <= 0
  ) {
    return undefined;
  }

  return completed / attempted;
}

/**
 * In a non-null FIFA player stat row, an omitted count means zero in the
 * extracted local schema. A null row means no observed match sample and is
 * kept wholly missing.
 */
export function deriveModelMetrics(
  rawMetrics: RawMetrics | null,
): Readonly<Record<string, number>> {
  if (rawMetrics === null) {
    return {};
  }

  const metrics: Record<string, number> = {};

  for (const metric of COUNT_METRICS) {
    const value = rawMetrics[metric];
    metrics[metric] = isFiniteNumber(value) ? value : 0;
  }

  const completionRates: Readonly<
    Record<DerivedRateMetric, number | undefined>
  > = {
    passCompletionRate: safeRatio(
      rawMetrics.passesCompleted,
      rawMetrics.passesAttempted,
    ),
    lineBreakCompletionRate: safeRatio(
      rawMetrics.lineBreaksCompleted,
      rawMetrics.lineBreaksAttempted,
    ),
    crossCompletionRate: safeRatio(
      rawMetrics.crossesCompleted,
      rawMetrics.crossesAttempted,
    ),
  };

  for (const [metric, value] of Object.entries(completionRates)) {
    if (isFiniteNumber(value)) {
      metrics[metric] = value;
    }
  }

  return metrics;
}

export function buildPositionGroupComparisonSamples(
  players: readonly Player[],
  positionGroup: PositionGroup,
): Readonly<Record<string, readonly number[]>> {
  const samples: Record<string, number[]> = {};

  for (const player of players) {
    if (
      player.positionGroup !== positionGroup ||
      player.rawMetrics === null ||
      (player.minutesPlayed ?? 0) <= 0
    ) {
      continue;
    }

    const normalizedMetrics = normalizeMetrics(
      deriveModelMetrics(player.rawMetrics),
      PLAYER_ATTRIBUTE_METRIC_DEFINITIONS,
      player.minutesPlayed ?? undefined,
    );

    for (const [metric, value] of Object.entries(normalizedMetrics)) {
      if (isFiniteNumber(value)) {
        (samples[metric] ??= []).push(value);
      }
    }
  }

  return samples;
}

export function derivePlayerAttributeResults(
  player: Player,
  players: readonly Player[],
): AttributeResultMap {
  if (player.positionGroup === null) return {};

  return calculateAttributes({
    metrics: deriveModelMetrics(player.rawMetrics),
    comparisonSamples: buildPositionGroupComparisonSamples(
      players,
      player.positionGroup,
    ),
    definitions:
      ATTRIBUTE_METRIC_WEIGHTS_BY_POSITION_GROUP[player.positionGroup],
    metricDefinitions: PLAYER_ATTRIBUTE_METRIC_DEFINITIONS,
    confidence: player.confidence,
    sampleMinutes: player.minutesPlayed ?? undefined,
  });
}

export function derivePlayerAttributes(
  player: Player,
  players: readonly Player[],
): PlayerAttributes {
  if (player.positionGroup === null) {
    return Object.fromEntries(
      ATTRIBUTE_KEYS.map((attributeKey) => [attributeKey, null]),
    ) as PlayerAttributes;
  }

  const scores = getAttributeScores(
    derivePlayerAttributeResults(player, players),
  );

  return Object.fromEntries(
    ATTRIBUTE_KEYS.map((attributeKey) => [
      attributeKey,
      scores[attributeKey],
    ]),
  ) as PlayerAttributes;
}

export function deriveAllPlayerAttributes(
  players: readonly Player[],
): Readonly<Record<string, PlayerAttributes>> {
  return Object.fromEntries(
    players.map((player) => [
      player.id,
      derivePlayerAttributes(player, players),
    ]),
  );
}
