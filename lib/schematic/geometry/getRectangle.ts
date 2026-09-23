import type { AltiumRecord } from "altiumts"
import { getCorner } from "./getCorner"
import { getLocation } from "./getLocation"
import type { Bounds } from "./types"

export function getRectangle(record: AltiumRecord): Bounds | undefined {
  const location = getLocation(record)
  const corner = getCorner(record)
  if (!location || !corner) return undefined
  return {
    maxX: Math.max(location.x, corner.x),
    maxY: Math.max(location.y, corner.y),
    minX: Math.min(location.x, corner.x),
    minY: Math.min(location.y, corner.y),
  }
}
