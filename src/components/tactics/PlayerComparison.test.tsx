import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PlayerComparison } from "@/components/tactics/PlayerComparison";
import {
  getPlayer,
  getPlayersForScenario,
  getRoles,
  getScenario,
} from "@/data/repository";
import { evaluateDecision } from "@/lib/decision/evaluateDecision";

describe("PlayerComparison", () => {
  it("replaces an empty BASE table with current-state, role, and one data notice", () => {
    const scenario = getScenario("kor-cze-2026", "level-69-find-nine");
    if (!scenario) throw new Error("Scenario fixture is missing");
    const scenarioPlayers = getPlayersForScenario(scenario);
    const outgoing = scenarioPlayers.find(
      (player) => player.id === "son-heungmin",
    );
    const incoming = scenarioPlayers.find(
      (player) => player.id === "oh-hyeongyu",
    );
    const role = getRoles().find(
      (candidate) => candidate.roleId === "target-striker",
    );
    if (!outgoing || !incoming || !role) {
      throw new Error("Player comparison fixtures are missing");
    }
    const evaluation = evaluateDecision({
      outgoing,
      incoming,
      role,
      instructions: scenario.defaultInstructions,
      scenario,
    });

    render(
      <PlayerComparison
        outgoing={outgoing}
        incoming={incoming}
        role={role}
        evaluation={evaluation}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "A. 현재 경기 상태 비교" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "B. 전술 역할 비교" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "C. 선수 성과 데이터" }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("공식 등록 포지션")).toHaveLength(2);
    expect(screen.getAllByText("전술 태그")).toHaveLength(2);
    expect(screen.getByText(/OUT→IN 변화/)).toBeInTheDocument();
    expect(screen.getByText("선택 역할 · 타깃형 공격수")).toBeInTheDocument();
    expect(screen.getByText("상대 전술 적합 근거")).toBeInTheDocument();
    expect(screen.getByText("예상 장점")).toBeInTheDocument();
    expect(screen.getByText("예상 위험")).toBeInTheDocument();
    expect(
      screen.getByText("비교 가능한 최근 1년 세부 지표가 없습니다."),
    ).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    expect(screen.queryByText(/BASE 등급 D/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Form 0/)).not.toBeInTheDocument();
    expect(screen.queryByText(/신뢰도 0%/)).not.toBeInTheDocument();
    expect(screen.queryByText(/능력치 0\/8/)).not.toBeInTheDocument();
  });

  it("keeps the comparison table for shared measured data and preserves zero deltas", () => {
    const player = getPlayer("son-heungmin");
    if (!player) throw new Error("Player comparison fixture is missing");

    const measuredPlayer = {
      ...player,
      attributes: Object.fromEntries(
        Object.keys(player.attributes).map((attribute) => [attribute, 10]),
      ) as typeof player.attributes,
    };

    render(
      <PlayerComparison
        outgoing={measuredPlayer}
        incoming={measuredPlayer}
        role={null}
      />,
    );

    const table = screen.getByRole("table", {
      name: "OUT·IN 공통 최근 1년 세부 지표 비교",
    });
    const rows = within(table).getAllByRole("row");
    expect(rows).toHaveLength(9);
    expect(rows.slice(1).every((row) => row.textContent?.endsWith("0"))).toBe(
      true,
    );
    expect(
      screen.queryByText("비교 가능한 최근 1년 세부 지표가 없습니다."),
    ).not.toBeInTheDocument();
  });

  it("does not fabricate a comparison when only one side has a metric", () => {
    const outgoing = getPlayer("son-heungmin");
    const incoming = getPlayer("oh-hyeongyu");
    if (!outgoing || !incoming) {
      throw new Error("Player comparison fixtures are missing");
    }

    render(
      <PlayerComparison
        outgoing={{
          ...outgoing,
          attributes: { ...outgoing.attributes, passing: null },
        }}
        incoming={{
          ...incoming,
          attributes: { ...incoming.attributes, passing: 15 },
        }}
        role={null}
      />,
    );

    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    expect(
      screen.getByText("비교 가능한 최근 1년 세부 지표가 없습니다."),
    ).toBeInTheDocument();
  });

  it("uses goalkeeper labels when both goalkeeper profiles are measured", () => {
    const outgoing = getPlayer("kim-seunggyu");
    const incoming = getPlayer("song-bumkeun");
    if (!outgoing || !incoming) {
      throw new Error("Goalkeeper comparison fixtures are missing");
    }
    const measuredOutgoing = {
      ...outgoing,
      goalkeeperAttributes: Object.fromEntries(
        Object.keys(outgoing.goalkeeperAttributes).map((attribute) => [
          attribute,
          10,
        ]),
      ) as typeof outgoing.goalkeeperAttributes,
    };
    const measuredIncoming = {
      ...incoming,
      goalkeeperAttributes: Object.fromEntries(
        Object.keys(incoming.goalkeeperAttributes).map((attribute) => [
          attribute,
          10,
        ]),
      ) as typeof incoming.goalkeeperAttributes,
    };

    render(
      <PlayerComparison
        outgoing={measuredOutgoing}
        incoming={measuredIncoming}
        role={null}
      />,
    );

    const table = screen.getByRole("table");
    expect(within(table).getByRole("row", { name: /선방/ })).toBeInTheDocument();
    expect(
      within(table).queryByRole("row", { name: /골 결정력/ }),
    ).not.toBeInTheDocument();
    expect(within(table).getAllByRole("row")).toHaveLength(9);
  });
});
