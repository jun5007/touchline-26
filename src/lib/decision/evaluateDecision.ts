import { getInstructions } from "@/data/repository";
import type {
  InstructionCategory,
  Player,
  Role,
  Scenario,
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

export const ATTRIBUTE_LABELS: Record<string, string> = {
  finishing: "골 결정력",
  chanceCreation: "찬스 창출",
  dribbling: "드리블",
  passing: "패스",
  pressing: "압박",
  defending: "수비 기여",
  aerial: "제공권",
  impact: "임팩트",
};

const ROLE_GAUGE_MODIFIERS: Record<
  string,
  Record<
    "attackThreat" | "possessionStability" | "defensiveStability" | "pressingIntensity",
    number
  >
> = {
  "inside-forward": {
    attackThreat: 5,
    possessionStability: -1,
    defensiveStability: -2,
    pressingIntensity: 1,
  },
  winger: {
    attackThreat: 3,
    possessionStability: 1,
    defensiveStability: -1,
    pressingIntensity: 2,
  },
  "target-striker": {
    attackThreat: 6,
    possessionStability: -1,
    defensiveStability: 0,
    pressingIntensity: -2,
  },
  "advanced-forward": {
    attackThreat: 7,
    possessionStability: -2,
    defensiveStability: -2,
    pressingIntensity: 2,
  },
  playmaker: {
    attackThreat: 3,
    possessionStability: 5,
    defensiveStability: -1,
    pressingIntensity: -1,
  },
  "box-to-box": {
    attackThreat: 2,
    possessionStability: 2,
    defensiveStability: 2,
    pressingIntensity: 5,
  },
  "holding-midfielder": {
    attackThreat: -3,
    possessionStability: 4,
    defensiveStability: 7,
    pressingIntensity: 2,
  },
  "attacking-fullback": {
    attackThreat: 4,
    possessionStability: 1,
    defensiveStability: -4,
    pressingIntensity: 2,
  },
  "defensive-fullback": {
    attackThreat: -3,
    possessionStability: 2,
    defensiveStability: 6,
    pressingIntensity: 1,
  },
  "centre-back": {
    attackThreat: -4,
    possessionStability: 1,
    defensiveStability: 7,
    pressingIntensity: 0,
  },
  "ball-playing-centre-back": {
    attackThreat: -2,
    possessionStability: 5,
    defensiveStability: 4,
    pressingIntensity: 0,
  },
};

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
    label: "낮은 데이터 신뢰도",
    conditions: [
      { path: "incomingConfidence", operator: "lt", value: 0.35 },
    ],
    penalty: 5,
    severity: "low",
    message: "투입 선수의 이 경기 표본이 짧아 퍼포먼스 스탯의 불확실성이 큽니다.",
    mitigation: "점수 차이를 절대값보다 선택 의도와 위험 범위로 해석하세요.",
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
  const totals = {
    attackThreat: 0,
    possessionStability: 0,
    defensiveStability: 0,
    pressingIntensity: 0,
  };
  let fitModifier = 0;

  for (const category of categories) {
    const selectedId = values[category.id];
    const option = category.options.find((candidate) => candidate.id === selectedId);
    if (!option) continue;
    fitModifier += option.fitModifier;
    for (const key of Object.keys(totals) as Array<keyof typeof totals>) {
      totals[key] += option.impactModifiers[key];
    }
  }

  return { totals, fitModifier };
}

function getRoleAttributeWeights(role: Role) {
  return Object.fromEntries(
    role.preferredAttributes.map((attribute, index) => [
      attribute,
      Math.max(1, role.preferredAttributes.length - index) *
        (role.fitModifiers[attribute] ?? 1),
    ]),
  );
}

function getMatchupFit(player: Player, scenario: Scenario, role: Role) {
  let fit = 58;
  if (scenario.scoreState === "level") {
    if (player.positionGroup === "STRIKER") fit += 10;
    if (player.positionGroup === "WINGER") fit += 6;
    if (["target-striker", "advanced-forward", "inside-forward"].includes(role.roleId)) fit += 7;
    if (player.tags.includes("박스 타깃")) fit += 5;
    if (player.tags.includes("낮은 블록 공략")) fit += 4;
  }
  if (scenario.scoreState === "leading") {
    if (player.positionGroup === "DM") fit += 13;
    if (player.positionGroup === "CM_AM") fit += 8;
    if (player.positionGroup === "CB") fit += 9;
    if (["holding-midfielder", "box-to-box", "defensive-fullback"].includes(role.roleId)) fit += 7;
    if (player.tags.includes("수비 안정")) fit += 5;
    if (player.positionGroup === "STRIKER") fit -= 7;
  }
  return Math.max(0, Math.min(100, fit));
}

export function isPositionMismatch(outgoing: Player, incoming: Player): boolean {
  if (outgoing.positionGroup === incoming.positionGroup) return false;
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
  return !compatiblePairs.has(`${outgoing.positionGroup}:${incoming.positionGroup}`);
}

export interface DecisionEvaluation {
  fit: SituationFitResult;
  risk: RiskEvaluation;
  impacts: ImpactComparison<
    "attackThreat" | "possessionStability" | "defensiveStability" | "pressingIntensity"
  >;
  explanation: ReturnType<typeof generateExplanation>;
  positionMismatch: boolean;
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
  scenario: Scenario;
}): DecisionEvaluation {
  const positionMismatch = isPositionMismatch(outgoing, incoming);
  const scenarioRiskRules = RISK_RULES.filter((rule) =>
    scenario.riskRules.includes(rule.id),
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
  const roleModifiers = ROLE_GAUGE_MODIFIERS[role.roleId] ?? {
    attackThreat: 0,
    possessionStability: 0,
    defensiveStability: 0,
    pressingIntensity: 0,
  };
  const afterGaugeModifiers = Object.fromEntries(
    (Object.keys(roleModifiers) as Array<keyof typeof roleModifiers>).map((key) => [
      key,
      instructionModifiers.totals[key] + roleModifiers[key],
    ]),
  );

  const impacts = calculateImpact({
    before: {
      attributes: outgoing.attributes,
      gaugeModifiers: defaultModifiers.totals,
    },
    after: {
      attributes: incoming.attributes,
      gaugeModifiers: afterGaugeModifiers,
    },
    attributeLabels: ATTRIBUTE_LABELS,
  });

  const fit = calculateSituationFit({
    attributes: incoming.attributes,
    attributeWeights: scenario.attributeWeights,
    roleAttributeWeights: getRoleAttributeWeights(role),
    roleModifier: Math.min(8, instructionModifiers.fitModifier),
    fitness: incoming.fitness,
    matchupFit: getMatchupFit(incoming, scenario, role),
    risk,
  });
  const explanation = generateExplanation({
    score: fit.score,
    impacts,
    risk,
    roleName: role.name,
  });

  return { fit, risk, impacts, explanation, positionMismatch };
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
  scenario: Scenario;
}): BestRoleEvaluation | null {
  return roles
    .filter((role) =>
      role.allowedPositionGroups.includes(incoming.positionGroup),
    )
    .map((role) => ({
      role,
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
        left.role.roleId.localeCompare(right.role.roleId),
    )[0] ?? null;
}

export function toStoredDecision({
  matchId,
  scenario,
  outgoing,
  incoming,
  role,
  instructions,
  evaluation,
}: {
  matchId: string;
  scenario: Scenario;
  outgoing: Player;
  incoming: Player;
  role: Role;
  instructions: TacticalInstructions;
  evaluation: DecisionEvaluation;
}): StoredDecision {
  return {
    version: 1,
    matchId,
    scenarioId: scenario.id,
    outPlayerId: outgoing.id,
    inPlayerId: incoming.id,
    roleId: role.roleId,
    instructions,
    score: evaluation.fit.score,
    riskPenalty: evaluation.risk.totalPenalty,
    impactsBefore: Object.fromEntries(
      Object.entries(evaluation.impacts).map(([key, value]) => [key, value.before]),
    ),
    impactsAfter: Object.fromEntries(
      Object.entries(evaluation.impacts).map(([key, value]) => [key, value.after]),
    ),
    explanation: {
      benefits: [...evaluation.explanation.benefits],
      risks: [...evaluation.explanation.risks],
      remedies: [...evaluation.explanation.mitigations],
      summary: evaluation.explanation.summary,
    },
    createdAt: new Date().toISOString(),
  };
}
