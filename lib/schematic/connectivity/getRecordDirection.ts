import type { AltiumRecord } from "altiumts"
import type { CardinalDirection } from "../geometry"
import { DIRECTION_BY_ORIENTATION } from "./constants"

export function getRecordDirection(record: AltiumRecord): CardinalDirection {
  const orientation =
    ((Math.round(record.getNumber("ORIENTATION") ?? 0) % 4) + 4) % 4
  return DIRECTION_BY_ORIENTATION[orientation] ?? "right"
}
