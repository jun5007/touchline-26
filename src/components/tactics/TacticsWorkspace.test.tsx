import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TacticsWorkspace } from "@/components/tactics/TacticsWorkspace";
import {
  getInstructions,
  getMatch,
  getPlayersByIds,
  getRoles,
  getScenario,
} from "@/data/repository";

const pushMock = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

function renderWorkspace(substitutionsRemaining?: number) {
  const match = getMatch("kor-cze-2026");
  const baseScenario = getScenario("kor-cze-2026", "level-69-find-nine");
  if (!match || !baseScenario) throw new Error("Fixture data is missing");
  const scenario =
    substitutionsRemaining === undefined
      ? baseScenario
      : { ...baseScenario, substitutionsRemaining };

  return render(
    <TacticsWorkspace
      match={match}
      scenario={scenario}
      lineupPlayers={getPlayersByIds(
        scenario.currentLineup.map((spot) => spot.playerId),
        scenario,
      )}
      benchPlayers={getPlayersByIds(scenario.benchOptions, scenario)}
      roles={getRoles()}
      instructions={getInstructions()}
    />,
  );
}

describe("TacticsWorkspace click substitution flow", () => {
  beforeEach(() => {
    window.localStorage.clear();
    pushMock.mockReset();
  });

  it("selects OUT/IN, previews, chooses a role, and opens the result", async () => {
    const user = userEvent.setup();
    renderWorkspace();

    await user.click(
      screen.getByRole("button", {
        name: /손흥민.*교체할 선수로 선택/,
      }),
    );
    await user.click(
      screen.getByRole("button", {
        name: /오현규.*투입 선수로 클릭 선택/,
      }),
    );

    expect(screen.getByText("SUBSTITUTION PREVIEW")).toBeInTheDocument();
    expect(screen.getAllByText("손흥민").length).toBeGreaterThan(0);
    expect(screen.getAllByText("오현규").length).toBeGreaterThan(0);
    expect(screen.queryByText(/BASE \+ Form · IN/)).not.toBeInTheDocument();

    await user.click(
      screen.getByRole("radio", { name: /타깃형 공격수/ }),
    );
    const confirm = screen.getByRole("button", {
      name: /결정 확정 · 적합도/,
    });
    expect(confirm).toBeEnabled();
    await user.click(confirm);

    expect(pushMock).toHaveBeenCalledWith(
      "/matches/kor-cze-2026/scenarios/level-69-find-nine/result",
    );
    const saved = window.localStorage.getItem(
      "touchline26:decision:kor-cze-2026:level-69-find-nine",
    );
    const parsed = JSON.parse(saved ?? "{}");
    expect(parsed).toMatchObject({
      version: 3,
      selectedTeamId: "kor",
      inPlayerId: "oh-hyeongyu",
      outPlayerId: "son-heungmin",
      roleId: "target-striker",
    });
    expect(parsed).not.toHaveProperty("score");
    expect(parsed).not.toHaveProperty("riskPenalty");
    expect(parsed).not.toHaveProperty("impactsBefore");
    expect(parsed).not.toHaveProperty("explanation");
  });

  it("supports instruction changes and cancelling the preview", async () => {
    const user = userEvent.setup();
    renderWorkspace();

    await user.click(
      screen.getByRole("button", {
        name: /손흥민.*교체할 선수로 선택/,
      }),
    );
    await user.click(
      screen.getByRole("button", {
        name: /오현규.*투입 선수로 클릭 선택/,
      }),
    );
    await user.click(
      screen.getByRole("radio", { name: /침투형 공격수/ }),
    );

    const highPress = screen.getByLabelText("높음", {
      selector: 'input[name="pressing"]',
    });
    fireEvent.click(highPress);
    expect(highPress).toBeChecked();

    await user.click(screen.getByRole("button", { name: "취소" }));
    expect(screen.queryByText("SUBSTITUTION PREVIEW")).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "선수와 역할을 선택하세요" }),
    ).toBeDisabled();
  });

  it("keeps Enter as a keyboard click alternative for bench selection", async () => {
    const user = userEvent.setup();
    renderWorkspace();

    await user.click(
      screen.getByRole("button", {
        name: /손흥민.*교체할 선수로 선택/,
      }),
    );
    const incoming = screen.getByRole("button", {
      name: /오현규.*투입 선수로 클릭 선택/,
    });
    incoming.focus();
    await user.keyboard("{Enter}");

    expect(incoming).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("투입 역할")).toBeInTheDocument();
  });

  it("blocks confirmation when the scenario has no substitution slot", async () => {
    const user = userEvent.setup();
    renderWorkspace(0);

    await user.click(
      screen.getByRole("button", {
        name: /손흥민.*교체할 선수로 선택/,
      }),
    );
    await user.click(
      screen.getByRole("button", {
        name: /오현규.*투입 선수로 클릭 선택/,
      }),
    );
    await user.click(
      screen.getByRole("radio", { name: /타깃형 공격수/ }),
    );

    expect(
      screen.getByRole("button", {
        name: /이 시점에 가능한 교체가 없습니다/,
      }),
    ).toBeDisabled();
    expect(pushMock).not.toHaveBeenCalled();
    expect(window.localStorage).toHaveLength(0);
  });

  it("recalculates the score and risk when role and team instructions change", async () => {
    const user = userEvent.setup();
    renderWorkspace();

    await user.click(
      screen.getByRole("button", {
        name: /손흥민.*교체할 선수로 선택/,
      }),
    );
    await user.click(
      screen.getByRole("button", {
        name: /오현규.*투입 선수로 클릭 선택/,
      }),
    );
    await user.click(screen.getByRole("radio", { name: /타깃형 공격수/ }));
    const targetScore = screen.getByRole("button", {
      name: /결정 확정 · 적합도/,
    }).textContent;

    const advancedRole = screen.getByRole("radio", {
      name: /침투형 공격수/,
    });
    await user.click(advancedRole);
    const advancedScore = screen.getByRole("button", {
      name: /결정 확정 · 적합도/,
    }).textContent;
    expect(advancedRole).toBeChecked();
    expect(advancedScore).toBeTruthy();
    expect(targetScore).toBeTruthy();

    fireEvent.click(
      screen.getByLabelText("중앙", {
        selector: 'input[name="attackDirection"]',
      }),
    );
    fireEvent.click(
      screen.getByLabelText("높음", {
        selector: 'input[name="pressing"]',
      }),
    );
    fireEvent.click(
      screen.getByLabelText("높음", {
        selector: 'input[name="defensiveLine"]',
      }),
    );
    fireEvent.click(
      screen.getByLabelText("공격", {
        selector: 'input[name="mentality"]',
      }),
    );

    expect(
      screen.getByRole("button", { name: /결정 확정 · 적합도/ }).textContent,
    ).not.toBe(advancedScore);
    expect(screen.getByText(/RISK CHECK/)).toBeInTheDocument();
  });
});
