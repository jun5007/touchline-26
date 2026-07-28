import {
  calculatePercentile,
  percentileToAttribute,
} from "./calculateAttributes";
import {
  adjustForConfidence,
  finalizeAttributeScore,
  getConfidenceLevel,
} from "./confidenceAdjustment";
import { clamp, isFiniteNumber } from "./numeric";
import type { ConfidenceLevel, MetricDirection } from "./types";

export const BASE_ATTRIBUTE_MIDPOINT = 10.5;
export const CLUB_EVIDENCE_WEIGHT = 0.8;
export const NATIONAL_EVIDENCE_WEIGHT = 0.2;
export const TLSI_MINIMUM_FACTOR = 0.98;
export const TLSI_MAXIMUM_FACTOR = 1.02;
export const MINIMUM_MINUTES_BY_POSITION = {
  GK: 900,
  CB: 900,
  FB_WB: 900,
  DM: 900,
  CM_AM: 800,
  WINGER: 700,
  STRIKER: 700,
} as const;
export const SUCCESS_RATE_MINIMUM_ATTEMPTS = {
  shotConversion: 10,
  passCompletionRate: 100,
  dribbleSuccessRate: 20,
  aerialWinRate: 20,
} as const;
export const SOURCE_RELIABILITY = {
  official_multiple_sources: 1,
  official_single_source: 0.9,
  open_licensed_data: 0.75,
  inferred_supplement: 0.5,
} as const;

export const FIELD_BASE_ATTRIBUTE_DEFINITIONS = {
  finishing: {
    metricWeights: {
      nonPenaltyGoalsPer90: 0.4,
      shotsOnTargetPer90: 0.25,
      shotConversion: 0.2,
      goalsPer90: 0.15,
    },
  },
  chanceCreation: {
    metricWeights: {
      assistsPer90: 0.2,
      keyPassesPer90: 0.35,
      chancesCreatedPer90: 0.3,
      finalThirdPassesPer90: 0.15,
    },
  },
  dribbling: {
    metricWeights: {
      successfulDribblesPer90: 0.5,
      dribbleSuccessRate: 0.3,
      progressiveCarriesPer90: 0.2,
    },
  },
  passing: {
    metricWeights: {
      passCompletionRate: 0.35,
      progressivePassesPer90: 0.3,
      finalThirdPassesPer90: 0.2,
      keyPassesPer90: 0.15,
    },
  },
  pressing: {
    metricWeights: {
      tacklesPer90: 0.25,
      interceptionsPer90: 0.25,
      recoveriesPer90: 0.3,
      pressuresPer90: 0.2,
    },
  },
  defending: {
    metricWeights: {
      tacklesPer90: 0.25,
      interceptionsPer90: 0.25,
      clearancesPer90: 0.2,
      blocksPer90: 0.15,
      recoveriesPer90: 0.15,
    },
  },
  aerial: {
    metricWeights: {
      aerialDuelsWonPer90: 0.6,
      aerialWinRate: 0.4,
    },
  },
  impact: {
    metricWeights: {
      goalsAndAssistsPer90: 0.35,
      substituteContributionPer90: 0.25,
      roleRelevantContributionPer90: 0.25,
      minutesReliability: 0.15,
    },
  },
} as const satisfies Readonly<Record<string, BaseAttributeDefinition>>;

export const GOALKEEPER_BASE_ATTRIBUTE_DEFINITIONS = {
  shotStopping: {
    metricWeights: {
      saveRate: 0.6,
      savesPer90: 0.4,
    },
  },
  distribution: {
    metricWeights: {
      passCompletionRate: 0.5,
      longPassCompletionRate: 0.5,
    },
  },
  aerialCommand: {
    metricWeights: {
      crossesClaimedPer90: 0.7,
      aerialActionsPer90: 0.3,
    },
  },
  sweeping: {
    metricWeights: {
      sweeperActionsPer90: 1,
    },
  },
  penaltySaving: {
    metricWeights: {
      penaltySaveRate: 0.8,
      penaltiesSavedPer90: 0.2,
    },
  },
  stability: {
    metricWeights: {
      cleanSheetRate: 0.4,
      goalsConcededPer90: 0.4,
      minutesReliability: 0.2,
    },
    metricDirections: {
      goalsConcededPer90: "lower",
    },
  },
  buildUp: {
    metricWeights: {
      passCompletionRate: 0.55,
      longPassCompletionRate: 0.45,
    },
  },
  impact: {
    metricWeights: {
      saveRate: 0.35,
      cleanSheetRate: 0.25,
      distributionContribution: 0.2,
      minutesReliability: 0.2,
    },
  },
} as const satisfies Readonly<Record<string, BaseAttributeDefinition>>;

export type NullableMetricValues = Readonly<
  Record<string, number | null | undefined>
>;

export interface PerformanceRecord {
  sourceId: string;
  sourceIds?: readonly string[];
  minutes: number | null;
  metrics: NullableMetricValues;
  /**
   * Optional stint-level league-strength context. It is applied to each
   * stint before counts/rates are combined, so a transferred player is not
   * treated as if every appearance came from the current club's league.
   */
  tlsi?: TlsiInput;
}

export type MetricAggregationDefinition = (
  | {
      kind: "sum";
      sourceMetric: string;
    }
  | {
      kind: "per90";
      sourceMetric: string;
    }
  | {
      kind: "successRate";
      numeratorMetric: string;
      denominatorMetric: string;
      minimumAttempts?: number;
    }
) & {
  direction?: MetricDirection;
};

export type MissingAggregationReason =
  | "no_observations"
  | "no_valid_minutes"
  | "below_minimum_attempts";

export interface AggregatedMetricEvidence {
  metric: string;
  kind: MetricAggregationDefinition["kind"];
  value: number | null;
  observedRecordCount: number;
  sourceIds: readonly string[];
  minutes: number | null;
  numerator: number | null;
  denominator: number | null;
  minimumAttempts: number | null;
  missingReason: MissingAggregationReason | null;
  tlsiApplied: boolean;
}

export interface AggregatedPerformance {
  metrics: Readonly<Record<string, number | null>>;
  evidence: Readonly<Record<string, AggregatedMetricEvidence>>;
}

export interface PositionMetricProfile {
  playerId: string;
  positionGroup: string | null;
  positionGroupStatus:
    | "verified"
    | "derived_from_lineups"
    | "broad_only"
    | "unknown";
  metrics: NullableMetricValues;
}

/**
 * Builds comparison samples from only exact, evidenced position groups.
 * Broad/unknown registrations never get forced into a tactical group.
 */
export function buildPositionComparisonSamples(
  profiles: readonly PositionMetricProfile[],
  positionGroup: string,
): Record<string, number[]> {
  const samples: Record<string, number[]> = {};
  for (const profile of profiles) {
    if (
      profile.positionGroup !== positionGroup ||
      !["verified", "derived_from_lineups"].includes(
        profile.positionGroupStatus,
      )
    ) {
      continue;
    }
    for (const [metric, value] of Object.entries(profile.metrics)) {
      if (!isFiniteNumber(value)) continue;
      (samples[metric] ??= []).push(value);
    }
  }
  return samples;
}

function unique(values: readonly string[]): string[] {
  return [...new Set(values.filter((value) => value.length > 0))];
}

function performanceRecordSourceIds(record: PerformanceRecord): string[] {
  return unique([record.sourceId, ...(record.sourceIds ?? [])]);
}

function isNonNegativeFinite(value: unknown): value is number {
  return isFiniteNumber(value) && value >= 0;
}

/**
 * Aggregates raw stints before deriving per-90 values or success rates.
 *
 * A record is included in a metric only when all fields required for that
 * metric are observed. Missing counts therefore never become zero and a
 * partially reported stint cannot dilute a rate from a fully reported stint.
 */
export function aggregatePerformanceRecords(
  records: readonly PerformanceRecord[],
  definitions: Readonly<Record<string, MetricAggregationDefinition>>,
): AggregatedPerformance {
  const metrics: Record<string, number | null> = {};
  const evidence: Record<string, AggregatedMetricEvidence> = {};

  for (const [metric, definition] of Object.entries(definitions)) {
    if (definition.kind === "successRate") {
      const minimumAttempts = Math.max(
        1,
        Math.trunc(
          isFiniteNumber(definition.minimumAttempts)
            ? definition.minimumAttempts
            : 1,
        ),
      );
      let numerator = 0;
      let denominator = 0;
      const sourceIds: string[] = [];
      let observedRecordCount = 0;
      let tlsiApplied = false;

      for (const record of records) {
        const made = record.metrics[definition.numeratorMetric];
        const attempted = record.metrics[definition.denominatorMetric];

        if (
          !isNonNegativeFinite(made) ||
          !isNonNegativeFinite(attempted) ||
          made > attempted
        ) {
          continue;
        }

        const direction = definition.direction ?? "higher";
        const rawRate = attempted > 0 ? made / attempted : 0;
        const adjustedRate = clamp(
          applyTlsiToMetric(rawRate, direction, record.tlsi),
          0,
          1,
          rawRate,
        );
        numerator += adjustedRate * attempted;
        denominator += attempted;
        observedRecordCount += 1;
        sourceIds.push(...performanceRecordSourceIds(record));
        tlsiApplied ||= normalizeTlsi(record.tlsi).applied;
      }

      const hasObservations = observedRecordCount > 0;
      const meetsMinimum =
        hasObservations && denominator >= minimumAttempts;
      const value = meetsMinimum ? numerator / denominator : null;
      const missingReason: MissingAggregationReason | null =
        value !== null
          ? null
          : hasObservations
            ? "below_minimum_attempts"
            : "no_observations";

      metrics[metric] = value;
      evidence[metric] = {
        metric,
        kind: definition.kind,
        value,
        observedRecordCount,
        sourceIds: unique(sourceIds),
        minutes: null,
        numerator: hasObservations ? numerator : null,
        denominator: hasObservations ? denominator : null,
        minimumAttempts,
        missingReason,
        tlsiApplied,
      };
      continue;
    }

    let total = 0;
    let eligibleMinutes = 0;
    let observedRecordCount = 0;
    let recordsWithValue = 0;
    const sourceIds: string[] = [];
    let tlsiApplied = false;

    for (const record of records) {
      const value = record.metrics[definition.sourceMetric];
      if (!isNonNegativeFinite(value)) {
        continue;
      }

      recordsWithValue += 1;
      if (definition.kind === "per90") {
        if (!isFiniteNumber(record.minutes) || record.minutes <= 0) {
          continue;
        }
        eligibleMinutes += record.minutes;
      }

      total += applyTlsiToMetric(
        value,
        definition.direction ?? "higher",
        record.tlsi,
      );
      observedRecordCount += 1;
      sourceIds.push(...performanceRecordSourceIds(record));
      tlsiApplied ||= normalizeTlsi(record.tlsi).applied;
    }

    const value =
      observedRecordCount === 0
        ? null
        : definition.kind === "per90"
          ? (total * 90) / eligibleMinutes
          : total;
    const missingReason: MissingAggregationReason | null =
      value !== null
        ? null
        : recordsWithValue > 0
          ? "no_valid_minutes"
          : "no_observations";

    metrics[metric] = value;
    evidence[metric] = {
      metric,
      kind: definition.kind,
      value,
      observedRecordCount,
      sourceIds: unique(sourceIds),
      minutes:
        definition.kind === "per90" && observedRecordCount > 0
          ? eligibleMinutes
          : null,
      numerator: observedRecordCount > 0 ? total : null,
      denominator: null,
      minimumAttempts: null,
      missingReason,
      tlsiApplied,
    };
  }

  return { metrics, evidence };
}

export interface TlsiInput {
  applied: boolean;
  strengthFactor: number | null | undefined;
}

export type TlsiReason =
  | "applied"
  | "not_applied"
  | "invalid_strength_factor";

export interface TlsiEvidence {
  applied: boolean;
  requestedFactor: number | null;
  effectiveFactor: number;
  pointAdjustment: -1 | 0 | 1;
  reason: TlsiReason;
}

function normalizeTlsi(input: TlsiInput | undefined): Omit<
  TlsiEvidence,
  "pointAdjustment"
> {
  const requestedFactor = isFiniteNumber(input?.strengthFactor)
    ? input.strengthFactor
    : null;

  if (!input?.applied) {
    return {
      applied: false,
      requestedFactor,
      effectiveFactor: 1,
      reason: "not_applied",
    };
  }

  if (requestedFactor === null) {
    return {
      applied: false,
      requestedFactor,
      effectiveFactor: 1,
      reason: "invalid_strength_factor",
    };
  }

  return {
    applied: true,
    requestedFactor,
    effectiveFactor: clamp(
      requestedFactor,
      TLSI_MINIMUM_FACTOR,
      TLSI_MAXIMUM_FACTOR,
      1,
    ),
    reason: "applied",
  };
}

/**
 * Applies the conservative TLSI factor to the metric domain. Lower-is-better
 * metrics use the reciprocal so that a stronger context still moves evidence
 * in the favourable direction. The final attribute delta is separately
 * limited to one point.
 */
export function applyTlsiToMetric(
  value: number,
  direction: MetricDirection,
  input: TlsiInput | undefined,
): number {
  const tlsi = normalizeTlsi(input);
  if (!tlsi.applied) return value;

  return direction === "lower"
    ? value / tlsi.effectiveFactor
    : value * tlsi.effectiveFactor;
}

function boundedPointAdjustment(
  baselineScore: number,
  candidateScore: number,
): -1 | 0 | 1 {
  const difference = candidateScore - baselineScore;
  if (difference > 0) return 1;
  if (difference < 0) return -1;
  return 0;
}

export interface BaseAttributeDefinition {
  metricWeights: Readonly<Record<string, number>>;
  metricDirections?: Readonly<
    Record<string, MetricDirection | undefined>
  >;
}

export type MissingMetricReason =
  | "missing_value"
  | "missing_comparison_sample";

export interface BaseMetricEvidence {
  metric: string;
  value: number;
  tlsiAdjustedValue: number;
  percentile: number;
  tlsiAdjustedPercentile: number;
  configuredWeight: number;
  actualWeight: number;
  comparisonSize: number;
  sourceIds: readonly string[];
  imputed: boolean;
}

export interface MissingBaseMetricEvidence {
  metric: string;
  configuredWeight: number;
  reason: MissingMetricReason;
}

export interface NullableBaseAttributeResult {
  baselinePercentile: number | null;
  percentile: number | null;
  baselineRawScore: number | null;
  rawScore: number | null;
  confidenceAdjustedScore: number | null;
  baselineScore: number | null;
  score: number | null;
  confidence: number;
  confidenceLevel: ConfidenceLevel;
  metricCoverage: number;
  minutesReliability: number;
  sourceReliability: number;
  sampleMinutes: number | null;
  plannedWeight: number;
  usedWeight: number;
  evidence: readonly BaseMetricEvidence[];
  missingMetrics: readonly MissingBaseMetricEvidence[];
  sourceIds: readonly string[];
  imputed: boolean;
  tlsi: TlsiEvidence;
}

export interface CalculateNullableBaseAttributeInput {
  metrics: NullableMetricValues;
  comparisonSamples: Readonly<
    Record<string, readonly number[] | undefined>
  >;
  definition: BaseAttributeDefinition;
  metricSourceIds?: Readonly<
    Record<string, readonly string[] | undefined>
  >;
  imputedMetrics?: readonly string[];
  sampleMinutes: number | null | undefined;
  fullReliabilityMinutes?: number;
  sourceReliability?: number;
  minimumComparisonSize?: number;
  tlsi?: TlsiInput;
}

/**
 * Produces a nullable 1-20 BASE attribute.
 *
 * Confidence is deliberately multiplicative:
 * metric coverage × minute reliability × source reliability.
 * If no metric has both a value and a comparison sample, the score is null
 * instead of a fabricated neutral 10/11.
 */
export function calculateNullableBaseAttribute({
  metrics,
  comparisonSamples,
  definition,
  metricSourceIds = {},
  imputedMetrics = [],
  sampleMinutes,
  fullReliabilityMinutes = 900,
  sourceReliability = 1,
  minimumComparisonSize = 2,
  tlsi: tlsiInput,
}: CalculateNullableBaseAttributeInput): NullableBaseAttributeResult {
  const configuredMetrics = Object.entries(
    definition.metricWeights,
  ).filter(([, weight]) => isFiniteNumber(weight) && weight > 0);
  const plannedWeight = configuredMetrics.reduce(
    (total, [, weight]) => total + weight,
    0,
  );
  const minimumSample = Math.max(
    1,
    Math.trunc(
      isFiniteNumber(minimumComparisonSize)
        ? minimumComparisonSize
        : 2,
    ),
  );
  const used: Array<Omit<BaseMetricEvidence, "actualWeight">> = [];
  const missingMetrics: MissingBaseMetricEvidence[] = [];

  for (const [metric, configuredWeight] of configuredMetrics) {
    const value = metrics[metric];
    if (!isFiniteNumber(value)) {
      missingMetrics.push({
        metric,
        configuredWeight,
        reason: "missing_value",
      });
      continue;
    }

    const comparisonSample = (
      comparisonSamples[metric] ?? []
    ).filter(isFiniteNumber);
    if (comparisonSample.length < minimumSample) {
      missingMetrics.push({
        metric,
        configuredWeight,
        reason: "missing_comparison_sample",
      });
      continue;
    }

    const direction =
      definition.metricDirections?.[metric] ?? "higher";
    const tlsiAdjustedValue = applyTlsiToMetric(
      value,
      direction,
      tlsiInput,
    );
    used.push({
      metric,
      value,
      tlsiAdjustedValue,
      percentile: calculatePercentile(value, comparisonSample, {
        direction,
      }),
      tlsiAdjustedPercentile: calculatePercentile(
        tlsiAdjustedValue,
        comparisonSample,
        { direction },
      ),
      configuredWeight,
      comparisonSize: comparisonSample.length,
      sourceIds: unique(metricSourceIds[metric] ?? []),
      imputed: imputedMetrics.includes(metric),
    });
  }

  const usedWeight = used.reduce(
    (total, metric) => total + metric.configuredWeight,
    0,
  );
  const metricCoverage =
    plannedWeight > 0 ? clamp(usedWeight / plannedWeight, 0, 1, 0) : 0;
  const safeFullReliabilityMinutes = Math.max(
    1,
    isFiniteNumber(fullReliabilityMinutes)
      ? fullReliabilityMinutes
      : 900,
  );
  const safeSampleMinutes =
    isFiniteNumber(sampleMinutes) && sampleMinutes >= 0
      ? sampleMinutes
      : null;
  const minutesReliability =
    safeSampleMinutes === null
      ? 0
      : clamp(
          safeSampleMinutes / safeFullReliabilityMinutes,
          0,
          1,
          0,
        );
  const safeSourceReliability = clamp(sourceReliability, 0, 1, 0);
  const confidence =
    metricCoverage * minutesReliability * safeSourceReliability;
  const normalizedTlsi = normalizeTlsi(tlsiInput);
  const baseTlsi: TlsiEvidence = {
    ...normalizedTlsi,
    pointAdjustment: 0,
  };

  if (usedWeight <= 0) {
    return {
      baselinePercentile: null,
      percentile: null,
      baselineRawScore: null,
      rawScore: null,
      confidenceAdjustedScore: null,
      baselineScore: null,
      score: null,
      confidence: 0,
      confidenceLevel: getConfidenceLevel(0),
      metricCoverage,
      minutesReliability,
      sourceReliability: safeSourceReliability,
      sampleMinutes: safeSampleMinutes,
      plannedWeight,
      usedWeight,
      evidence: [],
      missingMetrics,
      sourceIds: [],
      imputed: false,
      tlsi: baseTlsi,
    };
  }

  const evidence: BaseMetricEvidence[] = used.map((metric) => ({
    ...metric,
    actualWeight: metric.configuredWeight / usedWeight,
  }));
  const baselinePercentile = evidence.reduce(
    (total, metric) =>
      total + metric.percentile * metric.actualWeight,
    0,
  );
  const percentile = evidence.reduce(
    (total, metric) =>
      total + metric.tlsiAdjustedPercentile * metric.actualWeight,
    0,
  );
  const baselineRawScore = percentileToAttribute(baselinePercentile);
  const rawScore = percentileToAttribute(percentile);
  const confidenceAdjustedScore = adjustForConfidence(
    rawScore,
    confidence,
    BASE_ATTRIBUTE_MIDPOINT,
  );
  const baselineScore = finalizeAttributeScore(
    baselineRawScore,
    confidence,
    BASE_ATTRIBUTE_MIDPOINT,
  );
  const candidateScore = finalizeAttributeScore(
    rawScore,
    confidence,
    BASE_ATTRIBUTE_MIDPOINT,
  );
  const pointAdjustment = normalizedTlsi.applied
    ? boundedPointAdjustment(baselineScore, candidateScore)
    : 0;
  const score = clamp(
    baselineScore + pointAdjustment,
    1,
    20,
    baselineScore,
  );

  return {
    baselinePercentile,
    percentile,
    baselineRawScore,
    rawScore,
    confidenceAdjustedScore,
    baselineScore,
    score,
    confidence,
    confidenceLevel: getConfidenceLevel(confidence),
    metricCoverage,
    minutesReliability,
    sourceReliability: safeSourceReliability,
    sampleMinutes: safeSampleMinutes,
    plannedWeight,
    usedWeight,
    evidence,
    missingMetrics,
    sourceIds: unique(
      evidence.flatMap((metric) => metric.sourceIds),
    ),
    imputed: evidence.some((metric) => metric.imputed),
    tlsi: {
      ...normalizedTlsi,
      pointAdjustment,
    },
  };
}

export interface DomainAttributeEvidence {
  domain: "club" | "national";
  configuredWeight: number;
  reliability: number;
  evidenceWeight: number;
  actualWeight: number;
  sourceIds: readonly string[];
}

export interface CombinedBaseAttributeResult {
  baselinePercentile: number | null;
  percentile: number | null;
  baselineRawScore: number | null;
  rawScore: number | null;
  confidenceAdjustedScore: number | null;
  baselineScore: number | null;
  score: number | null;
  confidence: number;
  confidenceLevel: ConfidenceLevel;
  domainEvidence: readonly DomainAttributeEvidence[];
  missingDomains: readonly ("club" | "national")[];
  sourceIds: readonly string[];
  imputed: boolean;
  tlsiAdjustment: -1 | 0 | 1;
}

/**
 * Combines club and national-team evidence at an 80/20 prior. Effective
 * weights are prior × domain reliability and are then normalized over only
 * the usable domains. Missing national evidence therefore does not erase a
 * club estimate, while a national-only estimate keeps an intentionally low
 * confidence ceiling of 0.2.
 */
export function combineClubAndNationalEvidence(
  club: NullableBaseAttributeResult | null | undefined,
  national: NullableBaseAttributeResult | null | undefined,
): CombinedBaseAttributeResult {
  const candidates = [
    {
      domain: "club" as const,
      result: club,
      configuredWeight: CLUB_EVIDENCE_WEIGHT,
    },
    {
      domain: "national" as const,
      result: national,
      configuredWeight: NATIONAL_EVIDENCE_WEIGHT,
    },
  ];
  const usable = candidates.filter(
    (
      candidate,
    ): candidate is typeof candidate & {
      result: NullableBaseAttributeResult;
    } =>
      candidate.result?.baselinePercentile !== null &&
      candidate.result?.percentile !== null &&
      candidate.result !== null &&
      candidate.result !== undefined &&
      candidate.result.confidence > 0,
  );
  const totalEvidenceWeight = usable.reduce(
    (total, candidate) =>
      total +
      candidate.configuredWeight * candidate.result.confidence,
    0,
  );
  const missingDomains = candidates
    .filter(
      (candidate) =>
        !usable.some(
          (usableCandidate) =>
            usableCandidate.domain === candidate.domain,
        ),
    )
    .map((candidate) => candidate.domain);

  if (totalEvidenceWeight <= 0) {
    return {
      baselinePercentile: null,
      percentile: null,
      baselineRawScore: null,
      rawScore: null,
      confidenceAdjustedScore: null,
      baselineScore: null,
      score: null,
      confidence: 0,
      confidenceLevel: getConfidenceLevel(0),
      domainEvidence: [],
      missingDomains,
      sourceIds: [],
      imputed: false,
      tlsiAdjustment: 0,
    };
  }

  const domainEvidence: DomainAttributeEvidence[] = usable.map(
    ({ domain, result, configuredWeight }) => {
      const evidenceWeight = configuredWeight * result.confidence;
      return {
        domain,
        configuredWeight,
        reliability: result.confidence,
        evidenceWeight,
        actualWeight: evidenceWeight / totalEvidenceWeight,
        sourceIds: result.sourceIds,
      };
    },
  );
  const resultByDomain = new Map(
    usable.map((candidate) => [
      candidate.domain,
      candidate.result,
    ]),
  );
  const baselinePercentile = domainEvidence.reduce(
    (total, domain) =>
      total +
      (resultByDomain.get(domain.domain)?.baselinePercentile ?? 0) *
        domain.actualWeight,
    0,
  );
  const percentile = domainEvidence.reduce(
    (total, domain) =>
      total +
      (resultByDomain.get(domain.domain)?.percentile ?? 0) *
        domain.actualWeight,
    0,
  );
  const confidence = clamp(totalEvidenceWeight, 0, 1, 0);
  const baselineRawScore = percentileToAttribute(baselinePercentile);
  const rawScore = percentileToAttribute(percentile);
  const confidenceAdjustedScore = adjustForConfidence(
    rawScore,
    confidence,
    BASE_ATTRIBUTE_MIDPOINT,
  );
  const baselineScore = finalizeAttributeScore(
    baselineRawScore,
    confidence,
    BASE_ATTRIBUTE_MIDPOINT,
  );
  const candidateScore = finalizeAttributeScore(
    rawScore,
    confidence,
    BASE_ATTRIBUTE_MIDPOINT,
  );
  const anyTlsiApplied = usable.some(
    (candidate) => candidate.result.tlsi.applied,
  );
  const tlsiAdjustment = anyTlsiApplied
    ? boundedPointAdjustment(baselineScore, candidateScore)
    : 0;
  const score = clamp(
    baselineScore + tlsiAdjustment,
    1,
    20,
    baselineScore,
  );

  return {
    baselinePercentile,
    percentile,
    baselineRawScore,
    rawScore,
    confidenceAdjustedScore,
    baselineScore,
    score,
    confidence,
    confidenceLevel: getConfidenceLevel(confidence),
    domainEvidence,
    missingDomains,
    sourceIds: unique(
      domainEvidence.flatMap((domain) => domain.sourceIds),
    ),
    imputed: usable.some((candidate) => candidate.result.imputed),
    tlsiAdjustment,
  };
}

export type TournamentFormStatus =
  | "complete"
  | "no_minutes"
  | "insufficient_metrics";

export interface TournamentFormInput {
  minutes: number | null | undefined;
  metricCoverage: number | null | undefined;
  percentile: number | null | undefined;
}

export interface TournamentFormResult {
  minutes: number | null;
  metricCoverage: number;
  percentile: number | null;
  reliability: number;
  adjustment: number;
  status: TournamentFormStatus;
}

/**
 * Tournament Form is a scenario-time overlay, never part of the stored BASE.
 */
export function calculateTournamentForm({
  minutes,
  metricCoverage,
  percentile,
}: TournamentFormInput): TournamentFormResult {
  const safeMinutes =
    isFiniteNumber(minutes) && minutes > 0 ? minutes : null;
  const safeCoverage = clamp(metricCoverage, 0, 1, 0);
  const safePercentile = isFiniteNumber(percentile)
    ? clamp(percentile, 0, 1, 0.5)
    : null;
  const reliability =
    safeMinutes === null
      ? 0
      : Math.min(1, safeMinutes / 180) * safeCoverage;

  if (safeMinutes === null) {
    return {
      minutes: null,
      metricCoverage: safeCoverage,
      percentile: safePercentile,
      reliability,
      adjustment: 0,
      status: "no_minutes",
    };
  }

  if (safePercentile === null || safeCoverage === 0) {
    return {
      minutes: safeMinutes,
      metricCoverage: safeCoverage,
      percentile: safePercentile,
      reliability,
      adjustment: 0,
      status: "insufficient_metrics",
    };
  }

  return {
    minutes: safeMinutes,
    metricCoverage: safeCoverage,
    percentile: safePercentile,
    reliability,
    adjustment: clamp(
      (safePercentile - 0.5) * 4 * reliability,
      -2,
      2,
      0,
    ),
    status: "complete",
  };
}

export function calculateEffectiveAttribute(
  baseAttribute: number | null | undefined,
  formAdjustment: number | null | undefined,
): number | null {
  if (!isFiniteNumber(baseAttribute)) return null;

  return clamp(
    Math.round(
      clamp(baseAttribute, 1, 20, BASE_ATTRIBUTE_MIDPOINT) +
        clamp(formAdjustment, -2, 2, 0),
    ),
    1,
    20,
    BASE_ATTRIBUTE_MIDPOINT,
  );
}

export function calculateEffectiveAttributes<
  Key extends string,
>(
  baseAttributes: Readonly<
    Record<Key, number | null | undefined>
  >,
  form: Pick<TournamentFormResult, "adjustment">,
): Record<Key, number | null> {
  return Object.fromEntries(
    (
      Object.entries(baseAttributes) as Array<
        [Key, number | null | undefined]
      >
    ).map(([attribute, value]) => [
        attribute,
        calculateEffectiveAttribute(value, form.adjustment),
      ]),
  ) as Record<Key, number | null>;
}
