import { ALTIUM_SLOT_HOLE_TYPE } from "../model"
import { normalizeShape } from "./normalizeShape"
import type { ThroughHolePadConversionOptions } from "./types"

export function isSlottedThroughHolePad({
  geometry,
  record,
}: Pick<ThroughHolePadConversionOptions, "geometry" | "record">): boolean {
  return (
    record.getNumber("HOLETYPE") === ALTIUM_SLOT_HOLE_TYPE ||
    normalizeShape(geometry.holeShape).includes("SLOT") ||
    geometry.slotLengthMils > geometry.holeSizeMils ||
    (record.holeWidthMils ?? 0) > geometry.holeSizeMils
  )
}
