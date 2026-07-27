import { clamp, isFiniteNumber } from "../attributes";
import type {
  RiskCondition,
  RiskContext,
  RiskEvaluation,
  RiskFinding,
  RiskRule,
} from "./types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function readRiskContextValue(
  context: RiskContext,
  path: string,
): unknown {
  if (Object.prototype.hasOwnProperty.call(context, path)) {
    return context[path];
  }

  let current: unknown = context;
  for (const segment of path.split(".")) {
    if (!isRecord(current) && !Array.isArray(current)) {
      return undefined;
    }

    if (Array.isArray(current)) {
      const index = Number(segment);
      if (!Number.isInteger(index)) {
        return undefined;
      }
      current = current[index];
    } else {
      current = current[segment];
    }
  }
  return current;
}

function includesValue(container: unknown, expected: unknown): boolean {
  if (typeof container === "string" && typeof expected === "string") {
    return container.includes(expected);
  }
  if (Array.isArray(container)) {
    return container.some((item) => Object.is(item, expected));
  }
  return false;
}

export function evaluateRiskCondition(
  condition: RiskCondition,
  context: RiskContext,
): boolean {
  const actual = readRiskContextValue(context, condition.path);
  const expected = condition.value;

  switch (condition.operator) {
    case "eq":
      return Object.is(actual, expected);
    case "neq":
      return !Object.is(actual, expected);
    case "gt":
      return (
        isFiniteNumber(actual) &&
        isFiniteNumber(expected) &&
        actual > expected
      );
    case "gte":
      return (
        isFiniteNumber(actual) &&
        isFiniteNumber(expected) &&
        actual >= expected
      );
    case "lt":
      return (
        isFiniteNumber(actual) &&
        isFiniteNumber(expected) &&
        actual < expected
      );
    case "lte":
      return (
        isFiniteNumber(actual) &&
        isFiniteNumber(expected) &&
        actual <= expected
      );
    case "between":
      return (
        isFiniteNumber(actual) &&
        Array.isArray(expected) &&
        expected.length >= 2 &&
        isFiniteNumber(expected[0]) &&
        isFiniteNumber(expected[1]) &&
        actual >= Math.min(expected[0], expected[1]) &&
        actual <= Math.max(expected[0], expected[1])
      );
    case "includes":
      return includesValue(actual, expected);
    case "notIncludes":
      return !includesValue(actual, expected);
    case "oneOf":
      return (
        Array.isArray(expected) &&
        expected.some((item) => Object.is(actual, item))
      );
    case "truthy":
      return Boolean(actual);
    case "falsy":
      return !actual;
  }
}

export function isRiskRuleTriggered(
  rule: RiskRule,
  context: RiskContext,
): boolean {
  if (rule.enabled === false || rule.conditions.length === 0) {
    return false;
  }

  const results = rule.conditions.map((condition) =>
    evaluateRiskCondition(condition, context),
  );
  return rule.match === "any"
    ? results.some(Boolean)
    : results.every(Boolean);
}

export interface CalculateRiskInput {
  context: RiskContext;
  rules: readonly RiskRule[];
  maxPenalty?: number;
}

export function calculateRisk({
  context,
  rules,
  maxPenalty = 100,
}: CalculateRiskInput): RiskEvaluation {
  const safeMaximum = clamp(
    maxPenalty,
    0,
    Number.MAX_SAFE_INTEGER,
    100,
  );
  const triggered: RiskFinding[] = [];

  for (const rule of rules) {
    if (!isRiskRuleTriggered(rule, context)) {
      continue;
    }

    triggered.push({
      id: rule.id,
      label: rule.label,
      penalty: clamp(rule.penalty, 0, safeMaximum, 0),
      severity: rule.severity ?? "medium",
      message: rule.message,
      mitigation: rule.mitigation,
    });
  }

  const totalPenalty = clamp(
    triggered.reduce((total, finding) => total + finding.penalty, 0),
    0,
    safeMaximum,
    0,
  );

  return { totalPenalty, triggered };
}

