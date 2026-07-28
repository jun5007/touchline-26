import { describe, expect, it } from "vitest";

import { resultTemplates } from "@/data/repository";
import {
  calculateAttributeFit,
  calculateImpact,
  calculateRisk,
  calculateSituationFit,
  DECISION_GRADE_MINIMUMS,
  DEFAULT_IMPACT_GAUGE_DEFINITIONS,
  evaluateRiskCondition,
  generateExplanation,
  getDecisionGrade,
  readRiskContextValue,
  renderTemplate,
  SUPPORTED_IMPACT_ATTRIBUTES,
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

  it("excludes missing evidence and renormalizes the available weights", () => {
    expect(
      calculateAttributeFit(
        { finishing: 20, passing: null },
        { finishing: 1, passing: 1 },
      ),
    ).toBe(100);
  });

  it("excludes an all-null ability component and reweights available components", () => {
    const result = calculateSituationFit({
      attributes: { finishing: null, passing: null },
      attributeWeights: { finishing: 3, passing: 1 },
      roleFit: 80,
      fitness: 70,
      matchupFit: 60,
    });

    expect(result.componentAvailability).toEqual({
      ability: false,
      role: true,
      fitness: true,
      matchup: true,
    });
    expect(result.componentWeights).toEqual({
      ability: 0,
      role: 0.5,
      fitness: 0.25,
      matchup: 0.25,
    });
    expect(result.contributions).toEqual({
      ability: 0,
      role: 40,
      fitness: 17.5,
      matchup: 15,
    });
    expect(result.score).toBe(73);
    expect(result.warnings).toContain(
      "사용 가능한 선수 능력치가 없어 능력 구성 요소를 점수에서 제외했습니다.",
    );
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
    expect(getDecisionGrade(56)).toBe("excellent");
    expect(getDecisionGrade(52)).toBe("good");
    expect(getDecisionGrade(47)).toBe("mixed");
    expect(getDecisionGrade(39)).toBe("risky");
    expect(getDecisionGrade(38)).toBe("weak");
    expect(resultTemplates.grades.map((grade) => grade.min)).toEqual([
      DECISION_GRADE_MINIMUMS.excellent,
      DECISION_GRADE_MINIMUMS.good,
      DECISION_GRADE_MINIMUMS.mixed,
      DECISION_GRADE_MINIMUMS.risky,
      0,
    ]);
  });
});

describe("impact gauges", () => {
  it("builds the four canonical gauges only from the eight measured attributes", () => {
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

    const supported = new Set<string>(SUPPORTED_IMPACT_ATTRIBUTES);
    for (const definition of Object.values(
      DEFAULT_IMPACT_GAUGE_DEFINITIONS,
    )) {
      expect(
        Object.keys(definition.attributeWeights).every((key) =>
          supported.has(key),
        ),
      ).toBe(true);
      expect(
        Object.values(definition.attributeWeights).reduce(
          (sum, weight) => sum + (weight ?? 0),
          0,
        ),
      ).toBeCloseTo(1, 10);
    }
  });

  it("rejects a gauge definition that references an unsupported attribute", () => {
    expect(() =>
      calculateImpact({
        before: { attributes: { finishing: 10 } },
        after: { attributes: { finishing: 12 } },
        definitions: {
          invalid: {
            label: "근거 없는 게이지",
            attributeWeights: { speed: 1 },
          },
        },
      }),
    ).toThrow(/지원하지 않는 속성.*speed/);
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

  it("reports unavailable instead of fabricating a neutral gauge", () => {
    const unavailable = calculateImpact({
      before: { attributes: {} },
      after: {
        attributes: { finishing: null },
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

    expect(unavailable.threat).toMatchObject({
      before: 0,
      after: 0,
      delta: 0,
      available: false,
      availableAttributes: [],
      reason: "OUT·IN 공통 능력치 데이터 없음",
    });
    expect(clamped.threat.after).toBe(0);
  });

  it("compares only shared attributes and renormalizes their gauge weights", () => {
    const result = calculateImpact({
      before: {
        attributes: { finishing: 10, passing: 1 },
      },
      after: {
        attributes: { finishing: 20, passing: null },
      },
      definitions: {
        threat: {
          label: "위협",
          attributeWeights: { finishing: 0.25, passing: 0.75 },
        },
      },
    });

    expect(result.threat.available).toBe(true);
    expect(result.threat.availableAttributes).toEqual(["finishing"]);
    expect(result.threat.before).toBe(47);
    expect(result.threat.after).toBe(100);
    expect(result.threat.delta).toBe(53);
    expect(result.threat.drivers.map((driver) => driver.key)).toEqual([
      "finishing",
    ]);
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
    available: true,
    availableAttributes: ["test"],
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
      score: 53,
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
      observedCoachChoice: {
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
    expect(explanation.observedCoachChoiceComparison).toContain("전술적 추론");
    expect(explanation.observedCoachChoiceComparison).toContain("정답");
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
