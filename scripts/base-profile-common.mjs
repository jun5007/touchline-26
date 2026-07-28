import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const PROJECT_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
export const TEAM_IDS = ["kor", "cze", "mex", "rsa"];
export const TEAM_CODES = {
  kor: "KOR",
  cze: "CZE",
  mex: "MEX",
  rsa: "RSA",
};
export const BASE_PERIOD = {
  start: "2025-06-11",
  end: "2026-06-10",
};
export const FIELD_ATTRIBUTE_KEYS = [
  "finishing",
  "chanceCreation",
  "dribbling",
  "passing",
  "pressing",
  "defending",
  "aerial",
  "impact",
];
export const GOALKEEPER_ATTRIBUTE_KEYS = [
  "shotStopping",
  "distribution",
  "aerialCommand",
  "sweeping",
  "penaltySaving",
  "stability",
  "buildUp",
  "impact",
];
export const RAW_METRIC_KEYS = [
  "goals",
  "assists",
  "shots",
  "shotsOnTarget",
  "passesCompleted",
  "passesAttempted",
  "keyPasses",
  "chancesCreated",
  "finalThirdPasses",
  "progressivePasses",
  "progressiveCarries",
  "dribblesCompleted",
  "dribblesAttempted",
  "tackles",
  "interceptions",
  "recoveries",
  "pressures",
  "blocks",
  "clearances",
  "aerialDuelsWon",
  "aerialDuelsAttempted",
  "yellowCards",
  "redCards",
  "substituteAppearances",
  "substituteGoals",
  "substituteAssists",
  "saves",
  "shotsOnTargetFaced",
  "goalsConceded",
  "cleanSheets",
  "longPassesCompleted",
  "longPassesAttempted",
  "crossesClaimed",
  "sweeperActions",
  "penaltiesSaved",
  "penaltiesFaced",
];
const COMMON_REVIEW_SOURCE_IDS = [
  "base-audit-fifa-terms",
  "base-audit-uefa-terms",
  "base-audit-openfootball",
  "base-audit-openligadb",
  "base-audit-wikidata",
  "base-audit-skillcorner-open-data",
  "base-audit-wyscout-events",
  "base-audit-statsbomb-open-data",
  "base-audit-football-data-api",
  "base-audit-sportmonks-api",
  "base-audit-sports-reference-policy",
];
const DOMESTIC_REVIEW_SOURCE_ID = {
  kor: "base-audit-kleague-portal",
  cze: "base-audit-chance-liga-copyright",
  mex: "base-audit-liga-mx-statistics",
  rsa: "base-audit-psl-terms",
};

export function readJson(relativePath) {
  return JSON.parse(
    fs.readFileSync(path.join(PROJECT_ROOT, relativePath), "utf8"),
  );
}

export function writeJson(relativePath, value) {
  const absolutePath = path.join(PROJECT_ROOT, relativePath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, `${JSON.stringify(value, null, 2)}\n`);
}

export function loadGroupAData() {
  const players = readJson("src/data/players/group-a-players.json");
  const scenarios = TEAM_IDS.flatMap((teamId) =>
    readJson(`src/data/scenarios/group-a/${teamId}.json`),
  );
  return { players, scenarios };
}

function emptyUsage() {
  return {
    scenarioIds: new Set(),
    lineupScenarioIds: new Set(),
    benchScenarioIds: new Set(),
    actualDecisionScenarioIds: new Set(),
  };
}

/**
 * P0 is derived only from the existing 13 missions. It is the de-duplicated
 * union of every player that can affect a decision: current lineup, selectable
 * bench, and the result-only observed OUT/IN pair.
 */
export function deriveP0Scope(players, scenarios) {
  const playerById = new Map(players.map((player) => [player.id, player]));
  const usageByPlayerId = new Map();

  function mark(playerId, scenarioId, bucket) {
    if (!playerById.has(playerId)) {
      throw new Error(
        `P0 scope references unknown player ${playerId} in ${scenarioId}`,
      );
    }
    const usage = usageByPlayerId.get(playerId) ?? emptyUsage();
    usage.scenarioIds.add(scenarioId);
    usage[bucket].add(scenarioId);
    usageByPlayerId.set(playerId, usage);
  }

  for (const scenario of scenarios) {
    for (const playerId of scenario.currentLineup ?? []) {
      mark(playerId, scenario.id, "lineupScenarioIds");
    }
    for (const playerId of scenario.benchOptions ?? []) {
      mark(playerId, scenario.id, "benchScenarioIds");
    }
    for (const playerId of [
      scenario.actualDecision?.outPlayerId,
      scenario.actualDecision?.inPlayerId,
    ]) {
      if (typeof playerId === "string") {
        mark(playerId, scenario.id, "actualDecisionScenarioIds");
      }
    }
  }

  return [...usageByPlayerId.entries()]
    .map(([playerId, usage]) => {
      const player = playerById.get(playerId);
      const activeAttributes =
        player.baseProfile.attributes[player.baseProfile.activeAttributeModel];
      return {
        playerId,
        teamId: player.teamId,
        teamCode: TEAM_CODES[player.teamId],
        nameKo: player.nameKo,
        nameEn: player.nameEn,
        officialPosition: player.officialPosition,
        scenarioIds: [...usage.scenarioIds].sort(),
        lineupScenarioIds: [...usage.lineupScenarioIds].sort(),
        benchScenarioIds: [...usage.benchScenarioIds].sort(),
        actualDecisionScenarioIds: [
          ...usage.actualDecisionScenarioIds,
        ].sort(),
        collectionStatus: player.baseProfile.status,
        activeAttributeCount: Object.values(activeAttributes).filter(
          (value) => Number.isInteger(value),
        ).length,
      };
    })
    .sort(
      (left, right) =>
        TEAM_IDS.indexOf(left.teamId) - TEAM_IDS.indexOf(right.teamId) ||
        players.findIndex((player) => player.id === left.playerId) -
          players.findIndex((player) => player.id === right.playerId),
    );
}

export function createEmptyPerformanceProfile(playerId, priority, teamId) {
  return {
    playerId,
    period: { ...BASE_PERIOD },
    priority,
    collectionStatus: "incomplete",
    records: [],
    sourceIds: [],
    reviewedSourceIds: [
      ...COMMON_REVIEW_SOURCE_IDS,
      DOMESTIC_REVIEW_SOURCE_ID[teamId],
    ],
    missingReason:
      "분석 기간과 공개 재사용 권리를 모두 충족하는 선수 단위 성능 출처를 확보하지 못했습니다.",
  };
}
