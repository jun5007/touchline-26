import { describe, expect, it } from "vitest";
import {
  getInstructions,
  getPlayersForScenario,
  getRoles,
  getScenario,
} from "@/data/repository";
import type {
  DecisionScenarioContext,
  InstructionCategory,
  TacticalInstructions,
} from "@/data/types";
import {
  buildLegalInstructionCombinations,
  calculateLegalDecisionScoreDistribution,
  getDecisionScoreRelativeContext,
} from "@/lib/decision/decisionScoreDistribution";
import { evaluateDecision } from "@/lib/decision/evaluateDecision";

function fixture() {
  const scenario = getScenario("kor-cze-2026", "level-69-find-nine");
  if (!scenario) throw new Error("Scenario fixture is missing");
  const players = getPlayersForScenario(scenario);
  const outgoing = players.find((player) => player.id === "son-heungmin");
  const incoming = players.find((player) => player.id === "oh-hyeongyu");
  const targetRole = getRoles().find(
    (role) => role.roleId === "target-striker",
  );
  const incompatibleRole = getRoles().find(
    (role) => role.roleId === "centre-back",
  );
  if (!outgoing || !incoming || !targetRole || !incompatibleRole) {
    throw new Error("Decision fixtures are missing");
  }

  const scenarioContext: DecisionScenarioContext = {
    ...scenario,
    currentLineup: scenario.currentLineup.filter(
      (spot) => spot.playerId === outgoing.id,
    ),
    benchOptions: [incoming.id],
  };
  const instructionCategories = getInstructions().map((category) => ({
    ...category,
    options: category.options.filter(
      (option) =>
        option.id === scenario.defaultInstructions[category.id] ||
        (category.id === "pressing" && option.id === "high"),
    ),
  })) as InstructionCategory[];

  return {
    scenario: scenarioContext,
    outgoing,
    incoming,
    targetRole,
    incompatibleRole,
    instructionCategories,
  };
}

describe("legal decision score distribution", () => {
  it("enumerates legal UI combinations with the production evaluator", () => {
    const {
      scenario,
      outgoing,
      incoming,
      targetRole,
      incompatibleRole,
      instructionCategories,
    } = fixture();
    const instructions = buildLegalInstructionCombinations(
      instructionCategories,
    );
    const expectedScores = instructions.map((teamInstructions) =>
      evaluateDecision({
        outgoing,
        incoming,
        role: targetRole,
        instructions: teamInstructions,
        scenario,
      }).fit.score,
    );
    const distribution = calculateLegalDecisionScoreDistribution({
      scenario,
      lineupPlayers: [outgoing],
      benchPlayers: [incoming],
      roles: [targetRole, incompatibleRole],
      instructionCategories,
    });

    expect(instructions).toHaveLength(2);
    expect(distribution).not.toBeNull();
    expect(distribution?.combinationCount).toBe(expectedScores.length);
    expect(distribution?.minScore).toBe(Math.min(...expectedScores));
    expect(distribution?.maxScore).toBe(Math.max(...expectedScores));
    for (const score of expectedScores) {
      expect(distribution?.scoreHistogram[score]).toBeGreaterThan(0);
    }
  });

  it("returns a conservative tied rank and mission percentile", () => {
    const scoreHistogram = Array.from({ length: 101 }, () => 0);
    scoreHistogram[10] = 1;
    scoreHistogram[20] = 2;
    scoreHistogram[30] = 1;
    const distribution = {
      minScore: 10,
      maxScore: 30,
      combinationCount: 4,
      scoreHistogram,
    };

    expect(getDecisionScoreRelativeContext(distribution, 20)).toEqual({
      minScore: 10,
      maxScore: 30,
      combinationCount: 4,
      percentile: 50,
      topPercent: 75,
    });
    expect(getDecisionScoreRelativeContext(distribution, 30)).toMatchObject({
      percentile: 100,
      topPercent: 25,
    });
    expect(getDecisionScoreRelativeContext(distribution, 15)).toBeNull();
  });

  it("does not invent a comparison range when substitutions are unavailable", () => {
    const { scenario, outgoing, incoming, targetRole, instructionCategories } =
      fixture();

    expect(
      calculateLegalDecisionScoreDistribution({
        scenario: { ...scenario, substitutionsRemaining: 0 },
        lineupPlayers: [outgoing],
        benchPlayers: [incoming],
        roles: [targetRole],
        instructionCategories,
      }),
    ).toBeNull();
  });

  it("memoizes equivalent inputs without reusing a changed scenario value", () => {
    const {
      scenario,
      outgoing,
      incoming,
      targetRole,
      incompatibleRole,
      instructionCategories,
    } = fixture();
    const input = {
      scenario,
      lineupPlayers: [outgoing],
      benchPlayers: [incoming],
      roles: [targetRole, incompatibleRole],
      instructionCategories,
    };
    const first = calculateLegalDecisionScoreDistribution(input);
    const equivalent = calculateLegalDecisionScoreDistribution({
      ...input,
      lineupPlayers: [...input.lineupPlayers],
      benchPlayers: [...input.benchPlayers],
      roles: [...input.roles],
      instructionCategories: input.instructionCategories.map((category) => ({
        ...category,
        options: category.options.map((option) => ({ ...option })),
      })),
    });
    const changed = calculateLegalDecisionScoreDistribution({
      ...input,
      scenario: {
        ...scenario,
        instructionFit: {
          attackDirection: {
            left: -8,
            centre: -8,
            right: -8,
            balanced: -8,
          },
          pressing: { low: -8, medium: -8, high: -8 },
          defensiveLine: { low: -8, medium: -8, high: -8 },
          mentality: { safe: -8, balanced: -8, attacking: -8 },
          combinationModifiers: [],
        },
      },
    });

    expect(first).not.toBeNull();
    expect(equivalent).toBe(first);
    expect(changed).not.toBe(first);
    expect(changed?.scoreHistogram).not.toEqual(first?.scoreHistogram);
    expect(Object.isFrozen(first)).toBe(true);
    expect(Object.isFrozen(first?.scoreHistogram)).toBe(true);
  });

  it("rejects malformed instruction options instead of scoring them", () => {
    const categories = getInstructions().map((category) => ({
      ...category,
      options: category.options.filter((option) => {
        const defaults: TacticalInstructions = {
          attackDirection: "balanced",
          pressing: "medium",
          defensiveLine: "medium",
          mentality: "balanced",
        };
        return option.id === defaults[category.id];
      }),
    }));
    categories[0] = {
      ...categories[0],
      options: [
        ...categories[0].options,
        {
          ...categories[0].options[0],
          id: "not-a-real-direction",
        },
      ],
    };

    expect(buildLegalInstructionCombinations(categories)).toHaveLength(1);
  });
});
