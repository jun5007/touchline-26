/* eslint-disable @typescript-eslint/no-require-imports --
 * This CLI intentionally uses the repository's synchronous TypeScript loader. */
const fs = require("node:fs");
const path = require("node:path");

const {
  buildGroupABaseProfiles,
} = require("../src/lib/attributes/buildGroupABaseProfiles.ts");

const TEAM_IDS = ["kor", "cze", "mex", "rsa"];
const PROJECT_ROOT = path.resolve(__dirname, "..");
const PLAYER_FILE = path.join(
  PROJECT_ROOT,
  "src",
  "data",
  "players",
  "group-a-players.json",
);

function readJson(relativePath) {
  return JSON.parse(
    fs.readFileSync(path.join(PROJECT_ROOT, relativePath), "utf8"),
  );
}

function readPerformanceProfiles(domain) {
  return TEAM_IDS.flatMap((teamId) =>
    readJson(`src/data/${domain}-performance/${teamId}.json`),
  );
}

function fail(message) {
  console.error(`BASE PROFILE generation FAILED: ${message}`);
  process.exitCode = 1;
}

function main() {
  const args = new Set(process.argv.slice(2));
  const unknownArgs = [...args].filter((arg) => arg !== "--write");
  if (unknownArgs.length > 0) {
    throw new Error(`지원하지 않는 인자: ${unknownArgs.join(", ")}`);
  }
  const write = args.has("--write");
  const players = readJson("src/data/players/group-a-players.json");
  const result = buildGroupABaseProfiles({
    players,
    clubProfiles: readPerformanceProfiles("club"),
    nationalProfiles: readPerformanceProfiles("national"),
    sources: readJson("src/data/sources/sourceRegistry.json"),
    leagueStrength: readJson("src/data/leagues/league-strength.json"),
  });
  const changedPlayerIds = result.players
    .filter(
      (player, index) =>
        JSON.stringify(player.baseProfile) !==
        JSON.stringify(players[index]?.baseProfile),
    )
    .map((player) => player.id);

  console.log(
    `BASE PROFILE generation ${write ? "write" : "dry-run"} PASSED`,
  );
  console.log(
    `- eligibleRecords=${result.eligiblePerformanceRecordCount}, generated=${result.generatedPlayerIds.length}, preserved=${result.preservedPlayerIds.length}`,
  );
  console.log(
    `- changedPlayers=${changedPlayerIds.length}, activeAttributes=${result.activeAttributeCount}/${result.players.length * 8}`,
  );

  if (!write) {
    console.log(
      changedPlayerIds.length > 0
        ? "- no files written; inspect the raw records, then rerun with --write"
        : "- no files written; current player profiles already match the safe build result",
    );
    return;
  }

  if (changedPlayerIds.length === 0) {
    console.log("- no write needed");
    return;
  }
  fs.writeFileSync(
    PLAYER_FILE,
    `${JSON.stringify(result.players, null, 2)}\n`,
    "utf8",
  );
  console.log(`- wrote ${path.relative(PROJECT_ROOT, PLAYER_FILE)}`);
}

try {
  main();
} catch (error) {
  fail(error instanceof Error ? error.message : String(error));
}
