export const GROUP_A_TEAM_IDS = ["kor", "cze", "mex", "rsa"] as const;

export type GroupATeamId = (typeof GROUP_A_TEAM_IDS)[number];
export type GroupAOfficialPosition = "GK" | "DF" | "MF" | "FW";
export type GroupADataGrade = "A" | "B" | "C" | "D";
export type GroupAProfileStatus = "complete" | "partial" | "incomplete";
export type GroupALeagueStatus = "domestic" | "abroad";

export const FIELD_ATTRIBUTE_KEYS = [
  "finishing",
  "chanceCreation",
  "dribbling",
  "passing",
  "pressing",
  "defending",
  "aerial",
  "impact",
] as const;

export const GOALKEEPER_ATTRIBUTE_KEYS = [
  "shotStopping",
  "distribution",
  "aerialCommand",
  "sweeping",
  "penaltySaving",
  "stability",
  "buildUp",
  "impact",
] as const;

export type GroupAFieldAttributeKey = (typeof FIELD_ATTRIBUTE_KEYS)[number];
export type GroupAGoalkeeperAttributeKey =
  (typeof GOALKEEPER_ATTRIBUTE_KEYS)[number];

export type GroupAFieldAttributes = Record<
  GroupAFieldAttributeKey,
  number | null
>;
export type GroupAGoalkeeperAttributes = Record<
  GroupAGoalkeeperAttributeKey,
  number | null
>;
export type GroupAPositionGroup =
  | "GK"
  | "CB"
  | "FB_WB"
  | "DM"
  | "CM_AM"
  | "WINGER"
  | "STRIKER";

export interface GroupABaseProfile {
  period: {
    start: "2025-06-11";
    end: "2026-06-10";
  };
  analysisMinutes: number | null;
  dataGrade: GroupADataGrade;
  confidence: number;
  status: GroupAProfileStatus;
  activeAttributeModel: "field" | "goalkeeper";
  attributes: {
    field: GroupAFieldAttributes;
    goalkeeper: GroupAGoalkeeperAttributes;
  };
  missingAttributes: string[];
  sourceIds: string[];
  note: string;
  evidence?: {
    clubMinutes: number | null;
    nationalMinutes: number | null;
    clubEvidenceWeight: number;
    nationalEvidenceWeight: number;
    metricCoverage: number;
    sourceReliability: number;
    usedMetrics: string[];
    missingMetrics: string[];
    imputed: boolean;
  };
}

export interface GroupARawPerformanceMetrics {
  goals: number | null;
  assists: number | null;
  shots: number | null;
  shotsOnTarget: number | null;
  passesCompleted: number | null;
  passesAttempted: number | null;
  keyPasses: number | null;
  chancesCreated: number | null;
  finalThirdPasses: number | null;
  progressivePasses: number | null;
  progressiveCarries: number | null;
  dribblesCompleted: number | null;
  dribblesAttempted: number | null;
  tackles: number | null;
  interceptions: number | null;
  recoveries: number | null;
  pressures: number | null;
  blocks: number | null;
  clearances: number | null;
  aerialDuelsWon: number | null;
  aerialDuelsAttempted: number | null;
  yellowCards: number | null;
  redCards: number | null;
  substituteAppearances: number | null;
  substituteGoals: number | null;
  substituteAssists: number | null;
  saves: number | null;
  shotsOnTargetFaced: number | null;
  goalsConceded: number | null;
  cleanSheets: number | null;
  longPassesCompleted: number | null;
  longPassesAttempted: number | null;
  crossesClaimed: number | null;
  sweeperActions: number | null;
  penaltiesSaved: number | null;
  penaltiesFaced: number | null;
}

export interface GroupAPerformanceRecord {
  clubId?: string;
  clubName?: string;
  leagueId?: string;
  competitionId: string;
  competitionName: string;
  competitionType:
    | "league"
    | "cup"
    | "continental"
    | "world_cup_qualifier"
    | "continental_competition"
    | "competitive_friendly"
    | "friendly"
    | "other";
  dateFrom: string;
  dateTo: string;
  appearances: number | null;
  starts: number | null;
  minutes: number | null;
  rawMetrics: GroupARawPerformanceMetrics;
  sourceIds: string[];
  verificationStatus: "verified" | "partial" | "incomplete";
  /**
   * Optional stint-specific TOUCHLINE League Strength Index input.
   * Omitted/unapplied values are neutral and must never imply a league rating.
   */
  strengthFactor?: number | null;
  tlsiApplied?: boolean;
}

export interface GroupAPerformanceProfile {
  playerId: string;
  period: {
    start: "2025-06-11";
    end: "2026-06-10";
  };
  priority: "P0" | "P1";
  collectionStatus: GroupAProfileStatus;
  records: GroupAPerformanceRecord[];
  sourceIds: string[];
  reviewedSourceIds: string[];
  missingReason: string;
}

export interface GroupAClub {
  name: string;
  associationCode: string;
  sourceIds: string[];
}

export interface GroupALeagueContext {
  status: GroupALeagueStatus;
  strengthAdjustment: number | null;
  ratingStatus: "rated" | "unrated";
  derivation: string;
}

export interface GroupAFinalSquadMetadata {
  status: "verified";
  shirtNumber: number;
  officialPosition: GroupAOfficialPosition;
  dateOfBirth: string;
  heightCm: number;
  caps: number;
  goals: number;
  sourceIds: string[];
}

export interface GroupAPlayer {
  id: string;
  teamId: GroupATeamId;
  nameKo: string;
  nameEn: string;
  nameKoStatus: "official" | "editorial-transliteration";
  shirtNumber: number;
  officialPosition: GroupAOfficialPosition;
  positionGroup: GroupAPositionGroup | null;
  positionGroupCandidates: GroupAPositionGroup[];
  positionGroupStatus:
    | "verified"
    | "derived_from_lineups"
    | "broad_only"
    | "unknown";
  club: GroupAClub;
  leagueContext: GroupALeagueContext;
  finalSquad: GroupAFinalSquadMetadata;
  baseProfile: GroupABaseProfile;
}

export interface GroupASquad {
  teamId: GroupATeamId;
  competition: "FIFA World Cup 2026";
  squadSize: 26;
  headCoach: {
    nameKo: string;
    nameEn: string;
  };
  playerIds: string[];
  sourceIds: string[];
  verificationStatus: "verified";
}

export interface GroupAStanding {
  position: 1 | 2 | 3 | 4;
  played: 3;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  advanced: boolean;
  sourceIds: string[];
}

export interface GroupATeam {
  id: GroupATeamId;
  code: "KOR" | "CZE" | "MEX" | "RSA";
  nameKo: string;
  nameEn: string;
  confederation: "AFC" | "UEFA" | "CONCACAF" | "CAF";
  headCoach: {
    nameKo: string;
    nameEn: string;
  };
  fifaRanking: {
    rank: number;
    referenceDate: "2026-06-11";
    verificationStatus: "derived";
    method: string;
    sourceIds: string[];
  };
  standing: GroupAStanding;
  squadId: GroupATeamId;
  sourceIds: string[];
}

export interface GroupASourceRecord {
  id: string;
  title?: string;
  sourceName: string;
  publisher: string;
  url: string;
  accessedAt: string;
  sourceType: string;
  competition: string;
  season: string;
  teamId: GroupATeamId | null;
  playerId: string | null;
  covers?: string[];
  metricCoverage: string[];
  usagePermission:
    | "allowed_factual_use"
    | "allowed_with_attribution"
    | "open_license"
    | "restricted"
    | "unknown";
  notes: string;
  verificationNote?: string;
  usageLocation?: string;
  usageTerms?: string;
  transformation?: string;
  [key: string]: unknown;
}

export type GroupASourceRegistry = GroupASourceRecord[];

export interface GroupAMinute {
  regulation: number;
  added?: number;
}

export interface GroupAUnavailablePlayer {
  playerId: string;
  status: "matchday_unavailable" | "suspended";
  reason: string | null;
  note: string;
  verificationStatus: "verified_official" | "partial";
}

export interface GroupASubstitution {
  minute: GroupAMinute;
  outPlayerId: string;
  inPlayerId: string;
  note: string | null;
  verificationStatus: "verified_official";
}

export interface GroupAMatchEvent {
  minute: GroupAMinute;
  type: "goal" | "card" | "substitution";
  teamId: GroupATeamId;
  playerId: string;
  relatedPlayerId?: string;
  assistPlayerId: string | null;
  card: "yellow" | "red" | null;
  detail: string | null;
  verificationStatus: "verified_official";
}

export interface GroupAMatch {
  id: string;
  fifaMatchId: string;
  fdpResourceId: string;
  groupId: "group-a";
  competition: "FIFA World Cup 2026";
  stage: "group";
  matchNumber: number;
  date: string;
  localKickoff: string;
  kickoffUtc: string;
  venue: string;
  city: string;
  country: string;
  attendance: number;
  homeTeamId: GroupATeamId;
  awayTeamId: GroupATeamId;
  playableTeamIds: [GroupATeamId, GroupATeamId];
  finalScore: { home: number; away: number };
  halfTimeScore: { home: number; away: number };
  formationsByTeam: Partial<Record<GroupATeamId, string>>;
  lineupsByTeam: Partial<Record<GroupATeamId, string[]>>;
  benchesByTeam: Partial<Record<GroupATeamId, string[]>>;
  unavailableByTeam: Partial<
    Record<GroupATeamId, GroupAUnavailablePlayer[]>
  >;
  substitutionsByTeam: Partial<
    Record<GroupATeamId, GroupASubstitution[]>
  >;
  events: GroupAMatchEvent[];
  sourceIds: string[];
  discrepancyNotes: string[];
  verificationStatus: "verified_official";
}

export interface GroupATournamentForm {
  matchesPlayedBeforeScenario: number;
  minutesBeforeScenario: number | null;
  metricCoverage: number;
  reliability: number;
  percentile?: number | null;
  adjustment: number;
  status: "no_minutes" | "insufficient_metrics" | "complete";
  sourceIds: string[];
  note: string;
}

export interface GroupACurrentCondition {
  minutesInMatch: number;
  energyEstimate: number;
  energyEstimateStatus: "derived_from_verified_minutes";
  cardStatus: "clear" | "yellow";
  injuryStatus: null;
  currentPosition: null;
  recentScheduleBurden: null;
  eligible: boolean;
  sourceIds: string[];
  verificationStatus: "partial";
}

export interface GroupAEvidenceReference {
  sourceId: string;
  usage: "decision-input";
  observedThroughMatchMinute: number;
  observedThrough: string;
  note?: string;
}

export interface GroupAActualDecision {
  minute: number;
  outPlayerId: string;
  inPlayerId: string;
  scoreAtDecision: { home: number; away: number };
  interpretedRole: string;
  interpretationStatus: "inferred";
  note: string;
  parallelDecision: string | null;
  sourceIds: string[];
  usage: "result-only";
}

export interface GroupAScenario {
  id: string;
  matchId: string;
  selectedTeamId: GroupATeamId;
  opponentTeamId: GroupATeamId;
  order: number;
  globalOrder: number;
  minute: number;
  scenarioTimestamp: string;
  timestampBasis: string;
  currentScore: { home: number; away: number };
  scoreState: "trailing" | "level" | "leading";
  substitutionsRemaining: number;
  title: string;
  shortMission: string;
  mission: string;
  difficulty: "입문" | "보통" | "어려움";
  observations: string[];
  contextTimeline: Array<{
    minute: string;
    label: string;
    tone: "neutral" | "danger" | "positive";
  }>;
  opponentShape: string;
  currentLineup: string[];
  lineupStatus: "normal" | "verified_red_card_reduction";
  benchOptions: string[];
  unavailablePlayerIds: string[];
  attributeWeights: Record<GroupAFieldAttributeKey, number>;
  defaultInstructions: {
    attackDirection: "left" | "centre" | "right" | "balanced";
    pressing: "low" | "medium" | "high";
    defensiveLine: "low" | "medium" | "high";
    mentality: "safe" | "balanced" | "attacking";
  };
  instructionFit: {
    attackDirection: Record<"left" | "centre" | "right" | "balanced", number>;
    pressing: Record<"low" | "medium" | "high", number>;
    defensiveLine: Record<"low" | "medium" | "high", number>;
    mentality: Record<"safe" | "balanced" | "attacking", number>;
    combinationModifiers: Array<{
      id: string;
      label: string;
      when: Record<string, string>;
      modifier: number;
    }>;
  };
  matchupModifiers: {
    base: number;
    rules: Array<{
      id: string;
      label: string;
      positionGroups?: string[];
      roleIds?: string[];
      playerTags?: string[];
      modifier: number;
    }>;
  };
  matchupTags: string[];
  riskRules: string[];
  tournamentFormByPlayer: Record<string, GroupATournamentForm>;
  currentConditionByPlayer: Record<string, GroupACurrentCondition>;
  evidenceRefs: GroupAEvidenceReference[];
  actualDecision: GroupAActualDecision;
  resultFacts: {
    finalScore: { home: number; away: number };
    eventsAfterScenario: GroupAMatchEvent[];
    sourceIds: string[];
    usage: "result-only";
  };
  sourceIds: string[];
  verificationStatus: "verified_official";
}
