import type { AltiumPoint } from "altiumts"
import { pointKey, type SchematicPointKey } from "../geometry"
import { isPointOnSegment } from "./isPointOnSegment"

export function splitSegmentAtPoints({
  start,
  end,
  candidates,
}: {
  start: AltiumPoint
  end: AltiumPoint
  candidates: AltiumPoint[]
}): AltiumPoint[] {
  const dx = end.x - start.x
  const dy = end.y - start.y
  const lengthSquared = dx * dx + dy * dy
  if (lengthSquared === 0) return [start]

  const pointsByKey = new Map<SchematicPointKey, AltiumPoint>([
    [pointKey(start), start],
    [pointKey(end), end],
  ])
  for (const candidate of candidates) {
    if (isPointOnSegment({ point: candidate, start, end })) {
      pointsByKey.set(pointKey(candidate), candidate)
    }
  }
  return [...pointsByKey.values()].sort((left, right) => {
    const leftDistance = (left.x - start.x) * dx + (left.y - start.y) * dy
    const rightDistance = (right.x - start.x) * dx + (right.y - start.y) * dy
    return leftDistance - rightDistance
  })
}
