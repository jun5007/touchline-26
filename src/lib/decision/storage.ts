import type { StoredDecision } from "@/data/types";

const STORAGE_PREFIX = "touchline26:decision";
export const DECISION_STORAGE_VERSION = 3;
export const DECISION_STORAGE_EVENT = "touchline26:decision-change";

export type DecisionLoadResult =
  | { status: "ready"; decision: StoredDecision }
  | { status: "missing" }
  | { status: "invalid" };

const instructionValues = {
  attackDirection: ["left", "centre", "right", "balanced"],
  pressing: ["low", "medium", "high"],
  defensiveLine: ["low", "medium", "high"],
  mentality: ["safe", "balanced", "attacking"],
} as const;

function storageKey(matchId: string, scenarioId: string) {
  return `${STORAGE_PREFIX}:${matchId}:${scenarioId}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isIdentifier(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value.length <= 128 &&
    /^[a-z0-9][a-z0-9-]*$/i.test(value)
  );
}

function isInstructions(
  value: unknown,
): value is StoredDecision["instructions"] {
  if (!isRecord(value)) return false;

  return (
    instructionValues.attackDirection.includes(
      value.attackDirection as (typeof instructionValues.attackDirection)[number],
    ) &&
    instructionValues.pressing.includes(
      value.pressing as (typeof instructionValues.pressing)[number],
    ) &&
    instructionValues.defensiveLine.includes(
      value.defensiveLine as (typeof instructionValues.defensiveLine)[number],
    ) &&
    instructionValues.mentality.includes(
      value.mentality as (typeof instructionValues.mentality)[number],
    )
  );
}

function isStoredDecision(value: unknown): value is StoredDecision {
  if (!isRecord(value)) return false;

  return (
    value.version === DECISION_STORAGE_VERSION &&
    isIdentifier(value.matchId) &&
    isIdentifier(value.scenarioId) &&
    isIdentifier(value.selectedTeamId) &&
    isIdentifier(value.outPlayerId) &&
    isIdentifier(value.inPlayerId) &&
    isIdentifier(value.roleId) &&
    isInstructions(value.instructions) &&
    typeof value.createdAt === "string" &&
    Number.isFinite(Date.parse(value.createdAt))
  );
}

function normalizeDecision(decision: StoredDecision): StoredDecision {
  return {
    version: DECISION_STORAGE_VERSION,
    matchId: decision.matchId,
    scenarioId: decision.scenarioId,
    selectedTeamId: decision.selectedTeamId,
    outPlayerId: decision.outPlayerId,
    inPlayerId: decision.inPlayerId,
    roleId: decision.roleId,
    instructions: {
      attackDirection: decision.instructions.attackDirection,
      pressing: decision.instructions.pressing,
      defensiveLine: decision.instructions.defensiveLine,
      mentality: decision.instructions.mentality,
    },
    createdAt: decision.createdAt,
  };
}

export function saveDecision(decision: StoredDecision): boolean {
  if (typeof window === "undefined") return false;
  if (!isStoredDecision(decision)) return false;
  try {
    const normalized = normalizeDecision(decision);
    window.localStorage.setItem(
      storageKey(normalized.matchId, normalized.scenarioId),
      JSON.stringify(normalized),
    );
    window.dispatchEvent(new Event(DECISION_STORAGE_EVENT));
    return true;
  } catch {
    return false;
  }
}

export function loadDecisionResult(
  matchId: string,
  scenarioId: string,
): DecisionLoadResult {
  if (typeof window === "undefined") return { status: "missing" };
  const key = storageKey(matchId, scenarioId);
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return { status: "missing" };
    const parsed: unknown = JSON.parse(raw);
    if (!isStoredDecision(parsed)) {
      window.localStorage.removeItem(key);
      return { status: "invalid" };
    }
    if (parsed.matchId !== matchId || parsed.scenarioId !== scenarioId) {
      window.localStorage.removeItem(key);
      return { status: "invalid" };
    }
    const normalized = normalizeDecision(parsed);
    const normalizedRaw = JSON.stringify(normalized);
    if (raw !== normalizedRaw) {
      window.localStorage.setItem(key, normalizedRaw);
    }
    return { status: "ready", decision: normalized };
  } catch {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Storage may be unavailable. The caller still receives a safe null.
    }
    return { status: "invalid" };
  }
}

export function loadDecision(
  matchId: string,
  scenarioId: string,
): StoredDecision | null {
  const result = loadDecisionResult(matchId, scenarioId);
  return result.status === "ready" ? result.decision : null;
}

export function clearDecision(matchId: string, scenarioId: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(storageKey(matchId, scenarioId));
    window.dispatchEvent(new Event(DECISION_STORAGE_EVENT));
  } catch {
    // A failed clear should not break the playable flow.
  }
}
