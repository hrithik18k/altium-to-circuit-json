import type { AltiumPoint } from "altiumts"
import { pointsApproximatelyEqual } from "./pointsApproximatelyEqual"

export function removeClosingPoint({
  points,
  maxEndpointGapMils,
}: {
  points: AltiumPoint[]
  maxEndpointGapMils: number
}): AltiumPoint[] {
  const first = points[0]
  const last = points.at(-1)
  return first &&
    last &&
    pointsApproximatelyEqual({ left: first, right: last, maxEndpointGapMils })
    ? points.slice(0, -1)
    : points
}
