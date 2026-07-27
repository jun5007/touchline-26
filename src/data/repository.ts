import instructionsData from "@/data/instructions/instructions.json";
import matchesData from "@/data/matches/matches.json";
import playersData from "@/data/players/players.json";
import rolesData from "@/data/roles/roles.json";
import scenariosData from "@/data/scenarios/scenarios.json";
import resultTemplatesData from "@/data/copy/resultTemplates.json";
import type {
  InstructionCategory,
  Match,
  Player,
  Role,
  Scenario,
} from "@/data/types";

const matches = matchesData as Match[];
const players = playersData as Player[];
const scenarios = scenariosData as Scenario[];
const roles = rolesData as Role[];
const instructions = instructionsData as InstructionCategory[];

export const resultTemplates = resultTemplatesData;

export function getMatches(): Match[] {
  return matches;
}

export function getMatch(matchId: string): Match | undefined {
  return matches.find((match) => match.id === matchId);
}

export function getPlayers(): Player[] {
  return players;
}

export function getPlayer(playerId: string): Player | undefined {
  return players.find((player) => player.id === playerId);
}

export function getPlayersByIds(playerIds: string[]): Player[] {
  return playerIds.flatMap((playerId) => {
    const player = getPlayer(playerId);
    return player ? [player] : [];
  });
}

export function getScenariosForMatch(matchId: string): Scenario[] {
  return scenarios
    .filter((scenario) => scenario.matchId === matchId)
    .sort((a, b) => a.order - b.order);
}

export function getScenario(
  matchId: string,
  scenarioId: string,
): Scenario | undefined {
  return scenarios.find(
    (scenario) =>
      scenario.matchId === matchId && scenario.id === scenarioId,
  );
}

export function getNextScenario(scenario: Scenario): Scenario | undefined {
  return getScenariosForMatch(scenario.matchId).find(
    (candidate) => candidate.order === scenario.order + 1,
  );
}

export function getRoles(): Role[] {
  return roles;
}

export function getRolesForPlayer(player: Player): Role[] {
  return roles.filter((role) =>
    role.allowedPositionGroups.includes(player.positionGroup),
  );
}

export function getInstructions(): InstructionCategory[] {
  return instructions;
}

