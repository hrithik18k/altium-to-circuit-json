import type { AltiumPoint } from "altiumts"

export function getVectorDifference(
  left: AltiumPoint,
  right: AltiumPoint,
): number {
  const leftLength = Math.hypot(left.x, left.y)
  const rightLength = Math.hypot(right.x, right.y)
  if (leftLength === 0 || rightLength === 0) {
    return Number.POSITIVE_INFINITY
  }
  const cosine =
    (left.x * right.x + left.y * right.y) / (leftLength * rightLength)
  return 1 - Math.max(-1, Math.min(1, cosine))
}
