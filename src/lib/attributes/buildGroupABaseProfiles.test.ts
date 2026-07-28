import { describe, expect, it } from "vitest";

import type {
  GroupAPerformanceProfile,
  GroupAPerformanceRecord,
  GroupAPlayer,
  GroupARawPerformanceMetrics,
  GroupASourceRecord,
} from "../../data/group-a/types";
import {
  buildGroupABaseProfiles,
  GROUP_A_BASE_PERIOD,
} from "./buildGroupABaseProfiles";

function emptyRawMetrics(
  overrides: Partial<GroupARawPerformanceMetrics> = {},
): GroupARawPerformanceMetrics {
  return {
    goals: null,
    assists: null,
    shots: null,
    shotsOnTarget: null,
    passesCompleted: null,
    passesAttempted: null,
    keyPasses: null,
    chancesCreated: null,
    finalThirdPasses: null,
    progressivePasses: null,
    progressiveCarries: null,
    dribblesCompleted: null,
    dribblesAttempted: null,
    tackles: null,
    interceptions: null,
    recoveries: null,
    pressures: null,
    blocks: null,
    clearances: null,
    aerialDuelsWon: null,
    aerialDuelsAttempted: null,
    yellowCards: null,
    redCards: null,
    substituteAppearances: null,
    substituteGoals: null,
    substituteAssists: null,
    saves: null,
    shotsOnTargetFaced: null,
    goalsConceded: null,
    cleanSheets: null,
    longPassesCompleted: null,
    longPassesAttempted: null,
    crossesClaimed: null,
    sweeperActions: null,
    penaltiesSaved: null,
    penaltiesFaced: null,
    ...overrides,
  };
}

function player(
  id: string,
  options: {
    positionGroup?: GroupAPlayer["positionGroup"];
    positionGroupStatus?: GroupAPlayer["positionGroupStatus"];
  } = {},
): GroupAPlayer {
  const positionGroup = options.positionGroup ?? "STRIKER";
  return {
    id,
    teamId: "kor",
    nameKo: id,
    nameEn: id,
    nameKoStatus: "official",
    shirtNumber: 9,
    officialPosition: "FW",
    positionGroup,
    positionGroupCandidates:
      positionGroup === null ? ["WINGER", "STRIKER"] : [positionGroup],
    positionGroupStatus:
      options.positionGroupStatus ?? "verified",
    club: {
      name: "Test Club",
      associationCode: "KOR",
      sourceIds: [],
    },
    leagueContext: {
      status: "domestic",
      strengthAdjustment: null,
      ratingStatus: "unrated",
      derivation: "synthetic test",
    },
    finalSquad: {
      status: "verified",
      shirtNumber: 9,
      officialPosition: "FW",
      dateOfBirth: "2000-01-01",
      heightCm: 180,
      caps: 0,
      goals: 0,
      sourceIds: [],
    },
    baseProfile: {
      period: GROUP_A_BASE_PERIOD,
      analysisMinutes: null,
      dataGrade: "D",
      confidence: 0,
      status: "incomplete",
      activeAttributeModel: "field",
      attributes: {
        field: {
          finishing: null,
          chanceCreation: null,
          dribbling: null,
          passing: null,
          pressing: null,
          defending: null,
          aerial: null,
          impact: null,
        },
        goalkeeper: {
          shotStopping: null,
          distribution: null,
          aerialCommand: null,
          sweeping: null,
          penaltySaving: null,
          stability: null,
          buildUp: null,
          impact: null,
        },
      },
      missingAttributes: [
        "finishing",
        "chanceCreation",
        "dribbling",
        "passing",
        "pressing",
        "defending",
        "aerial",
        "impact",
      ],
      sourceIds: [],
      note: "preserve me when no raw record exists",
    },
  };
}

function record(
  sourceId: string,
  rawMetrics: Partial<GroupARawPerformanceMetrics>,
): GroupAPerformanceRecord {
  return {
    clubId: "test-club",
    clubName: "Test Club",
    leagueId: "test-league",
    competitionId: "test-league-2025",
    competitionName: "Test League",
    competitionType: "league",
    dateFrom: GROUP_A_BASE_PERIOD.start,
    dateTo: GROUP_A_BASE_PERIOD.end,
    appearances: 20,
    starts: 15,
    minutes: 1_200,
    rawMetrics: emptyRawMetrics(rawMetrics),
    sourceIds: [sourceId],
    verificationStatus: "verified",
  };
}

function profile(
  playerId: string,
  records: GroupAPerformanceRecord[],
): GroupAPerformanceProfile {
  return {
    playerId,
    period: GROUP_A_BASE_PERIOD,
    priority: "P0",
    collectionStatus:
      records.length > 0 ? "partial" : "incomplete",
    records,
    sourceIds: records.flatMap((item) => item.sourceIds),
    reviewedSourceIds: [],
    missingReason:
      records.length > 0 ? "" : "No permitted performance record",
  };
}

function source(
  id: string,
  usagePermission: GroupASourceRecord["usagePermission"] = "open_license",
): GroupASourceRecord {
  return {
    id,
    sourceName: id,
    publisher: "Synthetic",
    url: "https://example.test/data",
    accessedAt: "2026-07-28",
    sourceType: "open-data",
    competition: "Test League",
    season: "2025/26",
    teamId: null,
    playerId: null,
    metricCoverage: ["synthetic"],
    usagePermission,
    notes: "synthetic test source",
  };
}

describe("buildGroupABaseProfiles", () => {
  it("preserves the existing null profile exactly when raw record arrays are empty", () => {
    const original = player("no-records");
    const result = buildGroupABaseProfiles({
      players: [original],
      clubProfiles: [profile(original.id, [])],
      nationalProfiles: [profile(original.id, [])],
      sources: [],
    });

    expect(result.players[0]).toBe(original);
    expect(result.generatedPlayerIds).toEqual([]);
    expect(result.preservedPlayerIds).toEqual([original.id]);
    expect(result.eligiblePerformanceRecordCount).toBe(0);
    expect(result.activeAttributeCount).toBe(0);
  });

  it("derives position-relative attributes from permitted raw records", () => {
    const low = player("low-output");
    const high = player("high-output");
    const openSource = source("open-source");
    const result = buildGroupABaseProfiles({
      players: [low, high],
      clubProfiles: [
        profile(low.id, [
          record(openSource.id, {
            goals: 1,
            assists: 0,
            shots: 12,
            shotsOnTarget: 4,
          }),
        ]),
        profile(high.id, [
          record(openSource.id, {
            goals: 12,
            assists: 4,
            shots: 30,
            shotsOnTarget: 20,
          }),
        ]),
      ],
      nationalProfiles: [],
      sources: [openSource],
    });
    const lowFinishing =
      result.players[0].baseProfile.attributes.field.finishing;
    const highFinishing =
      result.players[1].baseProfile.attributes.field.finishing;

    expect(lowFinishing).not.toBeNull();
    expect(highFinishing).not.toBeNull();
    expect(highFinishing).toBeGreaterThan(lowFinishing ?? 20);
    expect(result.players[1].baseProfile.status).toBe("partial");
    expect(result.players[1].baseProfile.sourceIds).toEqual([
      openSource.id,
    ]);
    expect(result.activeAttributeCount).toBeGreaterThan(0);
  });

  it("never forces broad-only players into an exact comparison sample", () => {
    const broad = player("broad", {
      positionGroup: null,
      positionGroupStatus: "broad_only",
    });
    const exact = player("exact");
    const openSource = source("open-source");
    const result = buildGroupABaseProfiles({
      players: [broad, exact],
      clubProfiles: [
        profile(broad.id, [
          record(openSource.id, {
            goals: 20,
            assists: 10,
            shots: 40,
            shotsOnTarget: 30,
          }),
        ]),
        profile(exact.id, [
          record(openSource.id, {
            goals: 1,
            assists: 0,
            shots: 10,
            shotsOnTarget: 2,
          }),
        ]),
      ],
      nationalProfiles: [],
      sources: [openSource],
    });

    expect(
      Object.values(result.players[0].baseProfile.attributes.field),
    ).toEqual(Array.from({ length: 8 }, () => null));
    expect(result.players[0].baseProfile.status).toBe("incomplete");
  });

  it.each(["restricted", "unknown"] as const)(
    "rejects %s raw sources before producing a profile",
    (usagePermission) => {
      const target = player("blocked");
      const blockedSource = source("blocked-source", usagePermission);

      expect(() =>
        buildGroupABaseProfiles({
          players: [target],
          clubProfiles: [
            profile(target.id, [
              record(blockedSource.id, {
                goals: 1,
                assists: 0,
                shots: 10,
                shotsOnTarget: 4,
              }),
            ]),
          ],
          nationalProfiles: [],
          sources: [blockedSource],
        }),
      ).toThrow(/허용되지 않습니다/);
    },
  );
});
