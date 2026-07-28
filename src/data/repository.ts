import rolesData from "@/data/roles/roles.json";
import sourceRegistryData from "@/data/sources/sourceRegistry.json";
import { getInstructions } from "@/data/instructionCatalog";
import { resultTemplates } from "@/data/resultTemplateCatalog";
import { roleSupportsPlayer } from "@/lib/decision/positionCompatibility";
import {
  getGroupAMatches,
  getGroupAPlayer,
  getGroupAPlayers,
  getGroupAScenario,
  getGroupAScenarios,
  getGroupAScenariosForMatch,
  getGroupATeam,
} from "@/data/group-a/catalog";
import type {
  GroupAMatch,
  GroupAMatchEvent,
  GroupAPlayer,
  GroupAScenario,
  GroupASourceRecord,
} from "@/data/group-a/types";
import type {
  DataSource,
  DecisionMatchView,
  DecisionScenarioContext,
  LineupSpot,
  Match,
  MatchEvent,
  Player,
  PositionGroup,
  Role,
  Scenario,
} from "@/data/types";

const roles = rolesData as Role[];
const sourceRegistry =
  sourceRegistryData as unknown as GroupASourceRecord[];

export { resultTemplates };

const officialPositionLabel = {
  GK: "골키퍼 · 공식 분류",
  DF: "수비수 · 공식 분류",
  MF: "미드필더 · 공식 분류",
  FW: "공격수 · 공식 분류",
} as const;

const positionGroupCandidatesByOfficialPosition: Record<
  GroupAPlayer["officialPosition"],
  PositionGroup[]
> = {
  GK: ["GK"],
  DF: ["CB", "FB_WB"],
  MF: ["DM", "CM_AM", "WINGER"],
  FW: ["WINGER", "STRIKER"],
};

function formatScore(score: { home: number; away: number }): string {
  return `${score.home}–${score.away}`;
}

function toSource(sourceId: string): DataSource {
  const source = sourceRegistry.find((candidate) => candidate.id === sourceId);
  if (!source) {
    return {
      sourceName: sourceId,
      sourceUrl: "",
      accessedAt: "미등록",
      license: "출처 레지스트리 확인 필요",
      verificationNote: "참조 ID가 레지스트리에 없어 검증에서 오류로 처리됩니다.",
    };
  }
  return {
    sourceName:
      source.sourceName ?? source.title ?? `${source.publisher} 공식 자료`,
    sourceUrl: source.url,
    accessedAt: source.accessedAt,
    license:
      typeof source.usagePermission === "string"
        ? source.usagePermission
        : "공개 사실 데이터 인용 · 재사용 조건 미확인",
    verificationNote:
      source.verificationNote ??
      (typeof source.notes === "string" ? source.notes : "공식 자료"),
  };
}

function adaptPlayer(
  player: GroupAPlayer,
  scenario?: GroupAScenario,
): Player {
  const tournamentForm = scenario?.tournamentFormByPlayer[player.id];
  const condition = scenario?.currentConditionByPlayer[player.id];
  const positionGroupCandidates =
    player.positionGroupCandidates ??
    positionGroupCandidatesByOfficialPosition[player.officialPosition];
  const positionGroupStatus =
    player.positionGroupStatus ??
    (player.officialPosition === "GK"
      ? "verified"
      : "broad_only");
  const tacticalPositionLabel =
    positionGroupStatus === "verified"
      ? positionGroupCandidates.join("·")
      : `전술군 후보 ${positionGroupCandidates.join("·")} · 세부 미확인`;
  const confidenceLabel =
    player.baseProfile.confidence >= 0.6
      ? "높음"
      : player.baseProfile.confidence >= 0.35
        ? "보통"
        : "낮음";
  const activeAttributes =
    player.baseProfile.attributes[player.baseProfile.activeAttributeModel];
  const measuredAttributeCount = Object.values(activeAttributes).filter(
    (value) => Number.isInteger(value),
  ).length;
  const evidence = player.baseProfile.evidence;

  return {
    id: player.id,
    name: player.nameKo,
    nameEn: player.nameEn,
    shirtNumber: player.shirtNumber,
    teamId: player.teamId,
    officialPosition: player.officialPosition,
    position: `${officialPositionLabel[player.officialPosition]} · ${tacticalPositionLabel}`,
    positionGroup:
      player.positionGroup ??
      (player.officialPosition === "GK" ? "GK" : null),
    positionGroupCandidates,
    positionGroupStatus,
    preferredSide: null,
    minutesPlayed: player.baseProfile.analysisMinutes,
    tournamentMinutes: tournamentForm?.minutesBeforeScenario ?? null,
    fitness: condition?.energyEstimate ?? null,
    cardStatus: condition?.cardStatus ?? null,
    rawMetrics: null,
    activeAttributeModel: player.baseProfile.activeAttributeModel,
    attributes: player.baseProfile.attributes.field,
    goalkeeperAttributes: player.baseProfile.attributes.goalkeeper,
    confidence: player.baseProfile.confidence,
    confidenceLabel,
    performanceContext:
      measuredAttributeCount > 0
        ? `BASE PROFILE ${player.baseProfile.period.start}~${player.baseProfile.period.end}의 검증 가능한 원자료에서 ${measuredAttributeCount}/8개 능력치를 계산했습니다. 누락 능력치는 점수에서 제외합니다.`
        : `BASE PROFILE ${player.baseProfile.period.start}~${player.baseProfile.period.end}에 대해 분석 기간과 공개 재사용 권리를 함께 충족하는 선수 단위 성능 출처를 확보하지 못했습니다. 숫자를 만들지 않고 8개 능력치를 null로 유지하며, 현재 컨디션은 공식 출전시간 기반 추정치입니다.`,
    sourceStatus:
      player.baseProfile.status === "incomplete" ? "incomplete" : "derived",
    tags: [
      player.officialPosition,
      player.leagueContext.status === "domestic" ? "국내 소속" : "해외 소속",
    ],
    dataSources: [
      ...player.finalSquad.sourceIds,
      ...player.baseProfile.sourceIds,
    ],
    isSample: false,
    club: {
      name: player.club.name,
      associationCode: player.club.associationCode,
    },
    leagueContext: {
      status: player.leagueContext.status,
      strengthAdjustment: player.leagueContext.strengthAdjustment,
      ratingStatus: player.leagueContext.ratingStatus,
    },
    baseProfile: {
      periodStart: player.baseProfile.period.start,
      periodEnd: player.baseProfile.period.end,
      dataGrade: player.baseProfile.dataGrade,
      status: player.baseProfile.status,
      analysisMinutes: player.baseProfile.analysisMinutes,
      activeAttributeModel: player.baseProfile.activeAttributeModel,
      missingAttributes: player.baseProfile.missingAttributes,
      clubMinutes: evidence?.clubMinutes ?? null,
      nationalMinutes: evidence?.nationalMinutes ?? null,
      clubEvidenceWeight: evidence?.clubEvidenceWeight ?? 0,
      nationalEvidenceWeight: evidence?.nationalEvidenceWeight ?? 0,
      metricCoverage: evidence?.metricCoverage ?? 0,
      sourceReliability: evidence?.sourceReliability ?? 0,
      usedMetrics: evidence?.usedMetrics ?? [],
      missingMetrics:
        evidence?.missingMetrics ?? player.baseProfile.missingAttributes,
      imputed: evidence?.imputed ?? false,
    },
    tournamentForm: tournamentForm
      ? {
          matchesPlayedBeforeScenario:
            tournamentForm.matchesPlayedBeforeScenario,
          minutesBeforeScenario: tournamentForm.minutesBeforeScenario,
          metricCoverage: tournamentForm.metricCoverage,
          reliability: tournamentForm.reliability,
          percentile: tournamentForm.percentile ?? null,
          adjustment: tournamentForm.adjustment,
          status: tournamentForm.status,
          note: tournamentForm.note,
        }
      : undefined,
    currentCondition: condition
      ? {
          minutesInMatch: condition.minutesInMatch,
          energyEstimate: condition.energyEstimate,
          energyEstimateStatus: condition.energyEstimateStatus,
          cardStatus: condition.cardStatus,
          eligible: condition.eligible,
          verificationStatus: condition.verificationStatus,
        }
      : undefined,
  };
}

function minuteValue(event: GroupAMatchEvent): number {
  return event.minute.regulation + (event.minute.added ?? 0);
}

function eventLabel(event: GroupAMatchEvent): string {
  const player = getGroupAPlayer(event.playerId);
  const name = player?.nameKo ?? event.playerId;
  if (event.type === "goal") return `${name} 득점`;
  if (event.type === "substitution") {
    const outgoing = event.relatedPlayerId
      ? getGroupAPlayer(event.relatedPlayerId)?.nameKo
      : undefined;
    return `${outgoing ?? "선수"} OUT · ${name} IN`;
  }
  return `${name} ${event.card === "red" ? "퇴장" : "경고"}`;
}

function adaptEvent(event: GroupAMatchEvent): MatchEvent {
  return {
    minute: minuteValue(event),
    type:
      event.type === "goal"
        ? "goal"
        : event.type === "substitution"
          ? "substitution"
          : "other",
    teamId: event.teamId,
    label: eventLabel(event),
    verified: event.verificationStatus === "verified_official",
  };
}

function adaptMatch(match: GroupAMatch): Match {
  const home = getGroupATeam(match.homeTeamId);
  const away = getGroupATeam(match.awayTeamId);
  if (!home || !away) {
    throw new Error(`Group A match ${match.id} references an unknown team.`);
  }
  const allBenchIds = [
    ...(match.benchesByTeam[match.homeTeamId] ?? []),
    ...(match.benchesByTeam[match.awayTeamId] ?? []),
  ];

  return {
    id: match.id,
    competition: match.competition,
    season: "2026",
    group: "A조",
    stage: "조별리그",
    matchNumber: match.matchNumber,
    date: match.date,
    localKickoff: match.localKickoff,
    venue: match.venue,
    city: match.city,
    country: match.country,
    attendance: match.attendance,
    homeTeam: {
      id: home.id,
      name: home.nameKo,
      code: home.code,
    },
    awayTeam: {
      id: away.id,
      name: away.nameKo,
      code: away.code,
    },
    finalScore: {
      ...match.finalScore,
      halfTime: formatScore(match.halfTimeScore),
    },
    selectedTeamId: home.id,
    startingFormation: match.formationsByTeam[home.id] ?? "공식 기록 확인",
    opponentFormation: match.formationsByTeam[away.id] ?? "공식 기록 확인",
    lineup: match.lineupsByTeam[home.id] ?? [],
    benchOptions: match.benchesByTeam[home.id] ?? [],
    fullBenchNames: allBenchIds.flatMap((playerId) => {
      const player = getGroupAPlayer(playerId);
      return player ? [player.nameKo] : [];
    }),
    events: match.events.map(adaptEvent),
    dataSources: match.sourceIds.map(toSource),
    verificationStatus: "verified",
    isSample: false,
    homeTeamId: match.homeTeamId,
    awayTeamId: match.awayTeamId,
    playableTeamIds: match.playableTeamIds,
    formationsByTeam: match.formationsByTeam,
    halfTimeScore: match.halfTimeScore,
    sourceIds: match.sourceIds,
    discrepancyNotes: match.discrepancyNotes,
  };
}

function distributeLine(
  players: GroupAPlayer[],
  y: number,
  label: string,
): LineupSpot[] {
  return players.map((player, index) => ({
    playerId: player.id,
    x: Math.round(((index + 1) * 100) / (players.length + 1)),
    y,
    slot: `${label}${index + 1}`,
  }));
}

function buildSchematicLineup(playerIds: string[]): LineupSpot[] {
  const roster = playerIds.flatMap((playerId) => {
    const player = getGroupAPlayer(playerId);
    return player ? [player] : [];
  });
  const goalkeepers = roster.filter(
    (player) => player.officialPosition === "GK",
  );
  const defenders = roster.filter(
    (player) => player.officialPosition === "DF",
  );
  const midfielders = roster.filter(
    (player) => player.officialPosition === "MF",
  );
  const forwards = roster.filter(
    (player) => player.officialPosition === "FW",
  );

  return [
    ...distributeLine(goalkeepers, 88, "GK"),
    ...distributeLine(defenders, 69, "DF"),
    ...distributeLine(midfielders, 47, "MF"),
    ...distributeLine(forwards, 24, "FW"),
  ];
}

function adaptScenario(scenario: GroupAScenario): Scenario {
  return {
    id: scenario.id,
    matchId: scenario.matchId,
    order: scenario.order,
    title: scenario.title,
    selectedTeamId: scenario.selectedTeamId,
    minute: scenario.minute,
    currentScore: formatScore(scenario.currentScore),
    scoreState: scenario.scoreState,
    substitutionsRemaining: scenario.substitutionsRemaining,
    mission: scenario.mission,
    shortMission: scenario.shortMission,
    difficulty: scenario.difficulty,
    opponentShape: scenario.opponentShape,
    observations: scenario.observations,
    contextTimeline: scenario.contextTimeline,
    currentLineup: buildSchematicLineup(scenario.currentLineup),
    benchOptions: scenario.benchOptions,
    attributeWeights: scenario.attributeWeights,
    defaultInstructions: scenario.defaultInstructions,
    instructionFit: scenario.instructionFit,
    matchupModifiers:
      scenario.matchupModifiers as Scenario["matchupModifiers"],
    matchupTags: scenario.matchupTags,
    riskRules: scenario.riskRules,
    actualDecision: {
      minute: scenario.actualDecision.minute,
      outPlayerId: scenario.actualDecision.outPlayerId,
      inPlayerId: scenario.actualDecision.inPlayerId,
      scoreAtDecision: formatScore(scenario.actualDecision.scoreAtDecision),
      interpretedRole: scenario.actualDecision.interpretedRole,
      interpretationStatus: scenario.actualDecision.interpretationStatus,
      note: scenario.actualDecision.note,
      parallelDecision: scenario.actualDecision.parallelDecision ?? undefined,
    },
    dataSources: scenario.sourceIds,
    isSample: false,
    opponentTeamId: scenario.opponentTeamId,
    scenarioTimestamp: scenario.scenarioTimestamp,
    timestampBasis: scenario.timestampBasis,
    lineupStatus: scenario.lineupStatus,
    unavailablePlayerIds: scenario.unavailablePlayerIds,
    resultFacts: {
      finalScore: scenario.resultFacts.finalScore,
      eventsAfterScenario: scenario.resultFacts.eventsAfterScenario.map(
        adaptEvent,
      ),
      sourceIds: scenario.resultFacts.sourceIds,
      usage: "result-only",
    },
  };
}

const matches = getGroupAMatches().map(adaptMatch);
const scenarios = getGroupAScenarios().map(adaptScenario);
const players = getGroupAPlayers().map((player) => adaptPlayer(player));

export function getMatches(): Match[] {
  return matches;
}

export function getMatch(matchId: string): Match | undefined {
  return matches.find((match) => match.id === matchId);
}

export function getPlayers(): Player[] {
  return players;
}

export function getPlayersForScenario(scenario: Scenario): Player[] {
  const normalized = getGroupAScenario(scenario.matchId, scenario.id);
  if (!normalized) return players;
  return getGroupAPlayers().map((player) => adaptPlayer(player, normalized));
}

export function getPlayer(playerId: string): Player | undefined {
  return players.find((player) => player.id === playerId);
}

export function getPlayersByIds(
  playerIds: string[],
  scenario?: Scenario,
): Player[] {
  const source = scenario ? getPlayersForScenario(scenario) : players;
  return playerIds.flatMap((playerId) => {
    const player = source.find((candidate) => candidate.id === playerId);
    return player ? [player] : [];
  });
}

export function getScenariosForMatch(matchId: string): Scenario[] {
  return getGroupAScenariosForMatch(matchId)
    .map(adaptScenario)
    .sort((left, right) => left.minute - right.minute);
}

export function getScenario(
  matchId: string,
  scenarioId: string,
): Scenario | undefined {
  const scenario = getGroupAScenario(matchId, scenarioId);
  return scenario ? adaptScenario(scenario) : undefined;
}

export function getDecisionMatchView(match: Match): DecisionMatchView {
  return {
    id: match.id,
    homeTeam: match.homeTeam,
    awayTeam: match.awayTeam,
  };
}

export function getDecisionScenarioContext(
  scenario: Scenario,
): DecisionScenarioContext {
  return {
    id: scenario.id,
    matchId: scenario.matchId,
    selectedTeamId: scenario.selectedTeamId,
    minute: scenario.minute,
    currentScore: scenario.currentScore,
    scoreState: scenario.scoreState,
    substitutionsRemaining: scenario.substitutionsRemaining,
    shortMission: scenario.shortMission,
    opponentShape: scenario.opponentShape,
    currentLineup: scenario.currentLineup,
    benchOptions: scenario.benchOptions,
    attributeWeights: scenario.attributeWeights,
    defaultInstructions: scenario.defaultInstructions,
    instructionFit: scenario.instructionFit,
    matchupModifiers: scenario.matchupModifiers,
    matchupTags: scenario.matchupTags,
    riskRules: scenario.riskRules,
  };
}

export function getNextScenario(scenario: Scenario): Scenario | undefined {
  return scenarios
    .filter(
      (candidate) => candidate.selectedTeamId === scenario.selectedTeamId,
    )
    .sort((left, right) => left.order - right.order)
    .find((candidate) => candidate.order === scenario.order + 1);
}

export function getRoles(): Role[] {
  return roles;
}

export function getRolesForPlayer(player: Player): Role[] {
  return roles.filter((role) => roleSupportsPlayer(role, player));
}

export { getInstructions };
