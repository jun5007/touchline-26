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

const ATTRIBUTE_METRICS = {
  finishing:
    "nonPenaltyGoalsPer90 .40; shotsOnTargetPer90 .25; shotConversion .20; goalsPer90 .15",
  chanceCreation:
    "assistsPer90 .20; keyPassesPer90 .35; chancesCreatedPer90 .30; finalThirdPassesPer90 .15",
  dribbling:
    "successfulDribblesPer90 .50; dribbleSuccessRate .30; progressiveCarriesPer90 .20",
  passing:
    "passCompletionRate .35; progressivePassesPer90 .30; finalThirdPassesPer90 .20; keyPassesPer90 .15",
  pressing:
    "tacklesPer90 .25; interceptionsPer90 .25; recoveriesPer90 .30; pressuresPer90 .20",
  defending:
    "tacklesPer90 .25; interceptionsPer90 .25; clearancesPer90 .20; blocksPer90 .15; recoveriesPer90 .15",
  aerial: "aerialDuelsWonPer90 .60; aerialWinRate .40",
  impact:
    "goalsAndAssistsPer90 .35; substituteContributionPer90 .25; roleRelevantContributionPer90 .25; minutesReliability .15",
  shotStopping: "saves; shotsOnTargetFaced; goalsConceded",
  distribution:
    "passCompletionRate; longPassCompletionRate; completedPassesPer90",
  aerialCommand: "crossesClaimed; aerial actions",
  sweeping: "sweeperActions; defensive actions outside box",
  penaltySaving: "penaltiesSaved; penaltiesFaced",
  stability: "cleanSheets; goalsConceded; minutesReliability",
  buildUp: "passCompletionRate; longPassCompletionRate",
};

function writeMarkdown(relativePath, content) {
  const absolutePath = path.join(PROJECT_ROOT, relativePath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, content, "utf8");
}

function measuredAttributeCount(player) {
  const active =
    player.baseProfile.attributes[player.baseProfile.activeAttributeModel];
  return Object.values(active).filter((value) => Number.isInteger(value))
    .length;
}

function sumMinutes(profiles) {
  const values = profiles.flatMap((profile) =>
    profile.records
      .map((record) => record.minutes)
      .filter((value) => Number.isFinite(value)),
  );
  return values.length > 0
    ? values.reduce((total, value) => total + value, 0)
    : null;
}

const { players, scenarios } = loadGroupAData();
const scope = deriveP0Scope(players, scenarios);
const playerById = new Map(players.map((player) => [player.id, player]));
const clubByPlayerId = new Map(
  TEAM_IDS.flatMap((teamId) =>
    readJson(`src/data/club-performance/${teamId}.json`).map((profile) => [
      profile.playerId,
      profile,
    ]),
  ),
);
const nationalByPlayerId = new Map(
  TEAM_IDS.flatMap((teamId) =>
    readJson(`src/data/national-performance/${teamId}.json`).map(
      (profile) => [profile.playerId, profile],
    ),
  ),
);

const teamRows = TEAM_IDS.map((teamId) => {
  const entries = scope.filter((entry) => entry.teamId === teamId);
  const teamPlayers = entries.map((entry) => playerById.get(entry.playerId));
  const complete = teamPlayers.filter(
    (player) => player.baseProfile.status === "complete",
  ).length;
  const partial = teamPlayers.filter(
    (player) => player.baseProfile.status === "partial",
  ).length;
  const incomplete = teamPlayers.length - complete - partial;
  const active = teamPlayers.reduce(
    (total, player) => total + measuredAttributeCount(player),
    0,
  );
  return `| ${entries[0].teamCode} | ${entries.length} | ${complete} | ${partial} | ${incomplete} | ${active} | ${entries.length * 8} | ${((active / (entries.length * 8)) * 100).toFixed(1)}% |`;
}).join("\n");

const playerRows = scope
  .map((entry) => {
    const player = playerById.get(entry.playerId);
    const club = clubByPlayerId.get(entry.playerId);
    const national = nationalByPlayerId.get(entry.playerId);
    const clubMinutes = sumMinutes([club]);
    const nationalMinutes = sumMinutes([national]);
    const totalMinutes =
      clubMinutes === null && nationalMinutes === null
        ? null
        : (clubMinutes ?? 0) + (nationalMinutes ?? 0);
    return `| ${entry.teamCode} | ${player.nameKo} / ${player.nameEn} | ${entry.scenarioIds.join("<br>")} | ${totalMinutes ?? "—"} | ${club.records.length}건 | ${national.records.length}건 | ${player.baseProfile.status} | ${measuredAttributeCount(player)}/8 | ${Math.round(player.baseProfile.confidence * 100)}% | 미적용 | 검토 ${club.reviewedSourceIds.length}개 / 사용 0개 | ${player.baseProfile.missingAttributes.join(", ")} |`;
  })
  .join("\n");

const progress = `# BASE PROFILE 수집 진행

> 자동 생성: \`npm run base-profile:docs\`
> 분석 기간: ${BASE_PERIOD.start} 00:00 ~ ${BASE_PERIOD.end} 23:59
> P0: 기존 13미션의 currentLineup + benchOptions + 실제 OUT/IN 합집합

## 국가별

| 국가 | P0 선수 수 | 완료 | 부분 완료 | 미완료 | 활성 능력치 | 전체 가능한 능력치 | 데이터 커버리지 |
|---|---:|---:|---:|---:|---:|---:|---:|
${teamRows}
| **합계** | **${scope.length}** | **0** | **0** | **${scope.length}** | **0** | **${scope.length * 8}** | **0.0%** |

## 선수별

| 국가 | 선수 | 등장 미션 | 최근 1년 분 | 클럽 데이터 | 대표팀 데이터 | BASE 상태 | 활성 능력치 수 | confidence | TLSI | 출처 상태 | 누락 항목 |
|---|---|---|---:|---:|---:|---|---:|---:|---|---|---|
${playerRows}

## 판정

- P0 ${scope.length}명 모두 데이터 상태를 확인했지만, 기간과 공개 재사용 권리를 동시에 충족한 선수 성능 레코드는 0건입니다.
- 공식 리그 사이트에 화면상 통계가 있어도 저장·재배포 권한이 없으면 원자료 JSON에 복사하지 않았습니다.
- 오픈 라이선스 후보는 대상 기간 P0 선수 성능을 제공하지 않아 실제 점수 근거가 되지 못했습니다.
- 따라서 complete 0명, partial 0명, incomplete ${scope.length}명이며 활성 능력치는 0/${scope.length * 8}입니다.
- 이는 수집·계산 파이프라인의 실패가 아니라 허위 수치와 권리 위반을 차단한 명시적 상태입니다.
`;

const sourceMapRows = scope
  .flatMap((entry) => {
    const player = playerById.get(entry.playerId);
    const keys =
      player.baseProfile.activeAttributeModel === "goalkeeper"
        ? GOALKEEPER_ATTRIBUTE_KEYS
        : FIELD_ATTRIBUTE_KEYS;
    return keys.map(
      (attribute) =>
        `| ${entry.teamCode} | ${player.nameKo} | ${attribute} | ${ATTRIBUTE_METRICS[attribute] ?? "역할 관련 공식 지표"} | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |`,
    );
  })
  .join("\n");

const sourceMap = `# 능력치 원자료 매핑

> 자동 생성: \`npm run base-profile:docs\`
> 이 문서는 P0 ${scope.length}명 × 활성 모델 8개 = ${scope.length * 8}개 능력치의 현재 근거 상태를 열거합니다.

## 계산 원칙

- 공식 원자료와 앱 파생 1–20 점수는 분리합니다.
- 원자료가 없는 지표는 0으로 바꾸지 않습니다.
- 유효 지표만 원래 설정 가중치에 비례해 합계 1로 재정규화합니다.
- 비교 표본이 없거나 속성에 사용할 수 있는 지표가 하나도 없으면 결과는 null입니다.
- 현재 P0 성능 원자료가 0건이므로 아래 모든 결과는 null이며 imputed도 false입니다.

| 국가 | 선수 | 속성 | 계획 지표·가중치 | 원자료 | 출처 ID | 적용 가중치 | 결과 | confidence | imputed |
|---|---|---|---|---|---|---|---:|---:|---|
${sourceMapRows}
`;

writeMarkdown("docs/BASE_PROFILE_PROGRESS.md", progress);
writeMarkdown("docs/ATTRIBUTE_SOURCE_MAP.md", sourceMap);

console.log("BASE PROFILE documents generated");
console.log(
  `- P0=${scope.length}, attributeRows=${scope.length * 8}, active=0`,
);
