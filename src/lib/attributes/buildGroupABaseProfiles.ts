import type {
  GroupABaseProfile,
  GroupAFieldAttributeKey,
  GroupAGoalkeeperAttributeKey,
  GroupAPerformanceProfile,
  GroupAPerformanceRecord,
  GroupAPlayer,
  GroupAPositionGroup,
  GroupASourceRecord,
} from "../../data/group-a/types";
import {
  FIELD_ATTRIBUTE_KEYS,
  GOALKEEPER_ATTRIBUTE_KEYS,
} from "../../data/group-a/types";
import {
  FIELD_BASE_ATTRIBUTE_DEFINITIONS,
  GOALKEEPER_BASE_ATTRIBUTE_DEFINITIONS,
  MINIMUM_MINUTES_BY_POSITION,
  SUCCESS_RATE_MINIMUM_ATTEMPTS,
  TLSI_MAXIMUM_FACTOR,
  TLSI_MINIMUM_FACTOR,
  aggregatePerformanceRecords,
  buildPositionComparisonSamples,
  calculateNullableBaseAttribute,
  combineClubAndNationalEvidence,
  type AggregatedPerformance,
  type BaseAttributeDefinition,
  type MetricAggregationDefinition,
  type NullableBaseAttributeResult,
  type PerformanceRecord,
  type TlsiInput,
} from "./baseProfile";

export const GROUP_A_BASE_PERIOD = {
  start: "2025-06-11",
  end: "2026-06-10",
} as const;

const ALLOWED_RAW_SOURCE_PERMISSIONS = new Set<
  GroupASourceRecord["usagePermission"]
>([
  "allowed_factual_use",
  "allowed_with_attribution",
  "open_license",
]);

const CLUB_FULL_RELIABILITY_MINUTES = 1_200;
const NATIONAL_FULL_RELIABILITY_MINUTES = 360;

type PerformanceDomain = "club" | "national";

export interface LeagueStrengthInput {
  leagueId: string;
  strengthFactor: number;
  applied: boolean;
}

export interface BuildGroupABaseProfilesInput {
  players: readonly GroupAPlayer[];
  clubProfiles: readonly GroupAPerformanceProfile[];
  nationalProfiles: readonly GroupAPerformanceProfile[];
  sources: readonly GroupASourceRecord[];
  leagueStrength?: readonly LeagueStrengthInput[];
}

export interface BuildGroupABaseProfilesResult {
  players: GroupAPlayer[];
  generatedPlayerIds: string[];
  preservedPlayerIds: string[];
  eligiblePerformanceRecordCount: number;
  activeAttributeCount: number;
}

interface DomainAggregate {
  domain: PerformanceDomain;
  player: GroupAPlayer;
  records: PerformanceRecord[];
  baseline: AggregatedPerformance;
  adjusted: AggregatedPerformance;
  minutes: number | null;
  sourceReliability: number;
  sourceIds: string[];
  imputedMetrics: string[];
  weightedTlsiFactor: number | null;
  tlsiApplied: boolean;
}

interface AttributeBuildEvidence {
  club: NullableBaseAttributeResult | null;
  national: NullableBaseAttributeResult | null;
}

const FIELD_AGGREGATION_DEFINITIONS = {
  goalsPer90: { kind: "per90", sourceMetric: "goals" },
  shotsOnTargetPer90: {
    kind: "per90",
    sourceMetric: "shotsOnTarget",
  },
  shotConversion: {
    kind: "successRate",
    numeratorMetric: "goals",
    denominatorMetric: "shots",
    minimumAttempts: SUCCESS_RATE_MINIMUM_ATTEMPTS.shotConversion,
  },
  assistsPer90: { kind: "per90", sourceMetric: "assists" },
  keyPassesPer90: { kind: "per90", sourceMetric: "keyPasses" },
  chancesCreatedPer90: {
    kind: "per90",
    sourceMetric: "chancesCreated",
  },
  finalThirdPassesPer90: {
    kind: "per90",
    sourceMetric: "finalThirdPasses",
  },
  successfulDribblesPer90: {
    kind: "per90",
    sourceMetric: "dribblesCompleted",
  },
  dribbleSuccessRate: {
    kind: "successRate",
    numeratorMetric: "dribblesCompleted",
    denominatorMetric: "dribblesAttempted",
    minimumAttempts: SUCCESS_RATE_MINIMUM_ATTEMPTS.dribbleSuccessRate,
  },
  progressiveCarriesPer90: {
    kind: "per90",
    sourceMetric: "progressiveCarries",
  },
  passCompletionRate: {
    kind: "successRate",
    numeratorMetric: "passesCompleted",
    denominatorMetric: "passesAttempted",
    minimumAttempts: SUCCESS_RATE_MINIMUM_ATTEMPTS.passCompletionRate,
  },
  progressivePassesPer90: {
    kind: "per90",
    sourceMetric: "progressivePasses",
  },
  tacklesPer90: { kind: "per90", sourceMetric: "tackles" },
  interceptionsPer90: {
    kind: "per90",
    sourceMetric: "interceptions",
  },
  recoveriesPer90: { kind: "per90", sourceMetric: "recoveries" },
  pressuresPer90: { kind: "per90", sourceMetric: "pressures" },
  clearancesPer90: { kind: "per90", sourceMetric: "clearances" },
  blocksPer90: { kind: "per90", sourceMetric: "blocks" },
  aerialDuelsWonPer90: {
    kind: "per90",
    sourceMetric: "aerialDuelsWon",
  },
  aerialWinRate: {
    kind: "successRate",
    numeratorMetric: "aerialDuelsWon",
    denominatorMetric: "aerialDuelsAttempted",
    minimumAttempts: SUCCESS_RATE_MINIMUM_ATTEMPTS.aerialWinRate,
  },
  goalsAndAssistsPer90: {
    kind: "per90",
    sourceMetric: "goalsAndAssists",
  },
} as const satisfies Readonly<
  Record<string, MetricAggregationDefinition>
>;

const GOALKEEPER_AGGREGATION_DEFINITIONS = {
  saveRate: {
    kind: "successRate",
    numeratorMetric: "saves",
    denominatorMetric: "shotsOnTargetFaced",
    minimumAttempts: 1,
  },
  savesPer90: { kind: "per90", sourceMetric: "saves" },
  passCompletionRate: {
    kind: "successRate",
    numeratorMetric: "passesCompleted",
    denominatorMetric: "passesAttempted",
    minimumAttempts: SUCCESS_RATE_MINIMUM_ATTEMPTS.passCompletionRate,
  },
  longPassCompletionRate: {
    kind: "successRate",
    numeratorMetric: "longPassesCompleted",
    denominatorMetric: "longPassesAttempted",
    minimumAttempts: 20,
  },
  crossesClaimedPer90: {
    kind: "per90",
    sourceMetric: "crossesClaimed",
  },
  aerialActionsPer90: {
    kind: "per90",
    sourceMetric: "aerialDuelsAttempted",
  },
  sweeperActionsPer90: {
    kind: "per90",
    sourceMetric: "sweeperActions",
  },
  penaltySaveRate: {
    kind: "successRate",
    numeratorMetric: "penaltiesSaved",
    denominatorMetric: "penaltiesFaced",
    minimumAttempts: 1,
  },
  penaltiesSavedPer90: {
    kind: "per90",
    sourceMetric: "penaltiesSaved",
  },
  cleanSheetRate: {
    kind: "successRate",
    numeratorMetric: "cleanSheets",
    denominatorMetric: "appearances",
    minimumAttempts: 1,
  },
  goalsConcededPer90: {
    kind: "per90",
    sourceMetric: "goalsConceded",
    direction: "lower",
  },
} as const satisfies Readonly<
  Record<string, MetricAggregationDefinition>
>;

function unique(values: readonly string[]): string[] {
  return [...new Set(values.filter((value) => value.length > 0))];
}

function addNullable(
  left: number | null | undefined,
  right: number | null | undefined,
): number | null {
  return typeof left === "number" &&
    Number.isFinite(left) &&
    typeof right === "number" &&
    Number.isFinite(right)
    ? left + right
    : null;
}

function getAggregationDefinitions(
  player: GroupAPlayer,
): Readonly<Record<string, MetricAggregationDefinition>> {
  return player.baseProfile.activeAttributeModel === "goalkeeper"
    ? GOALKEEPER_AGGREGATION_DEFINITIONS
    : FIELD_AGGREGATION_DEFINITIONS;
}

function getMinimumMinutes(player: GroupAPlayer): number {
  const position = player.positionGroup;
  return position === null
    ? 900
    : MINIMUM_MINUTES_BY_POSITION[position];
}

function rawMetricsForAggregation(
  record: GroupAPerformanceRecord,
): Readonly<Record<string, number | null>> {
  return {
    ...record.rawMetrics,
    appearances: record.appearances,
    starts: record.starts,
    goalsAndAssists: addNullable(
      record.rawMetrics.goals,
      record.rawMetrics.assists,
    ),
  };
}

function assertFiniteNonNegative(
  value: number | null,
  label: string,
): void {
  if (value !== null && (!Number.isFinite(value) || value < 0)) {
    throw new Error(`${label}: null 또는 0 이상의 유한 숫자여야 합니다.`);
  }
}

function validateRawRecord(
  record: GroupAPerformanceRecord,
  label: string,
  sourcesById: ReadonlyMap<string, GroupASourceRecord>,
): void {
  if (record.sourceIds.length === 0) {
    throw new Error(`${label}: sourceIds가 비어 있습니다.`);
  }
  for (const sourceId of record.sourceIds) {
    const source = sourcesById.get(sourceId);
    if (!source) {
      throw new Error(`${label}: 등록되지 않은 sourceId ${sourceId}`);
    }
    if (!ALLOWED_RAW_SOURCE_PERMISSIONS.has(source.usagePermission)) {
      throw new Error(
        `${label}: ${sourceId}의 사용 권한 ${source.usagePermission}은 원자료 생성에 허용되지 않습니다.`,
      );
    }
  }
  assertFiniteNonNegative(record.appearances, `${label}.appearances`);
  assertFiniteNonNegative(record.starts, `${label}.starts`);
  assertFiniteNonNegative(record.minutes, `${label}.minutes`);
  for (const [metric, value] of Object.entries(record.rawMetrics)) {
    assertFiniteNonNegative(value, `${label}.rawMetrics.${metric}`);
  }
}

function resolveStintTlsi(
  record: GroupAPerformanceRecord,
  domain: PerformanceDomain,
  leagueStrengthById: ReadonlyMap<string, LeagueStrengthInput>,
): TlsiInput {
  if (domain === "national") {
    return { applied: false, strengthFactor: 1 };
  }

  const leagueInput = record.leagueId
    ? leagueStrengthById.get(record.leagueId)
    : undefined;
  const applied = record.tlsiApplied ?? leagueInput?.applied ?? false;
  const factor =
    record.strengthFactor ?? leagueInput?.strengthFactor ?? 1;

  if (!applied) {
    return { applied: false, strengthFactor: 1 };
  }
  if (
    !Number.isFinite(factor) ||
    factor < TLSI_MINIMUM_FACTOR ||
    factor > TLSI_MAXIMUM_FACTOR
  ) {
    throw new Error(
      `${record.competitionId}: 적용 TLSI strengthFactor는 ${TLSI_MINIMUM_FACTOR}~${TLSI_MAXIMUM_FACTOR}여야 합니다.`,
    );
  }
  return { applied: true, strengthFactor: factor };
}

export function adaptGroupAPerformanceRecord(
  record: GroupAPerformanceRecord,
  domain: PerformanceDomain,
  leagueStrengthById: ReadonlyMap<string, LeagueStrengthInput> = new Map(),
): PerformanceRecord {
  const sourceIds = unique(record.sourceIds);
  if (sourceIds.length === 0) {
    throw new Error(`${record.competitionId}: sourceIds가 비어 있습니다.`);
  }
  return {
    sourceId: sourceIds[0],
    sourceIds,
    minutes: record.minutes,
    metrics: rawMetricsForAggregation(record),
    tlsi: resolveStintTlsi(record, domain, leagueStrengthById),
  };
}

function totalMinutes(records: readonly PerformanceRecord[]): number | null {
  const validMinutes = records
    .map((record) => record.minutes)
    .filter(
      (minutes): minutes is number =>
        typeof minutes === "number" &&
        Number.isFinite(minutes) &&
        minutes >= 0,
    );
  return validMinutes.length > 0
    ? validMinutes.reduce((total, minutes) => total + minutes, 0)
    : null;
}

function sourceReliabilityForRecords(
  rawRecords: readonly GroupAPerformanceRecord[],
  sourcesById: ReadonlyMap<string, GroupASourceRecord>,
): number {
  const sourceIds = unique(
    rawRecords.flatMap((record) => record.sourceIds),
  );
  if (sourceIds.length === 0) return 0;

  const permissions = sourceIds.map(
    (sourceId) => sourcesById.get(sourceId)?.usagePermission,
  );
  const permissionReliability = permissions.includes("open_license")
    ? 0.75
    : sourceIds.length > 1
      ? 1
      : 0.9;
  return rawRecords.some(
    (record) => record.verificationStatus === "partial",
  )
    ? Math.min(permissionReliability, 0.5)
    : permissionReliability;
}

function withMinutesReliability(
  aggregate: AggregatedPerformance,
  player: GroupAPlayer,
  minutes: number | null,
  sourceIds: readonly string[],
): AggregatedPerformance {
  const minimumMinutes = getMinimumMinutes(player);
  const value =
    minutes === null
      ? null
      : Math.max(0, Math.min(1, minutes / minimumMinutes));
  return {
    metrics: {
      ...aggregate.metrics,
      minutesReliability: value,
    },
    evidence: {
      ...aggregate.evidence,
      minutesReliability: {
        metric: "minutesReliability",
        kind: "sum",
        value,
        observedRecordCount: minutes === null ? 0 : 1,
        sourceIds: [...sourceIds],
        minutes,
        numerator: minutes,
        denominator: minimumMinutes,
        minimumAttempts: null,
        missingReason: minutes === null ? "no_valid_minutes" : null,
        tlsiApplied: false,
      },
    },
  };
}

function weightedTlsiFactor(
  records: readonly PerformanceRecord[],
): number | null {
  const applied = records.filter(
    (record) =>
      record.tlsi?.applied &&
      typeof record.tlsi.strengthFactor === "number" &&
      Number.isFinite(record.tlsi.strengthFactor),
  );
  if (applied.length === 0) return null;
  const weights = applied.map((record) =>
    typeof record.minutes === "number" && record.minutes > 0
      ? record.minutes
      : 1,
  );
  const weightTotal = weights.reduce((total, weight) => total + weight, 0);
  return applied.reduce(
    (total, record, index) =>
      total +
      (record.tlsi?.strengthFactor ?? 1) *
        (weights[index] / weightTotal),
    0,
  );
}

function buildDomainAggregate(
  domain: PerformanceDomain,
  player: GroupAPlayer,
  profile: GroupAPerformanceProfile | undefined,
  sourcesById: ReadonlyMap<string, GroupASourceRecord>,
  leagueStrengthById: ReadonlyMap<string, LeagueStrengthInput>,
): DomainAggregate {
  if (profile) {
    if (
      profile.period.start !== GROUP_A_BASE_PERIOD.start ||
      profile.period.end !== GROUP_A_BASE_PERIOD.end
    ) {
      throw new Error(
        `${profile.playerId} ${domain}: BASE PROFILE 분석 기간이 일치하지 않습니다.`,
      );
    }
    profile.records.forEach((record, index) =>
      validateRawRecord(
        record,
        `${profile.playerId} ${domain}.records[${index}]`,
        sourcesById,
      ),
    );
  }

  const eligibleRawRecords = (profile?.records ?? []).filter(
    (record) => record.verificationStatus !== "incomplete",
  );
  const records = eligibleRawRecords.map((record) =>
    adaptGroupAPerformanceRecord(
      record,
      domain,
      leagueStrengthById,
    ),
  );
  const baselineRecords = records.map((record) => ({
    ...record,
    tlsi: { applied: false, strengthFactor: 1 },
  }));
  const definitions = getAggregationDefinitions(player);
  const minutes = totalMinutes(records);
  const sourceIds = unique(
    eligibleRawRecords.flatMap((record) => record.sourceIds),
  );
  const baseline = withMinutesReliability(
    aggregatePerformanceRecords(baselineRecords, definitions),
    player,
    minutes,
    sourceIds,
  );
  const adjusted = withMinutesReliability(
    aggregatePerformanceRecords(records, definitions),
    player,
    minutes,
    sourceIds,
  );
  const imputedMetrics = eligibleRawRecords.some(
    (record) => record.verificationStatus === "partial",
  )
    ? Object.entries(adjusted.metrics)
        .filter(([, value]) => typeof value === "number")
        .map(([metric]) => metric)
    : [];

  return {
    domain,
    player,
    records,
    baseline,
    adjusted,
    minutes,
    sourceReliability: sourceReliabilityForRecords(
      eligibleRawRecords,
      sourcesById,
    ),
    sourceIds,
    imputedMetrics,
    weightedTlsiFactor: weightedTlsiFactor(records),
    tlsiApplied: records.some((record) => record.tlsi?.applied),
  };
}

function metricSourceIds(
  aggregate: AggregatedPerformance,
): Record<string, readonly string[]> {
  return Object.fromEntries(
    Object.entries(aggregate.evidence).map(([metric, evidence]) => [
      metric,
      evidence.sourceIds,
    ]),
  );
}

function clampAttribute(value: number): number {
  return Math.max(1, Math.min(20, value));
}

function mergeStintTlsiResult(
  baseline: NullableBaseAttributeResult,
  adjusted: NullableBaseAttributeResult,
  aggregate: DomainAggregate,
): NullableBaseAttributeResult {
  if (!aggregate.tlsiApplied) return adjusted;
  if (
    baseline.score === null ||
    adjusted.score === null ||
    baseline.percentile === null ||
    adjusted.percentile === null
  ) {
    return {
      ...adjusted,
      baselinePercentile: null,
      baselineRawScore: null,
      baselineScore: null,
      score: null,
      tlsi: {
        applied: true,
        requestedFactor: aggregate.weightedTlsiFactor,
        effectiveFactor: aggregate.weightedTlsiFactor ?? 1,
        pointAdjustment: 0,
        reason: "applied",
      },
    };
  }
  const pointAdjustment =
    adjusted.score > baseline.score
      ? 1
      : adjusted.score < baseline.score
        ? -1
        : 0;
  return {
    ...adjusted,
    baselinePercentile: baseline.percentile,
    baselineRawScore: baseline.rawScore,
    baselineScore: baseline.score,
    score: clampAttribute(baseline.score + pointAdjustment),
    tlsi: {
      applied: true,
      requestedFactor: aggregate.weightedTlsiFactor,
      effectiveFactor: aggregate.weightedTlsiFactor ?? 1,
      pointAdjustment,
      reason: "applied",
    },
  };
}

function calculateDomainAttribute(
  aggregate: DomainAggregate,
  definition: BaseAttributeDefinition,
  baselineSamples: Readonly<
    Record<string, readonly number[] | undefined>
  >,
  adjustedSamples: Readonly<
    Record<string, readonly number[] | undefined>
  >,
): NullableBaseAttributeResult | null {
  if (aggregate.records.length === 0) return null;
  const fullReliabilityMinutes =
    aggregate.domain === "club"
      ? CLUB_FULL_RELIABILITY_MINUTES
      : NATIONAL_FULL_RELIABILITY_MINUTES;
  const common = {
    definition,
    sampleMinutes: aggregate.minutes,
    fullReliabilityMinutes,
    sourceReliability: aggregate.sourceReliability,
    imputedMetrics: aggregate.imputedMetrics,
    minimumComparisonSize: 2,
  } as const;
  const baseline = calculateNullableBaseAttribute({
    ...common,
    metrics: aggregate.baseline.metrics,
    comparisonSamples: baselineSamples,
    metricSourceIds: metricSourceIds(aggregate.baseline),
  });
  const adjusted = calculateNullableBaseAttribute({
    ...common,
    metrics: aggregate.adjusted.metrics,
    comparisonSamples: adjustedSamples,
    metricSourceIds: metricSourceIds(aggregate.adjusted),
  });
  return mergeStintTlsiResult(baseline, adjusted, aggregate);
}

function nullFieldAttributes(): Record<
  GroupAFieldAttributeKey,
  number | null
> {
  return Object.fromEntries(
    FIELD_ATTRIBUTE_KEYS.map((key) => [key, null]),
  ) as Record<GroupAFieldAttributeKey, number | null>;
}

function nullGoalkeeperAttributes(): Record<
  GroupAGoalkeeperAttributeKey,
  number | null
> {
  return Object.fromEntries(
    GOALKEEPER_ATTRIBUTE_KEYS.map((key) => [key, null]),
  ) as Record<GroupAGoalkeeperAttributeKey, number | null>;
}

function dataGrade(
  activeAttributeCount: number,
  confidence: number,
): GroupABaseProfile["dataGrade"] {
  if (activeAttributeCount === 8 && confidence >= 0.75) return "A";
  if (activeAttributeCount >= 6 && confidence >= 0.5) return "B";
  if (activeAttributeCount > 0) return "C";
  return "D";
}

function average(values: readonly number[]): number {
  return values.length > 0
    ? values.reduce((total, value) => total + value, 0) /
        values.length
    : 0;
}

function buildPlayerBaseProfile(
  player: GroupAPlayer,
  club: DomainAggregate,
  national: DomainAggregate,
  clubBaselineSamples: Readonly<
    Record<string, readonly number[] | undefined>
  >,
  clubAdjustedSamples: Readonly<
    Record<string, readonly number[] | undefined>
  >,
  nationalBaselineSamples: Readonly<
    Record<string, readonly number[] | undefined>
  >,
  nationalAdjustedSamples: Readonly<
    Record<string, readonly number[] | undefined>
  >,
): GroupABaseProfile {
  const isGoalkeeper =
    player.baseProfile.activeAttributeModel === "goalkeeper";
  const definitions = isGoalkeeper
    ? GOALKEEPER_BASE_ATTRIBUTE_DEFINITIONS
    : FIELD_BASE_ATTRIBUTE_DEFINITIONS;
  const attributeEvidence = new Map<string, AttributeBuildEvidence>();
  const scores = new Map<string, number | null>();

  for (const [attribute, definition] of Object.entries(definitions)) {
    const clubResult = calculateDomainAttribute(
      club,
      definition,
      clubBaselineSamples,
      clubAdjustedSamples,
    );
    const nationalResult = calculateDomainAttribute(
      national,
      definition,
      nationalBaselineSamples,
      nationalAdjustedSamples,
    );
    attributeEvidence.set(attribute, {
      club: clubResult,
      national: nationalResult,
    });
    scores.set(
      attribute,
      combineClubAndNationalEvidence(
        clubResult,
        nationalResult,
      ).score,
    );
  }

  const field = nullFieldAttributes();
  const goalkeeper = nullGoalkeeperAttributes();
  const activeKeys = isGoalkeeper
    ? GOALKEEPER_ATTRIBUTE_KEYS
    : FIELD_ATTRIBUTE_KEYS;
  for (const key of activeKeys) {
    const score = scores.get(key) ?? null;
    if (isGoalkeeper) {
      goalkeeper[key as GroupAGoalkeeperAttributeKey] = score;
    } else {
      field[key as GroupAFieldAttributeKey] = score;
    }
  }

  const combined = [...attributeEvidence.values()].map((evidence) =>
    combineClubAndNationalEvidence(
      evidence.club,
      evidence.national,
    ),
  );
  const activeCombined = combined.filter((result) => result.score !== null);
  const activeAttributeCount = activeCombined.length;
  const confidence = average(
    activeCombined.map((result) => result.confidence),
  );
  const missingAttributes = activeKeys.filter(
    (key) => scores.get(key) === null || scores.get(key) === undefined,
  );
  const status: GroupABaseProfile["status"] =
    activeAttributeCount === activeKeys.length
      ? "complete"
      : activeAttributeCount > 0
        ? "partial"
        : "incomplete";
  const domainResults = [...attributeEvidence.values()].flatMap(
    (evidence) =>
      [evidence.club, evidence.national].filter(
        (result): result is NullableBaseAttributeResult =>
          result !== null,
      ),
  );
  const clubWeights = activeCombined.flatMap((result) =>
    result.domainEvidence
      .filter((domain) => domain.domain === "club")
      .map((domain) => domain.actualWeight),
  );
  const nationalWeights = activeCombined.flatMap((result) =>
    result.domainEvidence
      .filter((domain) => domain.domain === "national")
      .map((domain) => domain.actualWeight),
  );
  const analysisMinutesValues = [club.minutes, national.minutes].filter(
    (minutes): minutes is number => minutes !== null,
  );
  const analysisMinutes =
    analysisMinutesValues.length > 0
      ? analysisMinutesValues.reduce(
          (total, minutes) => total + minutes,
          0,
        )
      : null;

  return {
    period: GROUP_A_BASE_PERIOD,
    analysisMinutes,
    dataGrade: dataGrade(activeAttributeCount, confidence),
    confidence,
    status,
    activeAttributeModel: player.baseProfile.activeAttributeModel,
    attributes: { field, goalkeeper },
    missingAttributes: [...missingAttributes],
    sourceIds: unique(
      activeCombined.flatMap((result) => [...result.sourceIds]),
    ),
    note:
      activeAttributeCount > 0
        ? "허용된 최근 365일 원자료를 포지션 표본·신뢰도 수축·구간별 TLSI 규칙으로 계산한 TOUCHLINE 26 파생값입니다."
        : "허용된 원자료가 없거나 정확한 포지션 비교 표본이 없어 숫자를 만들지 않았습니다.",
    evidence: {
      clubMinutes: club.minutes,
      nationalMinutes: national.minutes,
      clubEvidenceWeight: average(clubWeights),
      nationalEvidenceWeight: average(nationalWeights),
      metricCoverage: average(
        domainResults.map((result) => result.metricCoverage),
      ),
      sourceReliability: average(
        [club, national]
          .filter((aggregate) => aggregate.records.length > 0)
          .map((aggregate) => aggregate.sourceReliability),
      ),
      usedMetrics: unique(
        domainResults.flatMap((result) =>
          result.evidence.map((metric) => metric.metric),
        ),
      ),
      missingMetrics: unique(
        domainResults.flatMap((result) =>
          result.missingMetrics.map((metric) => metric.metric),
        ),
      ),
      imputed: domainResults.some((result) => result.imputed),
    },
  };
}

function profileMap(
  profiles: readonly GroupAPerformanceProfile[],
  domain: PerformanceDomain,
  playerIds: ReadonlySet<string>,
): Map<string, GroupAPerformanceProfile> {
  const result = new Map<string, GroupAPerformanceProfile>();
  for (const profile of profiles) {
    if (!playerIds.has(profile.playerId)) {
      throw new Error(
        `${domain}-performance에 알 수 없는 선수 ${profile.playerId}가 있습니다.`,
      );
    }
    if (result.has(profile.playerId)) {
      throw new Error(
        `${domain}-performance에 선수 ${profile.playerId}가 중복되었습니다.`,
      );
    }
    result.set(profile.playerId, profile);
  }
  return result;
}

function samplesForAggregate(
  aggregates: readonly DomainAggregate[],
  positionGroup: GroupAPositionGroup,
  variant: "baseline" | "adjusted",
): Record<string, number[]> {
  return buildPositionComparisonSamples(
    aggregates.map((aggregate) => ({
      playerId: aggregate.player.id,
      positionGroup: aggregate.player.positionGroup,
      positionGroupStatus: aggregate.player.positionGroupStatus,
      metrics: aggregate[variant].metrics,
    })),
    positionGroup,
  );
}

export function buildGroupABaseProfiles({
  players,
  clubProfiles,
  nationalProfiles,
  sources,
  leagueStrength = [],
}: BuildGroupABaseProfilesInput): BuildGroupABaseProfilesResult {
  const playerIds = new Set(players.map((player) => player.id));
  if (playerIds.size !== players.length) {
    throw new Error("선수 ID가 중복되었습니다.");
  }
  const sourcesById = new Map(
    sources.map((source) => [source.id, source]),
  );
  if (sourcesById.size !== sources.length) {
    throw new Error("sourceRegistry ID가 중복되었습니다.");
  }
  const leagueStrengthById = new Map(
    leagueStrength.map((record) => [record.leagueId, record]),
  );
  const clubByPlayer = profileMap(
    clubProfiles,
    "club",
    playerIds,
  );
  const nationalByPlayer = profileMap(
    nationalProfiles,
    "national",
    playerIds,
  );
  const clubAggregates = players.map((player) =>
    buildDomainAggregate(
      "club",
      player,
      clubByPlayer.get(player.id),
      sourcesById,
      leagueStrengthById,
    ),
  );
  const nationalAggregates = players.map((player) =>
    buildDomainAggregate(
      "national",
      player,
      nationalByPlayer.get(player.id),
      sourcesById,
      leagueStrengthById,
    ),
  );
  const clubAggregateByPlayer = new Map(
    clubAggregates.map((aggregate) => [
      aggregate.player.id,
      aggregate,
    ]),
  );
  const nationalAggregateByPlayer = new Map(
    nationalAggregates.map((aggregate) => [
      aggregate.player.id,
      aggregate,
    ]),
  );
  const generatedPlayerIds: string[] = [];
  const preservedPlayerIds: string[] = [];

  const nextPlayers = players.map((player) => {
    const club = clubAggregateByPlayer.get(player.id);
    const national = nationalAggregateByPlayer.get(player.id);
    if (!club || !national) {
      throw new Error(`${player.id}: 도메인 집계가 누락되었습니다.`);
    }
    if (club.records.length === 0 && national.records.length === 0) {
      preservedPlayerIds.push(player.id);
      return player;
    }

    const positionGroup = player.positionGroup;
    if (
      positionGroup === null ||
      !["verified", "derived_from_lineups"].includes(
        player.positionGroupStatus,
      )
    ) {
      generatedPlayerIds.push(player.id);
      return {
        ...player,
        baseProfile: buildPlayerBaseProfile(
          player,
          club,
          national,
          {},
          {},
          {},
          {},
        ),
      };
    }

    generatedPlayerIds.push(player.id);
    return {
      ...player,
      baseProfile: buildPlayerBaseProfile(
        player,
        club,
        national,
        samplesForAggregate(
          clubAggregates,
          positionGroup,
          "baseline",
        ),
        samplesForAggregate(
          clubAggregates,
          positionGroup,
          "adjusted",
        ),
        samplesForAggregate(
          nationalAggregates,
          positionGroup,
          "baseline",
        ),
        samplesForAggregate(
          nationalAggregates,
          positionGroup,
          "adjusted",
        ),
      ),
    };
  });
  const activeAttributeCount = nextPlayers.reduce((total, player) => {
    const active =
      player.baseProfile.attributes[
        player.baseProfile.activeAttributeModel
      ];
    return (
      total +
      Object.values(active).filter(
        (value) => typeof value === "number" && Number.isInteger(value),
      ).length
    );
  }, 0);

  return {
    players: nextPlayers,
    generatedPlayerIds,
    preservedPlayerIds,
    eligiblePerformanceRecordCount:
      clubAggregates.reduce(
        (total, aggregate) => total + aggregate.records.length,
        0,
      ) +
      nationalAggregates.reduce(
        (total, aggregate) => total + aggregate.records.length,
        0,
      ),
    activeAttributeCount,
  };
}
