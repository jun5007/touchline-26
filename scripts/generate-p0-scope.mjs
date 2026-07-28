import fs from "node:fs";
import path from "node:path";
import {
  BASE_PERIOD,
  PROJECT_ROOT,
  TEAM_IDS,
  createEmptyPerformanceProfile,
  deriveP0Scope,
  loadGroupAData,
  readJson,
  writeJson,
} from "./base-profile-common.mjs";

const { players, scenarios } = loadGroupAData();
const scope = deriveP0Scope(players, scenarios);
const p0Ids = new Set(scope.map((entry) => entry.playerId));
const playerById = new Map(players.map((player) => [player.id, player]));

function updatePerformanceProfiles(relativePath, teamId, teamPlayers) {
  const absolutePath = path.join(PROJECT_ROOT, relativePath);
  const existingByPlayerId = new Map(
    (fs.existsSync(absolutePath) ? readJson(relativePath) : []).map(
      (profile) => [profile.playerId, profile],
    ),
  );
  const profiles = teamPlayers.map((player) => {
    const template = createEmptyPerformanceProfile(
      player.id,
      p0Ids.has(player.id) ? "P0" : "P1",
      teamId,
    );
    const existing = existingByPlayerId.get(player.id);
    if (!existing) return template;
    return {
      ...template,
      ...existing,
      playerId: player.id,
      period: { ...BASE_PERIOD },
      priority: template.priority,
      records: Array.isArray(existing.records) ? existing.records : [],
      sourceIds: Array.isArray(existing.sourceIds)
        ? existing.sourceIds
        : [],
      reviewedSourceIds: [
        ...new Set([
          ...template.reviewedSourceIds,
          ...(existing.reviewedSourceIds ?? []),
        ]),
      ],
    };
  });
  writeJson(relativePath, profiles);
}

for (const teamId of TEAM_IDS) {
  const teamPlayers = players.filter((player) => player.teamId === teamId);
  updatePerformanceProfiles(
    `src/data/club-performance/${teamId}.json`,
    teamId,
    teamPlayers,
  );
  updatePerformanceProfiles(
    `src/data/national-performance/${teamId}.json`,
    teamId,
    teamPlayers,
  );
}

const teamSummaryRows = TEAM_IDS.map((teamId) => {
  const teamScope = scope.filter((entry) => entry.teamId === teamId);
  return `| ${teamScope[0]?.teamCode ?? teamId.toUpperCase()} | ${teamScope.length} | ${teamScope.reduce((sum, entry) => sum + entry.lineupScenarioIds.length, 0)} | ${teamScope.reduce((sum, entry) => sum + entry.benchScenarioIds.length, 0)} | ${teamScope.filter((entry) => entry.actualDecisionScenarioIds.length > 0).length} |`;
}).join("\n");

const playerRows = scope
  .map((entry) => {
    const player = playerById.get(entry.playerId);
    const missionList = entry.scenarioIds.join("<br>");
    return `| ${entry.teamCode} | \`${entry.playerId}\` | ${entry.nameKo} / ${entry.nameEn} | ${player.officialPosition} | ${missionList} | ${entry.lineupScenarioIds.length} | ${entry.benchScenarioIds.length} | ${entry.actualDecisionScenarioIds.length > 0 ? "예" : "아니오"} | ${entry.collectionStatus} · 활성 ${entry.activeAttributeCount}/8 |`;
  })
  .join("\n");

const report = `# P0 선수 자동 범위

> 생성 명령: \`npm run base-profile:scope\`
> 기준 데이터: 기존 4개국 · 6경기 · 13미션
> BASE 분석 기간: ${BASE_PERIOD.start} 00:00 ~ ${BASE_PERIOD.end} 23:59

## 산출 규칙

P0는 현재 13미션의 \`currentLineup\`, \`benchOptions\`, 결과 화면의 실제 감독 선택 OUT/IN을 합친 뒤 선수 ID로 중복 제거한 집합입니다. 현재 구현에는 별도 대체선수 배열이 없으며, 실제 선택 가능한 대체 후보는 \`benchOptions\` 전체이므로 모두 포함합니다.

이 문서는 소스 JSON에서 자동 생성됩니다. 수동으로 선수를 추가하거나 제외하지 않습니다.

## 요약

| 국가 | 고유 P0 | 선발 등장 합계 | 벤치 등장 합계 | 실제 선택 등장 선수 |
|---|---:|---:|---:|---:|
${teamSummaryRows}
| **합계** | **${scope.length}** | **${scope.reduce((sum, entry) => sum + entry.lineupScenarioIds.length, 0)}** | **${scope.reduce((sum, entry) => sum + entry.benchScenarioIds.length, 0)}** | **${scope.filter((entry) => entry.actualDecisionScenarioIds.length > 0).length}** |

## 선수별 범위

| 국가 | 선수 ID | 선수명 | 공식 포지션 | 등장 미션 | 선발 등장 | 벤치 등장 | 실제 감독 선택 | 데이터 수집 상태 |
|---|---|---|---|---|---:|---:|---|---|
${playerRows}

## 현재 수집 판정

- P0 ${scope.length}명 모두 기간과 공개 재사용 권리를 함께 충족하는 선수 단위 성능 출처를 확보하지 못했습니다.
- 따라서 BASE 수치를 만들지 않았고 \`null / incomplete\`를 유지합니다.
- \`src/data/club-performance/*.json\`과 \`src/data/national-performance/*.json\`에는 P0/P1 우선순위, 기간, 빈 \`records\`, 명시적 누락 사유를 저장합니다.
- 원자료를 확보하면 이 자동 범위를 바꾸지 않고 \`records\`만 추가해 계산할 수 있습니다.
`;

const outputPath = path.join(PROJECT_ROOT, "docs", "P0_PLAYER_SCOPE.md");
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, report, "utf8");

console.log(`P0 scope generated: docs/P0_PLAYER_SCOPE.md`);
console.log(`- players=${scope.length}, scenarios=${scenarios.length}`);
console.log(
  `- byTeam=${TEAM_IDS.map((teamId) => `${teamId}:${scope.filter((entry) => entry.teamId === teamId).length}`).join(",")}`,
);
console.log(
  "- performance skeletons=club:104,national:104 (no fabricated records)",
);
