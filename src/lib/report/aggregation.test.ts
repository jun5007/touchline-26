import { describe, expect, it } from "vitest";
import type {
  RecalculatedReportDecision,
  ReportMatchDefinition,
} from "@/lib/report/types";
import {
  aggregateGroupStageScores,
  calculateMatchScore,
  calculateOverallScore,
  summarizeReportHighlights,
} from "@/lib/report/aggregation";

const instructions = {
  attackDirection: "balanced",
  pressing: "medium",
  defensiveLine: "medium",
  mentality: "balanced",
} as const;

function decision(
  matchId: string,
  scenarioId: string,
  score: number,
  riskPenalty = 0,
  roleId = "playmaker",
): RecalculatedReportDecision {
  return {
    matchId,
    scenarioId,
    score,
    riskPenalty,
    roleId,
    instructions,
  };
}

const matches: ReportMatchDefinition[] = [
  { matchId: "match-1", scenarioIds: ["mission-1a", "mission-1b"] },
  { matchId: "match-2", scenarioIds: ["mission-2"] },
  { matchId: "match-3", scenarioIds: ["mission-3"] },
];

describe("group-stage report score aggregation", () => {
  it("calculates a match score from its completed mission scores", () => {
    expect(calculateMatchScore([60, 81])).toBe(70.5);
    expect(calculateMatchScore([])).toBeNull();
    expect(calculateMatchScore([Number.NaN, 80, 101, -1])).toBe(80);
  });

  it("averages multiple missions before giving each match equal overall weight", () => {
    const report = aggregateGroupStageScores(matches, [
      decision("match-1", "mission-1a", 100),
      decision("match-1", "mission-1b", 100),
      decision("match-2", "mission-2", 40),
      decision("match-3", "mission-3", 40),
    ]);

    expect(report.matches.map((match) => match.matchScore)).toEqual([
      100,
      40,
      40,
    ]);
    expect(report.overallScore).toBe(60);
    expect(report.overallScore).not.toBe(70);
    expect(report.completedMatchCount).toBe(3);
    expect(report.completedMissionCount).toBe(4);
    expect(report.allMatchesComplete).toBe(true);
  });

  it("keeps the overall score pending while exposing a provisional match score", () => {
    const report = aggregateGroupStageScores(matches, [
      decision("match-1", "mission-1a", 80),
      decision("match-2", "mission-2", 60),
      decision("other-match", "other-team-mission", 100),
    ]);

    expect(report.matches[0]).toMatchObject({
      status: "in-progress",
      matchScore: 80,
      completedMissionCount: 1,
      totalMissionCount: 2,
      includedInOverall: false,
      missingScenarioIds: ["mission-1b"],
    });
    expect(report.matches[1]).toMatchObject({
      status: "complete",
      matchScore: 60,
      includedInOverall: true,
    });
    expect(report.matches[2]).toMatchObject({
      status: "not-started",
      matchScore: null,
      includedInOverall: false,
    });
    expect(report.overallScore).toBeNull();
    expect(report.missingMissionCount).toBe(2);
    expect(report.allMatchesComplete).toBe(false);
  });

  it("returns no overall score until every group-stage match is complete", () => {
    const report = aggregateGroupStageScores(matches, [
      decision("match-1", "mission-1a", 90),
    ]);

    expect(report.overallScore).toBeNull();
    expect(calculateOverallScore([])).toBeNull();
    expect(calculateOverallScore([80, 70, null])).toBeNull();
  });

  it("selects highlights and frequency ties deterministically", () => {
    const decisions = [
      decision("match-2", "mission-b", 80, 4, "winger"),
      decision("match-1", "mission-a", 80, 9, "playmaker"),
      {
        ...decision("match-3", "mission-c", 70, 9, "winger"),
        instructions: { ...instructions, pressing: "high" as const },
      },
    ];

    const highlights = summarizeReportHighlights(decisions);
    expect(highlights.highestRatedDecision?.scenarioId).toBe("mission-a");
    expect(highlights.highestRiskDecision?.scenarioId).toBe("mission-a");
    expect(highlights.mostFrequentRole).toEqual({
      value: "winger",
      count: 2,
    });
    expect(highlights.mostFrequentInstructions.pressing).toEqual({
      value: "medium",
      count: 2,
    });
  });
});
