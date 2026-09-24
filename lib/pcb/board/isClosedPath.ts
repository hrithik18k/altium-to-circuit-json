import type { AltiumPoint } from "altiumts"
import { pointsApproximatelyEqual } from "../geometry"
import { MAX_ENDPOINT_GAP_MILS } from "./constants"

export function isClosedPath(points: AltiumPoint[]): boolean {
  const first = points[0]
  const last = points.at(-1)
  return Boolean(
    first &&
      last &&
      pointsApproximatelyEqual({
        left: first,
        right: last,
        maxEndpointGapMils: MAX_ENDPOINT_GAP_MILS,
      }),
  )
}
