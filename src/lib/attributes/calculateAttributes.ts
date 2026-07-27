import {
  adjustForConfidence,
  finalizeAttributeScore,
  getConfidenceLevel,
} from "./confidenceAdjustment";
import { clamp, isFiniteNumber } from "./numeric";
import { normalizeMetrics } from "./normalizeMetrics";
import type {
  AttributeDefinition,
  AttributeResultMap,
  AttributeScoreResult,
  CalculateAttributesInput,
  MetricDirection,
  MetricValues,
} from "./types";

export interface PercentileOptions {
  direction?: MetricDirection;
  fallback?: number;
}

/**
 * Interpolated percentile rank in the inclusive 0-1 range.
 *
 * - sample minimum -> 0
 * - sample maximum -> 1
 * - tied values -> average rank
 * - empty/invalid evidence -> neutral 0.5
 */
export function calculatePercentile(
  value: unknown,
  comparisonValues: readonly number[],
  options: PercentileOptions = {},
): number {
  const fallback = clamp(options.fallback, 0, 1, 0.5);
  if (!isFiniteNumber(value)) {
    return fallback;
  }

  const sample = comparisonValues
    .filter(isFiniteNumber)
    .sort((left, right) => left - right);

  if (sample.length === 0) {
    return fallback;
  }

  let percentile: number;

  if (sample.length === 1) {
    percentile =
      value === sample[0] ? 0.5 : value < sample[0] ? 0 : 1;
  } else if (value < sample[0]) {
    percentile = 0;
  } else if (value > sample[sample.length - 1]) {
    percentile = 1;
  } else {
    const firstEqual = sample.indexOf(value);

    if (firstEqual >= 0) {
      const lastEqual = sample.lastIndexOf(value);
      percentile =
        ((firstEqual + lastEqual) / 2) / (sample.length - 1);
    } else {
      const upperIndex = sample.findIndex(
        (sampleValue) => sampleValue > value,
      );
      const lowerIndex = Math.max(0, upperIndex - 1);
      const lowerValue = sample[lowerIndex];
      const upperValue = sample[upperIndex];
      const fraction =
        upperValue === lowerValue
          ? 0
          : (value - lowerValue) / (upperValue - lowerValue);
      percentile =
        (lowerIndex + clamp(fraction, 0, 1, 0)) /
        (sample.length - 1);
    }
  }

  const directed =
    options.direction === "lower" ? 1 - percentile : percentile;
  return clamp(directed, 0, 1, fallback);
}

export function percentileToAttribute(percentile: unknown): number {
  const safePercentile = clamp(percentile, 0, 1, 0.5);
  return Math.round(1 + 19 * safePercentile);
}

export interface CalculateAttributeScoreInput {
  metrics: MetricValues;
  comparisonSamples: Readonly<Record<string, readonly number[] | undefined>>;
  definition: AttributeDefinition;
  metricDirections?: Readonly<
    Record<string, MetricDirection | undefined>
  >;
  confidence?: number;
  sampleMinutes?: number;
}

export function calculateAttributeScore({
  metrics,
  comparisonSamples,
  definition,
  metricDirections = {},
  confidence = 1,
  sampleMinutes,
}: CalculateAttributeScoreInput): AttributeScoreResult {
  const evidence: Array<{
    metric: string;
    percentile: number;
    weight: number;
  }> = [];

  let weightedPercentile = 0;
  let totalWeight = 0;

  for (const [metric, configuredWeight] of Object.entries(
    definition.metricWeights,
  )) {
    const metricValue = metrics[metric];
    const weight =
      isFiniteNumber(configuredWeight) && configuredWeight > 0
        ? configuredWeight
        : 0;

    if (!isFiniteNumber(metricValue) || weight === 0) {
      continue;
    }

    const percentile = calculatePercentile(
      metricValue,
      comparisonSamples[metric] ?? [],
      {
        direction: metricDirections[metric],
        fallback: definition.fallbackPercentile,
      },
    );

    weightedPercentile += percentile * weight;
    totalWeight += weight;
    evidence.push({ metric, percentile, weight });
  }

  const percentile =
    totalWeight > 0
      ? weightedPercentile / totalWeight
      : clamp(definition.fallbackPercentile, 0, 1, 0.5);
  const rawScore = percentileToAttribute(percentile);
  const safeConfidence = clamp(
    definition.confidence ?? confidence,
    0,
    1,
    0,
  );
  const adjustedScore = adjustForConfidence(rawScore, safeConfidence);

  return {
    percentile,
    rawScore,
    adjustedScore,
    score: finalizeAttributeScore(rawScore, safeConfidence),
    confidence: safeConfidence,
    confidenceLevel: getConfidenceLevel(safeConfidence),
    sampleMinutes:
      isFiniteNumber(sampleMinutes) && sampleMinutes >= 0
        ? sampleMinutes
        : undefined,
    evidence,
  };
}

export function calculateAttributes({
  metrics,
  comparisonSamples,
  definitions,
  metricDefinitions = {},
  confidence = 1,
  sampleMinutes,
}: CalculateAttributesInput): AttributeResultMap {
  const normalizedMetrics = normalizeMetrics(
    metrics,
    metricDefinitions,
    sampleMinutes,
  );
  const metricDirections = Object.fromEntries(
    Object.entries(metricDefinitions).map(([metric, definition]) => [
      metric,
      definition?.direction,
    ]),
  );
  const results: AttributeResultMap = {};

  for (const [attribute, definition] of Object.entries(definitions)) {
    results[attribute] = calculateAttributeScore({
      metrics: normalizedMetrics,
      comparisonSamples,
      definition,
      metricDirections,
      confidence,
      sampleMinutes,
    });
  }

  return results;
}

export function getAttributeScores(
  results: Readonly<Record<string, AttributeScoreResult>>,
): Record<string, number> {
  return Object.fromEntries(
    Object.entries(results).map(([attribute, result]) => [
      attribute,
      result.score,
    ]),
  );
}

