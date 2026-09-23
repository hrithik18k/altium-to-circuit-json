import type { AltiumPoint } from "altiumts"
import type { SchematicSegment } from "../model"
import { isPointNearSegmentEndpoint } from "./isPointNearSegmentEndpoint"

export function doesPointTouchWireEndpoint(
  point: AltiumPoint,
  wireSegments: SchematicSegment[],
): boolean {
  return wireSegments.some((segment) =>
    isPointNearSegmentEndpoint({
      point,
      start: segment.start,
      end: segment.end,
    }),
  )
}
