export function getPositiveNumber(
  candidate: unknown,
  fallback: number,
): number {
  const parsed = Number(candidate)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}
