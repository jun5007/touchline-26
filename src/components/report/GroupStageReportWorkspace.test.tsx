import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  GroupStageReportWorkspace,
  type ReportMatchModel,
} from "@/components/report/GroupStageReportWorkspace";
import {
  getGroupAMatchesForTeam,
  getGroupAScenariosForMatch,
  getGroupATeam,
} from "@/data/group-a/catalog";
import {
  getMatch,
  getPlayersForScenario,
  getRoles,
  getScenario,
} from "@/data/repository";
import type { StoredDecision } from "@/data/types";
import { roleSupportsPlayer } from "@/lib/decision/positionCompatibility";
import { saveDecision } from "@/lib/decision/storage";

const pushMock = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

function fixtures() {
  const team = getGroupATeam("kor");
  if (!team) throw new Error("KOR fixture is missing");
  const roles = getRoles();
  const matches: ReportMatchModel[] = getGroupAMatchesForTeam(team.id).map(
    (groupMatch) => {
      const match = getMatch(groupMatch.id);
      if (!match) throw new Error(`Match ${groupMatch.id} is missing`);
      const isHome = groupMatch.homeTeamId === team.id;
      const opponent = getGroupATeam(
        isHome ? groupMatch.awayTeamId : groupMatch.homeTeamId,
      );
      if (!opponent) throw new Error("Opponent fixture is missing");
      return {
        match,
        opponentName: opponent.nameKo,
        opponentCode: opponent.code,
        scoreFor: isHome
          ? groupMatch.finalScore.home
          : groupMatch.finalScore.away,
        scoreAgainst: isHome
          ? groupMatch.finalScore.away
          : groupMatch.finalScore.home,
        scenarios: getGroupAScenariosForMatch(groupMatch.id, team.id).map(
          (groupScenario) => {
            const scenario = getScenario(groupMatch.id, groupScenario.id);
            if (!scenario) throw new Error("Scenario fixture is missing");
            return { scenario, players: getPlayersForScenario(scenario) };
          },
        ),
      };
    },
  );
  return { team, roles, matches };
}

function legalDecision(
  reportMatch: ReportMatchModel,
  scenarioIndex: number,
): StoredDecision {
  const model = reportMatch.scenarios[scenarioIndex];
  const outgoing = model.players.find((player) =>
    model.scenario.currentLineup.some(
      (spot) => spot.playerId === player.id,
    ),
  );
  const incoming = model.players.find(
    (player) =>
      model.scenario.benchOptions.includes(player.id) &&
      getRoles().some((role) => roleSupportsPlayer(role, player)),
  );
  const role = incoming
    ? getRoles().find((candidate) =>
        roleSupportsPlayer(candidate, incoming),
      )
    : undefined;
  if (!outgoing || !incoming || !role) {
    throw new Error("A legal report decision could not be built");
  }
  return {
    version: 3,
    matchId: reportMatch.match.id,
    scenarioId: model.scenario.id,
    selectedTeamId: model.scenario.selectedTeamId,
    outPlayerId: outgoing.id,
    inPlayerId: incoming.id,
    roleId: role.roleId,
    instructions: { ...model.scenario.defaultInstructions },
    createdAt: "2026-07-28T00:00:00.000Z",
  };
}

function renderReport() {
  const { team, roles, matches } = fixtures();
  render(
    <GroupStageReportWorkspace
      team={{
        id: team.id,
        code: team.code,
        nameKo: team.nameKo,
        standing: {
          position: team.standing.position,
          points: team.standing.points,
          goalDifference: team.standing.goalDifference,
        },
      }}
      matches={matches}
      roles={roles}
    />,
  );
  return { team, roles, matches };
}

describe("GroupStageReportWorkspace", () => {
  beforeEach(() => {
    window.localStorage.clear();
    pushMock.mockReset();
  });

  it("shows an honest partial report and excludes a partly completed match from the overall score", async () => {
    const { matches } = fixtures();
    expect(saveDecision(legalDecision(matches[0], 0))).toBe(true);

    renderReport();

    expect(
      await screen.findByRole("heading", {
        name: "대한민국 조별리그 감독 리포트",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("일부 완료")).toBeInTheDocument();
    expect(
      screen.getByText("3경기를 모두 완료하면 전체 평균 산정"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/현재 경기 점수는 완료 미션 기준 임시 평균입니다/),
    ).toBeInTheDocument();
    expect(screen.getAllByText("아직 결정 없음").length).toBeGreaterThan(0);
  });

  it("recalculates every mission and shows the equal-match-weighted completed report", async () => {
    const { matches } = fixtures();
    for (const reportMatch of matches) {
      for (let index = 0; index < reportMatch.scenarios.length; index += 1) {
        expect(saveDecision(legalDecision(reportMatch, index))).toBe(true);
      }
    }

    renderReport();

    expect(
      await screen.findByText("세 경기 점수를 동일 비중 평균"),
    ).toBeInTheDocument();
    expect(screen.getAllByText("경기 완료")).toHaveLength(3);
    expect(screen.getByText("4/4 미션")).toBeInTheDocument();
    expect(screen.getByText(/선수 능력치가 아니라/)).toBeInTheDocument();
    expect(screen.queryByText("아직 결정 없음")).not.toBeInTheDocument();
  });

  it("removes an invalid stored record and tells the user it was excluded", async () => {
    const { matches } = fixtures();
    const decision = legalDecision(matches[0], 0);
    const key = `touchline26:decision:${decision.matchId}:${decision.scenarioId}`;
    window.localStorage.setItem(
      key,
      JSON.stringify({ ...decision, version: 99, score: 100 }),
    );

    renderReport();

    expect(
      await screen.findByText(/손상되었거나 현재 팀·명단·역할과 맞지 않는 저장 결정 1건/),
    ).toBeInTheDocument();
    await waitFor(() => expect(window.localStorage.getItem(key)).toBeNull());
  });
});
