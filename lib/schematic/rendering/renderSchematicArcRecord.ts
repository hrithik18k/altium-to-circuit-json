import type { AnyCircuitElement, SchematicArc } from "circuit-json"
import { SCHEMATIC_SHEET_ID } from "../document"
import {
  getCoordinateOrFallback,
  getLocation,
  scaleLength,
  scalePoint,
} from "../geometry"
import type { PrimitiveRenderOptions } from "./types"

export function renderSchematicArcRecord({
  color,
  context,
  index,
  record,
  strokeWidth,
}: PrimitiveRenderOptions): AnyCircuitElement[] | undefined {
  if (record.recordKind !== "11" && record.recordKind !== "12") {
    return undefined
  }
  const center = getLocation(record)
  if (!center) return []
  return [
    {
      type: "schematic_arc",
      schematic_arc_id: `schematic_arc_altium_${index}`,
      schematic_sheet_id: SCHEMATIC_SHEET_ID,
      center: scalePoint(center, context.scale),
      radius: scaleLength(
        getCoordinateOrFallback({ record, key: "RADIUS", fallback: 1 }),
        context.scale,
      ),
      start_angle_degrees: Number(record.getCaseInsensitive("STARTANGLE") ?? 0),
      end_angle_degrees: Number(record.getCaseInsensitive("ENDANGLE") ?? 360),
      direction: "counterclockwise",
      stroke_width: strokeWidth,
      color,
      is_dashed: false,
    } satisfies SchematicArc,
  ]
}
