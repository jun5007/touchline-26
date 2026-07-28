import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const TEAM_IDS = ["kor", "cze", "mex", "rsa"];
const SOURCE_EXTENSIONS = [
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".json",
];
const TACTICS_ROUTE =
  "/matches/[matchId]/scenarios/[scenarioId]/tactics/page";
const TACTICS_CLIENT_MANIFEST = path.join(
  ".next",
  "server",
  "app",
  "matches",
  "[matchId]",
  "scenarios",
  "[scenarioId]",
  "tactics",
  "page_client-reference-manifest.js",
);
const FORBIDDEN_DECISION_KEYS = new Set([
  "actualDecision",
  "resultFacts",
  "finalScore",
  "eventsAfterScenario",
]);
const failures = [];

function fail(message) {
  failures.push(message);
}

function check(condition, message) {
  if (!condition) fail(message);
}

function readText(relativePath) {
  try {
    return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
  } catch (error) {
    fail(`${relativePath}: 파일을 읽을 수 없습니다 (${error.message})`);
    return "";
  }
}

function readJson(relativePath) {
  const text = readText(relativePath);
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch (error) {
    fail(`${relativePath}: JSON 파싱 실패 (${error.message})`);
    return null;
  }
}

function jsonFiles(relativeDirectory) {
  try {
    return fs
      .readdirSync(path.join(ROOT, relativeDirectory))
      .filter((name) => name.endsWith(".json"))
      .sort();
  } catch (error) {
    fail(`${relativeDirectory}: 디렉터리를 읽을 수 없습니다 (${error.message})`);
    return [];
  }
}

function projectPath(absolutePath) {
  return path.relative(ROOT, absolutePath).split(path.sep).join("/");
}

function sourceFiles(relativeDirectory) {
  const directory = path.join(ROOT, relativeDirectory);
  const files = [];
  function visit(currentDirectory) {
    for (const entry of fs.readdirSync(currentDirectory, {
      withFileTypes: true,
    })) {
      const absolutePath = path.join(currentDirectory, entry.name);
      if (entry.isDirectory()) {
        visit(absolutePath);
      } else if (
        SOURCE_EXTENSIONS.includes(path.extname(entry.name)) &&
        !/\.(?:test|spec)\.[^.]+$/.test(entry.name)
      ) {
        files.push(absolutePath);
      }
    }
  }
  try {
    visit(directory);
  } catch (error) {
    fail(`${relativeDirectory}: 소스 트리를 읽을 수 없습니다 (${error.message})`);
  }
  return files.sort();
}

function importSpecifiers(source) {
  const specifiers = [];
  const staticImportPattern =
    /(?:^|\n)\s*(?:import|export)\s+(?:type\s+)?(?:[^;"']*?\s+from\s+)?["']([^"']+)["']/g;
  const dynamicImportPattern =
    /\b(?:import|require)\s*\(\s*["']([^"']+)["']\s*\)/g;
  for (const pattern of [staticImportPattern, dynamicImportPattern]) {
    let match;
    while ((match = pattern.exec(source))) specifiers.push(match[1]);
  }
  return sortedUnique(specifiers);
}

function resolveProjectImport(importer, specifier) {
  let basePath;
  if (specifier.startsWith("@/")) {
    basePath = path.join(ROOT, "src", specifier.slice(2));
  } else if (specifier.startsWith(".")) {
    basePath = path.resolve(path.dirname(importer), specifier);
  } else {
    return null;
  }

  const candidates = [basePath];
  if (!path.extname(basePath)) {
    for (const extension of SOURCE_EXTENSIONS) {
      candidates.push(`${basePath}${extension}`);
    }
    for (const extension of SOURCE_EXTENSIONS) {
      candidates.push(path.join(basePath, `index${extension}`));
    }
  }
  return candidates.find((candidate) => {
    try {
      return fs.statSync(candidate).isFile();
    } catch {
      return false;
    }
  }) ?? null;
}

function isForbiddenClientDependency(absolutePath) {
  const relativePath = projectPath(absolutePath);
  return (
    relativePath === "src/data/repository.ts" ||
    relativePath === "src/data/group-a/catalog.ts" ||
    /^src\/data\/(?:matches|scenarios)\/group-a\/.+\.json$/.test(relativePath)
  );
}

function validateClientDependencyGraph() {
  const allSourceFiles = sourceFiles("src");
  const clientRoots = allSourceFiles.filter((absolutePath) =>
    /^\s*["']use client["']\s*;?/m.test(
      fs.readFileSync(absolutePath, "utf8").replace(/^\uFEFF/, ""),
    ),
  );
  const dependencyCache = new Map();
  const inspectedModules = new Set();
  const reportedChains = new Set();

  function dependencies(absolutePath) {
    if (dependencyCache.has(absolutePath)) {
      return dependencyCache.get(absolutePath);
    }
    const source = fs.readFileSync(absolutePath, "utf8");
    const resolved = importSpecifiers(source)
      .map((specifier) => ({
        specifier,
        absolutePath: resolveProjectImport(absolutePath, specifier),
      }))
      .filter((dependency) => dependency.absolutePath);
    dependencyCache.set(absolutePath, resolved);
    return resolved;
  }

  function inspect(absolutePath, chain, visited) {
    if (visited.has(absolutePath)) return;
    visited.add(absolutePath);
    inspectedModules.add(absolutePath);
    for (const dependency of dependencies(absolutePath)) {
      const nextChain = [...chain, dependency.absolutePath];
      if (isForbiddenClientDependency(dependency.absolutePath)) {
        const formattedChain = nextChain.map(projectPath).join(" -> ");
        if (!reportedChains.has(formattedChain)) {
          reportedChains.add(formattedChain);
          fail(
            `클라이언트 의존성 그래프가 서버 전용 원본 데이터를 가져옵니다: ${formattedChain}`,
          );
        }
        continue;
      }
      inspect(dependency.absolutePath, nextChain, visited);
    }
  }

  for (const clientRoot of clientRoots) {
    inspect(clientRoot, [clientRoot], new Set());
  }
  return {
    roots: clientRoots.length,
    modules: inspectedModules.size,
    forbiddenChains: reportedChains.size,
  };
}

function eventMinute(value) {
  if (typeof value === "number") return value;
  if (!value || typeof value !== "object") return Number.NaN;
  return Number(value.regulation) + Number(value.added ?? 0);
}

function sameJson(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function sortedUnique(values) {
  return [...new Set(values)].sort();
}

function sameSet(left, right) {
  const leftValues = sortedUnique(left);
  const rightValues = sortedUnique(right);
  return (
    leftValues.length === rightValues.length &&
    leftValues.join("|") === rightValues.join("|")
  );
}

function findForbiddenKeys(value, location, findings) {
  if (Array.isArray(value)) {
    value.forEach((item, index) =>
      findForbiddenKeys(item, `${location}[${index}]`, findings),
    );
    return;
  }
  if (!value || typeof value !== "object") return;
  for (const [key, child] of Object.entries(value)) {
    if (FORBIDDEN_DECISION_KEYS.has(key)) findings.push(`${location}.${key}`);
    findForbiddenKeys(child, `${location}.${key}`, findings);
  }
}

function collectStringLeaves(value, location, findings) {
  if (typeof value === "string") {
    findings.push({ location, value });
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) =>
      collectStringLeaves(item, `${location}[${index}]`, findings),
    );
    return;
  }
  if (!value || typeof value !== "object") return;
  for (const [key, child] of Object.entries(value)) {
    collectStringLeaves(child, `${location}.${key}`, findings);
  }
}

function resultOnlyMarkers(scenarios) {
  const decisionInputCorpus = JSON.stringify(
    scenarios.map((scenario) => {
      const projection = { ...scenario };
      delete projection.actualDecision;
      delete projection.resultFacts;
      return projection;
    }),
  );
  const leavesByScenario = scenarios.map((scenario) => {
    const leaves = [];
    collectStringLeaves(
      scenario.actualDecision,
      "actualDecision",
      leaves,
    );
    collectStringLeaves(scenario.resultFacts, "resultFacts", leaves);
    return { scenarioId: scenario.id, leaves };
  });
  const resultValueCounts = new Map();
  for (const { leaves } of leavesByScenario) {
    for (const { value } of leaves) {
      resultValueCounts.set(value, (resultValueCounts.get(value) ?? 0) + 1);
    }
  }

  return leavesByScenario.flatMap(({ scenarioId, leaves }) => {
    function markerPriority(location) {
      if (location === "actualDecision.parallelDecision") return 0;
      if (location === "actualDecision.note") return 1;
      if (location === "actualDecision.interpretedRole") return 2;
      if (location.endsWith(".detail")) return 3;
      return 4;
    }
    const candidates = leaves
      .filter(
        ({ value }) =>
          value.length >= 6 &&
          resultValueCounts.get(value) === 1 &&
          !decisionInputCorpus.includes(value),
      )
      .sort(
        (left, right) =>
          markerPriority(left.location) - markerPriority(right.location) ||
          right.value.length - left.value.length ||
          left.location.localeCompare(right.location),
      );
    check(
      candidates.length > 0,
      `시나리오 ${scenarioId}: 번들 검사에 사용할 결과 전용 고유 문자열이 없습니다`,
    );
    return candidates.length > 0
      ? [{ scenarioId, ...candidates[0] }]
      : [];
  });
}

function readTacticsClientManifest() {
  const absolutePath = path.join(ROOT, TACTICS_CLIENT_MANIFEST);
  if (!fs.existsSync(absolutePath)) return null;
  const source = fs.readFileSync(absolutePath, "utf8");
  const assignment = `globalThis.__RSC_MANIFEST["${TACTICS_ROUTE}"]`;
  const assignmentStart = source.indexOf(assignment);
  const jsonStart =
    assignmentStart < 0 ? -1 : source.indexOf("=", assignmentStart) + 1;
  const jsonEnd = source.lastIndexOf(";");
  if (assignmentStart < 0 || jsonStart <= 0 || jsonEnd <= jsonStart) {
    fail(
      `${projectPath(absolutePath)}: 전술 페이지 클라이언트 매니페스트 할당을 파싱할 수 없습니다`,
    );
    return null;
  }
  try {
    return JSON.parse(source.slice(jsonStart, jsonEnd).trim());
  } catch (error) {
    fail(
      `${projectPath(absolutePath)}: 전술 페이지 클라이언트 매니페스트 JSON 파싱 실패 (${error.message})`,
    );
    return null;
  }
}

function validateTacticsClientChunks(scenarios) {
  const chunksDirectory = path.join(ROOT, ".next", "static", "chunks");
  if (!fs.existsSync(chunksDirectory)) {
    return { status: "skipped", chunks: 0, markers: 0 };
  }
  const manifest = readTacticsClientManifest();
  if (!manifest) {
    check(
      !fs.existsSync(path.join(ROOT, TACTICS_CLIENT_MANIFEST)),
      "전술 페이지 클라이언트 매니페스트를 읽지 못해 기존 빌드 청크를 검증할 수 없습니다",
    );
    if (!fs.existsSync(path.join(ROOT, TACTICS_CLIENT_MANIFEST))) {
      fail(
        ".next/static/chunks는 존재하지만 전술 페이지 클라이언트 매니페스트가 없습니다",
      );
    }
    return { status: "failed", chunks: 0, markers: 0 };
  }

  const routeEntry = Object.entries(manifest.entryJSFiles ?? {}).find(
    ([entry]) =>
      entry.endsWith(
        "/src/app/matches/[matchId]/scenarios/[scenarioId]/tactics/page",
      ),
  );
  const chunkNames = new Set(routeEntry?.[1] ?? []);
  for (const [moduleName, moduleEntry] of Object.entries(
    manifest.clientModules ?? {},
  )) {
    if (moduleName.includes("/src/components/tactics/TacticsWorkspace.tsx")) {
      for (const chunkName of moduleEntry.chunks ?? []) {
        chunkNames.add(chunkName);
      }
    }
  }
  const javascriptChunks = sortedUnique(
    [...chunkNames]
      .filter((chunkName) => chunkName.endsWith(".js"))
      .map((chunkName) =>
        chunkName.replace(/^\/_next\//, "").replace(/^_next\//, ""),
      ),
  );
  check(
    javascriptChunks.length > 0,
    "전술 페이지 매니페스트에서 브라우저 JavaScript 청크를 찾지 못했습니다",
  );

  const chunkSources = [];
  for (const chunkName of javascriptChunks) {
    const absolutePath = path.join(ROOT, ".next", chunkName);
    if (!fs.existsSync(absolutePath)) {
      fail(`전술 페이지 클라이언트 청크가 없습니다: ${chunkName}`);
      continue;
    }
    chunkSources.push({
      name: chunkName,
      source: fs.readFileSync(absolutePath, "utf8"),
    });
  }
  const joinedSource = chunkSources.map(({ source }) => source).join("\n");
  for (const forbiddenKey of FORBIDDEN_DECISION_KEYS) {
    check(
      !joinedSource.includes(forbiddenKey),
      `전술 페이지 클라이언트 청크에 결과 전용 키 ${forbiddenKey}가 포함되어 있습니다`,
    );
  }
  const markers = resultOnlyMarkers(scenarios);
  for (const marker of markers) {
    const leakingChunks = chunkSources
      .filter(({ source }) => source.includes(marker.value))
      .map(({ name }) => name);
    check(
      leakingChunks.length === 0,
      `전술 페이지 클라이언트 청크에 시나리오 ${marker.scenarioId}의 결과 전용 문자열(${marker.location})이 포함되어 있습니다: ${leakingChunks.join(", ")}`,
    );
  }
  return {
    status: failures.length > 0 ? "failed" : "checked",
    chunks: chunkSources.length,
    markers: markers.length,
  };
}

function extractFunctionBody(source, functionName) {
  const marker = `export function ${functionName}`;
  const start = source.indexOf(marker);
  if (start < 0) {
    fail(`src/data/repository.ts: ${functionName} 함수를 찾을 수 없습니다`);
    return "";
  }
  const openingBrace = source.indexOf("{", start);
  if (openingBrace < 0) {
    fail(`src/data/repository.ts: ${functionName} 함수 본문이 없습니다`);
    return "";
  }
  let depth = 0;
  for (let index = openingBrace; index < source.length; index += 1) {
    if (source[index] === "{") depth += 1;
    if (source[index] === "}") {
      depth -= 1;
      if (depth === 0) return source.slice(openingBrace, index + 1);
    }
  }
  fail(`src/data/repository.ts: ${functionName} 함수 본문이 닫히지 않았습니다`);
  return "";
}

function extractTypeDeclaration(source, typeName) {
  const start = source.indexOf(`export type ${typeName}`);
  if (start < 0) {
    fail(`src/data/types.ts: ${typeName} 타입을 찾을 수 없습니다`);
    return "";
  }
  const end = source.indexOf(";", start);
  if (end < 0) {
    fail(`src/data/types.ts: ${typeName} 선언이 닫히지 않았습니다`);
    return "";
  }
  return source.slice(start, end + 1);
}

function countGoalsThrough(match, minute) {
  const score = { home: 0, away: 0 };
  for (const event of match.events ?? []) {
    if (event.type !== "goal" || eventMinute(event.minute) > minute) continue;
    if (event.teamId === match.homeTeamId) score.home += 1;
    if (event.teamId === match.awayTeamId) score.away += 1;
  }
  return score;
}

function minutesPlayedThrough(match, teamId, playerId, minute) {
  const starting = (match.lineupsByTeam?.[teamId] ?? []).includes(playerId);
  const substitutions = [...(match.substitutionsByTeam?.[teamId] ?? [])].sort(
    (left, right) => eventMinute(left.minute) - eventMinute(right.minute),
  );
  let enteredAt = starting ? 0 : null;
  let exitedAt = null;
  for (const substitution of substitutions) {
    const at = eventMinute(substitution.minute);
    if (at > minute) break;
    if (substitution.inPlayerId === playerId && enteredAt === null) enteredAt = at;
    if (substitution.outPlayerId === playerId && enteredAt !== null) {
      exitedAt = at;
      break;
    }
  }
  if (enteredAt === null) return 0;
  return Math.max(0, Math.min(minute, exitedAt ?? minute) - enteredAt);
}

const registry = readJson("src/data/sources/sourceRegistry.json") ?? [];
const registryById = new Map(registry.map((source) => [source.id, source]));
const players = readJson("src/data/players/group-a-players.json") ?? [];
const tournament = readJson("src/data/tournament/tournament.json") ?? {};
const matchFiles = jsonFiles("src/data/matches/group-a");
const matches = matchFiles.flatMap((file) => {
  const value = readJson(path.join("src/data/matches/group-a", file));
  return value ? [value] : [];
});
const scenarios = TEAM_IDS.flatMap((teamId) => {
  const value = readJson(`src/data/scenarios/group-a/${teamId}.json`);
  return Array.isArray(value) ? value : [];
});
const clientGraphValidation = validateClientDependencyGraph();
const tacticsBundleValidation = validateTacticsClientChunks(scenarios);
const matchById = new Map(matches.map((match) => [match.id, match]));
const sourceMatchById = new Map();
for (const match of matches) {
  for (const sourceId of match.sourceIds ?? []) {
    sourceMatchById.set(sourceId, match);
  }
}

check(
  tournament.baseProfileWindow?.through === "2026-06-10T23:59:59Z" &&
    Date.parse(tournament.baseProfileWindow.through) <
      Date.parse("2026-06-11T00:00:00Z"),
  "BASE PROFILE 종료 시점은 대회 개막 전이어야 합니다",
);
for (const player of players) {
  check(
    player.baseProfile?.period?.start === "2025-06-11" &&
      player.baseProfile?.period?.end === "2026-06-10",
    `${player.id}: BASE PROFILE 기간이 고정 창과 다릅니다`,
  );
  for (const sourceId of player.baseProfile?.sourceIds ?? []) {
    check(
      !sourceMatchById.has(sourceId),
      `${player.id}: BASE PROFILE이 본선 경기 출처 ${sourceId}를 참조합니다`,
    );
  }
}

for (const scenario of scenarios) {
  const label = `시나리오 ${scenario.id}`;
  const match = matchById.get(scenario.matchId);
  check(Boolean(match), `${label}: matchId를 찾을 수 없습니다`);
  if (!match) continue;
  const scenarioTime = Date.parse(scenario.scenarioTimestamp);
  const kickoffTime = Date.parse(match.kickoffUtc);
  const expectedScenarioTime = kickoffTime + scenario.minute * 60_000;
  check(
    Number.isFinite(scenarioTime) && scenarioTime === expectedScenarioTime,
    `${label}: scenarioTimestamp가 킥오프+경기 분 경계와 다릅니다`,
  );
  check(
    typeof scenario.timestampBasis === "string" &&
      scenario.timestampBasis.includes("logical match-clock"),
    `${label}: 논리 경기 시각임을 명시해야 합니다`,
  );

  const decisionProjection = { ...scenario };
  delete decisionProjection.actualDecision;
  delete decisionProjection.resultFacts;
  const forbiddenFindings = [];
  findForbiddenKeys(decisionProjection, "$", forbiddenFindings);
  check(
    forbiddenFindings.length === 0,
    `${label}: 의사결정 입력 영역에 결과 키가 있습니다 (${forbiddenFindings.join(", ")})`,
  );

  const expectedCurrentScore = countGoalsThrough(match, scenario.minute);
  check(
    sameJson(scenario.currentScore, expectedCurrentScore),
    `${label}: currentScore가 해당 분까지의 골 이벤트와 다릅니다`,
  );
  for (const timelineEntry of scenario.contextTimeline ?? []) {
    const matchMinute = String(timelineEntry.minute).match(/\d+/);
    if (matchMinute) {
      check(
        Number(matchMinute[0]) <= scenario.minute,
        `${label}: 타임라인 ${timelineEntry.minute}가 시나리오 이후입니다`,
      );
    }
  }

  for (const evidence of scenario.evidenceRefs ?? []) {
    check(
      evidence.usage === "decision-input",
      `${label}: evidenceRefs는 decision-input만 허용됩니다`,
    );
    check(
      registryById.has(evidence.sourceId),
      `${label}: evidence source ${evidence.sourceId}가 레지스트리에 없습니다`,
    );
    const observedThrough = Date.parse(evidence.observedThrough);
    check(
      Number.isFinite(observedThrough) && observedThrough <= scenarioTime,
      `${label}: ${evidence.sourceId} observedThrough가 미래입니다`,
    );
    check(
      Number.isFinite(evidence.observedThroughMatchMinute) &&
        evidence.observedThroughMatchMinute >= 0 &&
        evidence.observedThroughMatchMinute <= scenario.minute,
      `${label}: ${evidence.sourceId}의 관찰 경기 분이 시나리오를 넘습니다`,
    );
    const sourceMatch = sourceMatchById.get(evidence.sourceId);
    if (sourceMatch) {
      check(
        Date.parse(sourceMatch.kickoffUtc) <= kickoffTime,
        `${label}: 미래 경기 출처 ${evidence.sourceId}를 입력으로 사용했습니다`,
      );
      if (sourceMatch.id === match.id) {
        check(
          evidence.observedThroughMatchMinute <= scenario.minute,
          `${label}: 현재 경기 출처 경계가 시나리오 이후입니다`,
        );
      }
    }
  }

  const priorMatches = matches
    .filter(
      (candidate) =>
        [candidate.homeTeamId, candidate.awayTeamId].includes(
          scenario.selectedTeamId,
        ) && Date.parse(candidate.kickoffUtc) < kickoffTime,
    )
    .sort((left, right) => Date.parse(left.kickoffUtc) - Date.parse(right.kickoffUtc));
  const expectedFormSources = priorMatches.flatMap((priorMatch) => {
    const ftrSourceId = (priorMatch.sourceIds ?? []).find(
      (sourceId) =>
        registryById.get(sourceId)?.sourceType ===
        "official_full_time_match_report",
    );
    return ftrSourceId ? [ftrSourceId] : [];
  });

  for (const [playerId, form] of Object.entries(
    scenario.tournamentFormByPlayer ?? {},
  )) {
    const expectedAppearances = priorMatches.filter(
      (priorMatch) =>
        (priorMatch.lineupsByTeam?.[scenario.selectedTeamId] ?? []).includes(
          playerId,
        ) ||
        (priorMatch.substitutionsByTeam?.[scenario.selectedTeamId] ?? []).some(
          (substitution) => substitution.inPlayerId === playerId,
        ),
    ).length;
    check(
      form.matchesPlayedBeforeScenario === expectedAppearances,
      `${label} ${playerId}: Form 출전 수에 현재/미래 경기가 섞였거나 이전 경기 계산이 다릅니다`,
    );
    check(
      sameSet(form.sourceIds ?? [], expectedFormSources),
      `${label} ${playerId}: Tournament Form 출처가 시점 이전 FTR 집합과 다릅니다`,
    );
    for (const sourceId of form.sourceIds ?? []) {
      const sourceMatch = sourceMatchById.get(sourceId);
      check(
        Boolean(sourceMatch) &&
          sourceMatch.id !== match.id &&
          Date.parse(sourceMatch.kickoffUtc) < kickoffTime &&
          [sourceMatch.homeTeamId, sourceMatch.awayTeamId].includes(
            scenario.selectedTeamId,
          ),
        `${label} ${playerId}: Form에 현재/미래/타 팀 출처 ${sourceId}가 있습니다`,
      );
    }
    if (form.status === "no_minutes" || form.status === "insufficient_metrics") {
      check(
        form.adjustment === 0 &&
          form.metricCoverage === 0 &&
          form.reliability === 0,
        `${label} ${playerId}: 불충분 Form이 점수에 반영됐습니다`,
      );
    }
  }

  for (const [playerId, condition] of Object.entries(
    scenario.currentConditionByPlayer ?? {},
  )) {
    const expectedMinutes = minutesPlayedThrough(
      match,
      scenario.selectedTeamId,
      playerId,
      scenario.minute,
    );
    check(
      condition.minutesInMatch === expectedMinutes,
      `${label} ${playerId}: Current Condition minutes가 시점 이전 기록과 다릅니다`,
    );
    if (condition.energyEstimateStatus === "derived_from_verified_minutes") {
      const expectedEnergy = Math.max(
        60,
        Math.round(100 - expectedMinutes * 0.42),
      );
      check(
        condition.energyEstimate === expectedEnergy,
        `${label} ${playerId}: energyEstimate가 공개된 분 기반 식과 다릅니다`,
      );
    }
    const bookedBeforeScenario = (match.events ?? []).some(
      (event) =>
        event.type === "card" &&
        event.card === "yellow" &&
        event.playerId === playerId &&
        eventMinute(event.minute) <= scenario.minute,
    );
    check(
      condition.cardStatus === (bookedBeforeScenario ? "yellow" : "clear"),
      `${label} ${playerId}: cardStatus가 시점 이후 정보를 사용했거나 이전 경고를 놓쳤습니다`,
    );
    for (const sourceId of condition.sourceIds ?? []) {
      check(
        sourceMatchById.get(sourceId)?.id === match.id,
        `${label} ${playerId}: Current Condition 출처 ${sourceId}가 현재 경기가 아닙니다`,
      );
    }
  }

  check(
    scenario.actualDecision?.usage === "result-only",
    `${label}: actualDecision은 result-only여야 합니다`,
  );
  check(
    scenario.resultFacts?.usage === "result-only",
    `${label}: resultFacts는 result-only여야 합니다`,
  );
  check(
    sameJson(scenario.actualDecision?.scoreAtDecision, scenario.currentScore),
    `${label}: 실제 결정 시점 스코어가 현재 스코어와 다릅니다`,
  );
  check(
    sameJson(scenario.resultFacts?.finalScore, match.finalScore),
    `${label}: resultFacts 최종 스코어가 경기 데이터와 다릅니다`,
  );
  const expectedFutureEvents = (match.events ?? []).filter(
    (event) => eventMinute(event.minute) > scenario.minute,
  );
  check(
    sameJson(scenario.resultFacts?.eventsAfterScenario, expectedFutureEvents),
    `${label}: resultFacts 미래 이벤트 파티션이 정확하지 않습니다`,
  );
  check(
    (scenario.resultFacts?.eventsAfterScenario ?? []).every(
      (event) => eventMinute(event.minute) > scenario.minute,
    ),
    `${label}: eventsAfterScenario에 시점 이전 이벤트가 있습니다`,
  );
}

const repositorySource = readText("src/data/repository.ts");
const typesSource = readText("src/data/types.ts");
const tacticsPageSource = readText(
  "src/app/matches/[matchId]/scenarios/[scenarioId]/tactics/page.tsx",
);
const scenarioDtoBody = extractFunctionBody(
  repositorySource,
  "getDecisionScenarioContext",
);
const matchDtoBody = extractFunctionBody(repositorySource, "getDecisionMatchView");
const scenarioDtoType = extractTypeDeclaration(
  typesSource,
  "DecisionScenarioContext",
);
const matchDtoType = extractTypeDeclaration(typesSource, "DecisionMatchView");

for (const forbidden of [
  "actualDecision",
  "resultFacts",
  "finalScore",
  "eventsAfterScenario",
]) {
  check(
    !new RegExp(`\\b${forbidden}\\b`).test(scenarioDtoBody),
    `getDecisionScenarioContext가 ${forbidden}을 직렬화합니다`,
  );
  check(
    !new RegExp(`\\b${forbidden}\\b`).test(scenarioDtoType),
    `DecisionScenarioContext 타입이 ${forbidden}을 노출합니다`,
  );
}
for (const forbidden of ["finalScore", "events"]) {
  check(
    !new RegExp(`\\b${forbidden}\\b`).test(matchDtoBody),
    `getDecisionMatchView가 ${forbidden}을 직렬화합니다`,
  );
  check(
    !new RegExp(`\\b${forbidden}\\b`).test(matchDtoType),
    `DecisionMatchView 타입이 ${forbidden}을 노출합니다`,
  );
}
check(
  tacticsPageSource.includes("getDecisionMatchView(match)") &&
    tacticsPageSource.includes("getDecisionScenarioContext(scenario)"),
  "전술 페이지가 미래 누출 방지 DTO 경계를 사용하지 않습니다",
);
check(
  !/match=\{\s*match\s*\}/.test(tacticsPageSource) &&
    !/scenario=\{\s*scenario\s*\}/.test(tacticsPageSource),
  "전술 페이지가 원본 match/scenario 객체를 클라이언트에 전달합니다",
);

if (failures.length > 0) {
  console.error(`\nFuture leakage validation FAILED (${failures.length})`);
  for (const message of failures) console.error(`- ${message}`);
  console.error(
    `- clientGraph=roots:${clientGraphValidation.roots}, modules:${clientGraphValidation.modules}, forbiddenChains:${clientGraphValidation.forbiddenChains}`,
  );
  if (tacticsBundleValidation.status !== "skipped") {
    console.error(
      `- tacticsClientChunks=${tacticsBundleValidation.chunks}, resultOnlyMarkers=${tacticsBundleValidation.markers}`,
    );
  }
  process.exitCode = 1;
} else {
  console.log("Future leakage validation PASSED");
  console.log(
    `- scenarios=${scenarios.length}, evidenceBoundaries=checked, tournamentForm=pre-timestamp-only`,
  );
  console.log(
    "- actualDecision/resultFacts=result-only, tactics DTO excludes final/result fields",
  );
  console.log(
    `- clientGraph=roots:${clientGraphValidation.roots}, modules:${clientGraphValidation.modules}, forbiddenChains:${clientGraphValidation.forbiddenChains}`,
  );
  console.log(
    tacticsBundleValidation.status === "skipped"
      ? "- tacticsClientChunks=skipped (.next build not present)"
      : `- tacticsClientChunks=${tacticsBundleValidation.chunks}, resultOnlyMarkers=${tacticsBundleValidation.markers}`,
  );
}
