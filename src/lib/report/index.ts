export {
  aggregateGroupStageScores,
  calculateMatchScore,
  calculateOverallScore,
  summarizeReportHighlights,
} from "@/lib/report/aggregation";
export { calculateManagerTendency } from "@/lib/report/tendency";
export type {
  FrequencyStat,
  GroupStageScoreReport,
  InstructionFrequencySummary,
  ManagerTendency,
  RecalculatedReportDecision,
  ReportHighlights,
  ReportMatchDefinition,
  ReportMatchScore,
  ReportMatchStatus,
  TendencyAxes,
  TendencyAxisKey,
} from "@/lib/report/types";
