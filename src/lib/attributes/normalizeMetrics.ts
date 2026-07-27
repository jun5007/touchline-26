import { finiteOr, isFiniteNumber } from "./numeric";
import type { MetricDefinition, MetricValues } from "./types";

export const FULL_MATCH_MINUTES = 90;

/**
 * Converts a count to a per-90 rate. Invalid values and non-positive minute
 * samples safely return the supplied fallback instead of Infinity or NaN.
 */
export function toPer90(
  value: unknown,
  minutesPlayed: unknown,
  fallback = 0,
): number {
  const minutes = finiteOr(minutesPlayed, 0);
  if (!isFiniteNumber(value) || minutes <= 0) {
    return finiteOr(fallback, 0);
  }

  return (value * FULL_MATCH_MINUTES) / minutes;
}

export function normalizeMetric(
  value: unknown,
  definition: MetricDefinition | undefined,
  minutesPlayed?: number,
): number | undefined {
  if (!isFiniteNumber(value)) {
    return undefined;
  }

  if (definition?.normalization === "per90") {
    if (!isFiniteNumber(minutesPlayed) || minutesPlayed <= 0) {
      return undefined;
    }
    return toPer90(value, minutesPlayed);
  }

  return value;
}

/**
 * Keeps missing values missing. This prevents absent evidence from silently
 * becoming a real zero when weighted attributes are calculated.
 */
export function normalizeMetrics(
  values: MetricValues,
  definitions: Readonly<Record<string, MetricDefinition | undefined>> = {},
  minutesPlayed?: number,
): Record<string, number> {
  const normalized: Record<string, number> = {};

  for (const [metric, value] of Object.entries(values)) {
    const result = normalizeMetric(value, definitions[metric], minutesPlayed);
    if (result !== undefined) {
      normalized[metric] = result;
    }
  }

  return normalized;
}

