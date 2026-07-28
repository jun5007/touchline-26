import { describe, expect, it } from "vitest";
import {
  getGroupAMatches,
  getGroupAPlayers,
  getGroupAScenarios,
  getGroupATeams,
} from "@/data/group-a/catalog";
import {
  GOALKEEPER_ATTRIBUTE_KEYS,
  GROUP_A_TEAM_IDS,
} from "@/data/group-a/types";

describe("2026 World Cup Group A catalog", () => {
  const teams = getGroupATeams();
  const matches = getGroupAMatches();
  const scenarios = getGroupAScenarios();
  const players = getGroupAPlayers();
  const playerById = new Map(players.map((player) => [player.id, player]));

  it("contains exactly the four supported teams, six matches, and three matches per team", () => {
    expect(teams.map((team) => team.id)).toEqual([...GROUP_A_TEAM_IDS]);
    expect(matches).toHaveLength(6);
    expect(new Set(matches.map((match) => match.id))).toHaveLength(6);

    for (const teamId of GROUP_A_TEAM_IDS) {
      expect(
        matches.filter((match) => match.playableTeamIds.includes(teamId)),
      ).toHaveLength(3);
    }
  });

  it("supports both touchlines in every match and at least twelve distinct missions", () => {
    expect(scenarios.length).toBeGreaterThanOrEqual(12);
    expect(new Set(scenarios.map((scenario) => scenario.id)).size).toBe(
      scenarios.length,
    );

    for (const match of matches) {
      const perspectives = new Set(
        scenarios
          .filter((scenario) => scenario.matchId === match.id)
          .map((scenario) => scenario.selectedTeamId),
      );
      expect(perspectives).toEqual(new Set(match.playableTeamIds));
    }

    expect(
      Object.fromEntries(
        GROUP_A_TEAM_IDS.map((teamId) => [
          teamId,
          scenarios.filter(
            (scenario) => scenario.selectedTeamId === teamId,
          ).length,
        ]),
      ),
    ).toEqual({ kor: 4, cze: 3, mex: 3, rsa: 3 });
  });

  it("registers exactly 26 official-squad players per team with nullable BASE profiles", () => {
    expect(players).toHaveLength(104);
    expect(new Set(players.map((player) => player.id)).size).toBe(104);

    for (const teamId of GROUP_A_TEAM_IDS) {
      const squad = players.filter((player) => player.teamId === teamId);
      expect(squad).toHaveLength(26);
      expect(squad.map((player) => player.shirtNumber).sort((a, b) => a - b))
        .toEqual(Array.from({ length: 26 }, (_, index) => index + 1));
    }

    for (const player of players) {
      expect(player.baseProfile.period).toEqual({
        start: "2025-06-11",
        end: "2026-06-10",
      });
      expect(player.baseProfile).toMatchObject({
        analysisMinutes: null,
        dataGrade: "D",
        confidence: 0,
        status: "incomplete",
      });
      const active =
        player.baseProfile.attributes[
          player.baseProfile.activeAttributeModel
        ];
      expect(Object.values(active).every((value) => value === null)).toBe(
        true,
      );
    }
  });

  it("uses the dedicated requested goalkeeper schema without field-player substitution", () => {
    const goalkeepers = players.filter(
      (player) => player.officialPosition === "GK",
    );
    expect(goalkeepers.length).toBeGreaterThan(0);
    for (const goalkeeper of goalkeepers) {
      expect(goalkeeper.baseProfile.activeAttributeModel).toBe("goalkeeper");
      expect(
        Object.keys(goalkeeper.baseProfile.attributes.goalkeeper),
      ).toEqual([...GOALKEEPER_ATTRIBUTE_KEYS]);
      expect(
        Object.values(goalkeeper.baseProfile.attributes.goalkeeper).every(
          (value) => value === null,
        ),
      ).toBe(true);
    }
  });

  it("does not invent a precise tactical position group from FIFA's broad field-position label", () => {
    for (const player of players) {
      if (player.officialPosition === "GK") {
        expect(player.positionGroup).toBe("GK");
        expect(player.positionGroupCandidates).toEqual(["GK"]);
        expect(player.positionGroupStatus).toBe(
          "verified",
        );
      } else {
        expect(player.positionGroup).toBeNull();
        expect(player.positionGroupCandidates.length).toBeGreaterThan(1);
        expect(player.positionGroupStatus).toBe(
          "broad_only",
        );
      }
    }
  });

  it("keeps official matchday squads valid and unavailable players unselectable", () => {
    for (const match of matches) {
      for (const teamId of match.playableTeamIds) {
        const lineup = match.lineupsByTeam[teamId] ?? [];
        const bench = match.benchesByTeam[teamId] ?? [];
        const unavailable = (match.unavailableByTeam[teamId] ?? []).map(
          (entry) => entry.playerId,
        );
        expect(lineup).toHaveLength(11);
        expect(new Set(lineup).size).toBe(11);
        expect(lineup.some((playerId) => bench.includes(playerId))).toBe(
          false,
        );
        expect(
          unavailable.some(
            (playerId) =>
              lineup.includes(playerId) || bench.includes(playerId),
          ),
        ).toBe(false);
        for (const playerId of [...lineup, ...bench, ...unavailable]) {
          expect(playerById.get(playerId)?.teamId).toBe(teamId);
        }
      }
    }
  });

  it("keeps every decision roster on the selected team and separates result-only facts", () => {
    for (const scenario of scenarios) {
      const match = matches.find(
        (candidate) => candidate.id === scenario.matchId,
      );
      expect(match).toBeDefined();
      expect(match?.playableTeamIds).toContain(scenario.selectedTeamId);
      expect(scenario.benchOptions.length).toBeGreaterThanOrEqual(3);
      expect(
        scenario.currentLineup.length === 11 ||
          (scenario.id === "rsa-m01-ten-men-56" &&
            scenario.currentLineup.length === 10 &&
            scenario.lineupStatus === "verified_red_card_reduction"),
      ).toBe(true);

      for (const playerId of [
        ...scenario.currentLineup,
        ...scenario.benchOptions,
      ]) {
        expect(playerById.get(playerId)?.teamId).toBe(
          scenario.selectedTeamId,
        );
        expect(scenario.unavailablePlayerIds).not.toContain(playerId);
      }
      expect(scenario.currentLineup).toContain(
        scenario.actualDecision.outPlayerId,
      );
      expect(scenario.benchOptions).toContain(
        scenario.actualDecision.inPlayerId,
      );
      expect(scenario.actualDecision.usage).toBe("result-only");
      expect(scenario.resultFacts.usage).toBe("result-only");
      expect(
        scenario.evidenceRefs.every(
          (reference) =>
            reference.usage === "decision-input" &&
            new Date(reference.observedThrough).getTime() <=
              new Date(scenario.scenarioTimestamp).getTime(),
        ),
      ).toBe(true);
    }
  });
});
