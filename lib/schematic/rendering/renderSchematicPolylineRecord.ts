import { getSchematicRecordPoints } from "altiumts"
import type {
  AnyCircuitElement,
  SchematicPath,
  SchematicTrace,
} from "circuit-json"
import { SCHEMATIC_SHEET_ID } from "../document"
import { scalePoint } from "../geometry"
import { altiumColorToCss } from "../text"
import type { PrimitiveRenderOptions } from "./types"

export function renderSchematicPolylineRecord({
  color,
  context,
  index,
  record,
  strokeWidth,
}: PrimitiveRenderOptions): AnyCircuitElement[] | undefined {
  const kind = record.recordKind
  if (kind !== "27" && kind !== "6" && kind !== "7") return undefined
  const points = getSchematicRecordPoints(record).map((point) =>
    scalePoint(point, context.scale),
  )
  if (points.length < 2) return []
  if (kind === "27") {
    return [
      {
        type: "schematic_trace",
        schematic_trace_id: `schematic_trace_altium_${index}`,
        schematic_sheet_id: SCHEMATIC_SHEET_ID,
        junctions: [],
        edges: points.slice(1).map((point, pointIndex) => ({
          from: points[pointIndex] ?? point,
          to: point,
        })),
      } satisfies SchematicTrace,
    ]
  }
  return [
    {
      type: "schematic_path",
      schematic_path_id: `schematic_path_altium_${index}`,
      schematic_sheet_id: SCHEMATIC_SHEET_ID,
      points,
      stroke_width: strokeWidth,
      stroke_color: color,
      fill_color:
        kind === "7"
          ? altiumColorToCss(
              record.getCaseInsensitive("AREACOLOR"),
              "transparent",
            )
          : undefined,
      is_filled: kind === "7",
      is_dashed: false,
    } satisfies SchematicPath,
  ]
}
