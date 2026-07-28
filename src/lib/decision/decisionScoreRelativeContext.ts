export interface DecisionScoreDistribution {
  minScore: number;
  maxScore: number;
  combinationCount: number;
  /**
   * Index 0-100 is the number of legal choices that receive that exact score.
   */
  scoreHistogram: readonly number[];
}

export interface DecisionScoreRelativeContext {
  minScore: number;
  maxScore: number;
  combinationCount: number;
  percentile: number;
  /**
   * Conservative top share: all choices tied with the selected score count
   * together. For example, 10 means "top 10% or better, ties included."
   */
  topPercent: number;
}

export function getDecisionScoreRelativeContext(
  distribution: DecisionScoreDistribution | null,
  selectedScore: number,
): DecisionScoreRelativeContext | null {
  if (!distribution || distribution.combinationCount <= 0) return null;

  const safeScore = Math.max(0, Math.min(100, Math.round(selectedScore)));
  const equalCount = distribution.scoreHistogram[safeScore] ?? 0;
  if (equalCount <= 0) return null;

  const lowerCount = distribution.scoreHistogram
    .slice(0, safeScore)
    .reduce((sum, count) => sum + count, 0);
  const higherCount =
    distribution.combinationCount - lowerCount - equalCount;
  const percentile =
    distribution.combinationCount === 1
      ? 50
      : Math.round(
          ((lowerCount + (equalCount - 1) / 2) /
            (distribution.combinationCount - 1)) *
            100,
        );
  const topPercent = Math.max(
    1,
    Math.ceil(
      ((higherCount + equalCount) / distribution.combinationCount) * 100,
    ),
  );

  return {
    minScore: distribution.minScore,
    maxScore: distribution.maxScore,
    combinationCount: distribution.combinationCount,
    percentile,
    topPercent,
  };
}
