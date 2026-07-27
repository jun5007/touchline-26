export function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

export function finiteOr(value: unknown, fallback: number): number {
  return isFiniteNumber(value) ? value : fallback;
}

export function clamp(
  value: unknown,
  minimum: number,
  maximum: number,
  fallback = minimum,
): number {
  const safeMinimum = finiteOr(minimum, 0);
  const safeMaximum = finiteOr(maximum, safeMinimum);
  const lower = Math.min(safeMinimum, safeMaximum);
  const upper = Math.max(safeMinimum, safeMaximum);
  const safeFallback = finiteOr(fallback, lower);
  const safeValue = finiteOr(value, safeFallback);

  return Math.min(upper, Math.max(lower, safeValue));
}

export function roundTo(value: unknown, decimalPlaces = 0): number {
  const safePlaces = Math.trunc(clamp(decimalPlaces, 0, 8, 0));
  const multiplier = 10 ** safePlaces;
  return Math.round(finiteOr(value, 0) * multiplier) / multiplier;
}

/**
 * Maps an attribute score to the common 0-100 scoring domain.
 * 1 maps to 0, 10.5 maps to 50, and 20 maps to 100.
 */
export function attributeScoreToPercent(value: unknown): number {
  const score = clamp(value, 1, 20, 10.5);
  return ((score - 1) / 19) * 100;
}

export function clampPercent(value: unknown, fallback = 50): number {
  return clamp(value, 0, 100, fallback);
}

