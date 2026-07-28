import match01Data from "@/data/matches/group-a/group-a-match-01.json";
import match02Data from "@/data/matches/group-a/group-a-match-02.json";
import match25Data from "@/data/matches/group-a/group-a-match-25.json";
import match28Data from "@/data/matches/group-a/group-a-match-28.json";
import match53Data from "@/data/matches/group-a/group-a-match-53.json";
import match54Data from "@/data/matches/group-a/group-a-match-54.json";
import playersData from "@/data/players/group-a-players.json";
import czeScenariosData from "@/data/scenarios/group-a/cze.json";
import korScenariosData from "@/data/scenarios/group-a/kor.json";
import mexScenariosData from "@/data/scenarios/group-a/mex.json";
import rsaScenariosData from "@/data/scenarios/group-a/rsa.json";
import teamsData from "@/data/teams/teams.json";
import {
  GROUP_A_TEAM_IDS,
  type GroupAMatch,
  type GroupAPlayer,
  type GroupAScenario,
  type GroupAStanding,
  type GroupATeam,
  type GroupATeamId,
} from "@/data/group-a/types";

const teamRows = teamsData as unknown as GroupATeam[];
const playerRows = playersData as unknown as GroupAPlayer[];
const matchRows = [
  match01Data,
  match02Data,
  match25Data,
  match28Data,
  match53Data,
  match54Data,
] as unknown as GroupAMatch[];
const scenarioRows = [
  ...mexScenariosData,
  ...rsaScenariosData,
  ...korScenariosData,
  ...czeScenariosData,
] as unknown as GroupAScenario[];

const teams = GROUP_A_TEAM_IDS.flatMap((teamId) => {
  const team = teamRows.find((candidate) => candidate.id === teamId);
  return team ? [team] : [];
});
const matches = [...matchRows].sort(
  (left, right) => left.matchNumber - right.matchNumber,
);
const scenarios = [...scenarioRows].sort(
  (left, right) => left.globalOrder - right.globalOrder,
);
const players = [...playerRows].sort((left, right) => {
  const teamDelta =
    GROUP_A_TEAM_IDS.indexOf(left.teamId) -
    GROUP_A_TEAM_IDS.indexOf(right.teamId);
  return teamDelta || left.shirtNumber - right.shirtNumber;
});

export function isGroupATeamId(value: string): value is GroupATeamId {
  return (GROUP_A_TEAM_IDS as readonly string[]).includes(value);
}

export function getGroupATeams(): GroupATeam[] {
  return teams;
}

export function getGroupATeam(teamId: string): GroupATeam | undefined {
  return isGroupATeamId(teamId)
    ? teams.find((team) => team.id === teamId)
    : undefined;
}

export function getGroupAStandings(): Array<
  GroupAStanding & { teamId: GroupATeamId }
> {
  return teams
    .map((team) => ({ teamId: team.id, ...team.standing }))
    .sort((left, right) => left.position - right.position);
}

export function getGroupAMatches(): GroupAMatch[] {
  return matches;
}

export function getGroupAMatch(matchId: string): GroupAMatch | undefined {
  return matches.find((match) => match.id === matchId);
}

export function getGroupAMatchesForTeam(teamId: string): GroupAMatch[] {
  if (!isGroupATeamId(teamId)) return [];
  return matches.filter((match) => match.playableTeamIds.includes(teamId));
}

export function getGroupAScenarios(): GroupAScenario[] {
  return scenarios;
}

export function getGroupAScenario(
  matchId: string,
  scenarioId: string,
): GroupAScenario | undefined {
  return scenarios.find(
    (scenario) =>
      scenario.matchId === matchId && scenario.id === scenarioId,
  );
}

export function getGroupAScenariosForMatch(
  matchId: string,
  teamId?: string,
): GroupAScenario[] {
  return scenarios
    .filter(
      (scenario) =>
        scenario.matchId === matchId &&
        (!teamId || scenario.selectedTeamId === teamId),
    )
    .sort((left, right) => left.minute - right.minute);
}

export function getGroupAScenariosForTeam(teamId: string): GroupAScenario[] {
  if (!isGroupATeamId(teamId)) return [];
  return scenarios
    .filter((scenario) => scenario.selectedTeamId === teamId)
    .sort((left, right) => left.order - right.order);
}

export function getGroupAPlayers(teamId?: string): GroupAPlayer[] {
  if (!teamId) return players;
  if (!isGroupATeamId(teamId)) return [];
  return players.filter((player) => player.teamId === teamId);
}

export function getGroupAPlayer(playerId: string): GroupAPlayer | undefined {
  return players.find((player) => player.id === playerId);
}
