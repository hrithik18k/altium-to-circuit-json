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
    font_size: scaleLength(fontSize, scale),
    position: scalePoint(location, scale),
    // Schematic text rotates in SVG screen coordinates, whose Y axis points
    // down. Convert Altium's counterclockwise angle to that convention.
    rotation: ccwRotationDegrees === 0 ? 0 : -ccwRotationDegrees,
    anchor,
    color,
  }
}
