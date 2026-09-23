import type {
  AnyCircuitElement,
  SchematicCircle,
  SchematicPath,
} from "circuit-json"
import { SCHEMATIC_SHEET_ID } from "../document"
import {
  getCoordinateOrFallback,
  getLocation,
  scaleLength,
  scalePoint,
} from "../geometry"
import { altiumColorToCss } from "../text"
import { approximateEllipse } from "./approximateEllipse"
import type { PrimitiveRenderOptions } from "./types"

export function renderSchematicEllipseRecord({
  color,
  context,
  index,
  record,
  strokeWidth,
}: PrimitiveRenderOptions): AnyCircuitElement[] | undefined {
  if (record.recordKind !== "8") return undefined
  const center = getLocation(record)
  if (!center) return []
  const radiusX = getCoordinateOrFallback({
    record,
    key: "RADIUS",
    fallback: 1,
  })
  const radiusY = getCoordinateOrFallback({
    record,
    key: "SECONDARYRADIUS",
    fallback: radiusX,
  })
  const fillColor = altiumColorToCss(
    record.getCaseInsensitive("AREACOLOR"),
    "#ffffff",
  )
  const isFilled = record.getBoolean("ISSOLID") === true
  if (Math.abs(radiusX - radiusY) < 0.0001) {
    return [
      {
        type: "schematic_circle",
        schematic_circle_id: `schematic_circle_altium_${index}`,
        schematic_sheet_id: SCHEMATIC_SHEET_ID,
        center: scalePoint(center, context.scale),
        radius: scaleLength(radiusX, context.scale),
        stroke_width: strokeWidth,
        color,
        is_filled: isFilled,
        fill_color: fillColor,
        is_dashed: false,
      } satisfies SchematicCircle,
    ]
  }
  return [
    {
      type: "schematic_path",
      schematic_path_id: `schematic_ellipse_altium_${index}`,
      schematic_sheet_id: SCHEMATIC_SHEET_ID,
      points: approximateEllipse({ center, radiusX, radiusY }).map((point) =>
        scalePoint(point, context.scale),
      ),
      stroke_width: strokeWidth,
      stroke_color: color,
      fill_color: fillColor,
      is_filled: isFilled,
      is_dashed: false,
    } satisfies SchematicPath,
  ]
}
