export type MetricDirection = "higher" | "lower";

export type MetricValues = Readonly<
  Record<string, number | null | undefined>
>;

export type MetricWeights = Readonly<Record<string, number>>;

export interface MetricDefinition {
  /**
   * Count metrics should be converted before they are compared with a
   * position-group sample. Comparison samples must use the same unit.
   */
  normalization?: "raw" | "per90";
  direction?: MetricDirection;
}

export interface AttributeDefinition {
  metricWeights: MetricWeights;
  /**
   * Used only when none of the configured metrics has usable evidence.
   * A value of 0.5 maps to the neutral 10/11 area.
   */
  fallbackPercentile?: number;
  /**
   * An attribute may override the player-level confidence when its source
   * sample is materially better or worse than the other attributes.
   */
  confidence?: number;
}

export interface AttributeEvidence {
  metric: string;
  percentile: number;
  weight: number;
}

export interface AttributeScoreResult {
  /** Weighted percentile before the 1-20 conversion. */
  percentile: number;
  /** Integer result of round(1 + 19 * percentile). */
  rawScore: number;
  /** Confidence-shrunk score before final rounding. */
  adjustedScore: number;
  /** Display-ready integer in the inclusive 1-20 range. */
  score: number;
  confidence: number;
  confidenceLevel: ConfidenceLevel;
  sampleMinutes?: number;
  evidence: readonly AttributeEvidence[];
}

export type AttributeResultMap = Record<string, AttributeScoreResult>;

export type ConfidenceLevel = "low" | "medium" | "high";

export interface CalculateAttributesInput {
  metrics: MetricValues;
  comparisonSamples: Readonly<Record<string, readonly number[] | undefined>>;
  definitions: Readonly<Record<string, AttributeDefinition>>;
  metricDefinitions?: Readonly<Record<string, MetricDefinition | undefined>>;
  confidence?: number;
  sampleMinutes?: number;
}

