import type { AltiumPoint } from "altiumts"
import type { SchematicLine } from "circuit-json"
import { SCHEMATIC_SHEET_ID } from "../document"
import { scalePoint } from "../geometry"

export function createLine({
  index,
  start,
  end,
  color,
  strokeWidth,
  scale,
  suffix = "line",
}: {
  index: number
  start: AltiumPoint
  end: AltiumPoint
  color: string
  strokeWidth: number
  scale: number
  suffix?: string
}): SchematicLine {
  const scaledStart = scalePoint(start, scale)
  const scaledEnd = scalePoint(end, scale)
  return {
    type: "schematic_line",
    schematic_line_id: `schematic_line_altium_${index}_${suffix}`,
    schematic_sheet_id: SCHEMATIC_SHEET_ID,
    x1: scaledStart.x,
    y1: scaledStart.y,
    x2: scaledEnd.x,
    y2: scaledEnd.y,
    stroke_width: strokeWidth,
    color,
    is_dashed: false,
  }
}
