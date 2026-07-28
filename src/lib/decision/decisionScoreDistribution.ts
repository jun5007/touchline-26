import { createHash } from "node:crypto";
import generatedScoreDistributionsData from "@/data/generated/decision-score-distributions.json";
import type {
  DecisionScenarioContext,
  InstructionCategory,
  Player,
  Role,
  TacticalInstructions,
} from "@/data/types";
import { evaluateDecision } from "@/lib/decision/evaluateDecision";
import { roleSupportsPlayer } from "@/lib/decision/positionCompatibility";
import {
  getDecisionScoreRelativeContext,
  type DecisionScoreDistribution,
  type DecisionScoreRelativeContext,
} from "@/lib/decision/decisionScoreRelativeContext";

const validInstructionIds = {
  attackDirection: ["left", "centre", "right", "balanced"],
  pressing: ["low", "medium", "high"],
  defensiveLine: ["low", "medium", "high"],
  mentality: ["safe", "balanced", "attacking"],
} as const satisfies {
  [Key in keyof TacticalInstructions]: readonly TacticalInstructions[Key][];
};

export {
  getDecisionScoreRelativeContext,
  type DecisionScoreDistribution,
  type DecisionScoreRelativeContext,
};

export interface LegalDecisionScoreDistributionInput {
  scenario: DecisionScenarioContext;
  lineupPlayers: readonly Player[];
  benchPlayers: readonly Player[];
  roles: readonly Role[];
  instructionCategories: readonly InstructionCategory[];
}

export const SCORE_DISTRIBUTION_ARTIFACT_VERSION = 1;
const SCORE_DISTRIBUTION_CACHE_VERSION = 2;
const MAX_SCORE_DISTRIBUTION_CACHE_ENTRIES = 32;
const scoreDistributionCache = new Map<
  string,
  DecisionScoreDistribution | null
>();

interface GeneratedScoreDistributionEntry {
  inputHash: string;
  distribution: DecisionScoreDistribution;
}

interface GeneratedScoreDistributionArtifact {
  schemaVersion: number;
  entries: Record<string, GeneratedScoreDistributionEntry>;
}

const generatedScoreDistributions =
  generatedScoreDistributionsData as GeneratedScoreDistributionArtifact;

function createScoreDistributionCacheKey(
  input: LegalDecisionScoreDistributionInput,
): string | null {
  try {
    return JSON.stringify([
      SCORE_DISTRIBUTION_CACHE_VERSION,
      input.scenario,
      input.lineupPlayers,
      input.benchPlayers,
      input.roles,
      input.instructionCategories,
    ]);
  } catch {
    // Unexpected non-serializable test or caller data remains calculable;
    // it simply bypasses memoization.
    return null;
  }
}

export function createScoreDistributionInputHash(
  input: LegalDecisionScoreDistributionInput,
): string | null {
  const cacheKey = createScoreDistributionCacheKey(input);
  return cacheKey === null
    ? null
    : createHash("sha256").update(cacheKey).digest("hex");
}

export function createScoreDistributionArtifactKey(
  scenario: DecisionScenarioContext,
) {
  return `${scenario.matchId}:${scenario.id}`;
}

function isValidDistribution(
  distribution: DecisionScoreDistribution,
): boolean {
  if (
    !Number.isInteger(distribution.minScore) ||
    !Number.isInteger(distribution.maxScore) ||
    distribution.minScore < 0 ||
    distribution.maxScore > 100 ||
    distribution.minScore > distribution.maxScore ||
    !Number.isInteger(distribution.combinationCount) ||
    distribution.combinationCount <= 0 ||
    !Array.isArray(distribution.scoreHistogram) ||
    distribution.scoreHistogram.length !== 101
  ) {
    return false;
  }

  let histogramTotal = 0;
  for (const count of distribution.scoreHistogram) {
    if (!Number.isInteger(count) || count < 0) return false;
    histogramTotal += count;
  }
  return histogramTotal === distribution.combinationCount;
}

function readGeneratedScoreDistribution(
  input: LegalDecisionScoreDistributionInput,
  cacheKey: string,
): DecisionScoreDistribution | null | undefined {
  if (
    generatedScoreDistributions.schemaVersion !==
    SCORE_DISTRIBUTION_ARTIFACT_VERSION
  ) {
    return undefined;
  }
  const entry =
    generatedScoreDistributions.entries[
      createScoreDistributionArtifactKey(input.scenario)
    ];
  if (
    !entry ||
    entry.inputHash !==
      createHash("sha256").update(cacheKey).digest("hex") ||
    !isValidDistribution(entry.distribution)
  ) {
    return undefined;
  }
  return cacheScoreDistribution(cacheKey, entry.distribution);
}

function readCachedScoreDistribution(
  cacheKey: string,
): DecisionScoreDistribution | null | undefined {
  const cached = scoreDistributionCache.get(cacheKey);
  if (cached === undefined) return undefined;

  // Refresh insertion order so the bounded cache evicts the least-recently
  // used scenario value when a long-running process sees edited input data.
  scoreDistributionCache.delete(cacheKey);
  scoreDistributionCache.set(cacheKey, cached);
  return cached;
}

function cacheScoreDistribution(
  cacheKey: string,
  distribution: DecisionScoreDistribution | null,
): DecisionScoreDistribution | null {
  if (scoreDistributionCache.size >= MAX_SCORE_DISTRIBUTION_CACHE_ENTRIES) {
    const oldestKey = scoreDistributionCache.keys().next().value;
    if (oldestKey !== undefined) scoreDistributionCache.delete(oldestKey);
  }

  const cachedDistribution = distribution
    ? Object.freeze({
        ...distribution,
        scoreHistogram: Object.freeze([...distribution.scoreHistogram]),
      })
    : null;
  scoreDistributionCache.set(cacheKey, cachedDistribution);
  return cachedDistribution;
}

function getInstructionOptionIds<Key extends keyof TacticalInstructions>(
  categories: readonly InstructionCategory[],
  key: Key,
): TacticalInstructions[Key][] {
  const allowedIds = validInstructionIds[key] as readonly string[];
  const category = categories.find((candidate) => candidate.id === key);
  if (!category) return [];

  return [
    ...new Set(
      category.options.flatMap((option) =>
        allowedIds.includes(option.id)
          ? [option.id as TacticalInstructions[Key]]
          : [],
      ),
    ),
  ];
}

export function buildLegalInstructionCombinations(
  categories: readonly InstructionCategory[],
): TacticalInstructions[] {
  const attackDirections = getInstructionOptionIds(
    categories,
    "attackDirection",
  );
  const pressingOptions = getInstructionOptionIds(categories, "pressing");
  const defensiveLines = getInstructionOptionIds(
    categories,
    "defensiveLine",
  );
  const mentalities = getInstructionOptionIds(categories, "mentality");
  const combinations: TacticalInstructions[] = [];

  for (const attackDirection of attackDirections) {
    for (const pressing of pressingOptions) {
      for (const defensiveLine of defensiveLines) {
        for (const mentality of mentalities) {
          combinations.push({
            attackDirection,
            pressing,
            defensiveLine,
            mentality,
          });
        }
      }
    }
  }

  return combinations;
}

function uniquePlayersWithin(
  players: readonly Player[],
  allowedIds: ReadonlySet<string>,
): Player[] {
  const seen = new Set<string>();
  return players.filter((player) => {
    if (!allowedIds.has(player.id) || seen.has(player.id)) return false;
    seen.add(player.id);
    return true;
  });
}

function uniqueRoles(roles: readonly Role[]): Role[] {
  const seen = new Set<string>();
  return roles.filter((role) => {
    if (seen.has(role.roleId)) return false;
    seen.add(role.roleId);
    return true;
  });
}

/**
 * Enumerates every choice the current tactics UI can legally confirm:
 * scenario lineup OUT × scenario bench IN × compatible role × valid team
 * instructions. Every score comes from evaluateDecision; this function does
 * not introduce a second scoring formula.
 */
export function calculateLegalDecisionScoreDistributionFresh({
  scenario,
  lineupPlayers,
  benchPlayers,
  roles,
  instructionCategories,
}: LegalDecisionScoreDistributionInput): DecisionScoreDistribution | null {
  if (
    !Number.isInteger(scenario.substitutionsRemaining) ||
    scenario.substitutionsRemaining <= 0
  ) {
    return null;
  }

  const allowedLineupIds = new Set(
    scenario.currentLineup.map((spot) => spot.playerId),
  );
  const allowedBenchIds = new Set(scenario.benchOptions);
  const outgoingPlayers = uniquePlayersWithin(
    lineupPlayers,
    allowedLineupIds,
  );
  const incomingPlayers = uniquePlayersWithin(benchPlayers, allowedBenchIds);
  const roleCatalog = uniqueRoles(roles);
  const instructionCombinations = buildLegalInstructionCombinations(
    instructionCategories,
  );
  if (
    outgoingPlayers.length === 0 ||
    incomingPlayers.length === 0 ||
    instructionCombinations.length === 0
  ) {
    return null;
  }

  const incomingOptions = incomingPlayers.map((player) => ({
    player,
    roles: roleCatalog.filter((role) => roleSupportsPlayer(role, player)),
  }));
  const scoreHistogram = Array.from({ length: 101 }, () => 0);
  let combinationCount = 0;
  let minScore = 100;
  let maxScore = 0;

  for (const outgoing of outgoingPlayers) {
    for (const { player: incoming, roles: allowedRoles } of incomingOptions) {
      if (outgoing.id === incoming.id) continue;
      for (const role of allowedRoles) {
        for (const instructions of instructionCombinations) {
          const score = evaluateDecision({
            outgoing,
            incoming,
            role,
            instructions,
            scenario,
          }).fit.score;
          const safeScore = Math.max(0, Math.min(100, Math.round(score)));
          scoreHistogram[safeScore] += 1;
          combinationCount += 1;
          minScore = Math.min(minScore, safeScore);
          maxScore = Math.max(maxScore, safeScore);
        }
      }
    }
  }

  return combinationCount > 0
    ? { minScore, maxScore, combinationCount, scoreHistogram }
    : null;
}

/**
 * Production lookup order:
 * 1. process-local LRU;
 * 2. build-verified static distribution for a matching full input hash;
 * 3. fresh evaluation fallback when inputs changed or are non-serializable.
 *
 * The fallback keeps edited data functional, while the prebuild verification
 * prevents stale generated values from reaching a release build.
 */
export function calculateLegalDecisionScoreDistribution(
  input: LegalDecisionScoreDistributionInput,
): DecisionScoreDistribution | null {
  if (
    !Number.isInteger(input.scenario.substitutionsRemaining) ||
    input.scenario.substitutionsRemaining <= 0
  ) {
    return null;
  }

  const cacheKey = createScoreDistributionCacheKey(input);
  if (cacheKey) {
    const cached = readCachedScoreDistribution(cacheKey);
    if (cached !== undefined) return cached;
    const generated = readGeneratedScoreDistribution(input, cacheKey);
    if (generated !== undefined) return generated;
  }

  const distribution = calculateLegalDecisionScoreDistributionFresh(input);
  return cacheKey
    ? cacheScoreDistribution(cacheKey, distribution)
    : distribution;
}
