import type { AltiumPoint } from "altiumts"
import { isPointNear } from "./isPointNear"

export function isPointNearSegmentEndpoint({
  point,
  start,
  end,
}: {
  point: AltiumPoint
  start: AltiumPoint
  end: AltiumPoint
}): boolean {
  return isPointNear(point, start) || isPointNear(point, end)
}
