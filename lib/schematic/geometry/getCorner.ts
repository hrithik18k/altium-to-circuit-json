import type { AltiumPoint, AltiumRecord } from "altiumts"
import { getCoordinate } from "./getCoordinate"

export function getCorner(record: AltiumRecord): AltiumPoint | undefined {
  const x = getCoordinate(record, "CORNER.X")
  const y = getCoordinate(record, "CORNER.Y")
  return x === undefined || y === undefined ? undefined : { x, y }
}
