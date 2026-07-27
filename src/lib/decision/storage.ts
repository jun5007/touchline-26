import type { StoredDecision } from "@/data/types";

const STORAGE_PREFIX = "touchline26:decision";

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

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
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

function isImpactRecord(value: unknown): value is Record<string, number> {
  if (!isRecord(value)) return false;

  return Object.values(value).every(
    (impact) => typeof impact === "number" && Number.isFinite(impact),
  );
}

function isExplanation(
  value: unknown,
): value is StoredDecision["explanation"] {
  if (!isRecord(value)) return false;

  return (
    isStringArray(value.benefits) &&
    isStringArray(value.risks) &&
    isStringArray(value.remedies) &&
    typeof value.summary === "string"
  );
}

function isStoredDecision(value: unknown): value is StoredDecision {
  if (!isRecord(value)) return false;

  return (
    value.version === 1 &&
    typeof value.matchId === "string" &&
    typeof value.scenarioId === "string" &&
    typeof value.outPlayerId === "string" &&
    typeof value.inPlayerId === "string" &&
    typeof value.roleId === "string" &&
    isInstructions(value.instructions) &&
    typeof value.score === "number" &&
    Number.isFinite(value.score) &&
    value.score >= 0 &&
    value.score <= 100 &&
    typeof value.riskPenalty === "number" &&
    Number.isFinite(value.riskPenalty) &&
    isImpactRecord(value.impactsBefore) &&
    isImpactRecord(value.impactsAfter) &&
    isExplanation(value.explanation) &&
    typeof value.createdAt === "string" &&
    Number.isFinite(Date.parse(value.createdAt))
  );
}

export function saveDecision(decision: StoredDecision): boolean {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(
      storageKey(decision.matchId, decision.scenarioId),
      JSON.stringify(decision),
    );
    return true;
  } catch {
    return false;
  }
}

export function loadDecision(
  matchId: string,
  scenarioId: string,
): StoredDecision | null {
  if (typeof window === "undefined") return null;
  const key = storageKey(matchId, scenarioId);
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!isStoredDecision(parsed)) {
      window.localStorage.removeItem(key);
      return null;
    }
    if (parsed.matchId !== matchId || parsed.scenarioId !== scenarioId) {
      window.localStorage.removeItem(key);
      return null;
    }
    return parsed;
  } catch {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Storage may be unavailable. The caller still receives a safe null.
    }
    return null;
  }
}

export function clearDecision(matchId: string, scenarioId: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(storageKey(matchId, scenarioId));
  } catch {
    // A failed clear should not break the playable flow.
  }
}
