import type { AltiumPoint } from "altiumts"
import type { SchematicText } from "circuit-json"
import { SCHEMATIC_SHEET_ID } from "../document"
import { scaleLength, scalePoint } from "../geometry"

export function createDirectText({
  id,
  text,
  location,
  fontSize,
  color,
  scale,
  ccwRotationDegrees,
  anchor,
}: {
  id: string
  text: string
  location: AltiumPoint
  fontSize: number
  color: string
  scale: number
  ccwRotationDegrees: number
  anchor: SchematicText["anchor"]
}): SchematicText {
  return {
    type: "schematic_text",
    schematic_text_id: id,
    schematic_sheet_id: SCHEMATIC_SHEET_ID,
    text,
    font_size: Math.max(scaleLength(fontSize, scale), 0.2),
    position: scalePoint(location, scale),
    rotation: ccwRotationDegrees,
    anchor,
    color,
  }
}
