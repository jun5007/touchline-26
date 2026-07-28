import { describe, expect, it } from "vitest";
import {
  getDecisionMatchView,
  getDecisionScenarioContext,
  getMatch,
  getScenario,
} from "@/data/repository";

describe("decision-safe client context", () => {
  it("does not serialize final or post-decision result facts", () => {
    const match = getMatch("kor-cze-2026");
    const scenario = getScenario("kor-cze-2026", "level-69-find-nine");
    if (!match || !scenario) throw new Error("Missing decision fixtures");

    const matchView = getDecisionMatchView(match);
    const scenarioContext = getDecisionScenarioContext(scenario);
    const payload = JSON.stringify({ matchView, scenarioContext });

    expect(matchView).not.toHaveProperty("finalScore");
    expect(matchView).not.toHaveProperty("events");
    expect(scenarioContext).not.toHaveProperty("actualDecision");
    expect(scenarioContext).not.toHaveProperty("dataSources");
    expect(payload).not.toContain("finalScore");
    expect(payload).not.toContain("actualDecision");
    expect(payload).not.toContain("80분");
  });
});
