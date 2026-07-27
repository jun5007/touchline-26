import { describe, expect, it } from "vitest";

import {
  adjustForConfidence,
  calculateAttributes,
  calculatePercentile,
  calculateSampleConfidence,
  finalizeAttributeScore,
  getAttributeScores,
  getConfidenceLevel,
  normalizeMetrics,
  percentileToAttribute,
  POSITION_GROUP_ATTRIBUTE_WEIGHTS,
  toPer90,
  toPositionGroup,
} from ".";

describe("calculatePercentile", () => {
  it("maps sample boundaries and interpolates between observations", () => {
    const sample = [10, 20, 30, 40, 50];

    expect(calculatePercentile(10, sample)).toBe(0);
    expect(calculatePercentile(30, sample)).toBe(0.5);
    expect(calculatePercentile(35, sample)).toBe(0.625);
    expect(calculatePercentile(50, sample)).toBe(1);
  });

  it("uses the average rank for ties", () => {
    expect(calculatePercentile(2, [1, 2, 2, 4])).toBe(0.5);
    expect(calculatePercentile(7, [7, 7, 7])).toBe(0.5);
  });

  it("supports metrics where a lower value is better", () => {
    expect(
      calculatePercentile(50, [10, 20, 30, 40, 50], {
        direction: "lower",
      }),
    ).toBe(0);
    expect(
      calculatePercentile(10, [10, 20, 30, 40, 50], {
        direction: "lower",
      }),
    ).toBe(1);
  });

  it("returns a neutral, finite fallback for missing evidence", () => {
    expect(calculatePercentile(Number.NaN, [1, 2, 3])).toBe(0.5);
    expect(calculatePercentile(2, [Number.NaN, Infinity])).toBe(0.5);
    expect(calculatePercentile(2, [], { fallback: 0.25 })).toBe(0.25);
  });
});

describe("1-20 attribute mapping", () => {
  it("uses round(1 + 19 * percentile) and clamps the input", () => {
    expect(percentileToAttribute(-2)).toBe(1);
    expect(percentileToAttribute(0)).toBe(1);
    expect(percentileToAttribute(0.5)).toBe(11);
    expect(percentileToAttribute(1)).toBe(20);
    expect(percentileToAttribute(4)).toBe(20);
    expect(percentileToAttribute(Number.NaN)).toBe(11);
  });
});

describe("metric normalization", () => {
  it("converts count metrics to per-90 rates", () => {
    expect(toPer90(2, 45)).toBe(4);
    expect(toPer90(3, 90)).toBe(3);
  });

  it("does not leak Infinity or NaN from bad minute samples", () => {
    expect(toPer90(2, 0)).toBe(0);
    expect(toPer90(Number.NaN, 90)).toBe(0);
    expect(
      normalizeMetrics(
        { passes: 10, pressureRate: 4, missing: Number.NaN },
        {
          passes: { normalization: "per90" },
          pressureRate: { normalization: "raw" },
        },
        45,
      ),
    ).toEqual({ passes: 20, pressureRate: 4 });
  });
});

describe("confidence adjustment", () => {
  it("calculates a bounded minute-based confidence", () => {
    expect(calculateSampleConfidence(450)).toBe(0.5);
    expect(calculateSampleConfidence(1_800)).toBe(1);
    expect(calculateSampleConfidence(-1)).toBe(0);
    expect(
      calculateSampleConfidence(90, {
        fullConfidenceMinutes: 900,
        minimumConfidence: 0.2,
      }),
    ).toBe(0.2);
  });

  it("shrinks raw scores toward 10.5", () => {
    expect(adjustForConfidence(20, 1)).toBe(20);
    expect(adjustForConfidence(20, 0.5)).toBe(15.25);
    expect(adjustForConfidence(20, 0)).toBe(10.5);
    expect(finalizeAttributeScore(20, 0.5)).toBe(15);
  });

  it("labels confidence consistently", () => {
    expect(getConfidenceLevel(0.2)).toBe("low");
    expect(getConfidenceLevel(0.4)).toBe("medium");
    expect(getConfidenceLevel(0.75)).toBe("high");
  });
});

describe("calculateAttributes", () => {
  it("combines data-driven metric weights, per-90 normalization, and confidence", () => {
    const results = calculateAttributes({
      metrics: { shots: 2, turnovers: 1 },
      comparisonSamples: {
        shots: [0, 2, 4, 6, 8],
        turnovers: [0, 1, 2, 3, 4],
      },
      definitions: {
        threat: {
          metricWeights: { shots: 3, turnovers: 1 },
        },
      },
      metricDefinitions: {
        shots: { normalization: "per90" },
        turnovers: { normalization: "raw", direction: "lower" },
      },
      confidence: 0.5,
      sampleMinutes: 45,
    });

    // shots/90 = 4 -> 50th percentile; one turnover -> 75th when lower is
    // better. Weighted percentile = 56.25%, raw 12, adjusted 11.25 -> 11.
    expect(results.threat.percentile).toBe(0.5625);
    expect(results.threat.rawScore).toBe(12);
    expect(results.threat.adjustedScore).toBe(11.25);
    expect(results.threat.score).toBe(11);
    expect(results.threat.confidenceLevel).toBe("medium");
    expect(results.threat.sampleMinutes).toBe(45);
    expect(results.threat.evidence).toHaveLength(2);
    expect(getAttributeScores(results)).toEqual({ threat: 11 });
  });

  it("uses a neutral fallback and never returns NaN", () => {
    const results = calculateAttributes({
      metrics: { missing: Number.NaN },
      comparisonSamples: {},
      definitions: {
        impact: {
          metricWeights: { missing: 1 },
        },
      },
      confidence: Number.NaN,
    });

    expect(results.impact.percentile).toBe(0.5);
    expect(results.impact.rawScore).toBe(11);
    expect(results.impact.adjustedScore).toBe(10.5);
    expect(results.impact.score).toBe(11);
  });
});

describe("position groups", () => {
  it("normalizes common position labels", () => {
    expect(toPositionGroup("lcb")).toBe("CB");
    expect(toPositionGroup("RWB")).toBe("FB_WB");
    expect(toPositionGroup("cam")).toBe("CM_AM");
    expect(toPositionGroup("RW")).toBe("WINGER");
    expect(toPositionGroup("CF")).toBe("STRIKER");
    expect(toPositionGroup("unknown")).toBeUndefined();
  });

  it("provides distinct, normalized default weight profiles", () => {
    const centreBackTotal = Object.values(
      POSITION_GROUP_ATTRIBUTE_WEIGHTS.CB,
    ).reduce((total, weight) => total + weight, 0);
    const wingerTotal = Object.values(
      POSITION_GROUP_ATTRIBUTE_WEIGHTS.WINGER,
    ).reduce((total, weight) => total + weight, 0);

    expect(centreBackTotal).toBeCloseTo(1);
    expect(wingerTotal).toBeCloseTo(1);
    expect(POSITION_GROUP_ATTRIBUTE_WEIGHTS.CB.defending).toBeGreaterThan(
      POSITION_GROUP_ATTRIBUTE_WEIGHTS.WINGER.defending ?? 0,
    );
  });
});

