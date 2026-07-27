import { describe, expect, it } from "vitest";

import playersData from "@/data/players/players.json";
import type { Player } from "@/data/types";

import { adjustForConfidence } from "./confidenceAdjustment";
import {
  ATTRIBUTE_METRIC_WEIGHTS_BY_POSITION_GROUP,
  buildPositionGroupComparisonSamples,
  deriveAllPlayerAttributes,
  derivePlayerAttributeResults,
} from "./reproducePlayerAttributes";

const players = playersData as Player[];

describe("stored player attribute reproduction", () => {
  it("reproduces every stored 1-20 attribute exactly", () => {
    const generated = deriveAllPlayerAttributes(players);

    for (const player of players) {
      expect(generated[player.id], player.id).toEqual(player.attributes);
    }
  });

  it("builds per-90 comparison samples only inside a position group", () => {
    const wingerSamples = buildPositionGroupComparisonSamples(
      players,
      "WINGER",
    );

    expect(wingerSamples.takeOns).toHaveLength(3);
    expect(wingerSamples.takeOns).toEqual(
      expect.arrayContaining([
        expect.closeTo((8 * 90) / 99),
        expect.closeTo((3 * 90) / 34),
        3,
      ]),
    );
  });

  it("uses explicit position-specific weights and confidence shrinkage", () => {
    expect(
      ATTRIBUTE_METRIC_WEIGHTS_BY_POSITION_GROUP.STRIKER.finishing
        .metricWeights,
    ).toEqual({
      goals: 0.5,
      shotsOnTarget: 0.35,
      shots: 0.15,
    });

    const player = players.find(
      (candidate) => candidate.id === "oh-hyeongyu",
    );
    expect(player).toBeDefined();

    const result = derivePlayerAttributeResults(player!, players).finishing;
    expect(result.adjustedScore).toBe(
      adjustForConfidence(result.rawScore, player!.confidence),
    );
    expect(result.score).toBe(player!.attributes.finishing);
    expect(result.confidence).toBe(player!.confidence);
  });

  it("keeps players without an observed match row at the neutral midpoint", () => {
    for (const playerId of ["cho-guesung", "bae-junho"]) {
      const player = players.find((candidate) => candidate.id === playerId);
      expect(player?.rawMetrics).toBeNull();
      expect(
        Object.values(
          deriveAllPlayerAttributes(players)[playerId] ?? {},
        ),
      ).toEqual(Array(8).fill(11));
    }
  });
});
