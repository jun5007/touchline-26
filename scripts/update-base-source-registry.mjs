import path from "node:path";
import {
  PROJECT_ROOT,
  readJson,
  writeJson,
} from "./base-profile-common.mjs";

const registryPath = "src/data/sources/sourceRegistry.json";
const existing = readJson(registryPath).map((source) => ({
  ...source,
  usagePermission:
    source.usagePermission === "unknown"
      ? "restricted"
      : source.usagePermission,
  usageLocation: source.usageLocation ?? "existing verified match facts",
  usageTerms:
    source.usageTerms ??
    "기존 프로젝트에 이미 포함된 경기 사실의 검증 근거입니다. 이번 BASE 원자료 수집에는 사용하지 않습니다.",
  transformation:
    source.transformation ?? "BASE PROFILE 성능 원자료로 변환하지 않음",
}));

const common = {
  accessedAt: "2026-07-28",
  competition: "multiple",
  season: "2025/26",
  teamId: null,
  playerId: null,
  usageLocation: "BASE_PROFILE_SOURCE_AUDIT.md only",
  transformation: "none; rights and coverage review only",
};

const auditedSources = [
  {
    id: "base-audit-kleague-portal",
    sourceName: "K League Data Portal",
    sourceType: "official_league_statistics",
    publisher: "Korea Professional Football League",
    url: "https://portal.kleague.com/",
    metricCoverage: ["minutes", "goals", "assists", "playerActions"],
    usagePermission: "restricted",
    usageTerms:
      "보도 목적 외 기록·자료·데이터의 복제·저장·배포·판매는 사전 허가가 필요합니다.",
    notes: "공개 재사용 권한이 없어 BASE JSON에 복사하지 않았습니다.",
    ...common,
  },
  {
    id: "base-audit-chance-liga-copyright",
    sourceName: "Chance Liga Copyright",
    sourceType: "official_league_terms",
    publisher: "Ligová fotbalová asociace",
    url: "https://www.chanceliga.cz/text/29-copyright",
    metricCoverage: ["playerStatistics", "Stats Perform supplied data"],
    usagePermission: "restricted",
    usageTerms:
      "사전 동의 없는 추가 게재·복제·배포가 금지됩니다.",
    notes: "체코 리그 P0 성능 수치를 저장하지 않았습니다.",
    ...common,
  },
  {
    id: "base-audit-liga-mx-statistics",
    sourceName: "Liga MX Official Statistics",
    sourceType: "official_league_statistics",
    publisher: "Liga MX / FMF",
    url: "https://subinternacional.ligamx.net/cancha/estadistica",
    metricCoverage: ["appearances", "minutes", "goals", "cards"],
    usagePermission: "restricted",
    usageTerms:
      "전자·자기 매체를 포함한 전부 또는 일부 복제를 허용하는 공개 라이선스가 없습니다.",
    notes: "공개 재사용 권한이 없어 BASE JSON에 복사하지 않았습니다.",
    ...common,
  },
  {
    id: "base-audit-psl-terms",
    sourceName: "Premier Soccer League Website Terms",
    sourceType: "official_league_terms",
    publisher: "National Soccer League",
    url: "https://www.psl.co.za/content/101801",
    metricCoverage: ["fixtures", "results", "standings"],
    usagePermission: "restricted",
    usageTerms:
      "개인·교육적 열람 범위를 넘는 복제·개작·배포·출판·데이터베이스 이용은 동의가 필요합니다.",
    notes: "요구 선수 지표도 부족해 BASE 원자료로 사용하지 않았습니다.",
    ...common,
  },
  {
    id: "base-audit-premier-league-terms",
    sourceName: "Premier League Terms and Conditions",
    sourceType: "official_league_terms",
    publisher: "Football Association Premier League",
    url: "https://www.premierleague.com/terms-and-conditions",
    metricCoverage: ["Opta player statistics"],
    usagePermission: "restricted",
    usageTerms:
      "개인·사적 이용 범위를 넘는 데이터베이스 작성·재생산·재사용·재배포는 승인이 필요합니다.",
    notes: "BASE JSON에 저장하지 않았습니다.",
    ...common,
  },
  {
    id: "base-audit-bundesliga-terms",
    sourceName: "Bundesliga Terms of Use",
    sourceType: "official_league_terms",
    publisher: "Deutsche Fußball Liga",
    url: "https://www.bundesliga.com/en/bundesliga/info/terms-of-use-services",
    metricCoverage: ["official player statistics", "BMF data"],
    usagePermission: "restricted",
    usageTerms:
      "콘텐츠와 BMF 데이터는 보호 대상이며 개인·비상업 열람을 넘는 공개 재사용 권리가 없습니다.",
    notes: "BASE JSON에 저장하지 않았습니다.",
    ...common,
  },
  {
    id: "base-audit-uefa-terms",
    sourceName: "UEFA Terms and Conditions",
    sourceType: "official_confederation_terms",
    publisher: "UEFA",
    url: "https://www.uefa.com/termsconditions/",
    metricCoverage: ["UEFA competition player statistics"],
    usagePermission: "restricted",
    usageTerms:
      "개인 열람 외 체계적 수집, 데이터베이스 작성, 로봇·스크립트 수집과 모델 개발 이용이 제한됩니다.",
    notes: "BASE JSON에 저장하지 않았습니다.",
    ...common,
  },
  {
    id: "base-audit-fifa-terms",
    sourceName: "FIFA Terms of Service",
    sourceType: "official_federation_terms",
    publisher: "FIFA",
    url: "https://inside.fifa.com/terms-of-service",
    metricCoverage: ["FIFA competition facts", "FIFA platform data"],
    usagePermission: "restricted",
    usageTerms:
      "콘텐츠·데이터·API의 복제·배포·활용은 FIFA 권리와 이용조건의 적용을 받습니다.",
    notes:
      "FDP는 제한 접근이며 365일 클럽 성능 데이터도 아닙니다. 새 BASE 원자료로 사용하지 않았습니다.",
    ...common,
  },
  {
    id: "base-audit-openfootball",
    sourceName: "OpenFootball football.json",
    sourceType: "open_dataset",
    publisher: "OpenFootball",
    url: "https://github.com/openfootball/football.json",
    metricCoverage: ["fixtures", "team results"],
    usagePermission: "open_license",
    usageTerms: "CC0",
    notes: "선수 출전·분·행동 지표가 없어 P0 BASE 커버리지는 0명입니다.",
    ...common,
  },
  {
    id: "base-audit-openligadb",
    sourceName: "OpenLigaDB",
    sourceType: "open_api",
    publisher: "OpenLigaDB",
    url: "https://openligadb.de/",
    metricCoverage: ["fixtures", "team results", "goal events"],
    usagePermission: "open_license",
    usageTerms: "ODbL; 파생 데이터베이스 공개 시 귀속·동일조건 의무",
    notes: "대상 P0 선수의 시즌 성능 집계를 제공하지 않아 커버리지는 0명입니다.",
    ...common,
  },
  {
    id: "base-audit-wikidata",
    sourceName: "Wikidata Data Access",
    sourceType: "open_knowledge_graph",
    publisher: "Wikimedia Foundation",
    url: "https://www.wikidata.org/wiki/Help:Data_access",
    metricCoverage: ["identity", "club", "broad position metadata"],
    usagePermission: "open_license",
    usageTerms: "CC0",
    notes: "성능 데이터가 없어 P0 BASE 커버리지는 0명입니다.",
    ...common,
  },
  {
    id: "base-audit-skillcorner-open-data",
    sourceName: "SkillCorner Open Data",
    sourceType: "open_dataset",
    publisher: "SkillCorner",
    url: "https://github.com/SkillCorner/opendata",
    metricCoverage: ["sample tracking", "sample events"],
    usagePermission: "open_license",
    usageTerms: "MIT",
    notes: "2024/25 호주 A리그 샘플로 대상 기간·P0와 일치하지 않습니다.",
    ...common,
  },
  {
    id: "base-audit-wyscout-events",
    sourceName: "Wyscout Events Dataset",
    sourceType: "research_dataset",
    publisher: "Wyscout / figshare",
    url: "https://figshare.com/articles/dataset/Events/7770599",
    metricCoverage: ["historical event data"],
    usagePermission: "open_license",
    usageTerms: "CC BY 4.0",
    notes: "구시즌 연구 데이터로 대상 기간·P0와 일치하지 않습니다.",
    ...common,
  },
  {
    id: "base-audit-statsbomb-open-data",
    sourceName: "Hudl StatsBomb Open Data",
    sourceType: "public_dataset_with_agreement",
    publisher: "Hudl StatsBomb",
    url: "https://github.com/hudl/open-data",
    metricCoverage: ["selected competition event data"],
    usagePermission: "restricted",
    usageTerms:
      "Public Data User Agreement가 적용되며 연구 목적과 제3자 제공·재배포·상업 이용 제한이 있습니다.",
    notes: "대상 기간 P0 데이터도 없어 웹서비스 번들에 포함하지 않았습니다.",
    ...common,
  },
  {
    id: "base-audit-football-data-api",
    sourceName: "football-data.org API",
    sourceType: "registration_api",
    publisher: "football-data.org",
    url: "https://www.football-data.org/documentation/api",
    metricCoverage: ["fixtures", "results", "standings", "tiered data"],
    usagePermission: "restricted",
    usageTerms:
      "계정·API 키가 필요하고 선수·라인업 데이터는 유료 범위이며 공개 재배포 라이선스가 아닙니다.",
    notes: "무료·무로그인 조건을 충족하지 않아 사용하지 않았습니다.",
    ...common,
  },
  {
    id: "base-audit-sportmonks-api",
    sourceName: "Sportmonks Football API",
    sourceType: "commercial_api",
    publisher: "Sportmonks",
    url: "https://www.sportmonks.com/football-api/",
    metricCoverage: ["commercial football statistics"],
    usagePermission: "restricted",
    usageTerms: "계정·토큰·구독 계약이 필요합니다.",
    notes: "무료·무로그인 조건을 충족하지 않아 사용하지 않았습니다.",
    ...common,
  },
  {
    id: "base-audit-sports-reference-policy",
    sourceName: "Sports Reference Data Use Policy",
    sourceType: "publisher_data_policy",
    publisher: "Sports Reference",
    url: "https://www.sports-reference.com/data_use.html",
    metricCoverage: ["FBref displayed statistics"],
    usagePermission: "restricted",
    usageTerms:
      "자동 접근, 데이터베이스 생성 및 재배포가 제한되며 제3자 권리 데이터가 포함됩니다.",
    notes: "공식·오픈 출처가 아니므로 BASE JSON에 사용하지 않았습니다.",
    ...common,
  },
];

const byId = new Map(
  [...existing, ...auditedSources].map((source) => [source.id, source]),
);
writeJson(registryPath, [...byId.values()]);

console.log(
  `BASE source registry updated: ${path.relative(PROJECT_ROOT, path.join(PROJECT_ROOT, registryPath))}`,
);
console.log(
  `- existing=${existing.length}, audited=${auditedSources.length}, total=${byId.size}`,
);
