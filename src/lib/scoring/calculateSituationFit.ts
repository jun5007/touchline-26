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
 * Weighted player-attribute fit in the 0-100 domain.
 * Missing/invalid configured attributes receive a neutral 50 rather than
 * being treated as zero or silently increasing the remaining weights.
 */
export function calculateAttributeFit(
  attributes: MetricValues,
  weights: MetricWeights,
  fallback = 50,
): number {
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
    const normalized = isFiniteNumber(value)
      ? attributeScoreToPercent(value)
      : safeFallback;
    weightedTotal += normalized * weight;
    totalWeight += weight;
  }

  return totalWeight > 0
    ? clampPercent(weightedTotal / totalWeight, safeFallback)
    : safeFallback;
}

function normalizeComponentWeights(
  overrides: Partial<SituationComponentWeights> | undefined,
): SituationComponentWeights {
  const configured = {
    ...DEFAULT_SITUATION_COMPONENT_WEIGHTS,
    ...overrides,
  };
  const positive = {
    ability:
      isFiniteNumber(configured.ability) && configured.ability > 0
        ? configured.ability
        : 0,
    role:
      isFiniteNumber(configured.role) && configured.role > 0
        ? configured.role
        : 0,
    fitness:
      isFiniteNumber(configured.fitness) && configured.fitness > 0
        ? configured.fitness
        : 0,
    matchup:
      isFiniteNumber(configured.matchup) && configured.matchup > 0
        ? configured.matchup
        : 0,
  };
  const total =
    positive.ability +
    positive.role +
    positive.fitness +
    positive.matchup;

  if (total <= 0) {
    return DEFAULT_SITUATION_COMPONENT_WEIGHTS;
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
  const ability = calculateAttributeFit(
    input.attributes,
    input.attributeWeights,
  );
  const derivedRoleFit = input.roleAttributeWeights
    ? calculateAttributeFit(input.attributes, input.roleAttributeWeights)
    : 50;
  const directRoleFit = isFiniteNumber(input.roleFit)
    ? input.roleFit
    : derivedRoleFit;
  const role = clampPercent(
    directRoleFit + (isFiniteNumber(input.roleModifier) ? input.roleModifier : 0),
  );
  const fitness = clampPercent(input.fitness);
  const matchup = clampPercent(input.matchupFit);
  const componentWeights = normalizeComponentWeights(input.componentWeights);
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
  const warnings =
    typeof input.risk === "object" && input.risk !== null
      ? input.risk.triggered.map((finding) => finding.message)
      : [];

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
    warnings,
  };
}

export function getDecisionGrade(score: unknown): DecisionGrade {
  const safeScore = clampPercent(score, 0);
  if (safeScore >= 90) {
    return "excellent";
  }
  if (safeScore >= 75) {
    return "good";
  }
  if (safeScore >= 60) {
    return "mixed";
  }
  if (safeScore >= 40) {
    return "risky";
  }
  return "weak";
}
