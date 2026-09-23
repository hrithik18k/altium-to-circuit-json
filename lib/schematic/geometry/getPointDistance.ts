import type { AltiumPoint } from "altiumts"

export function getPointDistance(
  left: AltiumPoint,
  right: AltiumPoint,
): number {
  return Math.hypot(left.x - right.x, left.y - right.y)
}
