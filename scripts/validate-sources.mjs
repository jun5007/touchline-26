import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const TEAM_IDS = ["kor", "cze", "mex", "rsa"];
const USAGE_PERMISSIONS = new Set([
  "allowed_factual_use",
  "allowed_with_attribution",
  "open_license",
  "restricted",
  "unknown",
]);
const failures = [];
const references = [];

function fail(message) {
  failures.push(message);
}

function check(condition, message) {
  if (!condition) fail(message);
}

function readJson(relativePath) {
  try {
    return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), "utf8"));
  } catch (error) {
    fail(`${relativePath}: JSON을 읽을 수 없습니다 (${error.message})`);
    return null;
  }
}

function jsonFiles(relativeDirectory) {
  try {
    return fs
      .readdirSync(path.join(ROOT, relativeDirectory))
      .filter((name) => name.endsWith(".json"))
      .sort()
      .map((name) => path.join(relativeDirectory, name));
  } catch (error) {
    fail(`${relativeDirectory}: 디렉터리를 읽을 수 없습니다 (${error.message})`);
    return [];
  }
}

function collectSourceReferences(value, file, location = "$") {
  if (Array.isArray(value)) {
    value.forEach((item, index) =>
      collectSourceReferences(item, file, `${location}[${index}]`),
    );
    return;
  }
  if (!value || typeof value !== "object") return;

  for (const [key, child] of Object.entries(value)) {
    const childLocation = `${location}.${key}`;
    if (key === "sourceIds") {
      if (!Array.isArray(child)) {
        fail(`${file} ${childLocation}: sourceIds는 배열이어야 합니다`);
      } else {
        for (const [index, sourceId] of child.entries()) {
          if (typeof sourceId !== "string" || sourceId.trim() === "") {
            fail(
              `${file} ${childLocation}[${index}]: 비어 있지 않은 문자열이어야 합니다`,
            );
          } else {
            references.push({
              sourceId,
              file,
              location: `${childLocation}[${index}]`,
            });
          }
        }
      }
    } else if (key === "sourceId") {
      if (typeof child !== "string" || child.trim() === "") {
        fail(`${file} ${childLocation}: 비어 있지 않은 문자열이어야 합니다`);
      } else {
        references.push({ sourceId: child, file, location: childLocation });
      }
    }
    collectSourceReferences(child, file, childLocation);
  }
}

const registryPath = "src/data/sources/sourceRegistry.json";
const registry = readJson(registryPath) ?? [];
check(Array.isArray(registry), `${registryPath}: 배열이어야 합니다`);
const sourceIds = registry.map((source) => source.id);
check(
  sourceIds.length === new Set(sourceIds).size,
  `${registryPath}: 중복 source id가 있습니다`,
);
const sourceUrls = registry.map((source) => source.url);
check(
  sourceUrls.length === new Set(sourceUrls).size,
  `${registryPath}: 동일 URL은 하나의 레지스트리 항목으로만 관리해야 합니다`,
);

const registryById = new Map(registry.map((source) => [source.id, source]));
const requiredRegistryFields = [
  "id",
  "sourceName",
  "sourceType",
  "publisher",
  "url",
  "accessedAt",
  "competition",
  "season",
  "teamId",
  "playerId",
  "metricCoverage",
  "usagePermission",
  "notes",
];
for (const [index, source] of registry.entries()) {
  const label = `${registryPath}[${index}]`;
  for (const field of requiredRegistryFields) {
    check(
      Object.prototype.hasOwnProperty.call(source, field),
      `${label}: required registry field ${field} is missing`,
    );
  }
  check(
    typeof source.id === "string" && source.id.trim() !== "",
    `${label}: id가 필요합니다`,
  );
  check(
    typeof (source.title ?? source.sourceName) === "string" &&
      (source.title ?? source.sourceName).trim() !== "",
    `${label}: title 또는 sourceName이 필요합니다`,
  );
  check(
    typeof source.publisher === "string" && source.publisher.trim() !== "",
    `${label}: publisher가 필요합니다`,
  );
  check(
    typeof source.sourceType === "string" && source.sourceType.trim() !== "",
    `${label}: sourceType이 필요합니다`,
  );
  try {
    const url = new URL(source.url);
    check(
      url.protocol === "https:" || url.protocol === "http:",
      `${label}: URL은 http(s)여야 합니다`,
    );
  } catch {
    fail(`${label}: 유효한 URL이 아닙니다`);
  }
  check(
    /^\d{4}-\d{2}-\d{2}$/.test(source.accessedAt ?? "") &&
      Number.isFinite(Date.parse(`${source.accessedAt}T00:00:00Z`)),
    `${label}: accessedAt은 YYYY-MM-DD여야 합니다`,
  );
  check(
    USAGE_PERMISSIONS.has(source.usagePermission),
    `${label}: usagePermission은 허용된 5개 판정 중 하나여야 합니다`,
  );
}

const dataFiles = [
  "src/data/teams/teams.json",
  "src/data/players/group-a-players.json",
  "src/data/tournament/tournament.json",
  "src/data/tournament/group-a.json",
  "src/data/leagues/leagues.json",
  "src/data/leagues/league-strength.json",
  ...TEAM_IDS.map((teamId) => `src/data/squads/${teamId}.json`),
  ...TEAM_IDS.map(
    (teamId) => `src/data/club-performance/${teamId}.json`,
  ),
  ...TEAM_IDS.map(
    (teamId) => `src/data/national-performance/${teamId}.json`,
  ),
  ...jsonFiles("src/data/matches/group-a"),
  ...jsonFiles("src/data/scenarios/group-a"),
];

for (const file of dataFiles) {
  const data = readJson(file);
  if (data !== null) collectSourceReferences(data, file);
}

for (const reference of references) {
  check(
    registryById.has(reference.sourceId),
    `${reference.file} ${reference.location}: ${reference.sourceId}가 sourceRegistry에 없습니다`,
  );
}

for (const reference of references.filter(
  ({ file }) =>
    file.includes("club-performance") ||
    file.includes("national-performance"),
)) {
  const permission = registryById.get(reference.sourceId)?.usagePermission;
  check(
    permission !== "restricted" && permission !== "unknown",
    `${reference.file} ${reference.location}: BASE 원자료는 ${String(permission)} 출처 ${reference.sourceId}를 사용할 수 없습니다`,
  );
}

const matches = jsonFiles("src/data/matches/group-a").flatMap((file) => {
  const value = readJson(file);
  return value ? [value] : [];
});
const requiredMatchSourceTypes = [
  "official_full_time_match_report",
  "official_tactical_lineup",
  "official_post_match_summary_report",
  "official_match_data_api",
  "official_match_article",
];
for (const match of matches) {
  const records = (match.sourceIds ?? [])
    .map((sourceId) => registryById.get(sourceId))
    .filter(Boolean);
  const types = records.map((record) => record.sourceType);
  for (const sourceType of requiredMatchSourceTypes) {
    check(
      types.includes(sourceType),
      `${match.id}: ${sourceType} 출처가 없습니다`,
    );
  }
  check(
    records.length === requiredMatchSourceTypes.length,
    `${match.id}: 경기 출처는 공식 FTR/Tactical/PMSR/API/Article 5종이어야 합니다`,
  );
}

const uniqueReferencedIds = [...new Set(references.map((item) => item.sourceId))];
const unusedRegistryIds = sourceIds.filter(
  (sourceId) => !uniqueReferencedIds.includes(sourceId),
);

if (failures.length > 0) {
  console.error(`\nGroup A source validation FAILED (${failures.length})`);
  for (const message of failures) console.error(`- ${message}`);
  process.exitCode = 1;
} else {
  console.log("Group A source validation PASSED");
  console.log(
    `- registry=${registry.length}, referencedUnique=${uniqueReferencedIds.length}, usages=${references.length}`,
  );
  console.log(
    `- officialMatchBundles=${matches.length}/6, unresolved=0, unusedRegistry=${unusedRegistryIds.length}`,
  );
}
