import type { AltiumPoint, AltiumRecord } from "altiumts"
import type { SchematicText } from "circuit-json"
import type { SchematicContext } from "../document"
import { createDirectText } from "./createDirectText"
import { getFontSize } from "./getFontSize"
import { getTextPositioning } from "./getTextPositioning"

export function createText({
  record,
  index,
  text,
  location,
  color,
  context,
}: {
  record: AltiumRecord
  index: number
  text: string
  location: AltiumPoint
  color: string
  context: SchematicContext
}): SchematicText {
  const positioning = getTextPositioning(record)
  return createDirectText({
    id: `schematic_text_altium_${index}`,
    text,
    location,
    fontSize: getFontSize(record, context),
    color,
    scale: context.scale,
    ccwRotationDegrees: positioning.ccwRotationDegrees,
    anchor: positioning.anchor,
  })
}
