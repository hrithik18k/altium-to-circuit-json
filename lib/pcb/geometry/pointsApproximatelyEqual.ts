import type { AltiumPoint } from "altiumts"

export function pointsApproximatelyEqual({
  left,
  right,
  maxEndpointGapMils,
}: {
  left: AltiumPoint
  right: AltiumPoint
  maxEndpointGapMils: number
}): boolean {
  return (
    Math.abs(left.x - right.x) <= maxEndpointGapMils &&
    Math.abs(left.y - right.y) <= maxEndpointGapMils
  )
}
