import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const TEAM_IDS = ["kor", "cze", "mex", "rsa"];
const TEAM_LABELS = {
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

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), "utf8"));
}

function jsonFiles(relativeDirectory) {
  return fs
    .readdirSync(path.join(ROOT, relativeDirectory))
    .filter((name) => name.endsWith(".json"))
    .sort();
}

function countBy(values, selector) {
  const counts = {};
  for (const value of values) {
    const key = selector(value);
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return counts;
}

function formatCounts(counts, order) {
  return order.map((key) => `${key} ${counts[key] ?? 0}`).join(" / ");
}

function percentage(numerator, denominator) {
  if (denominator === 0) return "0.0%";
  return `${((numerator / denominator) * 100).toFixed(1)}%`;
}

function collectSourceIds(value, target) {
  if (Array.isArray(value)) {
    for (const item of value) collectSourceIds(item, target);
    return;
  }
  if (!value || typeof value !== "object") return;
  for (const [key, child] of Object.entries(value)) {
    if (key === "sourceIds" && Array.isArray(child)) {
      for (const sourceId of child) {
        if (typeof sourceId === "string") target.push(sourceId);
      }
    } else if (key === "sourceId" && typeof child === "string") {
      target.push(child);
    }
    collectSourceIds(child, target);
  }
}

const teams = readJson("src/data/teams/teams.json");
const players = readJson("src/data/players/group-a-players.json");
const tournament = readJson("src/data/tournament/tournament.json");
const group = readJson("src/data/tournament/group-a.json");
const registry = readJson("src/data/sources/sourceRegistry.json");
const leagues = readJson("src/data/leagues/leagues.json");
const leagueStrength = readJson("src/data/leagues/league-strength.json");
const matches = jsonFiles("src/data/matches/group-a").map((file) =>
  readJson(path.join("src/data/matches/group-a", file)),
);
const scenarios = TEAM_IDS.flatMap((teamId) =>
  readJson(`src/data/scenarios/group-a/${teamId}.json`),
);
const squads = Object.fromEntries(
  TEAM_IDS.map((teamId) => [
    teamId,
    readJson(`src/data/squads/${teamId}.json`),
  ]),
);
const clubPerformance = Object.fromEntries(
  TEAM_IDS.map((teamId) => [
    teamId,
    readJson(`src/data/club-performance/${teamId}.json`),
  ]),
);
const nationalPerformance = Object.fromEntries(
  TEAM_IDS.map((teamId) => [
    teamId,
    readJson(`src/data/national-performance/${teamId}.json`),
  ]),
);

const profileStatuses = countBy(players, (player) => player.baseProfile.status);
const profileGrades = countBy(players, (player) => player.baseProfile.dataGrade);
const goalkeepers = players.filter(
  (player) => player.baseProfile.activeAttributeModel === "goalkeeper",
);
const fieldPlayers = players.filter(
  (player) => player.baseProfile.activeAttributeModel === "field",
);
const activeAttributeValues = players.flatMap((player) => {
  const keys =
    player.baseProfile.activeAttributeModel === "goalkeeper"
      ? GOALKEEPER_KEYS
      : FIELD_KEYS;
  const attributes =
    player.baseProfile.attributes[player.baseProfile.activeAttributeModel];
  return keys.map((key) => attributes[key]);
});
const knownActiveAttributes = activeAttributeValues.filter(
  (value) => value !== null,
).length;
const knownAnalysisMinutes = players.filter(
  (player) => player.baseProfile.analysisMinutes !== null,
).length;
const completeProfiles = players.filter(
  (player) => player.baseProfile.status === "complete",
).length;
const appearedPlayerIds = new Set(
  matches.flatMap((match) =>
    Object.keys(match.lineupsByTeam).flatMap((teamId) => [
      ...(match.lineupsByTeam[teamId] ?? []),
      ...(match.substitutionsByTeam[teamId] ?? []).map(
        (substitution) => substitution.inPlayerId,
      ),
    ]),
  ),
);

const clubRecordsByTeam = Object.fromEntries(
  TEAM_IDS.map((teamId) => [
    teamId,
    clubPerformance[teamId].reduce(
      (sum, record) => sum + record.records.length,
      0,
    ),
  ]),
);
const totalClubRecords = Object.values(clubRecordsByTeam).reduce(
  (sum, count) => sum + count,
  0,
);
const nationalRecordsByTeam = Object.fromEntries(
  TEAM_IDS.map((teamId) => [
    teamId,
    nationalPerformance[teamId].reduce(
      (sum, record) => sum + record.records.length,
      0,
    ),
  ]),
);
const totalNationalRecords = Object.values(nationalRecordsByTeam).reduce(
  (sum, count) => sum + count,
  0,
);

const formSnapshots = scenarios.flatMap((scenario) =>
  Object.values(scenario.tournamentFormByPlayer ?? {}),
);
const formStatuses = countBy(formSnapshots, (form) => form.status);
const formMetricSnapshots = formSnapshots.filter(
  (form) => form.metricCoverage > 0,
).length;
const nonZeroFormAdjustments = formSnapshots.filter(
  (form) => form.adjustment !== 0,
).length;

const conditionSnapshots = scenarios.flatMap((scenario) =>
  Object.values(scenario.currentConditionByPlayer ?? {}),
);
const derivedEnergySnapshots = conditionSnapshots.filter(
  (condition) =>
    condition.energyEstimateStatus === "derived_from_verified_minutes",
).length;
const knownInjurySnapshots = conditionSnapshots.filter(
  (condition) => condition.injuryStatus !== null,
).length;
const knownScheduleBurdenSnapshots = conditionSnapshots.filter(
  (condition) => condition.recentScheduleBurden !== null,
).length;

const actualDecisionStatuses = countBy(
  scenarios,
  (scenario) => scenario.actualDecision.interpretationStatus,
);
const perspectiveCoverage = matches.reduce((sum, match) => {
  const represented = new Set(
    scenarios
      .filter((scenario) => scenario.matchId === match.id)
      .map((scenario) => scenario.selectedTeamId),
  );
  return (
    sum +
    [match.homeTeamId, match.awayTeamId].filter((teamId) =>
      represented.has(teamId),
    ).length
  );
}, 0);

const sourceReferences = [];
for (const value of [
  teams,
  players,
  tournament,
  group,
  leagues,
  leagueStrength,
  matches,
  scenarios,
  ...Object.values(squads),
  ...Object.values(clubPerformance),
  ...Object.values(nationalPerformance),
]) {
  collectSourceIds(value, sourceReferences);
}
const registryIdSet = new Set(registry.map((source) => source.id));
const uniqueSourceReferences = [...new Set(sourceReferences)];
const unresolvedSourceReferences = uniqueSourceReferences.filter(
  (sourceId) => !registryIdSet.has(sourceId),
);
const snapshotDate = registry
  .map((source) => source.accessedAt)
  .filter(Boolean)
  .sort()
  .at(-1);

const teamRows = TEAM_IDS.map((teamId) => {
  const teamPlayers = players.filter((player) => player.teamId === teamId);
  const completed = teamPlayers.filter(
    (player) => player.baseProfile.status === "complete",
  ).length;
  const appeared = teamPlayers.filter((player) =>
    appearedPlayerIds.has(player.id),
  ).length;
  const teamMatches = matches.filter((match) =>
    [match.homeTeamId, match.awayTeamId].includes(teamId),
  ).length;
  const teamMissions = scenarios.filter(
    (scenario) => scenario.selectedTeamId === teamId,
  ).length;
  const unresolved = new Set();
  for (const player of teamPlayers) {
    const references = [];
    collectSourceIds(player, references);
    for (const sourceId of references) {
      if (!registryIdSet.has(sourceId)) unresolved.add(sourceId);
    }
  }
  return `| ${TEAM_LABELS[teamId]} | ${squads[teamId].playerIds.length} | ${completed}/26 | D ${teamPlayers.length} | ${appeared} | ${teamPlayers.length - appeared} | 미적용 ${teamPlayers.length} | ${unresolved.size} | ${teamMatches} | ${teamMissions} |`;
}).join("\n");

const playerCoverageRows = TEAM_IDS.flatMap((teamId) =>
  players
    .filter((player) => player.teamId === teamId)
    .sort((left, right) => left.shirtNumber - right.shirtNumber)
    .map((player) => {
      const references = [];
      collectSourceIds(player, references);
      const unresolved = references.filter(
        (sourceId) => !registryIdSet.has(sourceId),
      );
      const hasBaseSource = player.baseProfile.sourceIds.length > 0;
      const appeared = appearedPlayerIds.has(player.id);
      const worldCupMinutes = appeared
        ? "— (분 미집계)"
        : "0 (출전 없음)";
      const missing = player.baseProfile.missingAttributes.join(", ");
      const sourceStatus =
        unresolved.length > 0
          ? `미해결 ${unresolved.join(", ")}`
          : hasBaseSource
            ? "명단·BASE 출처 연결"
            : "명단 확인 / BASE 출처 없음";
      return `| ${TEAM_LABELS[teamId]} | ${player.shirtNumber} | ${player.nameKo} / ${player.nameEn} | ${player.club.name} | 미확인 (협회 ${player.club.associationCode}) | — | ${worldCupMinutes} | ${player.baseProfile.dataGrade} | 미적용 · incomplete | ${missing} | ${sourceStatus} |`;
    }),
).join("\n");

const matchRows = [...matches]
  .sort((left, right) => left.matchNumber - right.matchNumber)
  .map((match) => {
    const matchScenarios = scenarios.filter(
      (scenario) => scenario.matchId === match.id,
    );
    const homeCount = matchScenarios.filter(
      (scenario) => scenario.selectedTeamId === match.homeTeamId,
    ).length;
    const awayCount = matchScenarios.filter(
      (scenario) => scenario.selectedTeamId === match.awayTeamId,
    ).length;
    return `| M${String(match.matchNumber).padStart(2, "0")} | ${TEAM_LABELS[match.homeTeamId]}–${TEAM_LABELS[match.awayTeamId]} | ${homeCount} | ${awayCount} | ${matchScenarios.length} |`;
  })
  .join("\n");

const standingRows = [...group.standings]
  .sort((left, right) => left.position - right.position)
  .map(
    (standing) =>
      `| ${standing.position} | ${TEAM_LABELS[standing.teamId]} | ${standing.played} | ${standing.won}-${standing.drawn}-${standing.lost} | ${standing.goalsFor}-${standing.goalsAgainst} | ${standing.goalDifference > 0 ? "+" : ""}${standing.goalDifference} | ${standing.points} |`,
  )
  .join("\n");

const tlsiSummary =
  leagueStrength.length === 0
    ? "0개 — 검증 가능한 교차 리그 지수가 없어 모든 선수의 `strengthAdjustment`를 `null`, 상태를 `unrated`로 유지"
    : `${leagueStrength.length}개 — 미적용 표기(1.00) ${leagueStrength.filter((record) => record.strengthFactor === 1).length}개, applied=false ${leagueStrength.filter((record) => record.applied === false).length}개, low confidence ${leagueStrength.filter((record) => record.confidence === "low").length}개, 영향 0 ${leagueStrength.filter((record) => record.attributeImpactLimit === 0).length}개`;

const report = `# Group A 데이터 커버리지

> 이 문서는 \`npm run data:coverage\`가 현재 저장소 JSON에서 직접 산출합니다. 출처 스냅샷 기준일: ${snapshotDate ?? "미상"}.

## 범위 요약

| 항목 | 현재 값 | 목표 | 상태 |
|---|---:|---:|---|
| 지원 팀 | ${teams.length} | 정확히 4 | ${teams.length === 4 ? "충족" : "미충족"} |
| 조별리그 경기 | ${matches.length} | 정확히 6 | ${matches.length === 6 ? "충족" : "미충족"} |
| 팀-경기 관점 | ${perspectiveCoverage} | 12 | ${perspectiveCoverage === 12 ? "충족" : "미충족"} |
| 의사결정 시나리오 | ${scenarios.length} | 최소 12 | ${scenarios.length >= 12 ? "충족" : "미충족"} |
| 최종 명단 선수 | ${players.length} | 104 | ${players.length === 104 ? "충족" : "미충족"} |
| BASE PROFILE 완료 선수 | ${completeProfiles} | 104 | **미완료 — ${percentage(completeProfiles, players.length)}** |
| 활성 속성 값 | ${knownActiveAttributes} | ${activeAttributeValues.length} | **미완료 — ${percentage(knownActiveAttributes, activeAttributeValues.length)}** |

## 공식 Group A 순위

| 순위 | 팀 | 경기 | 승-무-패 | 득-실 | 득실 | 승점 |
|---:|---|---:|---:|---:|---:|---:|
${standingRows}

## 팀별 선수 데이터

| 팀 | 최종 명단 | 완료 BASE | 등급 | 본선 출전 | 본선 미출전 | TLSI | 출처 누락 | 경기 | 미션 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
${teamRows}

- BASE 기간: \`2025-06-11..2026-06-10\`
- 프로필 상태: ${formatCounts(profileStatuses, ["complete", "partial", "incomplete"])}
- 데이터 등급: ${formatCounts(profileGrades, ["A", "B", "C", "D"])}
- 분석 분 값 보유: ${knownAnalysisMinutes}/${players.length}
- 포지션별 모델: 필드 ${fieldPlayers.length}명 / GK 별도 모델 ${goalkeepers.length}명
- 클럽 경기 성과 레코드: ${totalClubRecords}개, 대표팀 경기 성과 레코드: ${totalNationalRecords}개. 최종 명단의 신원·등번호·소속팀 검증은 성과 프로필 완료로 계산하지 않았습니다.

현재 활성 속성 ${knownActiveAttributes}/${activeAttributeValues.length}개만 수치가 있으며, 나머지는 \`null\`입니다. \`null\`은 중립 점수로 대체하지 않고 계산에서 제외한 뒤 남은 가중치를 재정규화해야 합니다. 전 속성이 없는 선수는 D/\`incomplete\`입니다.

## 선수별 커버리지

| 팀 | # | 선수 | 대회 직전 소속팀 | 리그 | 최근 1년 분석 시간 | 월드컵 출전 시간 | 등급 | TLSI 상태 | 누락 속성 | 출처 상태 |
|---|---:|---|---|---|---:|---:|---:|---|---|---|
${playerCoverageRows}

월드컵 출전 여부는 6개 공식 선발·교체 명단에서 계산했습니다. 선수별 정확한 본선 누적 분은 동일 기준으로 집계하지 않았으므로 출전 선수는 \`— (분 미집계)\`, 6경기 어느 선발·교체에도 없었던 선수만 \`0 (출전 없음)\`으로 표시합니다. 리그 이름도 공식 최종 명단의 클럽 협회 코드만으로 추정하지 않습니다.

## 경기·시나리오 관점

| 경기 | 대진 | 홈 팀 관점 | 원정 팀 관점 | 합계 |
|---|---|---:|---:|---:|
${matchRows}

- M01 RSA 56분 시나리오 한 건만 공식 퇴장 이후 10명 \`currentLineup\` 예외입니다.
- 실제 교체 해석 상태: ${formatCounts(actualDecisionStatuses, ["verified", "inferred"])}. OUT/IN/시점과 전술 목적 해석의 검증 수준은 분리됩니다.

## Tournament Form과 Current Condition

| 항목 | 커버리지 |
|---|---:|
| Tournament Form 스냅샷 | ${formSnapshots.length} |
| Form 상태 | ${formatCounts(formStatuses, ["no_minutes", "insufficient_metrics", "complete"])} |
| 선수별 지표 커버리지 > 0 | ${formMetricSnapshots}/${formSnapshots.length} |
| 0이 아닌 Form 조정 | ${nonZeroFormAdjustments}/${formSnapshots.length} |
| Current Condition 스냅샷 | ${conditionSnapshots.length} |
| 확인된 현재 경기 분 기반 에너지 추정 | ${derivedEnergySnapshots}/${conditionSnapshots.length} |
| 확인된 부상 상태 | ${knownInjurySnapshots}/${conditionSnapshots.length} |
| 확인된 최근 일정 부담 | ${knownScheduleBurdenSnapshots}/${conditionSnapshots.length} |

Tournament Form은 각 시나리오 타임스탬프 이전의 Group A 경기만 참조합니다. 선수 단위 지표 커버리지가 없으면 \`no_minutes\` 또는 \`insufficient_metrics\`, 신뢰도 0, 조정 0으로 남습니다. Current Condition의 에너지는 공식 출전 분에서 파생한 추정치이며 의료 정보가 아닙니다.

## TLSI와 출처

- TLSI: ${tlsiSummary}
- 출처 레지스트리: ${registry.length}개
- 데이터에서 참조한 고유 출처: ${uniqueSourceReferences.length}개
- 전체 출처 참조 사용: ${sourceReferences.length}회
- 미해결 출처 ID: ${unresolvedSourceReferences.length}개${unresolvedSourceReferences.length > 0 ? ` (${unresolvedSourceReferences.join(", ")})` : ""}

## 제출 시 명시해야 할 한계

1. 2025-06-11~2026-06-10 선수별 365일 이벤트·분 데이터가 확보되지 않아 BASE PROFILE 완료 선수는 ${completeProfiles}/${players.length}명입니다.
2. 공식 최종 명단 104명의 메타데이터 검증과 경기 공식 기록 검증은 완료된 성과 속성으로 과장하지 않습니다.
3. 필드/GK 활성 속성 ${activeAttributeValues.length}칸 중 확인된 값은 ${knownActiveAttributes}칸이며, 누락 값은 \`null\`입니다.
4. Tournament Form 선수 지표 커버리지는 ${formMetricSnapshots}/${formSnapshots.length}이며 불충분한 스냅샷에는 조정을 적용하지 않습니다.
5. TLSI가 없거나 불완전할 때는 리그 차이를 임의 추정하지 않고 중립/미산정 상태를 유지합니다.
`;

const outputPath = path.join(ROOT, "docs", "GROUP_A_DATA_COVERAGE.md");
fs.writeFileSync(outputPath, report, "utf8");

console.log(`Coverage report generated: ${path.relative(ROOT, outputPath)}`);
console.log(
  `- teams=${teams.length}, matches=${matches.length}, scenarios=${scenarios.length}, players=${players.length}`,
);
console.log(
  `- completeProfiles=${completeProfiles}/${players.length}, knownAttributes=${knownActiveAttributes}/${activeAttributeValues.length}, unresolvedSources=${unresolvedSourceReferences.length}`,
);
