import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const TEAM_IDS = ["kor", "cze", "mex", "rsa"];
const TEAM_ID_SET = new Set(TEAM_IDS);
const TEAM_CODES = {
  kor: "KOR",
  cze: "CZE",
  mex: "MEX",
  rsa: "RSA",
};
const FIELD_KEYS = [
  "finishing",
  "chanceCreation",
  "dribbling",
  "passing",
  "pressing",
  "defending",
  "aerial",
  "impact",
];
const GOALKEEPER_KEYS = [
  "shotStopping",
  "distribution",
  "aerialCommand",
  "sweeping",
  "penaltySaving",
  "stability",
  "buildUp",
  "impact",
];
const RAW_METRIC_KEYS = [
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
const POSITION_GROUPS = [
  "GK",
  "CB",
  "FB_WB",
  "DM",
  "CM_AM",
  "WINGER",
  "STRIKER",
];
const BASE_START = "2025-06-11";
const BASE_END = "2026-06-10";
const EXPECTED_MATCHES = {
  "mex-rsa-2026": {
    matchNumber: 1,
    homeTeamId: "mex",
    awayTeamId: "rsa",
    finalScore: { home: 2, away: 0 },
  },
  "kor-cze-2026": {
    matchNumber: 2,
    homeTeamId: "kor",
    awayTeamId: "cze",
    finalScore: { home: 2, away: 1 },
  },
  "cze-rsa-2026": {
    matchNumber: 25,
    homeTeamId: "cze",
    awayTeamId: "rsa",
    finalScore: { home: 1, away: 1 },
  },
  "mex-kor-2026": {
    matchNumber: 28,
    homeTeamId: "mex",
    awayTeamId: "kor",
    finalScore: { home: 1, away: 0 },
  },
  "cze-mex-2026": {
    matchNumber: 53,
    homeTeamId: "cze",
    awayTeamId: "mex",
    finalScore: { home: 0, away: 3 },
  },
  "rsa-kor-2026": {
    matchNumber: 54,
    homeTeamId: "rsa",
    awayTeamId: "kor",
    finalScore: { home: 1, away: 0 },
  },
};

const failures = [];
const warnings = [];

function fail(message) {
  failures.push(message);
}

function check(condition, message) {
  if (!condition) fail(message);
}

function readJson(relativePath) {
  const absolutePath = path.join(ROOT, relativePath);
  try {
    return JSON.parse(fs.readFileSync(absolutePath, "utf8"));
  } catch (error) {
    fail(`${relativePath}: JSON을 읽을 수 없습니다 (${error.message})`);
    return null;
  }
}

function jsonFiles(relativeDirectory) {
  const absoluteDirectory = path.join(ROOT, relativeDirectory);
  try {
    return fs
      .readdirSync(absoluteDirectory)
      .filter((name) => name.endsWith(".json"))
      .sort();
  } catch (error) {
    fail(`${relativeDirectory}: 디렉터리를 읽을 수 없습니다 (${error.message})`);
    return [];
  }
}

function sortedUnique(values) {
  return [...new Set(values)].sort();
}

function sameSet(actual, expected) {
  const actualValues = sortedUnique(actual);
  const expectedValues = sortedUnique(expected);
  return (
    actualValues.length === expectedValues.length &&
    actualValues.join("|") === expectedValues.join("|")
  );
}

function checkExactKeys(value, expected, label) {
  check(
    value && typeof value === "object" && !Array.isArray(value),
    `${label}: 객체여야 합니다`,
  );
  if (!value || typeof value !== "object" || Array.isArray(value)) return;
  check(
    sameSet(Object.keys(value), expected),
    `${label}: 키가 ${expected.join(", ")}와 정확히 일치해야 합니다`,
  );
}

function checkUnique(values, label) {
  check(
    values.length === new Set(values).size,
    `${label}: 중복 값이 있습니다`,
  );
}

function eventMinute(value) {
  if (typeof value === "number") return value;
  if (!value || typeof value !== "object") return Number.NaN;
  return Number(value.regulation) + Number(value.added ?? 0);
}

function isFiniteRange(value, minimum, maximum) {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= minimum &&
    value <= maximum
  );
}

function checkPlayerReference(playerId, teamId, rosterSet, label) {
  check(
    typeof playerId === "string" && rosterSet.has(playerId),
    `${label}: ${String(playerId)}가 ${teamId} 26명 로스터에 없습니다`,
  );
}

function buildStandings(matches) {
  const rows = Object.fromEntries(
    TEAM_IDS.map((teamId) => [
      teamId,
      {
        teamId,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        points: 0,
      },
    ]),
  );

  for (const match of matches) {
    if (
      !rows[match.homeTeamId] ||
      !rows[match.awayTeamId] ||
      !match.finalScore
    ) {
      continue;
    }
    const home = rows[match.homeTeamId];
    const away = rows[match.awayTeamId];
    home.played += 1;
    away.played += 1;
    home.goalsFor += match.finalScore.home;
    home.goalsAgainst += match.finalScore.away;
    away.goalsFor += match.finalScore.away;
    away.goalsAgainst += match.finalScore.home;
    if (match.finalScore.home > match.finalScore.away) {
      home.won += 1;
      away.lost += 1;
      home.points += 3;
    } else if (match.finalScore.home < match.finalScore.away) {
      away.won += 1;
      home.lost += 1;
      away.points += 3;
    } else {
      home.drawn += 1;
      away.drawn += 1;
      home.points += 1;
      away.points += 1;
    }
  }

  for (const row of Object.values(rows)) {
    row.goalDifference = row.goalsFor - row.goalsAgainst;
  }
  return rows;
}

function compareStanding(actual, expected, label) {
  for (const key of [
    "played",
    "won",
    "drawn",
    "lost",
    "goalsFor",
    "goalsAgainst",
    "goalDifference",
    "points",
  ]) {
    check(
      actual?.[key] === expected[key],
      `${label}.${key}: ${expected[key]}이어야 하나 ${String(actual?.[key])}입니다`,
    );
  }
}

const teams = readJson("src/data/teams/teams.json") ?? [];
const players = readJson("src/data/players/group-a-players.json") ?? [];
const tournament = readJson("src/data/tournament/tournament.json") ?? {};
const group = readJson("src/data/tournament/group-a.json") ?? {};
const leagues = readJson("src/data/leagues/leagues.json") ?? [];
const leagueStrength = readJson("src/data/leagues/league-strength.json") ?? [];

const matchFiles = jsonFiles("src/data/matches/group-a");
const matches = matchFiles.flatMap((file) => {
  const match = readJson(path.join("src/data/matches/group-a", file));
  return match ? [match] : [];
});
const scenarioFiles = jsonFiles("src/data/scenarios/group-a");
const scenarios = scenarioFiles.flatMap((file) => {
  const records =
    readJson(path.join("src/data/scenarios/group-a", file)) ?? [];
  const fileTeamId = path.basename(file, ".json");
  if (!Array.isArray(records)) {
    fail(`src/data/scenarios/group-a/${file}: 배열이어야 합니다`);
    return [];
  }
  return records.map((scenario) => ({ ...scenario, __fileTeamId: fileTeamId }));
});
const p0PlayerIds = new Set(
  scenarios
    .flatMap((scenario) => [
      ...(scenario.currentLineup ?? []),
      ...(scenario.benchOptions ?? []),
      scenario.actualDecision?.outPlayerId,
      scenario.actualDecision?.inPlayerId,
    ])
    .filter((playerId) => typeof playerId === "string"),
);

check(Array.isArray(teams), "teams.json: 배열이어야 합니다");
check(teams.length === 4, `팀 수는 정확히 4여야 하나 ${teams.length}입니다`);
checkUnique(
  teams.map((team) => team.id),
  "팀 ID",
);
check(
  sameSet(
    teams.map((team) => team.id),
    TEAM_IDS,
  ),
  "팀 범위는 kor/cze/mex/rsa만 허용됩니다",
);
for (const team of teams) {
  check(team.code === TEAM_CODES[team.id], `${team.id}: 팀 코드가 올바르지 않습니다`);
  check(team.squadId === team.id, `${team.id}: squadId가 팀 ID와 달라서는 안 됩니다`);
}

check(Array.isArray(players), "group-a-players.json: 배열이어야 합니다");
check(
  players.length === 104,
  `선수 수는 정확히 104여야 하나 ${players.length}입니다`,
);
checkUnique(
  players.map((player) => player.id),
  "선수 ID",
);

const playersByTeam = Object.fromEntries(
  TEAM_IDS.map((teamId) => [
    teamId,
    players.filter((player) => player.teamId === teamId),
  ]),
);

for (const player of players) {
  const label = `선수 ${player.id}`;
  check(TEAM_ID_SET.has(player.teamId), `${label}: 허용되지 않은 teamId입니다`);
  check(
    Number.isInteger(player.shirtNumber) &&
      player.shirtNumber >= 1 &&
      player.shirtNumber <= 26,
    `${label}: 등번호는 1~26 정수여야 합니다`,
  );
  check(
    ["GK", "DF", "MF", "FW"].includes(player.officialPosition),
    `${label}: 공식 포지션이 올바르지 않습니다`,
  );
  check(
    player.positionGroup === null ||
      POSITION_GROUPS.includes(player.positionGroup),
    `${label}: positionGroup은 null 또는 지원하는 전술 포지션 그룹이어야 합니다`,
  );
  check(
    Array.isArray(player.positionGroupCandidates) &&
      player.positionGroupCandidates.length > 0 &&
      player.positionGroupCandidates.every((group) =>
        POSITION_GROUPS.includes(group),
      ) &&
      new Set(player.positionGroupCandidates).size ===
        player.positionGroupCandidates.length,
    `${label}: positionGroupCandidates가 올바르지 않습니다`,
  );
  if (player.positionGroup !== null) {
    check(
      player.positionGroupCandidates.includes(player.positionGroup),
      `${label}: 확정 positionGroup은 후보 목록에 포함되어야 합니다`,
    );
  }
  check(
    ["verified", "derived_from_lineups", "broad_only", "unknown"].includes(
      player.positionGroupStatus,
    ),
    `${label}: positionGroupStatus가 올바르지 않습니다`,
  );
  if (player.officialPosition === "GK") {
    check(
      player.positionGroup === "GK" &&
        sameSet(player.positionGroupCandidates, ["GK"]) &&
        player.positionGroupStatus === "verified",
      `${label}: 공식 GK는 전술 그룹 GK로만 분류해야 합니다`,
    );
  } else if (player.positionGroupStatus === "broad_only") {
    check(
      player.positionGroup === null,
      `${label}: 세부 포지션 근거가 없으면 단일 전술 그룹을 생성하면 안 됩니다`,
    );
  }
  check(
    player.finalSquad?.status === "verified",
    `${label}: 최종 명단 상태가 verified가 아닙니다`,
  );
  check(
    player.finalSquad?.shirtNumber === player.shirtNumber,
    `${label}: 최종 명단 등번호와 선수 등번호가 다릅니다`,
  );
  check(
    player.finalSquad?.officialPosition === player.officialPosition,
    `${label}: 최종 명단 포지션과 선수 포지션이 다릅니다`,
  );

  const profile = player.baseProfile;
  check(Boolean(profile), `${label}: baseProfile이 없습니다`);
  if (!profile) continue;
  check(
    profile.period?.start === BASE_START && profile.period?.end === BASE_END,
    `${label}: BASE 기간은 ${BASE_START}..${BASE_END}여야 합니다`,
  );
  check(
    profile.analysisMinutes === null ||
      (Number.isFinite(profile.analysisMinutes) &&
        profile.analysisMinutes >= 0),
    `${label}: analysisMinutes는 null 또는 0 이상이어야 합니다`,
  );
  check(
    ["A", "B", "C", "D"].includes(profile.dataGrade),
    `${label}: dataGrade가 올바르지 않습니다`,
  );
  check(
    ["complete", "partial", "incomplete"].includes(profile.status),
    `${label}: BASE 상태가 올바르지 않습니다`,
  );
  check(
    isFiniteRange(profile.confidence, 0, 1),
    `${label}: BASE confidence는 0~1이어야 합니다`,
  );

  const expectedModel =
    player.officialPosition === "GK" ? "goalkeeper" : "field";
  check(
    profile.activeAttributeModel === expectedModel,
    `${label}: ${expectedModel} 속성 모델을 사용해야 합니다`,
  );
  checkExactKeys(
    profile.attributes?.field,
    FIELD_KEYS,
    `${label}.baseProfile.attributes.field`,
  );
  checkExactKeys(
    profile.attributes?.goalkeeper,
    GOALKEEPER_KEYS,
    `${label}.baseProfile.attributes.goalkeeper`,
  );

  const fieldAttributes = profile.attributes?.field ?? {};
  const goalkeeperAttributes = profile.attributes?.goalkeeper ?? {};
  for (const [key, value] of Object.entries({
    ...fieldAttributes,
    ...goalkeeperAttributes,
  })) {
    check(
      value === null ||
        (Number.isInteger(value) && isFiniteRange(value, 1, 20)),
      `${label}.${key}: 속성은 null 또는 1~20 정수여야 합니다`,
    );
  }

  const activeAttributes =
    expectedModel === "goalkeeper" ? goalkeeperAttributes : fieldAttributes;
  const inactiveAttributes =
    expectedModel === "goalkeeper" ? fieldAttributes : goalkeeperAttributes;
  check(
    Object.values(inactiveAttributes).every((value) => value === null),
    `${label}: 비활성 포지션 속성 모델에는 값을 넣을 수 없습니다`,
  );
  const missingAttributes = Object.entries(activeAttributes)
    .filter(([, value]) => value === null)
    .map(([key]) => key);
  check(
    sameSet(profile.missingAttributes ?? [], missingAttributes),
    `${label}: missingAttributes가 실제 null 속성과 일치하지 않습니다`,
  );
  if (missingAttributes.length > 0) {
    check(
      profile.status !== "complete",
      `${label}: null 속성이 있는데 complete로 표시했습니다`,
    );
  }
  if (missingAttributes.length === Object.keys(activeAttributes).length) {
    check(
      profile.dataGrade === "D" &&
        profile.status === "incomplete" &&
        profile.analysisMinutes === null &&
        profile.confidence === 0,
      `${label}: 전 속성이 null이면 D/incomplete, minutes null, confidence 0이어야 합니다`,
    );
  }

  const leagueContext = player.leagueContext;
  check(
    leagueContext?.strengthAdjustment === null ||
      isFiniteRange(leagueContext?.strengthAdjustment, -1, 1),
    `${label}: 리그 보정치는 null 또는 -1~1의 저충격 값이어야 합니다`,
  );
  if (leagueContext?.ratingStatus === "unrated") {
    check(
      leagueContext.strengthAdjustment === null,
      `${label}: unrated 리그에는 수치 보정을 적용할 수 없습니다`,
    );
  }
}

const rosterSets = {};
for (const teamId of TEAM_IDS) {
  const teamPlayers = playersByTeam[teamId];
  check(
    teamPlayers.length === 26,
    `${teamId}: 선수 수는 26이어야 하나 ${teamPlayers.length}입니다`,
  );
  checkUnique(
    teamPlayers.map((player) => player.shirtNumber),
    `${teamId} 등번호`,
  );
  rosterSets[teamId] = new Set(teamPlayers.map((player) => player.id));

  const squad = readJson(`src/data/squads/${teamId}.json`) ?? {};
  check(squad.teamId === teamId, `${teamId} squad: teamId가 다릅니다`);
  check(squad.squadSize === 26, `${teamId} squad: squadSize는 26이어야 합니다`);
  check(
    Array.isArray(squad.playerIds) && squad.playerIds.length === 26,
    `${teamId} squad: playerIds가 26명이 아닙니다`,
  );
  checkUnique(squad.playerIds ?? [], `${teamId} squad playerIds`);
  check(
    sameSet(squad.playerIds ?? [], [...rosterSets[teamId]]),
    `${teamId} squad: 26명 선수 파일과 정확히 일치하지 않습니다`,
  );

  for (const domain of ["club", "national"]) {
    const performance =
      readJson(`src/data/${domain}-performance/${teamId}.json`) ?? [];
    check(
      Array.isArray(performance) && performance.length === 26,
      `${teamId} ${domain}-performance: 26명 프로필이 필요합니다`,
    );
    checkUnique(
      performance.map((record) => record.playerId),
      `${teamId} ${domain}-performance playerId`,
    );
    check(
      sameSet(
        performance.map((record) => record.playerId),
        [...rosterSets[teamId]],
      ),
      `${teamId} ${domain}-performance: 로스터와 정확히 일치해야 합니다`,
    );
    for (const profile of performance) {
      const profileLabel =
        `${teamId} ${domain}-performance ${profile.playerId}`;
      check(
        profile.period?.start === BASE_START &&
          profile.period?.end === BASE_END,
        `${profileLabel}: 분석 기간이 BASE 기간과 다릅니다`,
      );
      check(
        profile.priority ===
          (p0PlayerIds.has(profile.playerId) ? "P0" : "P1"),
        `${profileLabel}: 자동 P0/P1 우선순위와 다릅니다`,
      );
      check(
        ["complete", "partial", "incomplete"].includes(
          profile.collectionStatus,
        ),
        `${profileLabel}: collectionStatus가 올바르지 않습니다`,
      );
      check(
        Array.isArray(profile.records),
        `${profileLabel}: records는 배열이어야 합니다`,
      );
      check(
        Array.isArray(profile.sourceIds) &&
          Array.isArray(profile.reviewedSourceIds),
        `${profileLabel}: sourceIds/reviewedSourceIds는 배열이어야 합니다`,
      );
      if ((profile.records ?? []).length === 0) {
        check(
          profile.collectionStatus === "incomplete" &&
            typeof profile.missingReason === "string" &&
            profile.missingReason.length > 0,
          `${profileLabel}: 빈 records는 incomplete와 누락 사유가 필요합니다`,
        );
      }
      for (const [index, record] of (profile.records ?? []).entries()) {
        const recordLabel = `${profileLabel}.records[${index}]`;
        check(
          Number.isFinite(Date.parse(record.dateFrom)) &&
            Number.isFinite(Date.parse(record.dateTo)) &&
            record.dateFrom >= BASE_START &&
            record.dateTo <= BASE_END &&
            record.dateFrom <= record.dateTo,
          `${recordLabel}: 날짜는 BASE 기간 안의 유효 구간이어야 합니다`,
        );
        check(
          domain === "club"
            ? ["league", "cup", "continental", "other"].includes(
                record.competitionType,
              )
            : [
                "world_cup_qualifier",
                "continental_competition",
                "competitive_friendly",
                "friendly",
                "other",
              ].includes(record.competitionType),
          `${recordLabel}: competitionType이 올바르지 않습니다`,
        );
        for (const key of ["appearances", "starts", "minutes"]) {
          check(
            record[key] === null ||
              (Number.isFinite(record[key]) && record[key] >= 0),
            `${recordLabel}.${key}: null 또는 0 이상이어야 합니다`,
          );
        }
        checkExactKeys(
          record.rawMetrics,
          RAW_METRIC_KEYS,
          `${recordLabel}.rawMetrics`,
        );
        for (const [key, value] of Object.entries(record.rawMetrics ?? {})) {
          check(
            value === null || (Number.isFinite(value) && value >= 0),
            `${recordLabel}.rawMetrics.${key}: null 또는 0 이상이어야 합니다`,
          );
        }
        check(
          Array.isArray(record.sourceIds) && record.sourceIds.length > 0,
          `${recordLabel}: 실제 성능 레코드는 sourceIds가 필요합니다`,
        );
        check(
          ["verified", "partial", "incomplete"].includes(
            record.verificationStatus,
          ),
          `${recordLabel}: verificationStatus가 올바르지 않습니다`,
        );
        if (
          record.tlsiApplied !== undefined ||
          record.strengthFactor !== undefined
        ) {
          check(
            typeof record.tlsiApplied === "boolean",
            `${recordLabel}: tlsiApplied는 boolean이어야 합니다`,
          );
          check(
            record.tlsiApplied
              ? Number.isFinite(record.strengthFactor) &&
                  record.strengthFactor >= 0.98 &&
                  record.strengthFactor <= 1.02
              : record.strengthFactor === undefined ||
                  record.strengthFactor === null ||
                  record.strengthFactor === 1,
            `${recordLabel}: 적용 TLSI는 0.98~1.02, 미적용 TLSI는 1 또는 생략이어야 합니다`,
          );
        }
      }
    }
  }
}

check(
  tournament.supportedGroupId === "group-a",
  "tournament.json: supportedGroupId는 group-a여야 합니다",
);
check(
  sameSet(tournament.supportedTeamIds ?? [], TEAM_IDS),
  "tournament.json: 지원 팀은 정확히 4개국이어야 합니다",
);
check(
  tournament.baseProfileWindow?.from === "2025-06-11T00:00:00Z" &&
    tournament.baseProfileWindow?.through === "2026-06-10T23:59:59Z",
  "tournament.json: BASE PROFILE 창이 정확하지 않습니다",
);
check(
  tournament.officialOpeningDate === "2026-06-11",
  "tournament.json: 대회 개막일이 정확하지 않습니다",
);
check(
  group.id === "group-a" && sameSet(group.teamIds ?? [], TEAM_IDS),
  "group-a.json: 정확히 Group A 4개국만 포함해야 합니다",
);

check(matches.length === 6, `경기 수는 정확히 6이어야 하나 ${matches.length}입니다`);
checkUnique(
  matches.map((match) => match.id),
  "경기 ID",
);
check(
  sameSet(Object.keys(EXPECTED_MATCHES), matches.map((match) => match.id)),
  "공식 Group A 6경기 ID 집합이 정확하지 않습니다",
);
check(
  sameSet(group.matchIds ?? [], Object.keys(EXPECTED_MATCHES)),
  "group-a.json matchIds가 공식 6경기와 일치하지 않습니다",
);

const appearancesByTeam = Object.fromEntries(
  TEAM_IDS.map((teamId) => [teamId, 0]),
);

for (const match of matches) {
  const label = `경기 ${match.id}`;
  const expected = EXPECTED_MATCHES[match.id];
  if (!expected) continue;
  check(match.groupId === "group-a", `${label}: groupId는 group-a여야 합니다`);
  check(
    match.matchNumber === expected.matchNumber &&
      match.homeTeamId === expected.homeTeamId &&
      match.awayTeamId === expected.awayTeamId,
    `${label}: 공식 경기 번호/대진과 다릅니다`,
  );
  check(
    match.finalScore?.home === expected.finalScore.home &&
      match.finalScore?.away === expected.finalScore.away,
    `${label}: 공식 최종 스코어와 다릅니다`,
  );
  check(
    sameSet(match.playableTeamIds ?? [], [
      match.homeTeamId,
      match.awayTeamId,
    ]),
    `${label}: 양 팀 모두 플레이 가능해야 합니다`,
  );
  check(
    Number.isFinite(Date.parse(match.kickoffUtc)),
    `${label}: kickoffUtc가 유효하지 않습니다`,
  );

  const participants = [match.homeTeamId, match.awayTeamId];
  for (const teamId of participants) {
    appearancesByTeam[teamId] += 1;
    const rosterSet = rosterSets[teamId] ?? new Set();
    const lineup = match.lineupsByTeam?.[teamId] ?? [];
    const bench = match.benchesByTeam?.[teamId] ?? [];
    const unavailable = match.unavailableByTeam?.[teamId] ?? [];
    const substitutions = match.substitutionsByTeam?.[teamId] ?? [];
    const unavailableIds = unavailable.map((record) => record.playerId);

    check(lineup.length === 11, `${label} ${teamId}: 선발은 11명이어야 합니다`);
    checkUnique(lineup, `${label} ${teamId} 선발`);
    checkUnique(bench, `${label} ${teamId} 벤치`);
    checkUnique(unavailableIds, `${label} ${teamId} 결장`);
    for (const [kind, ids] of [
      ["선발", lineup],
      ["벤치", bench],
      ["결장", unavailableIds],
    ]) {
      for (const playerId of ids) {
        checkPlayerReference(playerId, teamId, rosterSet, `${label} ${kind}`);
      }
    }

    const matchdayPartition = [...lineup, ...bench, ...unavailableIds];
    checkUnique(matchdayPartition, `${label} ${teamId} 명단 파티션`);
    check(
      sameSet(matchdayPartition, [...rosterSet]),
      `${label} ${teamId}: 선발+벤치+결장이 26명 로스터와 일치해야 합니다`,
    );

    const onPitch = new Set(lineup);
    for (const substitution of [...substitutions].sort(
      (left, right) => eventMinute(left.minute) - eventMinute(right.minute),
    )) {
      const minute = eventMinute(substitution.minute);
      check(
        Number.isFinite(minute) && minute >= 0 && minute <= 130,
        `${label} ${teamId}: 교체 시간이 유효하지 않습니다`,
      );
      checkPlayerReference(
        substitution.outPlayerId,
        teamId,
        rosterSet,
        `${label} 실제 교체 OUT`,
      );
      checkPlayerReference(
        substitution.inPlayerId,
        teamId,
        rosterSet,
        `${label} 실제 교체 IN`,
      );
      check(
        onPitch.has(substitution.outPlayerId),
        `${label} ${teamId}: OUT 선수가 당시 피치에 없습니다`,
      );
      check(
        !onPitch.has(substitution.inPlayerId),
        `${label} ${teamId}: IN 선수가 이미 피치에 있습니다`,
      );
      onPitch.delete(substitution.outPlayerId);
      onPitch.add(substitution.inPlayerId);
    }
  }

  const goals = { home: 0, away: 0 };
  for (const event of match.events ?? []) {
    check(
      participants.includes(event.teamId),
      `${label}: 이벤트 teamId가 대진에 없습니다`,
    );
    const rosterSet = rosterSets[event.teamId] ?? new Set();
    for (const [key, value] of Object.entries(event)) {
      if (/playerId$/i.test(key) && value !== null) {
        checkPlayerReference(
          value,
          event.teamId,
          rosterSet,
          `${label} 이벤트 ${key}`,
        );
      }
    }
    check(
      Number.isFinite(eventMinute(event.minute)),
      `${label}: 이벤트 시간이 유효하지 않습니다`,
    );
    if (event.type === "goal") {
      if (event.teamId === match.homeTeamId) goals.home += 1;
      if (event.teamId === match.awayTeamId) goals.away += 1;
    }
  }
  check(
    goals.home === match.finalScore.home && goals.away === match.finalScore.away,
    `${label}: 골 이벤트 합계와 최종 스코어가 다릅니다`,
  );
}

for (const teamId of TEAM_IDS) {
  check(
    appearancesByTeam[teamId] === 3,
    `${teamId}: 조별리그 경기는 3경기여야 하나 ${appearancesByTeam[teamId]}입니다`,
  );
}

const computedStandings = buildStandings(matches);
for (const teamId of TEAM_IDS) {
  const groupStanding = (group.standings ?? []).find(
    (standing) => standing.teamId === teamId,
  );
  const teamStanding = teams.find((team) => team.id === teamId)?.standing;
  check(Boolean(groupStanding), `group-a standings: ${teamId} 행이 없습니다`);
  check(Boolean(teamStanding), `teams.json standings: ${teamId} 행이 없습니다`);
  if (groupStanding) {
    compareStanding(
      groupStanding,
      computedStandings[teamId],
      `group-a standings ${teamId}`,
    );
  }
  if (teamStanding) {
    compareStanding(
      teamStanding,
      computedStandings[teamId],
      `teams.json standings ${teamId}`,
    );
  }
}

check(
  sameSet(scenarioFiles.map((file) => path.basename(file, ".json")), TEAM_IDS),
  "시나리오 파일은 kor/cze/mex/rsa.json 정확히 4개여야 합니다",
);
check(
  scenarios.length >= 12,
  `시나리오는 최소 12개여야 하나 ${scenarios.length}개입니다`,
);
checkUnique(
  scenarios.map((scenario) => scenario.id),
  "시나리오 ID",
);

const matchById = new Map(matches.map((match) => [match.id, match]));
const perspectivesByMatch = new Map(
  matches.map((match) => [match.id, new Set()]),
);
let redCardExceptionCount = 0;

for (const scenario of scenarios) {
  const label = `시나리오 ${scenario.id}`;
  const match = matchById.get(scenario.matchId);
  check(Boolean(match), `${label}: 존재하지 않는 matchId입니다`);
  if (!match) continue;
  const participants = [match.homeTeamId, match.awayTeamId];
  const selectedTeamId = scenario.selectedTeamId;
  const opponentTeamId =
    selectedTeamId === match.homeTeamId ? match.awayTeamId : match.homeTeamId;
  check(
    selectedTeamId === scenario.__fileTeamId,
    `${label}: 파일명 팀과 selectedTeamId가 다릅니다`,
  );
  check(
    participants.includes(selectedTeamId),
    `${label}: 선택 팀이 경기 참가 팀이 아닙니다`,
  );
  check(
    scenario.opponentTeamId === opponentTeamId,
    `${label}: 상대 팀이 대진과 다릅니다`,
  );
  perspectivesByMatch.get(match.id)?.add(selectedTeamId);
  check(
    Number.isInteger(scenario.minute) &&
      scenario.minute >= 1 &&
      scenario.minute <= 120,
    `${label}: minute는 1~120 정수여야 합니다`,
  );

  const isRedCardException =
    match.matchNumber === 1 &&
    selectedTeamId === "rsa" &&
    scenario.minute === 56 &&
    scenario.currentLineup?.length === 10 &&
    scenario.lineupStatus === "verified_red_card_reduction";
  if (isRedCardException) redCardExceptionCount += 1;
  check(
    isRedCardException ||
      (scenario.currentLineup?.length === 11 &&
        scenario.lineupStatus === "normal"),
    `${label}: currentLineup은 11명이어야 하며 유일한 예외는 M01 RSA 56분 퇴장 이후 10명입니다`,
  );

  const rosterSet = rosterSets[selectedTeamId] ?? new Set();
  const currentLineup = scenario.currentLineup ?? [];
  const benchOptions = scenario.benchOptions ?? [];
  const unavailable = scenario.unavailablePlayerIds ?? [];
  checkUnique(currentLineup, `${label} currentLineup`);
  checkUnique(benchOptions, `${label} benchOptions`);
  checkUnique(unavailable, `${label} unavailablePlayerIds`);
  for (const [kind, ids] of [
    ["currentLineup", currentLineup],
    ["benchOptions", benchOptions],
    ["unavailablePlayerIds", unavailable],
  ]) {
    for (const playerId of ids) {
      checkPlayerReference(playerId, selectedTeamId, rosterSet, `${label} ${kind}`);
    }
  }
  check(
    currentLineup.every((playerId) => !benchOptions.includes(playerId)),
    `${label}: currentLineup과 benchOptions가 겹칩니다`,
  );
  check(
    [...currentLineup, ...benchOptions].every(
      (playerId) => !unavailable.includes(playerId),
    ),
    `${label}: 결장 선수가 현재 명단에 포함됐습니다`,
  );
  check(
    sameSet(
      unavailable,
      (match.unavailableByTeam?.[selectedTeamId] ?? []).map(
        (record) => record.playerId,
      ),
    ),
    `${label}: 결장자 스냅샷이 경기 공식 명단과 다릅니다`,
  );

  const snapshotIds = sortedUnique([...currentLineup, ...benchOptions]);
  check(
    sameSet(Object.keys(scenario.tournamentFormByPlayer ?? {}), snapshotIds),
    `${label}: Tournament Form 선수 키가 현재 스냅샷과 다릅니다`,
  );
  check(
    sameSet(Object.keys(scenario.currentConditionByPlayer ?? {}), snapshotIds),
    `${label}: Current Condition 선수 키가 현재 스냅샷과 다릅니다`,
  );

  for (const [playerId, condition] of Object.entries(
    scenario.currentConditionByPlayer ?? {},
  )) {
    checkPlayerReference(
      playerId,
      selectedTeamId,
      rosterSet,
      `${label} Current Condition`,
    );
    check(
      isFiniteRange(condition.minutesInMatch, 0, scenario.minute),
      `${label} ${playerId}: 현재 경기 분 값이 시나리오 시점을 벗어났습니다`,
    );
    check(
      isFiniteRange(condition.energyEstimate, 0, 100),
      `${label} ${playerId}: energyEstimate는 0~100이어야 합니다`,
    );
    check(
      typeof condition.eligible === "boolean",
      `${label} ${playerId}: eligible은 boolean이어야 합니다`,
    );
  }

  for (const [playerId, form] of Object.entries(
    scenario.tournamentFormByPlayer ?? {},
  )) {
    checkPlayerReference(
      playerId,
      selectedTeamId,
      rosterSet,
      `${label} Tournament Form`,
    );
    check(
      Number.isInteger(form.matchesPlayedBeforeScenario) &&
        form.matchesPlayedBeforeScenario >= 0 &&
        form.matchesPlayedBeforeScenario <= 2,
      `${label} ${playerId}: 이전 본선 출전 수가 0~2 범위를 벗어났습니다`,
    );
    check(
      form.minutesBeforeScenario === null ||
        (Number.isFinite(form.minutesBeforeScenario) &&
          form.minutesBeforeScenario >= 0),
      `${label} ${playerId}: Tournament Form minutes가 올바르지 않습니다`,
    );
    check(
      isFiniteRange(form.metricCoverage, 0, 1) &&
        isFiniteRange(form.reliability, 0, 1),
      `${label} ${playerId}: Form coverage/reliability는 0~1이어야 합니다`,
    );
    check(
      isFiniteRange(form.adjustment, -2, 2),
      `${label} ${playerId}: Form 조정치는 -2~2 범위여야 합니다`,
    );
    if (form.status === "no_minutes" || form.status === "insufficient_metrics") {
      check(
        form.adjustment === 0,
        `${label} ${playerId}: 불충분 Form에는 0 조정만 허용됩니다`,
      );
    }
  }

  checkExactKeys(
    scenario.attributeWeights,
    FIELD_KEYS,
    `${label}.attributeWeights`,
  );
  const weightValues = Object.values(scenario.attributeWeights ?? {});
  check(
    weightValues.every((value) => isFiniteRange(value, 0, 1)) &&
      weightValues.reduce((sum, value) => sum + value, 0) > 0,
    `${label}: 속성 가중치는 0~1이며 합이 0보다 커야 합니다`,
  );

  const actual = scenario.actualDecision;
  check(Boolean(actual), `${label}: actualDecision이 없습니다`);
  if (actual) {
    checkPlayerReference(
      actual.outPlayerId,
      selectedTeamId,
      rosterSet,
      `${label} 실제 선택 OUT`,
    );
    checkPlayerReference(
      actual.inPlayerId,
      selectedTeamId,
      rosterSet,
      `${label} 실제 선택 IN`,
    );
    check(
      currentLineup.includes(actual.outPlayerId),
      `${label}: 실제 OUT 선수가 currentLineup에 없습니다`,
    );
    check(
      benchOptions.includes(actual.inPlayerId),
      `${label}: 실제 IN 선수가 benchOptions에 없습니다`,
    );
    check(
      actual.minute === scenario.minute,
      `${label}: 실제 선택 시점과 시나리오 시점이 다릅니다`,
    );
    const officialSubstitution = (
      match.substitutionsByTeam?.[selectedTeamId] ?? []
    ).find(
      (substitution) =>
        eventMinute(substitution.minute) === actual.minute &&
        substitution.outPlayerId === actual.outPlayerId &&
        substitution.inPlayerId === actual.inPlayerId,
    );
    check(
      Boolean(officialSubstitution),
      `${label}: actualDecision이 공식 교체 기록과 일치하지 않습니다`,
    );
  }
}

check(
  redCardExceptionCount === 1,
  `M01 RSA 56분 10명 예외는 정확히 1개여야 하나 ${redCardExceptionCount}개입니다`,
);
for (const match of matches) {
  check(
    sameSet(
      [...(perspectivesByMatch.get(match.id) ?? [])],
      [match.homeTeamId, match.awayTeamId],
    ),
    `${match.id}: 양 팀 관점 시나리오가 모두 있어야 합니다`,
  );
}

check(Array.isArray(leagues), "leagues.json: 배열이어야 합니다");
check(Array.isArray(leagueStrength), "league-strength.json: 배열이어야 합니다");
checkUnique(
  leagues.map((league) => league.id),
  "리그 ID",
);
checkUnique(
  leagueStrength.map((record) => record.leagueId),
  "TLSI leagueId",
);
check(
  sameSet(
    leagues.map((league) => league.id),
    leagueStrength.map((record) => record.leagueId),
  ),
  "leagues.json과 league-strength.json의 ID 집합이 다릅니다",
);
for (const record of leagueStrength) {
  check(
    isFiniteRange(record.strengthFactor, 0.98, 1.02),
    `TLSI ${record.leagueId}: strengthFactor는 0.98~1.02여야 합니다`,
  );
  check(
    isFiniteRange(record.attributeImpactLimit, 0, 1),
    `TLSI ${record.leagueId}: 속성 영향 상한은 0~1이어야 합니다`,
  );
  check(
    ["low", "medium", "high"].includes(record.confidence),
    `TLSI ${record.leagueId}: confidence가 올바르지 않습니다`,
  );
  if (record.sourceStatus === "incomplete") {
    check(
      record.confidence === "low" &&
        record.strengthFactor === 1 &&
        record.attributeImpactLimit === 0 &&
        record.applied === false,
      `TLSI ${record.leagueId}: 불완전 소스는 low, 1.00 표기, 영향 0, applied=false여야 합니다`,
    );
  }
}
if (leagueStrength.length === 0) {
  const allUnrated = players.every(
    (player) =>
      player.leagueContext?.ratingStatus === "unrated" &&
      player.leagueContext?.strengthAdjustment === null,
  );
  check(
    allUnrated,
    "TLSI 레코드가 없으면 모든 선수 리그 보정은 unrated/null이어야 합니다",
  );
  warnings.push(
    "TLSI 레코드는 0개입니다. 검증 가능한 리그 지수가 없어 104명 모두 unrated/null로 유지됩니다.",
  );
}

if (failures.length > 0) {
  console.error(`\nGroup A data validation FAILED (${failures.length})`);
  for (const message of failures) console.error(`- ${message}`);
  process.exitCode = 1;
} else {
  console.log("Group A data validation PASSED");
  console.log(
    `- teams=${teams.length}, matches=${matches.length}, scenarios=${scenarios.length}, players=${players.length}`,
  );
  console.log(
    `- squads=${TEAM_IDS.map((teamId) => `${teamId}:26`).join(", ")}`,
  );
  console.log(
    `- baseWindow=${BASE_START}..${BASE_END}, TLSI=${leagueStrength.length}`,
  );
}

for (const message of warnings) console.warn(`- WARN: ${message}`);
