export type PositionGroup =
  | "GK"
  | "CB"
  | "FB_WB"
  | "DM"
  | "CM_AM"
  | "WINGER"
  | "STRIKER";

export type AttributeKey =
  | "finishing"
  | "chanceCreation"
  | "dribbling"
  | "passing"
  | "pressing"
  | "defending"
  | "aerial"
  | "impact";

export type GoalkeeperAttributeKey =
  | "shotStopping"
  | "distribution"
  | "aerialCommand"
  | "sweeping"
  | "penaltySaving"
  | "stability"
  | "buildUp"
  | "impact";

export type ImpactGaugeKey =
  | "attackThreat"
  | "possessionStability"
  | "defensiveStability"
  | "pressingIntensity";

export type ConfidenceLabel = "높음" | "보통" | "낮음";

export interface DataSource {
  sourceName: string;
  sourceUrl: string;
  accessedAt: string;
  license: string;
  verificationNote: string;
}

export interface RawMetrics {
  passesAttempted?: number;
  passesCompleted?: number;
  lineBreaksAttempted?: number;
  lineBreaksCompleted?: number;
  ballProgressions?: number;
  takeOns?: number;
  shots?: number;
  shotsOnTarget?: number;
  goals?: number;
  assists?: number;
  directPressures?: number;
  possessionRegains?: number;
  aerialDuelsWon?: number;
  crossesAttempted?: number;
  crossesCompleted?: number;
}

/**
 * A player's attribute is nullable when the configured source window does not
 * contain enough evidence. `null` is deliberately different from a neutral
 * 10/11 rating: consumers must exclude it and renormalize the remaining
 * evidence.
 */
export type PlayerAttributes = Record<AttributeKey, number | null>;
export type GoalkeeperAttributes = Record<
  GoalkeeperAttributeKey,
  number | null
>;

export type PlayerAttributeWeights = Record<AttributeKey, number>;

export interface Player {
  id: string;
  name: string;
  nameEn: string;
  shirtNumber: number;
  teamId: string;
  officialPosition: "GK" | "DF" | "MF" | "FW";
  position: string;
  /**
   * Exact tactical group only when the available source supports it.
   * FIFA's final-squad list exposes GK/DF/MF/FW, so most Group A field
   * players intentionally keep this null.
   */
  positionGroup: PositionGroup | null;
  positionGroupCandidates: PositionGroup[];
  positionGroupStatus:
    | "verified"
    | "derived_from_lineups"
    | "broad_only"
    | "unknown";
  preferredSide: "left" | "centre" | "right" | "both" | null;
  minutesPlayed: number | null;
  tournamentMinutes: number | null;
  fitness: number | null;
  cardStatus: "clear" | "yellow" | null;
  rawMetrics: RawMetrics | null;
  activeAttributeModel: "field" | "goalkeeper";
  attributes: PlayerAttributes;
  goalkeeperAttributes: GoalkeeperAttributes;
  confidence: number;
  confidenceLabel: ConfidenceLabel;
  performanceContext: string;
  sourceStatus: "verified" | "derived" | "neutral-baseline" | "incomplete";
  tags: string[];
  dataSources: string[];
  isSample: boolean;
  club?: {
    name: string;
    associationCode: string;
  };
  leagueContext?: {
    status: "domestic" | "abroad";
    strengthAdjustment: number | null;
    ratingStatus: "rated" | "unrated";
  };
  baseProfile?: {
    periodStart: string;
    periodEnd: string;
    dataGrade: "A" | "B" | "C" | "D";
    status: "complete" | "partial" | "incomplete";
    analysisMinutes: number | null;
    activeAttributeModel: "field" | "goalkeeper";
    missingAttributes: string[];
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
  tournamentForm?: {
    matchesPlayedBeforeScenario: number;
    minutesBeforeScenario: number | null;
    metricCoverage: number;
    reliability: number;
    percentile: number | null;
    adjustment: number;
    status: "no_minutes" | "insufficient_metrics" | "complete";
    note: string;
  };
  currentCondition?: {
    minutesInMatch: number;
    energyEstimate: number;
    energyEstimateStatus: "derived_from_verified_minutes";
    cardStatus: "clear" | "yellow";
    eligible: boolean;
    verificationStatus: "partial";
  };
}

export interface MatchEvent {
  minute: number;
  type: "goal" | "substitution" | "captain-change" | "other";
  teamId: string;
  label: string;
  verified: boolean;
}

export interface Match {
  id: string;
  competition: string;
  season: string;
  group: string;
  stage: string;
  matchNumber: number;
  date: string;
  localKickoff: string;
  venue: string;
  city: string;
  country: string;
  attendance: number;
  homeTeam: { id: string; name: string; code: string };
  awayTeam: { id: string; name: string; code: string };
  finalScore: { home: number; away: number; halfTime: string };
  selectedTeamId: string;
  startingFormation: string;
  opponentFormation: string;
  lineup: string[];
  benchOptions: string[];
  fullBenchNames: string[];
  events: MatchEvent[];
  dataSources: DataSource[];
  verificationStatus: "verified" | "partial";
  isSample: boolean;
  homeTeamId?: string;
  awayTeamId?: string;
  playableTeamIds?: string[];
  formationsByTeam?: Record<string, string | undefined>;
  halfTimeScore?: { home: number; away: number };
  sourceIds?: string[];
  discrepancyNotes?: string[];
}

export interface LineupSpot {
  playerId: string;
  x: number;
  y: number;
  slot: string;
}

export interface TacticalInstructions {
  attackDirection: "left" | "centre" | "right" | "balanced";
  pressing: "low" | "medium" | "high";
  defensiveLine: "low" | "medium" | "high";
  mentality: "safe" | "balanced" | "attacking";
}

export type InstructionFitOptionModifiers = {
  [Category in keyof TacticalInstructions]: Record<
    TacticalInstructions[Category],
    number
  >;
};

export interface InstructionFitCombinationModifier {
  id: string;
  label: string;
  when: Partial<TacticalInstructions>;
  modifier: number;
}

export interface ScenarioInstructionFit {
  attackDirection: InstructionFitOptionModifiers["attackDirection"];
  pressing: InstructionFitOptionModifiers["pressing"];
  defensiveLine: InstructionFitOptionModifiers["defensiveLine"];
  mentality: InstructionFitOptionModifiers["mentality"];
  combinationModifiers: InstructionFitCombinationModifier[];
}

export interface MatchupModifierRule {
  id: string;
  label: string;
  positionGroups?: PositionGroup[];
  roleIds?: string[];
  playerTags?: string[];
  modifier: number;
}

export interface ScenarioMatchupModifiers {
  base: number;
  rules: MatchupModifierRule[];
}

export interface ActualDecision {
  minute: number;
  outPlayerId: string;
  inPlayerId: string;
  scoreAtDecision: string;
  interpretedRole: string;
  interpretationStatus: "verified" | "inferred";
  note: string;
  parallelDecision?: string;
}

export interface Scenario {
  id: string;
  matchId: string;
  order: number;
  title: string;
  selectedTeamId: string;
  minute: number;
  currentScore: string;
  scoreState: "trailing" | "level" | "leading";
  substitutionsRemaining: number;
  mission: string;
  shortMission: string;
  difficulty: "입문" | "보통" | "어려움";
  opponentShape: string;
  observations: string[];
  contextTimeline: Array<{ minute: string; label: string; tone: "neutral" | "danger" | "positive" }>;
  currentLineup: LineupSpot[];
  benchOptions: string[];
  attributeWeights: PlayerAttributeWeights;
  defaultInstructions: TacticalInstructions;
  instructionFit: ScenarioInstructionFit;
  matchupModifiers: ScenarioMatchupModifiers;
  matchupTags: string[];
  riskRules: string[];
  actualDecision: ActualDecision;
  dataSources: string[];
  isSample: boolean;
  opponentTeamId?: string;
  scenarioTimestamp?: string;
  timestampBasis?: string;
  lineupStatus?: "normal" | "verified_red_card_reduction";
  unavailablePlayerIds?: string[];
  resultFacts?: {
    finalScore: { home: number; away: number };
    eventsAfterScenario: Array<{
      minute: number;
      type: string;
      teamId: string;
      label: string;
      verified: boolean;
    }>;
    sourceIds: string[];
    usage: "result-only";
  };
}

/**
 * Client payloads for the decision board deliberately exclude result-only
 * fields such as the final score, post-scenario events and actualDecision.
 * This type boundary makes future-match leakage harder to introduce by
 * accident in a client component.
 */
export type DecisionMatchView = Pick<Match, "id" | "homeTeam" | "awayTeam">;

export type DecisionScenarioContext = Pick<
  Scenario,
  | "id"
  | "matchId"
  | "selectedTeamId"
  | "minute"
  | "currentScore"
  | "scoreState"
  | "substitutionsRemaining"
  | "shortMission"
  | "opponentShape"
  | "currentLineup"
  | "benchOptions"
  | "attributeWeights"
  | "defaultInstructions"
  | "instructionFit"
  | "matchupModifiers"
  | "matchupTags"
  | "riskRules"
>;

export interface Role {
  roleId: string;
  name: string;
  shortName: string;
  allowedPositionGroups: PositionGroup[];
  preferredAttributes: AttributeKey[];
  fitModifiers: Partial<Record<AttributeKey, number>>;
  riskModifiers: string[];
  description: string;
}

export interface InstructionOption {
  id: string;
  label: string;
  description: string;
  impactModifiers: Record<ImpactGaugeKey, number>;
}

export interface InstructionCategory {
  id: keyof TacticalInstructions;
  label: string;
  options: InstructionOption[];
}

export interface StoredDecision {
  version: 3;
  matchId: string;
  scenarioId: string;
  selectedTeamId: string;
  outPlayerId: string;
  inPlayerId: string;
  roleId: string;
  instructions: TacticalInstructions;
  createdAt: string;
}
