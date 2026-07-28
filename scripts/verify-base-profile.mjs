import fs from "node:fs";
import path from "node:path";
import {
  BASE_PERIOD,
  FIELD_ATTRIBUTE_KEYS,
  GOALKEEPER_ATTRIBUTE_KEYS,
  PROJECT_ROOT,
  TEAM_IDS,
  deriveP0Scope,
  loadGroupAData,
  readJson,
} from "./base-profile-common.mjs";

const failures = [];
const warnings = [];

function check(condition, message) {
  if (!condition) failures.push(message);
}

function warn(condition, message) {
  if (!condition) warnings.push(message);
}

function eventMinute(value) {
  if (typeof value === "number") return value;
  return Number(value?.regulation) + Number(value?.added ?? 0);
}

function fullMatchMinutesForPlayer(match, teamId, playerId) {
  const substitutions = match.substitutionsByTeam?.[teamId] ?? [];
  const started = (match.lineupsByTeam?.[teamId] ?? []).includes(playerId);
  const entered = substitutions.find(
    (substitution) => substitution.inPlayerId === playerId,
  );
  if (!started && !entered) return 0;
  const enteredAt = started ? 0 : eventMinute(entered.minute);
  const exited = substitutions.find(
    (substitution) => substitution.outPlayerId === playerId,
  );
  const exitedAt = exited ? eventMinute(exited.minute) : 90;
  return Math.max(0, Math.min(90, exitedAt) - enteredAt);
}

const { players, scenarios } = loadGroupAData();
const matches = fs
  .readdirSync(path.join(PROJECT_ROOT, "src/data/matches/group-a"))
  .filter((name) => name.endsWith(".json"))
  .map((name) => readJson(`src/data/matches/group-a/${name}`));
const registry = readJson("src/data/sources/sourceRegistry.json");
const leagueStrength = readJson("src/data/leagues/league-strength.json");
const registryById = new Map(registry.map((source) => [source.id, source]));
const playerById = new Map(players.map((player) => [player.id, player]));
const matchById = new Map(matches.map((match) => [match.id, match]));
const scope = deriveP0Scope(players, scenarios);
const p0Ids = new Set(scope.map((entry) => entry.playerId));
const p0Document = fs.readFileSync(
  path.join(PROJECT_ROOT, "docs/P0_PLAYER_SCOPE.md"),
  "utf8",
);

check(players.length === 104, `final squad players=${players.length}, expected 104`);
check(matches.length === 6, `matches=${matches.length}, expected 6`);
check(scenarios.length === 13, `scenarios=${scenarios.length}, expected 13`);
check(scope.length === 81, `P0 players=${scope.length}, expected 81`);

for (const entry of scope) {
  check(
    p0Document.includes(`\`${entry.playerId}\``),
    `docs/P0_PLAYER_SCOPE.md is missing ${entry.playerId}`,
  );
}
for (const scenario of scenarios) {
  check(
    scenario.benchOptions.length >= 3,
    `${scenario.id}: fewer than three selectable bench candidates`,
  );
  for (const playerId of [
    ...scenario.currentLineup,
    ...scenario.benchOptions,
    scenario.actualDecision.outPlayerId,
    scenario.actualDecision.inPlayerId,
  ]) {
    check(
      p0Ids.has(playerId),
      `${scenario.id}: selectable/observed player ${playerId} is outside P0`,
    );
  }
}

let activeAttributeCount = 0;
let p0Complete = 0;
let p0Partial = 0;
let p0Incomplete = 0;
let baseSourceReferenceCount = 0;
let performanceRecordCount = 0;

for (const player of players) {
  const profile = player.baseProfile;
  const activeKeys =
    profile.activeAttributeModel === "goalkeeper"
      ? GOALKEEPER_ATTRIBUTE_KEYS
      : FIELD_ATTRIBUTE_KEYS;
  const active = profile.attributes[profile.activeAttributeModel];
  check(
    profile.period.start === BASE_PERIOD.start &&
      profile.period.end === BASE_PERIOD.end,
    `${player.id}: BASE period mismatch`,
  );
  check(
    profile.confidence >= 0 && profile.confidence <= 1,
    `${player.id}: confidence outside 0..1`,
  );
  check(
    activeKeys.every(
      (key) =>
        active[key] === null ||
        (Number.isInteger(active[key]) &&
          active[key] >= 1 &&
          active[key] <= 20),
    ),
    `${player.id}: active attribute must be null or integer 1..20`,
  );
  check(
    ["verified", "derived_from_lineups", "broad_only", "unknown"].includes(
      player.positionGroupStatus,
    ),
    `${player.id}: invalid positionGroupStatus`,
  );
  if (player.positionGroupStatus === "broad_only") {
    check(
      player.positionGroup === null,
      `${player.id}: broad_only cannot invent an exact position group`,
    );
  }
  const measured = activeKeys.filter((key) => active[key] !== null).length;
  activeAttributeCount += measured;
  const missing = activeKeys.filter((key) => active[key] === null);
  check(
    missing.length === profile.missingAttributes.length &&
      missing.every((key) => profile.missingAttributes.includes(key)),
    `${player.id}: missingAttributes does not match null attributes`,
  );
  for (const sourceId of profile.sourceIds ?? []) {
    baseSourceReferenceCount += 1;
    check(registryById.has(sourceId), `${player.id}: unknown BASE source ${sourceId}`);
  }
  if (p0Ids.has(player.id)) {
    if (profile.status === "complete") p0Complete += 1;
    if (profile.status === "partial") p0Partial += 1;
    if (profile.status === "incomplete") p0Incomplete += 1;
  }
}

for (const teamId of TEAM_IDS) {
  for (const domain of ["club", "national"]) {
    const profiles = readJson(
      `src/data/${domain}-performance/${teamId}.json`,
    );
    check(
      profiles.length === 26,
      `${teamId} ${domain}: performance profile count=${profiles.length}`,
    );
    for (const profile of profiles) {
      check(
        playerById.get(profile.playerId)?.teamId === teamId,
        `${teamId} ${domain}: unknown/wrong-team player ${profile.playerId}`,
      );
      check(
        profile.period.start === BASE_PERIOD.start &&
          profile.period.end === BASE_PERIOD.end,
        `${profile.playerId} ${domain}: period mismatch`,
      );
      check(
        profile.priority === (p0Ids.has(profile.playerId) ? "P0" : "P1"),
        `${profile.playerId} ${domain}: priority mismatch`,
      );
      for (const sourceId of profile.reviewedSourceIds ?? []) {
        check(
          registryById.has(sourceId),
          `${profile.playerId} ${domain}: unknown reviewed source ${sourceId}`,
        );
      }
      for (const record of profile.records ?? []) {
        performanceRecordCount += 1;
        check(
          Number.isFinite(record.minutes) && record.minutes >= 0,
          `${profile.playerId} ${domain}: record minutes must be non-negative`,
        );
        check(
          record.dateFrom >= BASE_PERIOD.start &&
            record.dateTo <= BASE_PERIOD.end,
          `${profile.playerId} ${domain}: record outside BASE period`,
        );
        if (
          record.tlsiApplied !== undefined ||
          record.strengthFactor !== undefined
        ) {
          check(
            typeof record.tlsiApplied === "boolean",
            `${profile.playerId} ${domain}: stint tlsiApplied must be boolean`,
          );
          check(
            record.tlsiApplied
              ? Number.isFinite(record.strengthFactor) &&
                  record.strengthFactor >= 0.98 &&
                  record.strengthFactor <= 1.02
              : record.strengthFactor === undefined ||
                  record.strengthFactor === null ||
                  record.strengthFactor === 1,
            `${profile.playerId} ${domain}: invalid stint TLSI`,
          );
        }
        for (const sourceId of record.sourceIds ?? []) {
          baseSourceReferenceCount += 1;
          const source = registryById.get(sourceId);
          check(Boolean(source), `${profile.playerId}: unknown raw source ${sourceId}`);
          check(
            !["restricted", "unknown"].includes(source?.usagePermission),
            `${profile.playerId}: disallowed raw source ${sourceId} (${source?.usagePermission})`,
          );
        }
      }
    }
  }
}

for (const scenario of scenarios) {
  const currentMatch = matchById.get(scenario.matchId);
  check(Boolean(currentMatch), `${scenario.id}: unknown match`);
  if (!currentMatch) continue;
  const currentKickoff = Date.parse(currentMatch.kickoffUtc);
  const priorMatches = matches.filter(
    (match) =>
      [match.homeTeamId, match.awayTeamId].includes(
        scenario.selectedTeamId,
      ) && Date.parse(match.kickoffUtc) < currentKickoff,
  );
  for (const [playerId, form] of Object.entries(
    scenario.tournamentFormByPlayer,
  )) {
    const expectedMinutes = priorMatches.reduce(
      (total, match) =>
        total +
        fullMatchMinutesForPlayer(
          match,
          scenario.selectedTeamId,
          playerId,
        ),
      0,
    );
    check(
      form.minutesBeforeScenario ===
        (expectedMinutes > 0 ? expectedMinutes : null),
      `${scenario.id} ${playerId}: Tournament Form minutes mismatch`,
    );
    check(
      form.metricCoverage >= 0 && form.metricCoverage <= 1,
      `${scenario.id} ${playerId}: Form coverage outside 0..1`,
    );
    check(
      form.reliability >= 0 && form.reliability <= 1,
      `${scenario.id} ${playerId}: Form reliability outside 0..1`,
    );
    check(
      form.adjustment >= -2 && form.adjustment <= 2,
      `${scenario.id} ${playerId}: Form adjustment outside -2..2`,
    );
    if (expectedMinutes === 0) {
      check(
        form.status === "no_minutes" && form.adjustment === 0,
        `${scenario.id} ${playerId}: no-minute Form must be neutral`,
      );
    }
    if (form.metricCoverage === 0) {
      check(
        form.adjustment === 0,
        `${scenario.id} ${playerId}: missing-metric Form must be neutral`,
      );
    }
    for (const sourceId of form.sourceIds) {
      const sourceMatch = matches.find((match) =>
        match.sourceIds.includes(sourceId),
      );
      check(
        Boolean(sourceMatch) &&
          Date.parse(sourceMatch.kickoffUtc) < currentKickoff,
        `${scenario.id} ${playerId}: Form source leaks current/future match ${sourceId}`,
      );
    }
  }
}

for (const record of leagueStrength) {
  check(
    record.strengthFactor >= 0.98 && record.strengthFactor <= 1.02,
    `${record.leagueId}: TLSI factor outside 0.98..1.02`,
  );
  if (!record.applied) {
    check(
      record.strengthFactor === 1 &&
        record.attributeImpactLimit === 0,
      `${record.leagueId}: unapplied TLSI must be neutral`,
    );
  } else {
    check(
      record.attributeImpactLimit >= -1 &&
        record.attributeImpactLimit <= 1,
      `${record.leagueId}: TLSI attribute impact outside ±1`,
    );
  }
}

warn(
  p0Complete + p0Partial === scope.length,
  `P0 BASE completion target not met: complete=${p0Complete}, partial=${p0Partial}, incomplete=${p0Incomplete}`,
);
warn(
  activeAttributeCount > 0,
  `No active BASE attributes are available: ${activeAttributeCount}/${players.length * 8}`,
);
warn(
  performanceRecordCount > 0,
  "No reusable club/national performance record could be stored",
);

if (failures.length > 0) {
  console.error(`BASE PROFILE verification FAILED (${failures.length})`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log("BASE PROFILE integrity verification PASSED");
  console.log(
    `- P0=${scope.length} (complete:${p0Complete}, partial:${p0Partial}, incomplete:${p0Incomplete})`,
  );
  console.log(
    `- performanceRecords=${performanceRecordCount}, activeAttributes=${activeAttributeCount}/${players.length * 8}`,
  );
  console.log(
    `- sourceRegistry=${registry.length}, rawSourceReferences=${baseSourceReferenceCount}`,
  );
  console.log(
    "- formulas=verified by the chained synthetic baseProfile Vitest suite",
  );
  console.log(
    warnings.length === 0
      ? "- coverageTarget=MET"
      : "- coverageTarget=NOT_MET (integrity remains valid)",
  );
  for (const warning of warnings) console.warn(`WARNING: ${warning}`);
}
