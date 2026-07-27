import { describe, expect, it } from "vitest";
import {
  getPlayer,
  getRoles,
  getScenario,
} from "@/data/repository";
import {
  evaluateBestRole,
  evaluateDecision,
} from "@/lib/decision/evaluateDecision";

function requireFixture<T>(value: T | undefined, label: string): T {
  if (!value) throw new Error(`Missing fixture: ${label}`);
  return value;
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
  const son = requireFixture(getPlayer("son-heungmin"), "Son Heung-min");
  const oh = requireFixture(getPlayer("oh-hyeongyu"), "Oh Hyeongyu");
  const hwang = requireFixture(getPlayer("hwang-inbeom"), "Hwang Inbeom");
  const kim = requireFixture(getPlayer("kim-jingyu"), "Kim Jingyu");
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
      incoming: oh,
      role: targetRole,
      instructions: levelScenario.defaultInstructions,
      scenario: levelScenario,
    });
    const passingHeavy = evaluateDecision({
      outgoing: son,
      incoming: oh,
      role: passingHeavyRole,
      instructions: levelScenario.defaultInstructions,
      scenario: levelScenario,
    });

    expect(passingHeavy.fit.components.role).not.toBe(
      baseline.fit.components.role,
    );
  });

  it("chooses the highest-scoring allowed role for previews and alternatives", () => {
    const allowed = getRoles().filter((role) =>
      role.allowedPositionGroups.includes(oh.positionGroup),
    );
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
});
