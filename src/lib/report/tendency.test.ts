import { describe, expect, it } from "vitest";
import type {
  RecalculatedReportDecision,
  TendencyAxisKey,
} from "@/lib/report/types";
import { calculateManagerTendency } from "@/lib/report/tendency";

function decision(
  overrides: Partial<RecalculatedReportDecision> = {},
): RecalculatedReportDecision {
  return {
    matchId: "match",
    scenarioId: "scenario",
    score: 70,
    riskPenalty: 0,
    roleId: "playmaker",
    instructions: {
      attackDirection: "balanced",
      pressing: "medium",
      defensiveLine: "medium",
      mentality: "balanced",
    },
    ...overrides,
  };
}

describe("manager tendency", () => {
  it("returns a bounded, explicit empty state without tactical decisions", () => {
    const tendency = calculateManagerTendency([]);
    expect(tendency.label).toBe("결정 기록 없음");
    expect(tendency.topAxes).toEqual([]);
    expect(tendency.decisionCount).toBe(0);
    expect(Object.values(tendency.axes)).toEqual([0, 0, 0, 0, 0, 0, 0]);
  });

  it("raises aggression and pressing for attacking, high-line, high-press choices", () => {
    const tendency = calculateManagerTendency([
      decision({
        roleId: "advanced-forward",
        riskPenalty: 8,
        instructions: {
          attackDirection: "centre",
          pressing: "high",
          defensiveLine: "high",
          mentality: "attacking",
        },
      }),
    ]);

    expect(tendency.axes.aggression).toBeGreaterThanOrEqual(90);
    expect(tendency.axes.pressing).toBeGreaterThanOrEqual(90);
    expect(tendency.axes.aggression).toBeGreaterThan(tendency.axes.stability);
    expect(tendency.label).toBe("공격적 압박형");
  });

  it("raises stability for safe, low-risk defensive choices", () => {
    const tendency = calculateManagerTendency([
      decision({
        score: 85,
        roleId: "holding-midfielder",
        instructions: {
          attackDirection: "balanced",
          pressing: "low",
          defensiveLine: "low",
          mentality: "safe",
        },
      }),
    ]);

    expect(tendency.axes.stability).toBeGreaterThanOrEqual(85);
    expect(tendency.axes.stability).toBeGreaterThan(tendency.axes.aggression);
    expect(tendency.label).toBe("안정적 통제형");
  });

  it("tracks the pressing axis directly from repeated pressing choices", () => {
    const high = calculateManagerTendency([
      decision({
        instructions: {
          attackDirection: "balanced",
          pressing: "high",
          defensiveLine: "medium",
          mentality: "balanced",
        },
      }),
    ]);
    const low = calculateManagerTendency([
      decision({
        instructions: {
          attackDirection: "balanced",
          pressing: "low",
          defensiveLine: "medium",
          mentality: "balanced",
        },
      }),
    ]);

    expect(high.axes.pressing).toBeGreaterThan(low.axes.pressing);
    expect(high.axes.pressing - low.axes.pressing).toBeGreaterThanOrEqual(60);
  });

  it("raises control for balanced instructions and a playmaker role", () => {
    const tendency = calculateManagerTendency([decision({ score: 90 })]);

    expect(tendency.axes.control).toBeGreaterThanOrEqual(90);
    expect(tendency.axes.control).toBeGreaterThan(tendency.axes.aggression);
  });

  it("derives width, central focus, and risk taking from choices deterministically", () => {
    const choices = [
      decision({
        matchId: "m1",
        scenarioId: "s1",
        score: 55,
        riskPenalty: 12,
        roleId: "attacking-fullback",
        instructions: {
          attackDirection: "left",
          pressing: "high",
          defensiveLine: "high",
          mentality: "attacking",
        },
      }),
      decision({
        matchId: "m2",
        scenarioId: "s2",
        score: 65,
        riskPenalty: 8,
        roleId: "winger",
        instructions: {
          attackDirection: "right",
          pressing: "high",
          defensiveLine: "high",
          mentality: "attacking",
        },
      }),
    ];
    const first = calculateManagerTendency(choices);
    const second = calculateManagerTendency(choices);

    expect(first).toEqual(second);
    expect(first.axes.width).toBeGreaterThan(first.axes.central);
    expect(first.axes.riskTaking).toBeGreaterThanOrEqual(75);
    expect(first.basis).toBe("tactical-choice-pattern");
    expect(first.note).toContain("선수 능력치가 아니라");
  });

  it("keeps every tactical-choice axis within 0–100", () => {
    const tendency = calculateManagerTendency([
      decision({ score: 100, riskPenalty: 999, roleId: "unknown-role" }),
    ]);

    for (const [axis, value] of Object.entries(tendency.axes) as Array<
      [TendencyAxisKey, number]
    >) {
      expect(axis).toBeTruthy();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(100);
    }
  });
});
