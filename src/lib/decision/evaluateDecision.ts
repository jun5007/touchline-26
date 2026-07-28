import { getInstructions } from "@/data/instructionCatalog";
import type {
  AttributeKey,
  DecisionScenarioContext,
  ImpactGaugeKey,
  InstructionCategory,
  Player,
  Role,
  StoredDecision,
  TacticalInstructions,
} from "@/data/types";
import {
  calculateImpact,
  calculateRisk,
  calculateSituationFit,
  generateExplanation,
  type ImpactComparison,
  type RiskEvaluation,
  type RiskRule,
  type SituationFitResult,
} from "@/lib/scoring";
import {
  getEligiblePositionGroups,
  playerHasVerifiedPositionGroup,
  roleSupportsPlayer,
} from "@/lib/decision/positionCompatibility";
import { calculateEffectiveAttributes } from "@/lib/attributes/baseProfile";

export const ATTRIBUTE_LABELS: Record<AttributeKey, string> = {
  finishing: "골 결정력",
  chanceCreation: "찬스 창출",
  dribbling: "드리블",
  passing: "패스",
  pressing: "압박",
  defending: "수비 기여",
  aerial: "제공권",
  impact: "임팩트",
};

const IMPACT_GAUGE_KEYS: readonly ImpactGaugeKey[] = [
  "attackThreat",
  "possessionStability",
  "defensiveStability",
  "pressingIntensity",
];

const RISK_RULES: RiskRule[] = [
  {
    id: "high-line-low-press",
    label: "라인과 압박의 간격",
    conditions: [
      { path: "instructions.defensiveLine", operator: "eq", value: "high" },
      { path: "instructions.pressing", operator: "eq", value: "low" },
    ],
    penalty: 12,
    severity: "high",
    message: "높은 수비 라인과 낮은 압박의 조합은 상대 전진 패스 시간을 늘릴 수 있습니다.",
    mitigation: "수비 라인을 보통으로 내리거나 압박 강도를 보통 이상으로 맞추세요.",
  },
  {
    id: "all-out-attack",
    label: "전환 수비 노출",
    conditions: [
      { path: "instructions.mentality", operator: "eq", value: "attacking" },
      { path: "instructions.defensiveLine", operator: "eq", value: "high" },
    ],
    penalty: 8,
    severity: "medium",
    message: "공격 성향과 높은 라인을 동시에 선택해 볼을 잃은 뒤 뒷공간이 커질 수 있습니다.",
    mitigation: "한쪽 윙백의 전진을 제한하거나 수비 라인을 보통으로 유지하세요.",
  },
  {
    id: "deep-passive-block",
    label: "수동적 저블록",
    conditions: [
      { path: "instructions.defensiveLine", operator: "eq", value: "low" },
      { path: "instructions.pressing", operator: "eq", value: "low" },
    ],
    penalty: 7,
    severity: "medium",
    message: "라인과 압박을 모두 낮추면 박스 앞 세컨드볼과 반복 크로스를 허용할 수 있습니다.",
    mitigation: "압박을 보통으로 올려 상대의 편안한 크로스 준비를 방해하세요.",
  },
  {
    id: "position-mismatch",
    label: "포지션 재배치",
    conditions: [{ path: "positionMismatch", operator: "truthy" }],
    penalty: 10,
    severity: "high",
    message: "직접 호환되지 않는 포지션 교체라 주변 선수의 재배치가 필요합니다.",
    mitigation: "역할 설명을 확인하고 인접 포지션 선수의 위치까지 함께 조정했다고 가정하세요.",
  },
  {
    id: "low-confidence",
    label: "BASE 근거 불확실성",
    conditions: [
      { path: "incomingConfidence", operator: "lt", value: 0.6 },
    ],
    penalty: 5,
    severity: "low",
    message:
      "투입 선수의 최근 1년 원자료 범위와 신뢰도가 제한되어 평가 불확실성이 큽니다.",
    mitigation:
      "선수의 경기력이 낮다는 뜻이 아닙니다. 점수 차이를 근거 불확실성을 포함한 범위로 해석하세요.",
  },
  {
    id: "protect-lead-attacking",
    label: "미션과 공격 성향 충돌",
    conditions: [
      { path: "scoreState", operator: "eq", value: "leading" },
      { path: "instructions.mentality", operator: "eq", value: "attacking" },
    ],
    penalty: 6,
    severity: "medium",
    message: "리드 보호 미션에서 공격 성향을 높여 경기 통제보다 추가 득점 위험을 택했습니다.",
    mitigation: "공격 방향은 유지하되 성향을 균형으로 내려 후방 숫자를 확보하세요.",
  },
];

function sumInstructionModifiers(
  values: TacticalInstructions,
  categories: InstructionCategory[] = getInstructions(),
) {
  const totals = Object.fromEntries(
    IMPACT_GAUGE_KEYS.map((gauge) => [gauge, 0]),
  ) as Record<ImpactGaugeKey, number>;

  for (const category of categories) {
    const selectedId = values[category.id];
    const option = category.options.find(
      (candidate) => candidate.id === selectedId,
    );
    if (!option) continue;
    for (const gauge of IMPACT_GAUGE_KEYS) {
      const modifier = option.impactModifiers[gauge];
      if (Number.isFinite(modifier)) {
        totals[gauge] += modifier ?? 0;
      }
    }
  }

  return totals;
}

function getRoleAttributeWeights(
  role: Role,
): Partial<Record<AttributeKey, number>> {
  return Object.fromEntries(
    role.preferredAttributes.map((attribute, index) => [
      attribute,
      Math.max(1, role.preferredAttributes.length - index) *
        (role.fitModifiers[attribute] ?? 1),
    ]),
  ) as Partial<Record<AttributeKey, number>>;
}

const TACTICAL_INSTRUCTION_KEYS = [
  "attackDirection",
  "pressing",
  "defensiveLine",
  "mentality",
] as const satisfies ReadonlyArray<keyof TacticalInstructions>;

function matchesInstructionCombination(
  instructions: TacticalInstructions,
  when: Partial<TacticalInstructions>,
): boolean {
  return (
    Object.entries(when) as Array<
      [
        keyof TacticalInstructions,
        TacticalInstructions[keyof TacticalInstructions],
      ]
    >
  ).every(([category, expected]) => instructions[category] === expected);
}

/**
 * Returns a scenario-owned team-instruction fit adjustment.
 *
 * The defensive fallback keeps old or malformed saved scenario snapshots
 * usable without reviving the former global instruction-option score.
 */
export function calculateInstructionFit(
  instructions: TacticalInstructions,
  scenario: DecisionScenarioContext,
): number {
  const configuration = scenario.instructionFit;
  if (!configuration) return 0;

  let total = 0;
  for (const category of TACTICAL_INSTRUCTION_KEYS) {
    const categoryModifiers = configuration[category] as
      | Readonly<Record<string, number>>
      | undefined;
    const modifier = categoryModifiers?.[instructions[category]];
    if (Number.isFinite(modifier)) {
      total += modifier ?? 0;
    }
  }
  for (const combination of configuration.combinationModifiers ?? []) {
    if (
      Number.isFinite(combination.modifier) &&
      matchesInstructionCombination(instructions, combination.when)
    ) {
      total += combination.modifier;
    }
  }

  return Math.max(-8, Math.min(8, total));
}

function matchesMatchupRule(
  player: Player,
  role: Role,
  rule: DecisionScenarioContext["matchupModifiers"]["rules"][number],
): boolean {
  let hasMatcher = false;

  if (rule.positionGroups) {
    hasMatcher = true;
    if (!playerHasVerifiedPositionGroup(player, rule.positionGroups)) {
      return false;
    }
  }
  if (rule.roleIds) {
    hasMatcher = true;
    if (!rule.roleIds.includes(role.roleId)) return false;
  }
  if (rule.playerTags) {
    hasMatcher = true;
    if (!rule.playerTags.some((tag) => player.tags.includes(tag))) return false;
  }

  return hasMatcher;
}

export function calculateMatchupFit(
  player: Player,
  scenario: DecisionScenarioContext,
  role: Role,
): number {
  return calculateMatchupEvaluation(player, scenario, role).fit;
}

export interface MatchupEvaluation {
  fit: number;
  matchedRuleIds: string[];
  reasons: string[];
}

export function calculateMatchupEvaluation(
  player: Player,
  scenario: DecisionScenarioContext,
  role: Role,
): MatchupEvaluation {
  const configuration = scenario.matchupModifiers;
  if (!configuration) {
    return { fit: 50, matchedRuleIds: [], reasons: [] };
  }

  let fit = Number.isFinite(configuration.base) ? configuration.base : 50;
  const matchedRules: typeof configuration.rules = [];
  for (const rule of configuration.rules ?? []) {
    if (
      Number.isFinite(rule.modifier) &&
      matchesMatchupRule(player, role, rule)
    ) {
      fit += rule.modifier;
      matchedRules.push(rule);
    }
  }

  return {
    fit: Math.max(0, Math.min(100, fit)),
    matchedRuleIds: matchedRules.map((rule) => rule.id),
    reasons: matchedRules.map(
      (rule) => `${rule.label} (${rule.modifier > 0 ? "+" : ""}${rule.modifier})`,
    ),
  };
}

export function isPositionMismatch(outgoing: Player, incoming: Player): boolean {
  const outgoingGroups = getEligiblePositionGroups(outgoing);
  const incomingGroups = getEligiblePositionGroups(incoming);
  if (
    outgoingGroups.some((group) => incomingGroups.includes(group))
  ) {
    return false;
  }
  const compatiblePairs = new Set([
    "WINGER:STRIKER",
    "STRIKER:WINGER",
    "CM_AM:DM",
    "DM:CM_AM",
    "FB_WB:WINGER",
    "WINGER:FB_WB",
    "CB:DM",
    "DM:CB",
  ]);
  return !outgoingGroups.some((outgoingGroup) =>
    incomingGroups.some((incomingGroup) =>
      compatiblePairs.has(`${outgoingGroup}:${incomingGroup}`),
    ),
  );
}

export interface DecisionEvaluation {
  fit: SituationFitResult;
  risk: RiskEvaluation;
  impacts: ImpactComparison<ImpactGaugeKey>;
  explanation: ReturnType<typeof generateExplanation>;
  positionMismatch: boolean;
  instructionFit: number;
  matchupFit: number;
  matchupReasons: string[];
  effectiveAttributes: {
    outgoing: Player["attributes"];
    incoming: Player["attributes"];
  };
  formAdjustments: {
    outgoing: number;
    incoming: number;
  };
}

export interface BestRoleEvaluation {
  role: Role;
  evaluation: DecisionEvaluation;
}

export function evaluateDecision({
  outgoing,
  incoming,
  role,
  instructions,
  scenario,
}: {
  outgoing: Player;
  incoming: Player;
  role: Role;
  instructions: TacticalInstructions;
  scenario: DecisionScenarioContext;
}): DecisionEvaluation {
  const positionMismatch = isPositionMismatch(outgoing, incoming);
  const outgoingFormAdjustment = outgoing.tournamentForm?.adjustment ?? 0;
  const incomingFormAdjustment = incoming.tournamentForm?.adjustment ?? 0;
  const outgoingEffectiveAttributes = calculateEffectiveAttributes(
    outgoing.attributes,
    { adjustment: outgoingFormAdjustment },
  );
  const incomingEffectiveAttributes = calculateEffectiveAttributes(
    incoming.attributes,
    { adjustment: incomingFormAdjustment },
  );
  const scenarioRiskRules = RISK_RULES.filter((rule) =>
    scenario.riskRules.includes(rule.id),
  ).map((rule) =>
    rule.id === "low-confidence"
      ? {
          ...rule,
          penalty: incoming.confidence >= 0.35 ? 2 : 5,
        }
      : rule,
  );
  const roleRiskRules: RiskRule[] = role.riskModifiers.map(
    (message, index) => ({
      id: `role-${role.roleId}-${index}`,
      label: `${role.name} 역할 위험`,
      conditions: [{ path: "roleRiskActive", operator: "truthy" }],
      penalty: 2,
      severity: "low",
      message,
      mitigation: `${role.name}의 단점을 상쇄하도록 팀 지시와 주변 선수 역할을 조정하세요.`,
    }),
  );
  const risk = calculateRisk({
    context: {
      instructions,
      positionMismatch,
      incomingConfidence: incoming.confidence,
      scoreState: scenario.scoreState,
      roleRiskActive: roleRiskRules.length > 0,
    },
    rules: [...scenarioRiskRules, ...roleRiskRules],
    maxPenalty: 35,
  });
  const instructionModifiers = sumInstructionModifiers(instructions);
  const defaultModifiers = sumInstructionModifiers(scenario.defaultInstructions);
  const roleModifiers = getRoleAttributeWeights(role);

  const impacts = calculateImpact({
    before: {
      attributes: outgoingEffectiveAttributes,
      gaugeModifiers: defaultModifiers,
    },
    after: {
      attributes: incomingEffectiveAttributes,
      gaugeModifiers: instructionModifiers,
    },
    attributeLabels: ATTRIBUTE_LABELS,
  });

  const instructionFit = calculateInstructionFit(instructions, scenario);
  const matchup = calculateMatchupEvaluation(incoming, scenario, role);
  const matchupFit = matchup.fit;
  const hasMeasuredRoleAttribute = role.preferredAttributes.some(
    (attribute) =>
      Number.isFinite(incomingEffectiveAttributes[attribute]),
  );
  const fit = calculateSituationFit({
    attributes: incomingEffectiveAttributes,
    attributeWeights: scenario.attributeWeights,
    roleAttributeWeights: roleModifiers,
    // A compatible role is selectable only after the position-group guard.
    // When its preferred attributes are all null, 50 is a positional
    // compatibility baseline rather than a fabricated player attribute.
    roleFit: hasMeasuredRoleAttribute ? undefined : 50,
    roleModifier: instructionFit,
    fitness: incoming.fitness ?? undefined,
    matchupFit,
    risk,
  });
  const explanation = generateExplanation({
    score: fit.score,
    impacts,
    risk,
    roleName: role.name,
  });

  return {
    fit,
    risk,
    impacts,
    explanation,
    positionMismatch,
    instructionFit,
    matchupFit,
    matchupReasons: matchup.reasons,
    effectiveAttributes: {
      outgoing: outgoingEffectiveAttributes,
      incoming: incomingEffectiveAttributes,
    },
    formAdjustments: {
      outgoing: outgoingFormAdjustment,
      incoming: incomingFormAdjustment,
    },
  };
}

export function evaluateBestRole({
  outgoing,
  incoming,
  roles,
  instructions,
  scenario,
}: {
  outgoing: Player;
  incoming: Player;
  roles: Role[];
  instructions: TacticalInstructions;
  scenario: DecisionScenarioContext;
}): BestRoleEvaluation | null {
  const best = roles
    .filter((role) => roleSupportsPlayer(role, incoming))
    .map((role, sourceIndex) => ({
      role,
      sourceIndex,
      evaluation: evaluateDecision({
        outgoing,
        incoming,
        role,
        instructions,
        scenario,
      }),
    }))
    .sort(
      (left, right) =>
        right.evaluation.fit.score - left.evaluation.fit.score ||
        left.sourceIndex - right.sourceIndex,
    )[0];

  return best ? { role: best.role, evaluation: best.evaluation } : null;
}

export function toStoredDecision({
  matchId,
  scenario,
  outgoing,
  incoming,
  role,
  instructions,
}: {
  matchId: string;
  scenario: DecisionScenarioContext;
  outgoing: Player;
  incoming: Player;
  role: Role;
  instructions: TacticalInstructions;
  evaluation: DecisionEvaluation;
}): StoredDecision {
  return {
    version: 3,
    matchId,
    scenarioId: scenario.id,
    selectedTeamId: scenario.selectedTeamId,
    outPlayerId: outgoing.id,
    inPlayerId: incoming.id,
    roleId: role.roleId,
    instructions,
    createdAt: new Date().toISOString(),
  };
}
