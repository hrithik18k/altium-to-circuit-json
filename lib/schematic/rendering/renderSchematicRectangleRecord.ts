import type { AnyCircuitElement, SchematicRect } from "circuit-json"
import { SCHEMATIC_SHEET_ID } from "../document"
import { getRectangle, scaleLength, scalePoint } from "../geometry"
import { altiumColorToCss } from "../text"
import type { PrimitiveRenderOptions } from "./types"

export function renderSchematicRectangleRecord({
  color,
  context,
  index,
  record,
  strokeWidth,
}: PrimitiveRenderOptions): AnyCircuitElement[] | undefined {
  if (record.recordKind !== "10" && record.recordKind !== "14") return undefined
  const rectangle = getRectangle(record)
  if (!rectangle) return []
  return [
    {
      type: "schematic_rect",
      schematic_rect_id: `schematic_rect_altium_${index}`,
      schematic_sheet_id: SCHEMATIC_SHEET_ID,
      center: scalePoint(
        {
          x: (rectangle.minX + rectangle.maxX) / 2,
          y: (rectangle.minY + rectangle.maxY) / 2,
        },
        context.scale,
      ),
      width: scaleLength(rectangle.maxX - rectangle.minX, context.scale),
      height: scaleLength(rectangle.maxY - rectangle.minY, context.scale),
      rotation: 0,
      stroke_width: strokeWidth,
      color,
      is_filled: record.getBoolean("ISSOLID") === true,
      fill_color: altiumColorToCss(
        record.getCaseInsensitive("AREACOLOR"),
        "#ffffff",
      ),
      is_dashed: false,
    } satisfies SchematicRect,
  ]
}
