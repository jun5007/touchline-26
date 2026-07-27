import { beforeEach, describe, expect, it } from "vitest";
import type { StoredDecision } from "@/data/types";
import {
  clearDecision,
  loadDecision,
  saveDecision,
} from "@/lib/decision/storage";

const decision: StoredDecision = {
  version: 1,
  matchId: "match",
  scenarioId: "scenario",
  outPlayerId: "out",
  inPlayerId: "in",
  roleId: "role",
  instructions: {
    attackDirection: "balanced",
    pressing: "medium",
    defensiveLine: "medium",
    mentality: "balanced",
  },
  score: 77,
  riskPenalty: 2,
  impactsBefore: { attackThreat: 50 },
  impactsAfter: { attackThreat: 58 },
  explanation: {
    benefits: ["장점"],
    risks: ["위험"],
    remedies: ["보완"],
    summary: "요약",
  },
  createdAt: "2026-07-27T00:00:00.000Z",
};

const key = "touchline26:decision:match:scenario";

const invalidNestedDecisions: Array<[string, unknown]> = [
  ["an instructions array", { ...decision, instructions: [] }],
  [
    "an incomplete instructions object",
    {
      ...decision,
      instructions: {
        attackDirection: "balanced",
        pressing: "medium",
        defensiveLine: "medium",
      },
    },
  ],
  [
    "an unsupported instruction value",
    {
      ...decision,
      instructions: { ...decision.instructions, pressing: "all-out" },
    },
  ],
  ["a missing before-impact record", { ...decision, impactsBefore: null }],
  ["an after-impact array", { ...decision, impactsAfter: [58] }],
  [
    "a non-numeric impact",
    {
      ...decision,
      impactsAfter: { ...decision.impactsAfter, attackThreat: "high" },
    },
  ],
  ["a missing explanation", { ...decision, explanation: null }],
  [
    "a non-array benefit list",
    {
      ...decision,
      explanation: { ...decision.explanation, benefits: "benefit" },
    },
  ],
  [
    "a non-string remedy",
    {
      ...decision,
      explanation: { ...decision.explanation, remedies: [null] },
    },
  ],
  [
    "a non-string explanation summary",
    {
      ...decision,
      explanation: { ...decision.explanation, summary: 42 },
    },
  ],
  ["an invalid creation date", { ...decision, createdAt: "not-a-date" }],
  ["a non-numeric risk penalty", { ...decision, riskPenalty: "2" }],
];

describe("decision storage", () => {
  beforeEach(() => window.localStorage.clear());

  it("saves, loads, and clears a valid decision", () => {
    expect(saveDecision(decision)).toBe(true);
    expect(loadDecision("match", "scenario")).toEqual(decision);
    clearDecision("match", "scenario");
    expect(loadDecision("match", "scenario")).toBeNull();
  });

  it("removes corrupt or out-of-range data without throwing", () => {
    window.localStorage.setItem(key, '{"version":1,"score":999}');
    expect(loadDecision("match", "scenario")).toBeNull();
    expect(window.localStorage.getItem(key)).toBeNull();

    window.localStorage.setItem(key, "{broken");
    expect(loadDecision("match", "scenario")).toBeNull();
    expect(window.localStorage.getItem(key)).toBeNull();
  });

  it.each(invalidNestedDecisions)(
    "removes a stored decision with %s",
    (_description, storedValue) => {
      window.localStorage.setItem(key, JSON.stringify(storedValue));

      expect(() => loadDecision("match", "scenario")).not.toThrow();
      expect(loadDecision("match", "scenario")).toBeNull();
      expect(window.localStorage.getItem(key)).toBeNull();
    },
  );

  it("removes a valid decision stored under mismatched route identifiers", () => {
    window.localStorage.setItem(
      key,
      JSON.stringify({ ...decision, scenarioId: "another-scenario" }),
    );

    expect(loadDecision("match", "scenario")).toBeNull();
    expect(window.localStorage.getItem(key)).toBeNull();
  });
});
