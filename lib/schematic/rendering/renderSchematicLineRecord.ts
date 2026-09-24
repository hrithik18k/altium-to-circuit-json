import type { AnyCircuitElement } from "circuit-json"
import { getCorner, getLocation } from "../geometry"
import { createLine } from "../text"
import type { PrimitiveRenderOptions } from "./types"

export function renderSchematicLineRecord({
  color,
  context,
  index,
  record,
  strokeWidth,
}: PrimitiveRenderOptions): AnyCircuitElement[] | undefined {
  if (record.recordKind !== "13") return undefined
  const location = getLocation(record)
  const corner = getCorner(record)
  if (!location || !corner) return []
  return [
    createLine({
      index,
      start: location,
      end: corner,
      color,
      strokeWidth,
      scale: context.scale,
    }),
  ]
}
