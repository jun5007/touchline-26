import type { MetricValues, MetricWeights } from "../attributes";

export type { MetricValues, MetricWeights };

export type RiskSeverity = "low" | "medium" | "high";

export type RiskOperator =
  | "eq"
  | "neq"
  | "gt"
  | "gte"
  | "lt"
  | "lte"
  | "between"
  | "includes"
  | "notIncludes"
  | "oneOf"
  | "truthy"
  | "falsy";

export interface RiskCondition {
  /** Dot notation is supported, for example "instructions.defensiveLine". */
  path: string;
  operator: RiskOperator;
  value?: unknown;
}

export interface RiskRule {
  id: string;
  label: string;
  conditions: readonly RiskCondition[];
  match?: "all" | "any";
  penalty: number;
  severity?: RiskSeverity;
  message: string;
  mitigation?: string;
  enabled?: boolean;
}

export type RiskContext = Readonly<Record<string, unknown>>;

export interface RiskFinding {
  id: string;
  label: string;
  penalty: number;
  severity: RiskSeverity;
  message: string;
  mitigation?: string;
}

export interface RiskEvaluation {
  totalPenalty: number;
  triggered: readonly RiskFinding[];
}

export interface SituationComponentWeights {
  ability: number;
  role: number;
  fitness: number;
  matchup: number;
}

export interface SituationFitInput {
  /** Player attributes in the inclusive 1-20 domain. */
  attributes: MetricValues;
  attributeWeights: MetricWeights;
  /**
   * Direct 0-100 role fit. If omitted, roleAttributeWeights are evaluated
   * against the same player attributes.
   */
  roleFit?: number;
  roleAttributeWeights?: MetricWeights;
  /** Percentage-point adjustment supplied by role/scenario data. */
  roleModifier?: number;
  /** Fitness/freshness and opponent matchup are both in the 0-100 domain. */
  fitness?: number;
  matchupFit?: number;
  risk?: number | RiskEvaluation;
  componentWeights?: Partial<SituationComponentWeights>;
}

export interface SituationFitComponents {
  ability: number;
  role: number;
  fitness: number;
  matchup: number;
}

export interface SituationFitResult {
  score: number;
  preRiskScore: number;
  riskPenalty: number;
  components: SituationFitComponents;
  contributions: SituationFitComponents;
  componentWeights: SituationComponentWeights;
  componentAvailability: Readonly<Record<keyof SituationFitComponents, boolean>>;
  warnings: readonly string[];
}

export type CanonicalImpactGauge =
  | "attackThreat"
  | "possessionStability"
  | "defensiveStability"
  | "pressingIntensity";

export interface ImpactGaugeDefinition {
  label: string;
  attributeWeights: MetricWeights;
  fallbackScore?: number;
}

export interface ImpactSnapshot {
  attributes: MetricValues;
  /** Percentage-point modifiers keyed by gauge id. */
  gaugeModifiers?: MetricValues;
}

export interface ImpactDriver {
  key: string;
  label: string;
  delta: number;
}

export interface ImpactGaugeResult {
  id: string;
  label: string;
  before: number;
  after: number;
  delta: number;
  /** False when OUT and IN have no measured attribute in common. */
  available: boolean;
  /** Only these shared attributes contributed to both scores. */
  availableAttributes: readonly string[];
  direction: "increase" | "decrease" | "unchanged";
  reason: string;
  drivers: readonly ImpactDriver[];
}

export type ImpactComparison<GaugeId extends string = string> = Record<
  GaugeId,
  ImpactGaugeResult
>;

export interface CalculateImpactInput<GaugeId extends string = string> {
  before: ImpactSnapshot;
  after: ImpactSnapshot;
  definitions?: Readonly<Record<GaugeId, ImpactGaugeDefinition>>;
  attributeLabels?: Readonly<Record<string, string | undefined>>;
}

export interface ExplanationTemplates {
  scoreExcellent: string;
  scoreGood: string;
  scoreMixed: string;
  scoreRisky: string;
  scoreWeak: string;
  benefitIncrease: string;
  benefitIntent: string;
  riskImpactDecrease: string;
  riskCaution: string;
  mitigationDefault: string;
  alternative: string;
  observedCoachChoice: string;
  observedCoachChoiceInferred: string;
}

export interface AlternativeExplanationInput {
  name: string;
  comparison: string;
}

export interface ObservedCoachChoiceExplanationInput {
  description: string;
  difference?: string;
  isInferred?: boolean;
}

export interface GenerateExplanationInput {
  score: number;
  impacts: Readonly<Record<string, ImpactGaugeResult>>;
  risk: RiskEvaluation;
  roleName?: string;
  alternative?: AlternativeExplanationInput;
  observedCoachChoice?: ObservedCoachChoiceExplanationInput;
  templates?: Partial<ExplanationTemplates>;
  maxItems?: number;
}

export interface DecisionExplanation {
  summary: string;
  benefits: readonly string[];
  risks: readonly string[];
  mitigations: readonly string[];
  alternative?: string;
  observedCoachChoiceComparison?: string;
}

export type DecisionGrade =
  | "excellent"
  | "good"
  | "mixed"
  | "risky"
  | "weak";
