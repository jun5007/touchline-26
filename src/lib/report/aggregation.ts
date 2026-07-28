import type { TacticalInstructions } from "@/data/types";
import type {
  FrequencyStat,
  GroupStageScoreReport,
  InstructionFrequencySummary,
  RecalculatedReportDecision,
  ReportHighlights,
  ReportMatchDefinition,
  ReportMatchScore,
} from "@/lib/report/types";

function roundToOneDecimal(value: number): number {
  return Math.round((value + Number.EPSILON) * 10) / 10;
}

function isValidScore(value: number): boolean {
  return Number.isFinite(value) && value >= 0 && value <= 100;
}

export function calculateMatchScore(
  completedMissionScores: readonly number[],
): number | null {
  const validScores = completedMissionScores.filter(isValidScore);
  if (validScores.length === 0) return null;
  return roundToOneDecimal(
    validScores.reduce((sum, score) => sum + score, 0) / validScores.length,
  );
}

/**
 * Calculates the group-stage average only when every expected match has a
 * complete score. Each match then contributes one value regardless of how
 * many missions it contains.
 */
export function calculateOverallScore(
  matchScores: readonly (number | null)[],
): number | null {
  if (
    matchScores.length === 0 ||
    matchScores.some((score) => score === null || !isValidScore(score))
  ) {
    return null;
  }
  return calculateMatchScore(matchScores as readonly number[]);
}

function decisionKey(matchId: string, scenarioId: string): string {
  return `${matchId}\u0000${scenarioId}`;
}

export function aggregateGroupStageScores(
  matches: readonly ReportMatchDefinition[],
  decisions: readonly RecalculatedReportDecision[],
): GroupStageScoreReport {
  const decisionByMission = new Map<string, RecalculatedReportDecision>();
  for (const decision of decisions) {
    if (!isValidScore(decision.score)) continue;
    decisionByMission.set(
      decisionKey(decision.matchId, decision.scenarioId),
      decision,
    );
  }

  const matchReports: ReportMatchScore[] = matches.map((match) => {
    const uniqueScenarioIds = [...new Set(match.scenarioIds)];
    const completedDecisions = uniqueScenarioIds.flatMap((scenarioId) => {
      const decision = decisionByMission.get(
        decisionKey(match.matchId, scenarioId),
      );
      return decision ? [decision] : [];
    });
    const completedScenarioIds = completedDecisions.map(
      (decision) => decision.scenarioId,
    );
    const completedSet = new Set(completedScenarioIds);
    const missingScenarioIds = uniqueScenarioIds.filter(
      (scenarioId) => !completedSet.has(scenarioId),
    );
    const completedMissionCount = completedScenarioIds.length;
    const totalMissionCount = uniqueScenarioIds.length;
    const status =
      completedMissionCount === 0
        ? "not-started"
        : completedMissionCount === totalMissionCount && totalMissionCount > 0
          ? "complete"
          : "in-progress";

    return {
      matchId: match.matchId,
      status,
      matchScore: calculateMatchScore(
        completedDecisions.map((decision) => decision.score),
      ),
      completedMissionCount,
      totalMissionCount,
      completedScenarioIds,
      missingScenarioIds,
      includedInOverall: status === "complete",
    };
  });

  const matchScoresForOverall = matchReports.map((match) =>
    match.includedInOverall ? match.matchScore : null,
  );
  const totalMissionCount = matchReports.reduce(
    (sum, match) => sum + match.totalMissionCount,
    0,
  );
  const completedMissionCount = matchReports.reduce(
    (sum, match) => sum + match.completedMissionCount,
    0,
  );
  const completedMatchCount = matchReports.filter(
    (match) => match.includedInOverall,
  ).length;

  return {
    matches: matchReports,
    overallScore: calculateOverallScore(matchScoresForOverall),
    completedMatchCount,
    totalMatchCount: matchReports.length,
    completedMissionCount,
    totalMissionCount,
    missingMissionCount: totalMissionCount - completedMissionCount,
    allMatchesComplete:
      matchReports.length > 0 && completedMatchCount === matchReports.length,
  };
}

function mostFrequent<Value extends string>(
  values: readonly Value[],
): FrequencyStat<Value> | null {
  if (values.length === 0) return null;
  const counts = new Map<Value, number>();
  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort(
      (left, right) =>
        right.count - left.count ||
        left.value.localeCompare(right.value, "en"),
    )[0] ?? null;
}

function bestDecision(
  decisions: readonly RecalculatedReportDecision[],
  metric: "score" | "riskPenalty",
): RecalculatedReportDecision | null {
  return (
    [...decisions].sort(
      (left, right) =>
        right[metric] - left[metric] ||
        left.matchId.localeCompare(right.matchId, "en") ||
        left.scenarioId.localeCompare(right.scenarioId, "en"),
    )[0] ?? null
  );
}

export function summarizeReportHighlights(
  decisions: readonly RecalculatedReportDecision[],
): ReportHighlights {
  const instructionKeys = [
    "attackDirection",
    "pressing",
    "defensiveLine",
    "mentality",
  ] as const satisfies ReadonlyArray<keyof TacticalInstructions>;
  const mostFrequentInstructions = Object.fromEntries(
    instructionKeys.map((key) => [
      key,
      mostFrequent(decisions.map((decision) => decision.instructions[key])),
    ]),
  ) as InstructionFrequencySummary;

  return {
    highestRatedDecision: bestDecision(decisions, "score"),
    highestRiskDecision: bestDecision(decisions, "riskPenalty"),
    mostFrequentRole: mostFrequent(
      decisions.map((decision) => decision.roleId),
    ),
    mostFrequentInstructions,
  };
}
