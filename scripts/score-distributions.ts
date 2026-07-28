import {
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import {
  getDecisionScenarioContext,
  getInstructions,
  getMatches,
  getPlayersByIds,
  getRoles,
  getScenariosForMatch,
} from "../src/data/repository";
import {
  SCORE_DISTRIBUTION_ARTIFACT_VERSION,
  calculateLegalDecisionScoreDistributionFresh,
  createScoreDistributionArtifactKey,
  createScoreDistributionInputHash,
  type DecisionScoreDistribution,
} from "../src/lib/decision/decisionScoreDistribution";

interface ScoreDistributionArtifact {
  schemaVersion: number;
  entries: Record<
    string,
    {
      inputHash: string;
      distribution: DecisionScoreDistribution;
    }
  >;
}

const projectRoot = path.resolve(__dirname, "..");
const outputPath = path.join(
  projectRoot,
  "src",
  "data",
  "generated",
  "decision-score-distributions.json",
);
const writeMode = process.argv.includes("--write");
const startedAt = performance.now();
const entries: ScoreDistributionArtifact["entries"] = {};
let totalCombinationCount = 0;

const scenarios = getMatches()
  .flatMap((match) => getScenariosForMatch(match.id))
  .sort((left, right) =>
    createScoreDistributionArtifactKey(
      getDecisionScenarioContext(left),
    ).localeCompare(
      createScoreDistributionArtifactKey(getDecisionScenarioContext(right)),
    )
  );

for (const scenario of scenarios) {
  const scenarioContext = getDecisionScenarioContext(scenario);
  const input = {
    scenario: scenarioContext,
    lineupPlayers: getPlayersByIds(
      scenario.currentLineup.map((spot) => spot.playerId),
      scenario,
    ),
    benchPlayers: getPlayersByIds(scenario.benchOptions, scenario),
    roles: getRoles(),
    instructionCategories: getInstructions(),
  };
  const inputHash = createScoreDistributionInputHash(input);
  const distribution = calculateLegalDecisionScoreDistributionFresh(input);
  if (!inputHash || !distribution) {
    throw new Error(
      `Could not generate a legal score distribution for ${scenario.id}.`,
    );
  }

  entries[createScoreDistributionArtifactKey(scenarioContext)] = {
    inputHash,
    distribution,
  };
  totalCombinationCount += distribution.combinationCount;
}

if (scenarios.length !== 13 || Object.keys(entries).length !== 13) {
  throw new Error(
    `Expected 13 canonical scenarios, received ${scenarios.length}.`,
  );
}

const artifact: ScoreDistributionArtifact = {
  schemaVersion: SCORE_DISTRIBUTION_ARTIFACT_VERSION,
  entries,
};
const serializedArtifact = `${JSON.stringify(artifact, null, 2)}\n`;
const elapsedMs = performance.now() - startedAt;

if (writeMode) {
  mkdirSync(path.dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, serializedArtifact, "utf8");
  console.log(`Generated: ${outputPath}`);
} else {
  const existingArtifact = readFileSync(outputPath, "utf8");
  if (existingArtifact !== serializedArtifact) {
    console.error(
      "Score distribution artifact is stale. Run npm run score-distribution:generate and review the diff.",
    );
    process.exitCode = 1;
  } else {
    console.log(`Verified: ${outputPath}`);
  }
}

console.log(`Scenarios: ${scenarios.length}`);
console.log(`Legal combinations: ${totalCombinationCount}`);
console.log(`Fresh evaluation: ${elapsedMs.toFixed(3)}ms`);
