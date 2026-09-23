import type { AltiumPoint, AltiumRecord } from "altiumts"
import { getCoordinate } from "./getCoordinate"

export function getLocation(record: AltiumRecord): AltiumPoint | undefined {
  const x = getCoordinate(record, "LOCATION.X")
  const y = getCoordinate(record, "LOCATION.Y")
  return x === undefined || y === undefined ? undefined : { x, y }
}
