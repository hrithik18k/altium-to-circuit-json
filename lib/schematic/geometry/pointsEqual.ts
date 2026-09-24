import type { AltiumPoint } from "altiumts"

export function pointsEqual(
  left: AltiumPoint,
  right: AltiumPoint | undefined,
): boolean {
  return (
    right !== undefined &&
    Math.abs(left.x - right.x) < 0.000001 &&
    Math.abs(left.y - right.y) < 0.000001
  )
}
