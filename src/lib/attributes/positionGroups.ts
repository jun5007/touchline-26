export const POSITION_GROUPS = [
  "GK",
  "CB",
  "FB_WB",
  "DM",
  "CM_AM",
  "WINGER",
  "STRIKER",
] as const;

export type PositionGroup = (typeof POSITION_GROUPS)[number];

const POSITION_ALIASES: Readonly<Record<string, PositionGroup>> = {
  GK: "GK",
  CB: "CB",
  LCB: "CB",
  RCB: "CB",
  LB: "FB_WB",
  RB: "FB_WB",
  LWB: "FB_WB",
  RWB: "FB_WB",
  WB: "FB_WB",
  DM: "DM",
  CDM: "DM",
  CM: "CM_AM",
  CAM: "CM_AM",
  AM: "CM_AM",
  LM: "WINGER",
  RM: "WINGER",
  LW: "WINGER",
  RW: "WINGER",
  WINGER: "WINGER",
  ST: "STRIKER",
  CF: "STRIKER",
  FW: "STRIKER",
  STRIKER: "STRIKER",
};

export function toPositionGroup(
  position: string | null | undefined,
): PositionGroup | undefined {
  if (typeof position !== "string") {
    return undefined;
  }
  return POSITION_ALIASES[position.trim().toUpperCase()];
}

/**
 * Product defaults only. Scenario JSON remains free to provide different
 * weights, so scoring never depends on a player, team, or competition name.
 */
export const POSITION_GROUP_ATTRIBUTE_WEIGHTS: Readonly<
  Record<PositionGroup, Readonly<Record<string, number>>>
> = {
  GK: {
    shotStopping: 0.3,
    distribution: 0.2,
    aerialCommand: 0.15,
    sweeping: 0.1,
    composure: 0.1,
    impact: 0.15,
  },
  CB: {
    defending: 0.3,
    aerial: 0.2,
    passing: 0.15,
    pressing: 0.1,
    speed: 0.1,
    impact: 0.15,
  },
  FB_WB: {
    defending: 0.2,
    pressing: 0.15,
    passing: 0.15,
    chanceCreation: 0.15,
    speed: 0.2,
    impact: 0.15,
  },
  DM: {
    defending: 0.25,
    pressing: 0.2,
    passing: 0.2,
    aerial: 0.1,
    composure: 0.1,
    impact: 0.15,
  },
  CM_AM: {
    passing: 0.25,
    chanceCreation: 0.2,
    pressing: 0.15,
    dribbling: 0.1,
    composure: 0.15,
    impact: 0.15,
  },
  WINGER: {
    dribbling: 0.25,
    chanceCreation: 0.2,
    speed: 0.2,
    finishing: 0.1,
    pressing: 0.1,
    impact: 0.15,
  },
  STRIKER: {
    finishing: 0.3,
    chanceCreation: 0.1,
    aerial: 0.15,
    speed: 0.15,
    pressing: 0.1,
    impact: 0.2,
  },
};

