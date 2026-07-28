import type { TacticalInstructions } from "@/data/types";

export interface ReportMatchDefinition {
  matchId: string;
  scenarioIds: readonly string[];
}

/**
 * A validated decision whose score and risk were recalculated from the current
 * repository data. Persisted score, risk, or explanation fields must never be
 * passed through without recalculation.
 */
export interface RecalculatedReportDecision {
  matchId: string;
  scenarioId: string;
  score: number;
  riskPenalty: number;
  roleId: string;
  instructions: TacticalInstructions;
}

export type ReportMatchStatus = "not-started" | "in-progress" | "complete";

export interface ReportMatchScore {
  matchId: string;
  status: ReportMatchStatus;
  matchScore: number | null;
  completedMissionCount: number;
  totalMissionCount: number;
  completedScenarioIds: string[];
  missingScenarioIds: string[];
  /**
   * Only fully completed matches enter the group-stage average. This prevents
   * a partially completed multi-mission match from being cherry-picked.
   */
  includedInOverall: boolean;
}

export interface GroupStageScoreReport {
  matches: ReportMatchScore[];
  overallScore: number | null;
  completedMatchCount: number;
  totalMatchCount: number;
  completedMissionCount: number;
  totalMissionCount: number;
  missingMissionCount: number;
  allMatchesComplete: boolean;
}

export type TendencyAxisKey =
  | "aggression"
  | "stability"
  | "pressing"
  | "control"
  | "width"
  | "central"
  | "riskTaking";

export type TendencyAxes = Record<TendencyAxisKey, number>;

export interface ManagerTendency {
  axes: TendencyAxes;
  topAxes: TendencyAxisKey[];
  label: string;
  decisionCount: number;
  basis:
    | "no-decisions"
    | "tactical-choice-pattern";
  note: string;
}

export interface FrequencyStat<Value extends string = string> {
  value: Value;
  count: number;
}

export type InstructionFrequencySummary = {
  [Key in keyof TacticalInstructions]: FrequencyStat<TacticalInstructions[Key]> | null;
};

export interface ReportHighlights {
  highestRatedDecision: RecalculatedReportDecision | null;
  highestRiskDecision: RecalculatedReportDecision | null;
  mostFrequentRole: FrequencyStat | null;
  mostFrequentInstructions: InstructionFrequencySummary;
}
