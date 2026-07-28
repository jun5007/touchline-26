import { describe, expect, it } from "vitest";
import {
  getInstructions,
  getPlayersForScenario,
  getRoles,
  getScenario,
} from "@/data/repository";
import type { AttributeKey, TacticalInstructions } from "@/data/types";
import {
  calculateInstructionFit,
  calculateMatchupFit,
  evaluateBestRole,
  evaluateDecision,
} from "@/lib/decision/evaluateDecision";
import { roleSupportsPlayer } from "@/lib/decision/positionCompatibility";

function requireFixture<T>(value: T | undefined, label: string): T {
  if (!value) throw new Error(`Missing fixture: ${label}`);
  return value;
}

function instructionCombinations(): TacticalInstructions[] {
  const combinations: TacticalInstructions[] = [];
  for (const attackDirection of [
    "left",
    "centre",
    "right",
    "balanced",
  ] as const) {
    for (const pressing of ["low", "medium", "high"] as const) {
      for (const defensiveLine of ["low", "medium", "high"] as const) {
        for (const mentality of ["safe", "balanced", "attacking"] as const) {
          combinations.push({
            attackDirection,
            pressing,
            defensiveLine,
            mentality,
          });
        }
      }
    }
  }
  return combinations;
}

describe("decision configuration integration", () => {
  const levelScenario = requireFixture(
    getScenario("kor-cze-2026", "level-69-find-nine"),
    "level scenario",
  );
  const leadScenario = requireFixture(
    getScenario("kor-cze-2026", "lead-84-close-game"),
    "lead scenario",
  );
  const levelPlayers = getPlayersForScenario(levelScenario);
  const leadPlayers = getPlayersForScenario(leadScenario);
  const son = requireFixture(
    levelPlayers.find((player) => player.id === "son-heungmin"),
    "Son Heung-min",
  );
  const oh = requireFixture(
    levelPlayers.find((player) => player.id === "oh-hyeongyu"),
    "Oh Hyeongyu",
  );
  const hwang = requireFixture(
    leadPlayers.find((player) => player.id === "hwang-inbeom"),
    "Hwang Inbeom",
  );
  const kim = requireFixture(
    leadPlayers.find((player) => player.id === "kim-jingyu"),
    "Kim Jingyu",
  );
  const targetRole = requireFixture(
    getRoles().find((role) => role.roleId === "target-striker"),
    "target striker",
  );
  const boxRole = requireFixture(
    getRoles().find((role) => role.roleId === "box-to-box"),
    "box-to-box",
  );
  const passiveInstructions = {
    attackDirection: "balanced",
    pressing: "low",
    defensiveLine: "low",
    mentality: "safe",
  } as const;

  it("declares complete scenario-owned instruction and matchup modifiers", () => {
    const roleIds = new Set(getRoles().map((role) => role.roleId));

    for (const scenario of [levelScenario, leadScenario]) {
      for (const category of getInstructions()) {
        const modifiers = scenario.instructionFit[category.id] as Record<
          string,
          number
        >;
        expect(Object.keys(modifiers).sort()).toEqual(
          category.options.map((option) => option.id).sort(),
        );
        expect(Object.values(modifiers).every(Number.isFinite)).toBe(true);
      }

      const instructionRuleIds =
        scenario.instructionFit.combinationModifiers.map((rule) => rule.id);
      expect(new Set(instructionRuleIds).size).toBe(instructionRuleIds.length);

      const matchupRuleIds = scenario.matchupModifiers.rules.map(
        (rule) => rule.id,
      );
      expect(new Set(matchupRuleIds).size).toBe(matchupRuleIds.length);
      for (const rule of scenario.matchupModifiers.rules) {
        expect(Number.isFinite(rule.modifier)).toBe(true);
        expect(
          (rule.positionGroups?.length ?? 0) +
            (rule.roleIds?.length ?? 0) +
            (rule.playerTags?.length ?? 0),
        ).toBeGreaterThan(0);
        for (const roleId of rule.roleIds ?? []) {
          expect(roleIds.has(roleId)).toBe(true);
        }
      }
    }
  });

  it("keeps instruction fit scenario-specific and bounded from -8 to +8", () => {
    const combinations = instructionCombinations();
    const levelValues = combinations.map((instructions) =>
      calculateInstructionFit(instructions, levelScenario),
    );
    const leadValues = combinations.map((instructions) =>
      calculateInstructionFit(instructions, leadScenario),
    );
    const aggressiveCentre = {
      attackDirection: "centre",
      pressing: "high",
      defensiveLine: "high",
      mentality: "attacking",
    } as const;

    expect(Math.min(...levelValues)).toBeGreaterThanOrEqual(-8);
    expect(Math.max(...levelValues)).toBeLessThanOrEqual(8);
    expect(Math.min(...leadValues)).toBeGreaterThanOrEqual(-8);
    expect(Math.max(...leadValues)).toBeLessThanOrEqual(8);
    expect(new Set(levelValues).size).toBeGreaterThan(4);
    expect(new Set(leadValues).size).toBeGreaterThan(4);
    expect(calculateInstructionFit(aggressiveCentre, levelScenario)).toBe(7);
    expect(calculateInstructionFit(aggressiveCentre, leadScenario)).toBe(-6);
    expect(
      calculateInstructionFit(
        leadScenario.defaultInstructions,
        leadScenario,
      ),
    ).toBe(8);
  });

  it("uses declared matchup rules without awarding an unverified tactical-position bonus", () => {
    expect(calculateMatchupFit(oh, levelScenario, targetRole)).toBe(62);
    expect(
      calculateMatchupFit(
        oh,
        { ...levelScenario, scoreState: "leading" },
        targetRole,
      ),
    ).toBe(62);
    expect(calculateMatchupFit(oh, leadScenario, targetRole)).toBe(56);
    expect(calculateMatchupFit(kim, leadScenario, boxRole)).toBe(63);

    const withoutRoleRule = {
      ...targetRole,
      roleId: "unlisted-target-role",
    };
    expect(calculateMatchupFit(oh, levelScenario, withoutRoleRule)).toBe(55);

    const evaluation = evaluateDecision({
      outgoing: son,
      incoming: oh,
      role: targetRole,
      instructions: levelScenario.defaultInstructions,
      scenario: levelScenario,
    });
    expect(evaluation.matchupReasons).toEqual(
      [expect.stringContaining("득점 지향 역할")],
    );
  });

  it("applies only the risk rules enabled by each scenario", () => {
    const level = evaluateDecision({
      outgoing: son,
      incoming: oh,
      role: targetRole,
      instructions: passiveInstructions,
      scenario: levelScenario,
    });
    const lead = evaluateDecision({
      outgoing: hwang,
      incoming: kim,
      role: boxRole,
      instructions: passiveInstructions,
      scenario: leadScenario,
    });

    expect(level.risk.triggered.map((finding) => finding.id)).not.toContain(
      "deep-passive-block",
    );
    expect(lead.risk.triggered.map((finding) => finding.id)).toContain(
      "deep-passive-block",
    );
  });

  it("applies evidence-confidence penalties at the documented 0/2/5 tiers", () => {
    const penaltyFor = (confidence: number) => {
      const evaluation = evaluateDecision({
        outgoing: son,
        incoming: { ...oh, confidence },
        role: { ...targetRole, riskModifiers: [] },
        instructions: levelScenario.defaultInstructions,
        scenario: levelScenario,
      });
      return evaluation.risk.triggered.find(
        (finding) => finding.id === "low-confidence",
      )?.penalty;
    };

    expect(penaltyFor(0.6)).toBeUndefined();
    expect(penaltyFor(0.59)).toBe(2);
    expect(penaltyFor(0.35)).toBe(2);
    expect(penaltyFor(0.34)).toBe(5);
  });

  it("surfaces role risk modifiers as explicit, low-penalty findings", () => {
    const evaluation = evaluateDecision({
      outgoing: son,
      incoming: oh,
      role: targetRole,
      instructions: levelScenario.defaultInstructions,
      scenario: levelScenario,
    });

    expect(evaluation.risk.triggered).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "role-target-striker-0",
          message: targetRole.riskModifiers[0],
          penalty: 2,
        }),
      ]),
    );
  });

  it("uses role fit modifiers when weighting preferred attributes", () => {
    const measuredOh = {
      ...oh,
      attributes: {
        ...oh.attributes,
        aerial: 19,
        finishing: 17,
        impact: 13,
        passing: 3,
      },
    };
    const passingHeavyRole = {
      ...targetRole,
      roleId: "passing-heavy-target",
      fitModifiers: {
        aerial: 0.1,
        finishing: 0.1,
        impact: 0.1,
        passing: 10,
      },
      riskModifiers: [],
    };
    const baseline = evaluateDecision({
      outgoing: son,
      incoming: measuredOh,
      role: targetRole,
      instructions: levelScenario.defaultInstructions,
      scenario: levelScenario,
    });
    const passingHeavy = evaluateDecision({
      outgoing: son,
      incoming: measuredOh,
      role: passingHeavyRole,
      instructions: levelScenario.defaultInstructions,
      scenario: levelScenario,
    });

    expect(passingHeavy.fit.components.role).not.toBe(
      baseline.fit.components.role,
    );
  });

  it("uses BASE plus scenario-time Tournament Form as effective attributes", () => {
    const measuredAttributes = {
      finishing: 14,
      chanceCreation: 10,
      dribbling: 10,
      passing: 9,
      pressing: 8,
      defending: 7,
      aerial: 13,
      impact: 12,
    } as const;
    const measuredOutgoing = {
      ...son,
      attributes: measuredAttributes,
      confidence: 0.8,
    };
    const neutralIncoming = {
      ...oh,
      attributes: measuredAttributes,
      confidence: 0.8,
      tournamentForm: {
        matchesPlayedBeforeScenario: 1,
        minutesBeforeScenario: 90,
        metricCoverage: 1,
        reliability: 0.5,
        percentile: 0.5,
        adjustment: 0,
        status: "complete" as const,
        note: "synthetic neutral form",
      },
    };
    const positiveIncoming = {
      ...neutralIncoming,
      tournamentForm: {
        ...neutralIncoming.tournamentForm,
        percentile: 1,
        adjustment: 1,
        note: "synthetic positive form",
      },
    };
    const neutral = evaluateDecision({
      outgoing: measuredOutgoing,
      incoming: neutralIncoming,
      role: { ...targetRole, riskModifiers: [] },
      instructions: levelScenario.defaultInstructions,
      scenario: levelScenario,
    });
    const positive = evaluateDecision({
      outgoing: measuredOutgoing,
      incoming: positiveIncoming,
      role: { ...targetRole, riskModifiers: [] },
      instructions: levelScenario.defaultInstructions,
      scenario: levelScenario,
    });

    expect(neutral.fit.componentAvailability.ability).toBe(true);
    expect(positive.effectiveAttributes.incoming.finishing).toBe(15);
    expect(positive.formAdjustments.incoming).toBe(1);
    expect(positive.fit.components.ability).toBeGreaterThan(
      neutral.fit.components.ability,
    );
    expect(positive.fit.score).toBeGreaterThan(neutral.fit.score);
  });

  it("chooses the highest-scoring allowed role for previews and alternatives", () => {
    const allowed = getRoles().filter((role) => roleSupportsPlayer(role, oh));
    const best = evaluateBestRole({
      outgoing: son,
      incoming: oh,
      roles: getRoles(),
      instructions: levelScenario.defaultInstructions,
      scenario: levelScenario,
    });
    const allScores = allowed.map(
      (role) =>
        evaluateDecision({
          outgoing: son,
          incoming: oh,
          role,
          instructions: levelScenario.defaultInstructions,
          scenario: levelScenario,
        }).fit.score,
    );

    expect(best).not.toBeNull();
    expect(best?.evaluation.fit.score).toBe(Math.max(...allScores));
  });

  it("is deterministic across score states, roles, and instructions", () => {
    const cases = [
      {
        outgoing: son,
        incoming: oh,
        role: targetRole,
        instructions: levelScenario.defaultInstructions,
        scenario: levelScenario,
      },
      {
        outgoing: hwang,
        incoming: kim,
        role: boxRole,
        instructions: leadScenario.defaultInstructions,
        scenario: leadScenario,
      },
      {
        outgoing: son,
        incoming: oh,
        role: targetRole,
        instructions: passiveInstructions,
        scenario: levelScenario,
      },
    ];

    for (const decision of cases) {
      expect(evaluateDecision(decision)).toEqual(evaluateDecision(decision));
    }
  });

  it("changes the role component when the same scenario uses different instructions", () => {
    const exposedInstructions = {
      attackDirection: "left",
      pressing: "low",
      defensiveLine: "high",
      mentality: "safe",
    } as const;
    const preferred = evaluateDecision({
      outgoing: son,
      incoming: oh,
      role: targetRole,
      instructions: levelScenario.defaultInstructions,
      scenario: levelScenario,
    });
    const exposed = evaluateDecision({
      outgoing: son,
      incoming: oh,
      role: targetRole,
      instructions: exposedInstructions,
      scenario: levelScenario,
    });

    expect(preferred.instructionFit).toBe(8);
    expect(exposed.instructionFit).toBe(-8);
    expect(preferred.fit.components.role).toBeGreaterThan(
      exposed.fit.components.role,
    );
  });

  it("keeps team-instruction fit active without inventing missing attributes", () => {
    const noMeasuredAttributes = {
      finishing: null,
      chanceCreation: null,
      dribbling: null,
      passing: null,
      pressing: null,
      defending: null,
      aerial: null,
      impact: null,
    } as const;
    const incoming = { ...oh, attributes: noMeasuredAttributes };
    const preferred = evaluateDecision({
      outgoing: son,
      incoming,
      role: targetRole,
      instructions: levelScenario.defaultInstructions,
      scenario: levelScenario,
    });
    const conservative = evaluateDecision({
      outgoing: son,
      incoming,
      role: targetRole,
      instructions: {
        attackDirection: "left",
        pressing: "low",
        defensiveLine: "medium",
        mentality: "safe",
      },
      scenario: levelScenario,
    });

    expect(preferred.fit.componentAvailability.ability).toBe(false);
    expect(preferred.fit.componentAvailability.role).toBe(true);
    expect(preferred.fit.components.role).toBe(58);
    expect(conservative.fit.components.role).toBe(47);
    expect(preferred.fit.score).toBeGreaterThan(conservative.fit.score);
  });

  it("keeps the shipped missions playable while BASE ability evidence is unavailable", () => {
    const levelBest = evaluateDecision({
      outgoing: requireFixture(
        levelPlayers.find((player) => player.id === "hwang-heechan"),
        "Hwang Heechan",
      ),
      incoming: oh,
      role: targetRole,
      instructions: {
        attackDirection: "centre",
        pressing: "medium",
        defensiveLine: "medium",
        mentality: "attacking",
      },
      scenario: levelScenario,
    });
    const leadBest = evaluateDecision({
      outgoing: requireFixture(
        leadPlayers.find((player) => player.id === "lee-gihyuk"),
        "Lee Gihyuk",
      ),
      incoming: requireFixture(
        leadPlayers.find((player) => player.id === "park-jinseob"),
        "Park Jinseob",
      ),
      role: boxRole,
      instructions: leadScenario.defaultInstructions,
      scenario: leadScenario,
    });

    for (const evaluation of [levelBest, leadBest]) {
      expect(evaluation.fit.componentAvailability.ability).toBe(false);
      expect(evaluation.fit.componentAvailability.fitness).toBe(true);
      expect(evaluation.fit.componentWeights.ability).toBe(0);
      expect(evaluation.fit.score).toBeGreaterThan(0);
      expect(evaluation.fit.score).toBeLessThanOrEqual(100);
    }
  });

  it("returns four gauges built from real attributes with clamped scores", () => {
    const highAttributes = Object.fromEntries(
      Object.keys(oh.attributes).map((attribute) => [attribute, 999]),
    ) as Record<AttributeKey, number>;
    const lowAttributes = Object.fromEntries(
      Object.keys(oh.attributes).map((attribute) => [attribute, -999]),
    ) as Record<AttributeKey, number>;
    const noRiskTargetRole = { ...targetRole, riskModifiers: [] };
    const highEvaluation = evaluateDecision({
      outgoing: son,
      incoming: { ...oh, attributes: highAttributes, fitness: 999 },
      role: noRiskTargetRole,
      instructions: levelScenario.defaultInstructions,
      scenario: {
        ...levelScenario,
        matchupModifiers: { base: 999, rules: [] },
      },
    });
    const lowEvaluation = evaluateDecision({
      outgoing: son,
      incoming: { ...oh, attributes: lowAttributes, fitness: -999 },
      role: noRiskTargetRole,
      instructions: {
        attackDirection: "left",
        pressing: "low",
        defensiveLine: "high",
        mentality: "safe",
      },
      scenario: {
        ...levelScenario,
        matchupModifiers: { base: -999, rules: [] },
      },
    });

    expect(Object.keys(highEvaluation.impacts)).toEqual([
      "attackThreat",
      "possessionStability",
      "defensiveStability",
      "pressingIntensity",
    ]);
    expect(highEvaluation.fit.score).toBe(95);
    expect(lowEvaluation.fit.score).toBe(0);
    expect(highEvaluation.matchupFit).toBe(100);
    expect(lowEvaluation.matchupFit).toBe(0);
    expect(
      Object.values(highEvaluation.impacts).every(
        (gauge) =>
          gauge.before >= 0 &&
          gauge.before <= 100 &&
          gauge.after >= 0 &&
          gauge.after <= 100,
      ),
    ).toBe(true);
  });

  it("preserves source order when allowed roles have exactly tied scores", () => {
    const firstRole = {
      ...targetRole,
      roleId: "first-tied-role",
      riskModifiers: [],
    };
    const secondRole = {
      ...firstRole,
      roleId: "second-tied-role",
    };
    const first = evaluateBestRole({
      outgoing: son,
      incoming: oh,
      roles: [firstRole, secondRole],
      instructions: levelScenario.defaultInstructions,
      scenario: levelScenario,
    });
    const reversed = evaluateBestRole({
      outgoing: son,
      incoming: oh,
      roles: [secondRole, firstRole],
      instructions: levelScenario.defaultInstructions,
      scenario: levelScenario,
    });

    expect(first?.role.roleId).toBe("first-tied-role");
    expect(reversed?.role.roleId).toBe("second-tied-role");
  });
});
