import { describe, expect, it } from "vitest";

import {
  FIELD_BASE_ATTRIBUTE_DEFINITIONS,
  GOALKEEPER_BASE_ATTRIBUTE_DEFINITIONS,
  MINIMUM_MINUTES_BY_POSITION,
  SOURCE_RELIABILITY,
  SUCCESS_RATE_MINIMUM_ATTEMPTS,
  aggregatePerformanceRecords,
  buildPositionComparisonSamples,
  calculateEffectiveAttribute,
  calculateEffectiveAttributes,
  calculateNullableBaseAttribute,
  calculateTournamentForm,
  combineClubAndNationalEvidence,
  type NullableBaseAttributeResult,
} from "./baseProfile";

const FULL_SAMPLE = [0, 25, 50, 75, 100] as const;

function singleMetricAttribute(
  value: number,
  options: {
    minutes?: number;
    sourceReliability?: number;
    tlsi?: { applied: boolean; strengthFactor: number | null };
    sourceId?: string;
  } = {},
): NullableBaseAttributeResult {
  return calculateNullableBaseAttribute({
    metrics: { output: value },
    comparisonSamples: { output: FULL_SAMPLE },
    definition: { metricWeights: { output: 1 } },
    metricSourceIds: {
      output: [options.sourceId ?? "synthetic-source"],
    },
    sampleMinutes: options.minutes ?? 900,
    sourceReliability: options.sourceReliability ?? 1,
    tlsi: options.tlsi,
  });
}

describe("aggregatePerformanceRecords", () => {
  it("keeps the published field weights, minute floors, and rate thresholds", () => {
    for (const definition of [
      ...Object.values(FIELD_BASE_ATTRIBUTE_DEFINITIONS),
      ...Object.values(GOALKEEPER_BASE_ATTRIBUTE_DEFINITIONS),
    ]) {
      expect(
        Object.values(definition.metricWeights).reduce(
          (total, weight) => total + weight,
          0,
        ),
      ).toBeCloseTo(1);
    }
    expect(MINIMUM_MINUTES_BY_POSITION).toMatchObject({
      GK: 900,
      CM_AM: 800,
      WINGER: 700,
      STRIKER: 700,
    });
    expect(SUCCESS_RATE_MINIMUM_ATTEMPTS).toEqual({
      shotConversion: 10,
      passCompletionRate: 100,
      dribbleSuccessRate: 20,
      aerialWinRate: 20,
    });
    expect(SOURCE_RELIABILITY).toEqual({
      official_multiple_sources: 1,
      official_single_source: 0.9,
      open_licensed_data: 0.75,
      inferred_supplement: 0.5,
    });
  });

  it("sums multi-club counts before deriving per-90 and success rates", () => {
    const result = aggregatePerformanceRecords(
      [
        {
          sourceId: "club-a",
          minutes: 450,
          metrics: {
            shots: 5,
            passesCompleted: 300,
            passesAttempted: 350,
          },
        },
        {
          sourceId: "club-b",
          minutes: 450,
          metrics: {
            shots: 10,
            passesCompleted: 200,
            passesAttempted: 250,
          },
        },
        {
          sourceId: "partial-club",
          minutes: 450,
          metrics: {
            shots: null,
            passesCompleted: null,
            passesAttempted: 250,
          },
        },
      ],
      {
        shots: { kind: "sum", sourceMetric: "shots" },
        shotsPer90: { kind: "per90", sourceMetric: "shots" },
        passSuccess: {
          kind: "successRate",
          numeratorMetric: "passesCompleted",
          denominatorMetric: "passesAttempted",
          minimumAttempts: 500,
        },
      },
    );

    expect(result.metrics.shots).toBe(15);
    expect(result.metrics.shotsPer90).toBe(1.5);
    expect(result.metrics.passSuccess).toBeCloseTo(500 / 600);
    expect(result.evidence.shotsPer90.minutes).toBe(900);
    expect(result.evidence.passSuccess.denominator).toBe(600);
    expect(result.evidence.passSuccess.sourceIds).toEqual([
      "club-a",
      "club-b",
    ]);
  });

  it("applies each transfer stint TLSI before minute-weighted per-90 aggregation", () => {
    const baseline = aggregatePerformanceRecords(
      [
        {
          sourceId: "club-a",
          minutes: 100,
          metrics: { goals: 10 },
        },
        {
          sourceId: "club-b",
          minutes: 300,
          metrics: { goals: 30 },
        },
      ],
      {
        goalsPer90: { kind: "per90", sourceMetric: "goals" },
      },
    );
    const adjusted = aggregatePerformanceRecords(
      [
        {
          sourceId: "club-a",
          minutes: 100,
          metrics: { goals: 10 },
          tlsi: { applied: true, strengthFactor: 1.02 },
        },
        {
          sourceId: "club-b",
          sourceIds: ["club-b", "cross-check"],
          minutes: 300,
          metrics: { goals: 30 },
          tlsi: { applied: true, strengthFactor: 0.98 },
        },
      ],
      {
        goalsPer90: { kind: "per90", sourceMetric: "goals" },
      },
    );

    expect(baseline.metrics.goalsPer90).toBe(9);
    expect(adjusted.metrics.goalsPer90).toBeCloseTo(8.91);
    expect(adjusted.evidence.goalsPer90.tlsiApplied).toBe(true);
    expect(adjusted.evidence.goalsPer90.sourceIds).toEqual([
      "club-a",
      "club-b",
      "cross-check",
    ]);
  });

  it("preserves null for absent, minute-less, and undersampled evidence", () => {
    const result = aggregatePerformanceRecords(
      [
        {
          sourceId: "incomplete",
          minutes: null,
          metrics: {
            shots: 3,
            duelsWon: 2,
            duelsAttempted: 4,
            missing: null,
          },
        },
      ],
      {
        shotsPer90: { kind: "per90", sourceMetric: "shots" },
        duelSuccess: {
          kind: "successRate",
          numeratorMetric: "duelsWon",
          denominatorMetric: "duelsAttempted",
          minimumAttempts: 10,
        },
        missingCount: { kind: "sum", sourceMetric: "missing" },
      },
    );

    expect(result.metrics).toEqual({
      shotsPer90: null,
      duelSuccess: null,
      missingCount: null,
    });
    expect(result.evidence.shotsPer90.missingReason).toBe(
      "no_valid_minutes",
    );
    expect(result.evidence.duelSuccess.missingReason).toBe(
      "below_minimum_attempts",
    );
    expect(result.evidence.missingCount.missingReason).toBe(
      "no_observations",
    );
  });

  it("builds samples only from verified or lineup-derived exact groups", () => {
    const samples = buildPositionComparisonSamples(
      [
        {
          playerId: "verified",
          positionGroup: "STRIKER",
          positionGroupStatus: "verified",
          metrics: { goalsPer90: 0.5, passing: null },
        },
        {
          playerId: "derived",
          positionGroup: "STRIKER",
          positionGroupStatus: "derived_from_lineups",
          metrics: { goalsPer90: 0.7 },
        },
        {
          playerId: "broad",
          positionGroup: null,
          positionGroupStatus: "broad_only",
          metrics: { goalsPer90: 99 },
        },
        {
          playerId: "winger",
          positionGroup: "WINGER",
          positionGroupStatus: "verified",
          metrics: { goalsPer90: 0.3 },
        },
      ],
      "STRIKER",
    );

    expect(samples).toEqual({ goalsPer90: [0.5, 0.7] });
  });
});

describe("calculateNullableBaseAttribute", () => {
  it("reweights only usable metrics and shrinks by evidence confidence", () => {
    const result = calculateNullableBaseAttribute({
      metrics: {
        shotsPer90: 75,
        passSuccess: null,
      },
      comparisonSamples: {
        shotsPer90: FULL_SAMPLE,
        passSuccess: [0.6, 0.7, 0.8],
      },
      definition: {
        metricWeights: {
          shotsPer90: 0.75,
          passSuccess: 0.25,
        },
      },
      metricSourceIds: {
        shotsPer90: ["club-a", "club-b"],
      },
      sampleMinutes: 450,
      fullReliabilityMinutes: 900,
      sourceReliability: 0.8,
    });

    expect(result.percentile).toBe(0.75);
    expect(result.metricCoverage).toBe(0.75);
    expect(result.minutesReliability).toBe(0.5);
    expect(result.confidence).toBeCloseTo(0.3);
    expect(result.baselineRawScore).toBe(15);
    expect(result.baselineScore).toBe(12);
    expect(result.score).toBe(12);
    expect(result.evidence[0].actualWeight).toBe(1);
    expect(result.missingMetrics).toEqual([
      {
        metric: "passSuccess",
        configuredWeight: 0.25,
        reason: "missing_value",
      },
    ]);
    expect(result.sourceIds).toEqual(["club-a", "club-b"]);
  });

  it("returns null rather than 10/11 when no metric is evidenced", () => {
    const result = calculateNullableBaseAttribute({
      metrics: { missing: null, unsampled: 4 },
      comparisonSamples: { unsampled: [] },
      definition: {
        metricWeights: { missing: 0.5, unsampled: 0.5 },
      },
      sampleMinutes: 900,
    });

    expect(result.score).toBeNull();
    expect(result.rawScore).toBeNull();
    expect(result.percentile).toBeNull();
    expect(result.confidence).toBe(0);
    expect(result.missingMetrics.map(({ reason }) => reason)).toEqual([
      "missing_value",
      "missing_comparison_sample",
    ]);
    expect(result.imputed).toBe(false);
  });

  it("labels limited proxy metrics as imputed without hiding missing metrics", () => {
    const result = calculateNullableBaseAttribute({
      metrics: { tacklesPer90: 2, pressuresPer90: null },
      comparisonSamples: {
        tacklesPer90: [1, 2, 3],
        pressuresPer90: [5, 10, 15],
      },
      definition: {
        metricWeights: { tacklesPer90: 0.5, pressuresPer90: 0.5 },
      },
      imputedMetrics: ["tacklesPer90"],
      sampleMinutes: 900,
    });

    expect(result.imputed).toBe(true);
    expect(result.evidence[0].imputed).toBe(true);
    expect(result.missingMetrics).toEqual([
      {
        metric: "pressuresPer90",
        configuredWeight: 0.5,
        reason: "missing_value",
      },
    ]);
  });

  it("keeps TLSI neutral when not applied and caps an applied factor and delta", () => {
    const notApplied = calculateNullableBaseAttribute({
      metrics: { output: 50 },
      comparisonSamples: { output: [40, 49, 50, 51, 60] },
      definition: { metricWeights: { output: 1 } },
      sampleMinutes: 900,
      tlsi: { applied: false, strengthFactor: 1.02 },
    });
    const applied = calculateNullableBaseAttribute({
      metrics: { output: 50 },
      comparisonSamples: { output: [40, 49, 50, 51, 60] },
      definition: { metricWeights: { output: 1 } },
      sampleMinutes: 900,
      tlsi: { applied: true, strengthFactor: 1.5 },
    });

    expect(notApplied.tlsi).toMatchObject({
      applied: false,
      effectiveFactor: 1,
      pointAdjustment: 0,
      reason: "not_applied",
    });
    expect(notApplied.score).toBe(notApplied.baselineScore);
    expect(applied.tlsi.effectiveFactor).toBe(1.02);
    expect(applied.evidence[0].tlsiAdjustedValue).toBe(51);
    expect(applied.rawScore).toBe(15);
    expect(applied.baselineScore).toBe(11);
    expect(applied.score).toBe(12);
    expect(applied.tlsi.pointAdjustment).toBe(1);
  });
});

describe("combineClubAndNationalEvidence", () => {
  it("allows club-only evidence while retaining its 0.8 confidence ceiling", () => {
    const result = combineClubAndNationalEvidence(
      singleMetricAttribute(100, { sourceId: "club-source" }),
      null,
    );

    expect(result.confidence).toBe(0.8);
    expect(result.domainEvidence).toEqual([
      {
        domain: "club",
        configuredWeight: 0.8,
        reliability: 1,
        evidenceWeight: 0.8,
        actualWeight: 1,
        sourceIds: ["club-source"],
      },
    ]);
    expect(result.missingDomains).toEqual(["national"]);
    expect(result.score).toBe(18);
  });

  it("keeps a national-only estimate deliberately low-confidence", () => {
    const result = combineClubAndNationalEvidence(
      null,
      singleMetricAttribute(100, { sourceId: "national-source" }),
    );

    expect(result.confidence).toBe(0.2);
    expect(result.domainEvidence[0].actualWeight).toBe(1);
    expect(result.missingDomains).toEqual(["club"]);
    expect(result.score).toBe(12);
  });

  it("reweights 80/20 priors by each domain's reliability", () => {
    const club = singleMetricAttribute(100, {
      sourceId: "club-source",
    });
    const national = singleMetricAttribute(0, {
      minutes: 450,
      sourceId: "national-source",
    });
    const result = combineClubAndNationalEvidence(club, national);

    expect(result.confidence).toBe(0.9);
    expect(result.domainEvidence[0].actualWeight).toBeCloseTo(8 / 9);
    expect(result.domainEvidence[1].actualWeight).toBeCloseTo(1 / 9);
    expect(result.sourceIds).toEqual([
      "club-source",
      "national-source",
    ]);
  });

  it("returns null when neither domain has usable evidence", () => {
    const result = combineClubAndNationalEvidence(null, null);

    expect(result.score).toBeNull();
    expect(result.confidence).toBe(0);
    expect(result.missingDomains).toEqual(["club", "national"]);
  });
});

describe("Tournament Form and effective attributes", () => {
  it("uses the documented minute, coverage, and percentile formula", () => {
    const form = calculateTournamentForm({
      minutes: 90,
      metricCoverage: 0.8,
      percentile: 1,
    });

    expect(form.reliability).toBeCloseTo(0.4);
    expect(form.adjustment).toBeCloseTo(0.8);
    expect(form.status).toBe("complete");
    expect(
      calculateEffectiveAttributes(
        { finishing: 10, passing: null, impact: 20 },
        form,
      ),
    ).toEqual({
      finishing: 11,
      passing: null,
      impact: 20,
    });
  });

  it("keeps no-minute and missing-metric form neutral", () => {
    const noMinutes = calculateTournamentForm({
      minutes: null,
      metricCoverage: 1,
      percentile: 1,
    });
    const noMetrics = calculateTournamentForm({
      minutes: 180,
      metricCoverage: 0.6,
      percentile: null,
    });

    expect(noMinutes).toMatchObject({
      reliability: 0,
      adjustment: 0,
      status: "no_minutes",
    });
    expect(noMetrics).toMatchObject({
      reliability: 0.6,
      adjustment: 0,
      status: "insufficient_metrics",
    });
    expect(calculateEffectiveAttribute(null, 2)).toBeNull();
    expect(calculateEffectiveAttribute(10, noMinutes.adjustment)).toBe(
      10,
    );
  });

  it("clamps effective values and form adjustments safely", () => {
    expect(calculateEffectiveAttribute(20, 99)).toBe(20);
    expect(calculateEffectiveAttribute(1, -99)).toBe(1);
    expect(
      calculateTournamentForm({
        minutes: 10_000,
        metricCoverage: 5,
        percentile: 5,
      }).adjustment,
    ).toBe(2);
  });
});
