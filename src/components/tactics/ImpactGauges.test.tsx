import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ImpactGauges } from "@/components/tactics/ImpactGauges";
import {
  getDecisionScenarioContext,
  getPlayersForScenario,
  getRoles,
  getScenario,
} from "@/data/repository";
import {
  evaluateDecision,
  type DecisionEvaluation,
} from "@/lib/decision/evaluateDecision";

function buildEvaluation(measured: boolean): DecisionEvaluation {
  const scenario = getScenario("kor-cze-2026", "level-69-find-nine");
  if (!scenario) throw new Error("Scenario fixture is missing");
  const players = getPlayersForScenario(scenario);
  const originalOutgoing = players.find(
    (player) => player.id === "son-heungmin",
  );
  const originalIncoming = players.find(
    (player) => player.id === "oh-hyeongyu",
  );
  const role = getRoles().find(
    (candidate) => candidate.roleId === "target-striker",
  );
  if (!originalOutgoing || !originalIncoming || !role) {
    throw new Error("Impact fixtures are missing");
  }
  const toMeasuredAttributes = (attributes: typeof originalOutgoing.attributes) =>
    Object.fromEntries(
      Object.keys(attributes).map((attribute) => [attribute, 10]),
    ) as typeof attributes;
  const outgoing = measured
    ? {
        ...originalOutgoing,
        attributes: toMeasuredAttributes(originalOutgoing.attributes),
      }
    : originalOutgoing;
  const incoming = measured
    ? {
        ...originalIncoming,
        attributes: toMeasuredAttributes(originalIncoming.attributes),
      }
    : originalIncoming;

  return evaluateDecision({
    outgoing,
    incoming,
    role,
    instructions: scenario.defaultInstructions,
    scenario: getDecisionScenarioContext(scenario),
  });
}

describe("ImpactGauges", () => {
  it("shows one explanation and no empty bars when every gauge is unavailable", () => {
    render(<ImpactGauges evaluation={buildEvaluation(false)} />);

    expect(screen.queryAllByTestId("impact-gauge")).toHaveLength(0);
    expect(
      screen.getByText(
        /비교 가능한 선수 성과 데이터가 없어 전후 영향 그래프를 표시하지 않습니다/,
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("전술 선택 적합도")).toBeInTheDocument();
    expect(screen.getByText("승률·선수 절대 능력치 아님")).toBeInTheDocument();
    expect(screen.getByText(/역할·팀 지시/)).toBeInTheDocument();
    expect(screen.getByText(/선수 BASE 능력/)).toBeInTheDocument();
    expect(screen.getByText(/위험 패널티/)).toBeInTheDocument();
    expect(screen.queryByText("데이터 없음")).not.toBeInTheDocument();
  });

  it("keeps available legacy gauges", () => {
    render(<ImpactGauges evaluation={buildEvaluation(true)} />);

    expect(screen.getAllByTestId("impact-gauge")).toHaveLength(4);
    expect(screen.getByText("확인된 BASE + Form 지표")).toBeInTheDocument();
    expect(
      screen.queryByText(
        /비교 가능한 선수 성과 데이터가 없어 전후 영향 그래프를 표시하지 않습니다/,
      ),
    ).not.toBeInTheDocument();
  });

  it("does not draw placeholder bars before a decision is selected", () => {
    render(<ImpactGauges evaluation={null} />);

    expect(screen.queryAllByTestId("impact-gauge")).toHaveLength(0);
    expect(
      screen.getByText(/OUT 선수, IN 선수, 역할을 선택하면/),
    ).toBeInTheDocument();
  });
});
