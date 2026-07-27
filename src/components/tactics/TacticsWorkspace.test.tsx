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

function renderWorkspace() {
  const match = getMatch("kor-cze-2026");
  const scenario = getScenario("kor-cze-2026", "level-69-find-nine");
  if (!match || !scenario) throw new Error("Fixture data is missing");

  return render(
    <TacticsWorkspace
      match={match}
      scenario={scenario}
      lineupPlayers={getPlayersByIds(
        scenario.currentLineup.map((spot) => spot.playerId),
      )}
      benchPlayers={getPlayersByIds(scenario.benchOptions)}
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
        name: "손흥민, 중앙 공격수. 교체할 선수로 선택",
      }),
    );
    await user.click(
      screen.getByRole("button", {
        name: "오현규, 중앙 공격수. 투입 선수로 선택하거나 드래그",
      }),
    );

    expect(screen.getByText("SUBSTITUTION PREVIEW")).toBeInTheDocument();
    expect(screen.getAllByText("손흥민").length).toBeGreaterThan(0);
    expect(screen.getAllByText("오현규").length).toBeGreaterThan(0);

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
    expect(saved).toContain('"inPlayerId":"oh-hyeongyu"');
    expect(saved).toContain('"outPlayerId":"son-heungmin"');
  });

  it("supports instruction changes and cancelling the preview", async () => {
    const user = userEvent.setup();
    renderWorkspace();

    await user.click(
      screen.getByRole("button", {
        name: "손흥민, 중앙 공격수. 교체할 선수로 선택",
      }),
    );
    await user.click(
      screen.getByRole("button", {
        name: "오현규, 중앙 공격수. 투입 선수로 선택하거나 드래그",
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
        name: "손흥민, 중앙 공격수. 교체할 선수로 선택",
      }),
    );
    const incoming = screen.getByRole("button", {
      name: "오현규, 중앙 공격수. 투입 선수로 선택하거나 드래그",
    });
    incoming.focus();
    await user.keyboard("{Enter}");

    expect(incoming).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("투입 역할")).toBeInTheDocument();
  });
});
