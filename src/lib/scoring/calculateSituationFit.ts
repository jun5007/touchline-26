import {
  attributeScoreToPercent,
  clampPercent,
  isFiniteNumber,
  roundTo,
} from "../attributes";
import type {
  DecisionGrade,
  MetricValues,
  MetricWeights,
  SituationComponentWeights,
  SituationFitInput,
  SituationFitResult,
} from "./types";

export const DEFAULT_SITUATION_COMPONENT_WEIGHTS: SituationComponentWeights =
  {
    ability: 0.6,
    role: 0.2,
    fitness: 0.1,
    matchup: 0.1,
  };

/**
 * Grade bands are calibrated against every legal choice in the two shipped
 * missions. They label relative tactical fit inside this small retrospective
 * model; they do not turn the 0-100 score into a win probability.
 */
export const DECISION_GRADE_MINIMUMS = {
  excellent: 56,
  good: 52,
  mixed: 47,
  risky: 39,
} as const;

interface AttributeFitCalculation {
  score: number;
  available: boolean;
}

/**
 * Weighted player-attribute fit in the 0-100 domain.
 *
 * Missing/invalid configured attributes are excluded. The configured weights
 * of the remaining evidence are renormalized, so a missing value is never
 * converted into a measured neutral rating.
 */
function calculateAttributeFitWithAvailability(
  attributes: MetricValues,
  weights: MetricWeights,
  fallback = 50,
): AttributeFitCalculation {
  const safeFallback = clampPercent(fallback);
  let weightedTotal = 0;
  let totalWeight = 0;

  for (const [attribute, configuredWeight] of Object.entries(weights)) {
    const weight =
      isFiniteNumber(configuredWeight) && configuredWeight > 0
        ? configuredWeight
        : 0;
    if (weight === 0) {
      continue;
    }

    const value = attributes[attribute];
    if (!isFiniteNumber(value)) {
      continue;
    }
    const normalized = attributeScoreToPercent(value);
    weightedTotal += normalized * weight;
    totalWeight += weight;
  }

  return {
    score:
      totalWeight > 0
        ? clampPercent(weightedTotal / totalWeight, safeFallback)
        : safeFallback,
    available: totalWeight > 0,
  };
}

export function calculateAttributeFit(
  attributes: MetricValues,
  weights: MetricWeights,
  fallback = 50,
): number {
  return calculateAttributeFitWithAvailability(
    attributes,
    weights,
    fallback,
  ).score;
}

function normalizeComponentWeights(
  overrides: Partial<SituationComponentWeights> | undefined,
  availability: Readonly<
    Record<keyof SituationComponentWeights, boolean>
  >,
): SituationComponentWeights {
  const configured = {
    ...DEFAULT_SITUATION_COMPONENT_WEIGHTS,
    ...overrides,
  };
  const positive = {
    ability:
      availability.ability &&
      isFiniteNumber(configured.ability) &&
      configured.ability > 0
        ? configured.ability
        : 0,
    role:
      availability.role &&
      isFiniteNumber(configured.role) &&
      configured.role > 0
        ? configured.role
        : 0,
    fitness:
      availability.fitness &&
      isFiniteNumber(configured.fitness) &&
      configured.fitness > 0
        ? configured.fitness
        : 0,
    matchup:
      availability.matchup &&
      isFiniteNumber(configured.matchup) &&
      configured.matchup > 0
        ? configured.matchup
        : 0,
  };
  const total =
    positive.ability +
    positive.role +
    positive.fitness +
    positive.matchup;

  if (total <= 0) {
    return { ability: 0, role: 0, fitness: 0, matchup: 0 };
  }

  return {
    ability: positive.ability / total,
    role: positive.role / total,
    fitness: positive.fitness / total,
    matchup: positive.matchup / total,
  };
}

function getRiskPenalty(risk: SituationFitInput["risk"]): number {
  if (isFiniteNumber(risk)) {
    return clampPercent(risk, 0);
  }
  return clampPercent(risk?.totalPenalty, 0);
}

export function calculateSituationFit(
  input: SituationFitInput,
): SituationFitResult {
  const abilityCalculation = calculateAttributeFitWithAvailability(
    input.attributes,
    input.attributeWeights,
  );
  const roleCalculation = input.roleAttributeWeights
    ? calculateAttributeFitWithAvailability(
        input.attributes,
        input.roleAttributeWeights,
      )
    : { score: 50, available: false };
  const hasDirectRoleFit = isFiniteNumber(input.roleFit);
  const directRoleFit = isFiniteNumber(input.roleFit)
    ? input.roleFit
    : roleCalculation.score;
  const ability = abilityCalculation.score;
  const role = clampPercent(
    directRoleFit + (isFiniteNumber(input.roleModifier) ? input.roleModifier : 0),
  );
  const fitness = clampPercent(input.fitness);
  const matchup = clampPercent(input.matchupFit);
  const componentAvailability = {
    ability: abilityCalculation.available,
    role: hasDirectRoleFit || roleCalculation.available,
    fitness: isFiniteNumber(input.fitness),
    matchup: isFiniteNumber(input.matchupFit),
  };
  const componentWeights = normalizeComponentWeights(
    input.componentWeights,
    componentAvailability,
  );
  const contributions = {
    ability: ability * componentWeights.ability,
    role: role * componentWeights.role,
    fitness: fitness * componentWeights.fitness,
    matchup: matchup * componentWeights.matchup,
  };
  const preRiskScore = clampPercent(
    Object.values(contributions).reduce(
      (total, contribution) => total + contribution,
      0,
    ),
  );
  const riskPenalty = getRiskPenalty(input.risk);
  const score = clampPercent(Math.round(preRiskScore - riskPenalty), 0);
  const warnings = [
    ...(abilityCalculation.available
      ? []
      : ["사용 가능한 선수 능력치가 없어 능력 구성 요소를 점수에서 제외했습니다."]),
    ...(!componentAvailability.role
      ? ["사용 가능한 역할 적합 근거가 없어 역할 구성 요소를 점수에서 제외했습니다."]
      : []),
    ...(!componentAvailability.fitness
      ? ["현재 컨디션 데이터가 없어 체력 구성 요소를 점수에서 제외했습니다."]
      : []),
    ...(!componentAvailability.matchup
      ? ["매치업 데이터가 없어 매치업 구성 요소를 점수에서 제외했습니다."]
      : []),
    ...(typeof input.risk === "object" && input.risk !== null
      ? input.risk.triggered.map((finding) => finding.message)
      : []),
  ];

  return {
    score,
    preRiskScore: roundTo(preRiskScore, 1),
    riskPenalty,
    components: {
      ability: roundTo(ability, 1),
      role: roundTo(role, 1),
      fitness: roundTo(fitness, 1),
      matchup: roundTo(matchup, 1),
    },
    contributions: {
      ability: roundTo(contributions.ability, 1),
      role: roundTo(contributions.role, 1),
      fitness: roundTo(contributions.fitness, 1),
      matchup: roundTo(contributions.matchup, 1),
    },
    componentWeights,
    componentAvailability,
    warnings,
  };
}

export function getDecisionGrade(score: unknown): DecisionGrade {
  const safeScore = clampPercent(score, 0);
  if (safeScore >= DECISION_GRADE_MINIMUMS.excellent) {
    return "excellent";
  }
  if (safeScore >= DECISION_GRADE_MINIMUMS.good) {
    return "good";
  }
  if (safeScore >= DECISION_GRADE_MINIMUMS.mixed) {
    return "mixed";
  }
  if (safeScore >= DECISION_GRADE_MINIMUMS.risky) {
    return "risky";
  }
  return "weak";
}
