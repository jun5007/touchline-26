import { clamp, roundTo } from "./numeric";
import type { ConfidenceLevel } from "./types";

export const ATTRIBUTE_MIDPOINT = 10.5;

export interface SampleConfidenceOptions {
  /** Minutes at which the linear confidence curve reaches 1. */
  fullConfidenceMinutes?: number;
  /** Optional evidence floor, still clamped to the 0-1 range. */
  minimumConfidence?: number;
}

export function calculateSampleConfidence(
  minutesPlayed: unknown,
  options: SampleConfidenceOptions = {},
): number {
  const fullConfidenceMinutes = clamp(
    options.fullConfidenceMinutes,
    1,
    Number.MAX_SAFE_INTEGER,
    900,
  );
  const minimumConfidence = clamp(options.minimumConfidence, 0, 1, 0);
  const minutesRatio = clamp(
    typeof minutesPlayed === "number"
      ? minutesPlayed / fullConfidenceMinutes
      : 0,
    0,
    1,
    0,
  );

  return Math.max(minimumConfidence, minutesRatio);
}

export function getConfidenceLevel(confidence: unknown): ConfidenceLevel {
  const safeConfidence = clamp(confidence, 0, 1, 0);
  if (safeConfidence >= 0.75) {
    return "high";
  }
  if (safeConfidence >= 0.4) {
    return "medium";
  }
  return "low";
}

/**
 * Shrinks a 1-20 score toward the neutral midpoint when evidence is limited.
 */
export function adjustForConfidence(
  rawScore: unknown,
  confidence: unknown,
  midpoint = ATTRIBUTE_MIDPOINT,
): number {
  const safeMidpoint = clamp(midpoint, 1, 20, ATTRIBUTE_MIDPOINT);
  const safeRawScore = clamp(rawScore, 1, 20, safeMidpoint);
  const safeConfidence = clamp(confidence, 0, 1, 0);

  return clamp(
    safeConfidence * safeRawScore +
      (1 - safeConfidence) * safeMidpoint,
    1,
    20,
    safeMidpoint,
  );
}

export function finalizeAttributeScore(
  rawScore: unknown,
  confidence: unknown,
  midpoint = ATTRIBUTE_MIDPOINT,
): number {
  return clamp(
    roundTo(adjustForConfidence(rawScore, confidence, midpoint)),
    1,
    20,
    midpoint,
  );
}

