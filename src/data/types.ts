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
  crossesAttempted?: number;
  crossesCompleted?: number;
}

export type PlayerAttributes = Record<AttributeKey, number>;

export interface Player {
  id: string;
  name: string;
  nameEn: string;
  shirtNumber: number;
  teamId: string;
  officialPosition: "GK" | "DF" | "MF" | "FW";
  position: string;
  positionGroup: PositionGroup;
  preferredSide: "left" | "centre" | "right" | "both";
  minutesPlayed: number;
  tournamentMinutes: number;
  fitness: number;
  cardStatus: "clear" | "yellow";
  rawMetrics: RawMetrics | null;
  attributes: PlayerAttributes;
  confidence: number;
  confidenceLabel: ConfidenceLabel;
  performanceContext: string;
  sourceStatus: "verified" | "derived" | "neutral-baseline";
  tags: string[];
  dataSources: string[];
  isSample: boolean;
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
  attributeWeights: PlayerAttributes;
  defaultInstructions: TacticalInstructions;
  matchupTags: string[];
  riskRules: string[];
  actualDecision: ActualDecision;
  dataSources: string[];
  isSample: boolean;
}

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
  fitModifier: number;
  impactModifiers: {
    attackThreat: number;
    possessionStability: number;
    defensiveStability: number;
    pressingIntensity: number;
  };
}

export interface InstructionCategory {
  id: keyof TacticalInstructions;
  label: string;
  options: InstructionOption[];
}

export interface StoredDecision {
  version: 1;
  matchId: string;
  scenarioId: string;
  outPlayerId: string;
  inPlayerId: string;
  roleId: string;
  instructions: TacticalInstructions;
  score: number;
  riskPenalty: number;
  impactsBefore: Record<string, number>;
  impactsAfter: Record<string, number>;
  explanation: {
    benefits: string[];
    risks: string[];
    remedies: string[];
    summary: string;
  };
  createdAt: string;
}

