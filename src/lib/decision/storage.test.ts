import { beforeEach, describe, expect, it, vi } from "vitest";
import type { StoredDecision } from "@/data/types";
import {
  clearDecision,
  DECISION_STORAGE_VERSION,
  loadDecision,
  saveDecision,
} from "@/lib/decision/storage";

const decision: StoredDecision = {
  version: 3,
  matchId: "match",
  scenarioId: "scenario",
  selectedTeamId: "kor",
  outPlayerId: "out",
  inPlayerId: "in",
  roleId: "role",
  instructions: {
    attackDirection: "balanced",
    pressing: "medium",
    defensiveLine: "medium",
    mentality: "balanced",
  },
  createdAt: "2026-07-27T00:00:00.000Z",
};

const key = "touchline26:decision:match:scenario";

describe("decision storage v3", () => {
  beforeEach(() => window.localStorage.clear());

  it("saves, loads, and clears only the minimal selection state", () => {
    expect(DECISION_STORAGE_VERSION).toBe(3);
    expect(saveDecision(decision)).toBe(true);
    expect(loadDecision("match", "scenario")).toEqual(decision);

    const persisted = JSON.parse(window.localStorage.getItem(key) ?? "{}");
    expect(Object.keys(persisted).sort()).toEqual(
      [
        "createdAt",
        "inPlayerId",
        "instructions",
        "matchId",
        "outPlayerId",
        "roleId",
        "scenarioId",
        "selectedTeamId",
        "version",
      ].sort(),
    );
    expect(persisted).not.toHaveProperty("score");
    expect(persisted).not.toHaveProperty("riskPenalty");
    expect(persisted).not.toHaveProperty("impactsBefore");
    expect(persisted).not.toHaveProperty("explanation");

    clearDecision("match", "scenario");
    expect(loadDecision("match", "scenario")).toBeNull();
  });

  it("whitelists fields on save and load so derived or injected values never persist", () => {
    expect(
      saveDecision({
        ...decision,
        score: 999,
        riskPenalty: -100,
        explanation: { summary: "forged" },
      } as StoredDecision),
    ).toBe(true);
    expect(window.localStorage.getItem(key)).not.toContain("forged");

    window.localStorage.setItem(
      key,
      JSON.stringify({
        ...decision,
        score: 999,
        riskPenalty: -100,
        instructions: { ...decision.instructions, injected: "ignored" },
      }),
    );
    expect(loadDecision("match", "scenario")).toEqual(decision);
    expect(window.localStorage.getItem(key)).toBe(JSON.stringify(decision));
  });

  it("removes corrupt records and rejects unsupported identifiers or instructions", () => {
    const invalidRecords: unknown[] = [
      { ...decision, instructions: [] },
      {
        ...decision,
        instructions: { ...decision.instructions, pressing: "all-out" },
      },
      { ...decision, roleId: "" },
      { ...decision, inPlayerId: "../player" },
      { ...decision, createdAt: "not-a-date" },
      { ...decision, selectedTeamId: "" },
      { ...decision, version: 4 },
    ];

    for (const invalid of invalidRecords) {
      window.localStorage.setItem(key, JSON.stringify(invalid));
      expect(loadDecision("match", "scenario")).toBeNull();
      expect(window.localStorage.getItem(key)).toBeNull();
    }

    window.localStorage.setItem(key, "{broken");
    expect(loadDecision("match", "scenario")).toBeNull();
    expect(window.localStorage.getItem(key)).toBeNull();
  });

  it("removes version 1 records instead of trusting or migrating cached calculations", () => {
    window.localStorage.setItem(
      key,
      JSON.stringify({
        ...decision,
        version: 1,
        score: 99,
        riskPenalty: 0,
        impactsBefore: {},
        impactsAfter: {},
        explanation: {
          benefits: [],
          risks: [],
          remedies: [],
          summary: "legacy",
        },
      }),
    );

    expect(loadDecision("match", "scenario")).toBeNull();
    expect(window.localStorage.getItem(key)).toBeNull();
  });

  it("removes a structurally valid record stored under mismatched route identifiers", () => {
    window.localStorage.setItem(
      key,
      JSON.stringify({ ...decision, scenarioId: "another-scenario" }),
    );

    expect(loadDecision("match", "scenario")).toBeNull();
    expect(window.localStorage.getItem(key)).toBeNull();
  });

  it("does not throw when browser storage operations fail", () => {
    const setItem = vi
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation(() => {
        throw new DOMException("blocked");
      });
    expect(saveDecision(decision)).toBe(false);
    setItem.mockRestore();
  });
});
