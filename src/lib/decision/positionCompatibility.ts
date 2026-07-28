import type { Player, PositionGroup, Role } from "@/data/types";

export function getEligiblePositionGroups(
  player: Player,
): readonly PositionGroup[] {
  return player.positionGroupCandidates.length > 0
    ? player.positionGroupCandidates
    : player.positionGroup
      ? [player.positionGroup]
      : [];
}

export function roleSupportsPlayer(role: Role, player: Player): boolean {
  return getEligiblePositionGroups(player).some((group) =>
    role.allowedPositionGroups.includes(group),
  );
}

export function playerHasVerifiedPositionGroup(
  player: Player,
  groups: readonly PositionGroup[],
): boolean {
  return player.positionGroup !== null && groups.includes(player.positionGroup);
}
