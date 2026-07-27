import { describe, expect, it } from "vitest";

import {
  calculateAttributeFit,
  calculateImpact,
  calculateRisk,
  calculateSituationFit,
  evaluateRiskCondition,
  generateExplanation,
  getDecisionGrade,
  readRiskContextValue,
  renderTemplate,
} from ".";
import type {
  ImpactGaugeResult,
  RiskEvaluation,
  RiskRule,
} from ".";

const riskRules: readonly RiskRule[] = [
  {
    id: "high-line-low-press",
    label: "전술 모순",
    conditions: [
      {
        path: "instructions.defensiveLine",
        operator: "eq",
        value: "high",
      },
      {
        path: "instructions.press",
        operator: "eq",
        value: "low",
      },
    ],
    penalty: 12,
    severity: "high",
    message: "높은 수비 라인 뒤 공간이 노출될 수 있습니다.",
    mitigation: "수비 라인을 낮추거나 압박 강도를 높이세요.",
  },
  {
    id: "player-condition",
    label: "선수 상태",
    match: "any",
    conditions: [
      { path: "player.cardStatus", operator: "eq", value: "yellow" },
      { path: "player.fitness", operator: "lt", value: 30 },
    ],
    penalty: 9,
    severity: "medium",
    message: "경고 또는 체력 상태로 지속적인 압박에 위험이 있습니다.",
  },
  {
    id: "disabled",
    label: "비활성 규칙",
    enabled: false,
    conditions: [{ path: "always", operator: "truthy" }],
    penalty: 99,
    message: "표시되지 않아야 합니다.",
  },
];

describe("risk rules", () => {
  const context = {
    instructions: { defensiveLine: "high", press: "low" },
    player: { cardStatus: "yellow", fitness: 82 },
    tags: ["wide", "direct"],
  };

  it("reads nested paths while preserving direct dotted keys", () => {
    expect(readRiskContextValue(context, "player.fitness")).toBe(82);
    expect(
      readRiskContextValue({ "player.fitness": 10 }, "player.fitness"),
    ).toBe(10);
  });

  it("supports declarative comparison operators", () => {
    expect(
      evaluateRiskCondition(
        { path: "player.fitness", operator: "between", value: [80, 90] },
        context,
      ),
    ).toBe(true);
    expect(
      evaluateRiskCondition(
        { path: "tags", operator: "includes", value: "wide" },
        context,
      ),
    ).toBe(true);
    expect(
      evaluateRiskCondition(
        { path: "instructions.press", operator: "oneOf", value: ["low", "mid"] },
        context,
      ),
    ).toBe(true);
  });

  it("applies all/any rules and returns explainable findings", () => {
    const result = calculateRisk({ context, rules: riskRules });

    expect(result.totalPenalty).toBe(21);
    expect(result.triggered.map((finding) => finding.id)).toEqual([
      "high-line-low-press",
      "player-condition",
    ]);
    expect(result.triggered[0].mitigation).toContain("압박");
  });

  it("clamps aggregated and malformed penalties", () => {
    const result = calculateRisk({
      context: { active: true },
      maxPenalty: 25,
      rules: [
        {
          id: "one",
          label: "one",
          conditions: [{ path: "active", operator: "truthy" }],
          penalty: 20,
          message: "one",
        },
        {
          id: "two",
          label: "two",
          conditions: [{ path: "active", operator: "truthy" }],
          penalty: Number.NaN,
          message: "two",
        },
        {
          id: "three",
          label: "three",
          conditions: [{ path: "active", operator: "truthy" }],
          penalty: 20,
          message: "three",
        },
      ],
    });

    expect(result.totalPenalty).toBe(25);
    expect(result.triggered[1].penalty).toBe(0);
  });
});

describe("situation fit", () => {
  it("normalizes 1-20 attribute values to 0-100", () => {
    expect(
      calculateAttributeFit(
        { finishing: 20, passing: 1 },
        { finishing: 3, passing: 1 },
      ),
    ).toBe(75);
  });

  it("uses a neutral value for configured but missing evidence", () => {
    expect(
      calculateAttributeFit(
        { finishing: 20 },
        { finishing: 1, passing: 1 },
      ),
    ).toBe(75);
  });

  it("uses the specified 60/20/10/10 structure and subtracts risk", () => {
    const risk: RiskEvaluation = {
      totalPenalty: 5,
      triggered: [
        {
          id: "spacing",
          label: "간격",
          penalty: 5,
          severity: "medium",
          message: "중원 간격을 확인해야 합니다.",
        },
      ],
    };
    const result = calculateSituationFit({
      attributes: { finishing: 20 },
      attributeWeights: { finishing: 1 },
      roleFit: 80,
      fitness: 70,
      matchupFit: 60,
      risk,
    });

    expect(result.preRiskScore).toBe(89);
    expect(result.riskPenalty).toBe(5);
    expect(result.score).toBe(84);
    expect(result.contributions).toEqual({
      ability: 60,
      role: 16,
      fitness: 7,
      matchup: 6,
    });
    expect(result.warnings).toEqual(["중원 간격을 확인해야 합니다."]);
  });

  it("derives role fit from role attributes and applies a modifier", () => {
    const result = calculateSituationFit({
      attributes: { passing: 20 },
      attributeWeights: { passing: 1 },
      roleAttributeWeights: { passing: 1 },
      roleModifier: -10,
      fitness: 100,
      matchupFit: 100,
    });

    expect(result.components.role).toBe(90);
    expect(result.score).toBe(98);
  });

  it("clamps bad inputs and never returns NaN or an out-of-range score", () => {
    const result = calculateSituationFit({
      attributes: { finishing: Number.NaN },
      attributeWeights: { finishing: 1 },
      roleFit: Infinity,
      fitness: Number.NaN,
      matchupFit: -999,
      risk: 999,
    });

    expect(result.score).toBe(0);
    expect(Number.isFinite(result.preRiskScore)).toBe(true);
    expect(Object.values(result.components).every(Number.isFinite)).toBe(
      true,
    );
  });

  it("normalizes custom component weights", () => {
    const result = calculateSituationFit({
      attributes: { finishing: 20 },
      attributeWeights: { finishing: 1 },
      roleFit: 0,
      fitness: 0,
      matchupFit: 0,
      componentWeights: {
        ability: 4,
        role: 0,
        fitness: 0,
        matchup: 0,
      },
    });

    expect(result.score).toBe(100);
  });

  it("assigns the documented decision bands", () => {
    expect(getDecisionGrade(90)).toBe("excellent");
    expect(getDecisionGrade(75)).toBe("good");
    expect(getDecisionGrade(60)).toBe("mixed");
    expect(getDecisionGrade(40)).toBe("risky");
    expect(getDecisionGrade(39)).toBe("weak");
  });
});

describe("impact gauges", () => {
  it("returns all four canonical gauges with before/after deltas", () => {
    const result = calculateImpact({
      before: {
        attributes: {
          finishing: 10,
          chanceCreation: 10,
          dribbling: 10,
          passing: 10,
          pressing: 10,
          defending: 10,
          aerial: 10,
          impact: 10,
          speed: 10,
          stamina: 10,
          composure: 10,
          ballRetention: 10,
        },
      },
      after: {
        attributes: {
          finishing: 16,
          chanceCreation: 16,
          dribbling: 16,
          passing: 12,
          pressing: 10,
          defending: 6,
          aerial: 6,
          impact: 16,
          speed: 15,
          stamina: 10,
          composure: 10,
          ballRetention: 12,
        },
      },
    });

    expect(Object.keys(result)).toEqual([
      "attackThreat",
      "possessionStability",
      "defensiveStability",
      "pressingIntensity",
    ]);
    expect(result.attackThreat.after).toBeGreaterThan(
      result.attackThreat.before,
    );
    expect(result.attackThreat.delta).toBe(
      result.attackThreat.after - result.attackThreat.before,
    );
    expect(result.defensiveStability.delta).toBeLessThan(0);
    expect(result.attackThreat.reason).toContain("상승");
  });

  it("supports fully data-driven custom gauges and tactical modifiers", () => {
    const result = calculateImpact({
      before: {
        attributes: { finishing: 1 },
        gaugeModifiers: { threat: 0 },
      },
      after: {
        attributes: { finishing: 20 },
        gaugeModifiers: { threat: -10 },
      },
      definitions: {
        threat: {
          label: "위협",
          attributeWeights: { finishing: 1 },
        },
      },
      attributeLabels: { finishing: "골 결정력" },
    });

    expect(result.threat).toMatchObject({
      before: 0,
      after: 90,
      delta: 90,
      direction: "increase",
    });
    expect(result.threat.reason).toContain("골 결정력");
    expect(result.threat.drivers.map((driver) => driver.key)).toEqual([
      "finishing",
      "tacticalModifier",
    ]);
  });

  it("clamps gauge values and safely handles missing or invalid data", () => {
    const neutral = calculateImpact({
      before: { attributes: {} },
      after: {
        attributes: { finishing: Number.NaN },
        gaugeModifiers: { threat: Infinity },
      },
      definitions: {
        threat: {
          label: "위협",
          attributeWeights: { finishing: 1 },
        },
      },
    });
    const clamped = calculateImpact({
      before: { attributes: { finishing: 20 } },
      after: {
        attributes: { finishing: 20 },
        gaugeModifiers: { threat: -500 },
      },
      definitions: {
        threat: {
          label: "위협",
          attributeWeights: { finishing: 1 },
        },
      },
    });

    expect(neutral.threat.before).toBe(50);
    expect(neutral.threat.after).toBe(50);
    expect(neutral.threat.delta).toBe(0);
    expect(clamped.threat.after).toBe(0);
  });
});

function impact(
  id: string,
  label: string,
  delta: number,
): ImpactGaugeResult {
  return {
    id,
    label,
    before: 50,
    after: 50 + delta,
    delta,
    direction:
      delta > 0 ? "increase" : delta < 0 ? "decrease" : "unchanged",
    reason: "test",
    drivers: [],
  };
}

describe("rule-based explanations", () => {
  it("renders custom templates without leaving unresolved placeholders", () => {
    expect(
      renderTemplate("{name} 선택: {delta}, {missing}", {
        name: "플레이메이커",
        delta: "+8",
      }),
    ).toBe("플레이메이커 선택: +8,");
  });

  it("explains benefits, risks, mitigations, an alternative, and actual choice", () => {
    const explanation = generateExplanation({
      score: 82,
      impacts: {
        attack: impact("attack", "공격 위협", 18),
        defense: impact("defense", "수비 안정", -9),
      },
      risk: {
        totalPenalty: 7,
        triggered: [
          {
            id: "space",
            label: "공간",
            penalty: 7,
            severity: "high",
            message: "측면 수비 지원이 줄어들 수 있습니다.",
            mitigation: "반대쪽 풀백의 전진을 제한하세요.",
          },
        ],
      },
      roleName: "인사이드 포워드",
      alternative: {
        name: "대안 선수",
        comparison: "수비 안정은 높지만 공격 위협 증가는 작습니다.",
      },
      actualDecision: {
        description: "실제 감독은 다른 교체를 선택했습니다.",
        difference: "중원 안정에 더 무게를 둔 선택으로 볼 수 있습니다.",
        isInferred: true,
      },
    });

    expect(explanation.summary).toContain("뚜렷한 장점");
    expect(explanation.benefits[0]).toContain("공격 위협");
    expect(explanation.risks).toEqual([
      "측면 수비 지원이 줄어들 수 있습니다.",
      "수비 안정: -9점 낮아질 가능성을 함께 관리해야 합니다.",
    ]);
    expect(explanation.mitigations[0]).toContain("풀백");
    expect(explanation.alternative).toContain("대안 선수");
    expect(explanation.actualDecisionComparison).toContain("전술적 추론");
    expect(explanation.actualDecisionComparison).toContain("정답");
  });

  it("always shows a possible intent and a caveat", () => {
    const explanation = generateExplanation({
      score: 25,
      impacts: {
        attack: impact("attack", "공격 위협", 0),
      },
      risk: { totalPenalty: 0, triggered: [] },
      roleName: "측면 윙어",
    });

    expect(explanation.summary).toContain("노린 효과");
    expect(explanation.benefits[0]).toContain("측면 윙어");
    expect(explanation.risks).toHaveLength(1);
    expect(explanation.mitigations).toHaveLength(1);
  });

  it("accepts copy supplied by a JSON template layer", () => {
    const explanation = generateExplanation({
      score: 95,
      impacts: {
        press: impact("press", "압박 강도", 6),
      },
      risk: { totalPenalty: 0, triggered: [] },
      templates: {
        benefitIncrease: "{label} 변화 {delta}",
      },
    });

    expect(explanation.benefits).toEqual(["압박 강도 변화 +6"]);
    // A high score must still contain a risk/caveat.
    expect(explanation.risks).toHaveLength(1);
  });
});
