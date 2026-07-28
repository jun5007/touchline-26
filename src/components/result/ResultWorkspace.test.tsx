import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  recalculateStoredDecision,
  ResultWorkspace,
} from "@/components/result/ResultWorkspace";
import {
  getMatch,
  getPlayersForScenario,
  getRoles,
  getScenario,
} from "@/data/repository";
import type {
  Match,
  Player,
  Role,
  Scenario,
  StoredDecision,
} from "@/data/types";
import { evaluateDecision } from "@/lib/decision/evaluateDecision";
import { saveDecision } from "@/lib/decision/storage";

const pushMock = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

function getFixtures(): {
  match: Match;
  scenario: Scenario;
  players: Player[];
  roles: Role[];
  stored: StoredDecision;
} {
  const match = getMatch("kor-cze-2026");
  const scenario = getScenario("kor-cze-2026", "level-69-find-nine");
  if (!match || !scenario) throw new Error("Fixture data is missing");

  return {
    match,
    scenario,
    players: getPlayersForScenario(scenario),
    roles: getRoles(),
    stored: {
      version: 3,
      matchId: match.id,
      scenarioId: scenario.id,
      selectedTeamId: scenario.selectedTeamId,
      outPlayerId: "son-heungmin",
      inPlayerId: "oh-hyeongyu",
      roleId: "target-striker",
      instructions: { ...scenario.defaultInstructions },
      createdAt: "2026-07-27T00:00:00.000Z",
    },
  };
}

describe("stored decision revalidation", () => {
  beforeEach(() => {
    window.localStorage.clear();
    pushMock.mockReset();
  });

  it("recalculates score, risk, impact, and explanation from current repository data", () => {
    const fixtures = getFixtures();
    const resolution = recalculateStoredDecision(fixtures);
    expect(resolution.status).toBe("ready");
    if (resolution.status !== "ready") return;

    const expected = evaluateDecision({
      outgoing: resolution.outgoing,
      incoming: resolution.incoming,
      role: resolution.role,
      instructions: fixtures.stored.instructions,
      scenario: fixtures.scenario,
    });
    expect(resolution.decision.score).toBe(expected.fit.score);
    expect(resolution.decision.riskPenalty).toBe(expected.risk.totalPenalty);
    expect(resolution.decision.explanation.summary).toBe(
      expected.explanation.summary,
    );
    expect(resolution.decision.breakdown.baseProfile).toMatchObject({
      available: false,
      dataGrade: "D",
      status: "incomplete",
    });
    expect(resolution.decision.breakdown.currentCondition).toMatchObject({
      available: true,
      energyEstimate: 100,
    });
    expect(resolution.decision.breakdown.tournamentForm.adjustment).toBe(0);

    const changedPlayers = fixtures.players.map((player) =>
      player.id === fixtures.stored.inPlayerId
        ? {
            ...player,
            attributes: Object.fromEntries(
              Object.keys(player.attributes).map((key) => [key, 1]),
            ) as Player["attributes"],
          }
        : player,
    );
    const changed = recalculateStoredDecision({
      ...fixtures,
      players: changedPlayers,
    });
    expect(changed.status).toBe("ready");
    if (changed.status === "ready") {
      expect(changed.decision.score).toBeLessThan(resolution.decision.score);
    }
  });

  it("rejects route or team mismatch, cross-team players, OUT=IN, stale lineup membership, and disallowed roles", () => {
    const fixtures = getFixtures();
    const cases: Array<[StoredDecision, string]> = [
      [{ ...fixtures.stored, matchId: "another-match" }, "route-mismatch"],
      [{ ...fixtures.stored, scenarioId: "another-scenario" }, "route-mismatch"],
      [{ ...fixtures.stored, selectedTeamId: "cze" }, "team-mismatch"],
      [
        {
          ...fixtures.stored,
          inPlayerId: fixtures.stored.outPlayerId,
        },
        "invalid-selection",
      ],
      [{ ...fixtures.stored, outPlayerId: "oh-hyeongyu" }, "invalid-selection"],
      [{ ...fixtures.stored, inPlayerId: "son-heungmin" }, "invalid-selection"],
      [
        { ...fixtures.stored, inPlayerId: "cze-matej-kovar" },
        "invalid-selection",
      ],
      [{ ...fixtures.stored, roleId: "centre-back" }, "invalid-role"],
    ];

    for (const [stored, reason] of cases) {
      expect(
        recalculateStoredDecision({ ...fixtures, stored }),
      ).toMatchObject({ status: "recovery", reason });
    }
  });

  it("rejects a stored decision when no substitution slot remains", () => {
    const fixtures = getFixtures();
    expect(
      recalculateStoredDecision({
        ...fixtures,
        scenario: {
          ...fixtures.scenario,
          substitutionsRemaining: 0,
        },
      }),
    ).toMatchObject({ status: "recovery", reason: "substitution-limit" });
  });

  it("rejects duplicate rosters, lineup/bench overlap, missing players, and duplicate IDs", () => {
    const fixtures = getFixtures();
    const firstSpot = fixtures.scenario.currentLineup[0];

    expect(
      recalculateStoredDecision({
        ...fixtures,
        scenario: {
          ...fixtures.scenario,
          currentLineup: [...fixtures.scenario.currentLineup, firstSpot],
        },
      }),
    ).toMatchObject({ status: "recovery", reason: "duplicate-roster" });

    expect(
      recalculateStoredDecision({
        ...fixtures,
        scenario: {
          ...fixtures.scenario,
          benchOptions: [
            ...fixtures.scenario.benchOptions,
            fixtures.stored.outPlayerId,
          ],
        },
      }),
    ).toMatchObject({ status: "recovery", reason: "duplicate-roster" });

    expect(
      recalculateStoredDecision({
        ...fixtures,
        players: fixtures.players.filter(
          (player) => player.id !== fixtures.stored.inPlayerId,
        ),
      }),
    ).toMatchObject({ status: "recovery", reason: "missing-player" });

    const duplicateIncoming = fixtures.players.find(
      (player) => player.id === fixtures.stored.inPlayerId,
    );
    if (!duplicateIncoming) throw new Error("Incoming fixture is missing");
    expect(
      recalculateStoredDecision({
        ...fixtures,
        players: [...fixtures.players, duplicateIncoming],
      }),
    ).toMatchObject({ status: "recovery", reason: "missing-player" });
  });

  it("renders a report from a minimal record and never adds calculations to storage", async () => {
    const fixtures = getFixtures();
    const expected = recalculateStoredDecision(fixtures);
    if (expected.status !== "ready") throw new Error("Expected a valid fixture");
    expect(saveDecision(fixtures.stored)).toBe(true);

    render(
      <ResultWorkspace
        match={fixtures.match}
        scenario={fixtures.scenario}
        players={fixtures.players}
        roles={fixtures.roles}
      />,
    );

    expect(
      await screen.findAllByLabelText(
        `전술 선택 적합도 ${Math.round(expected.decision.score)}점`,
      ),
    ).toHaveLength(2);
    const persisted = window.localStorage.getItem(
      `touchline26:decision:${fixtures.match.id}:${fixtures.scenario.id}`,
    );
    expect(persisted).toBe(JSON.stringify(fixtures.stored));
    expect(persisted).not.toContain("score");
    expect(
      screen.getAllByText("승률이나 선수 절대 능력 평가가 아닙니다."),
    ).toHaveLength(2);
    expect(screen.getByText("점수 구성 보기")).toBeInTheDocument();
    expect(screen.getByText("선수 BASE 능력치")).toBeInTheDocument();
    expect(
      screen.getByText(/선수별 공통 성과 지표가 없어/),
    ).toBeInTheDocument();
    expect(screen.getByText("공식 경기 사실")).toBeInTheDocument();
    expect(screen.getByText("추론")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "경기 종료 후 확인된 사실" }),
    ).toBeInTheDocument();
    expect(screen.getByText("사용자 선택 위험")).toBeInTheDocument();
    expect(screen.getByText("실제 교체 위험")).toBeInTheDocument();
  });

  it("normalizes forged browser storage before rendering and uses the current evaluator", async () => {
    const fixtures = getFixtures();
    const expected = recalculateStoredDecision(fixtures);
    if (expected.status !== "ready") throw new Error("Expected a valid fixture");
    const key = `touchline26:decision:${fixtures.match.id}:${fixtures.scenario.id}`;
    window.localStorage.setItem(
      key,
      JSON.stringify({
        ...fixtures.stored,
        score: 999,
        riskPenalty: -100,
        explanation: { summary: "forged browser value" },
      }),
    );

    render(
      <ResultWorkspace
        match={fixtures.match}
        scenario={fixtures.scenario}
        players={fixtures.players}
        roles={fixtures.roles}
      />,
    );

    expect(
      await screen.findAllByLabelText(
        `전술 선택 적합도 ${Math.round(expected.decision.score)}점`,
      ),
    ).toHaveLength(2);
    expect(
      screen.queryByLabelText("전술 선택 적합도 999점"),
    ).not.toBeInTheDocument();
    const normalized = window.localStorage.getItem(key);
    expect(normalized).toBe(JSON.stringify(fixtures.stored));
    expect(normalized).not.toContain("score");
    expect(normalized).not.toContain("riskPenalty");
    expect(normalized).not.toContain("forged browser value");
  });

  it("clears stale selections and provides an accessible recovery route", async () => {
    const fixtures = getFixtures();
    const key = `touchline26:decision:${fixtures.match.id}:${fixtures.scenario.id}`;
    window.localStorage.setItem(
      key,
      JSON.stringify({ ...fixtures.stored, inPlayerId: "removed-player" }),
    );

    render(
      <ResultWorkspace
        match={fixtures.match}
        scenario={fixtures.scenario}
        players={fixtures.players}
        roles={fixtures.roles}
      />,
    );

    expect(
      await screen.findByRole("heading", { name: "결정을 다시 확인해 주세요" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "전술 보드로 돌아가기" }),
    ).toHaveAttribute(
      "href",
      `/matches/${fixtures.match.id}/scenarios/${fixtures.scenario.id}/tactics`,
    );
    await waitFor(() => expect(window.localStorage.getItem(key)).toBeNull());
  });
});
