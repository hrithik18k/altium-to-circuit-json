import type { AltiumPoint } from "altiumts"
import { pointsApproximatelyEqual } from "../geometry"

export function isClosedAltiumPath(points: AltiumPoint[]): boolean {
  const first = points[0]
  const last = points.at(-1)
  return Boolean(
    first &&
      last &&
      pointsApproximatelyEqual({
        left: first,
        right: last,
        maxEndpointGapMils: 0.01,
      }),
  )
}
