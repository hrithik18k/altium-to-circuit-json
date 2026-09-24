import type { AltiumRecord } from "altiumts"
import type { AnyCircuitElement, SchematicPath } from "circuit-json"
import { SCHEMATIC_SHEET_ID, type SchematicContext } from "../document"
import { getLocation, scalePoint } from "../geometry"
import { altiumColorToCss, createDirectText, getFontSize } from "../text"
import type { SymbolRenderOptions } from "./types"

export function renderHierarchicalPort({
  record,
  index,
  context,
  options,
  color,
}: {
  record: AltiumRecord
  index: number
  context: SchematicContext
  options: SymbolRenderOptions
  color: string
}): AnyCircuitElement[] {
  const location = getLocation(record)
  if (!location) return []
  const width = Math.max(Number(record.getCaseInsensitive("WIDTH") ?? 16), 10)
  const height = Math.max(Number(record.getCaseInsensitive("HEIGHT") ?? 10), 4)
  const halfHeight = height / 2
  const pointDepth = Math.min(width * 0.22, height)
  const ioType = Number(record.getCaseInsensitive("IOTYPE") ?? 0)
  const points =
    ioType === 1
      ? [
          { x: location.x, y: location.y },
          { x: location.x + pointDepth, y: location.y + halfHeight },
          { x: location.x + width, y: location.y + halfHeight },
          { x: location.x + width, y: location.y - halfHeight },
          { x: location.x + pointDepth, y: location.y - halfHeight },
        ]
      : ioType === 2
        ? [
            { x: location.x, y: location.y + halfHeight },
            {
              x: location.x + width - pointDepth,
              y: location.y + halfHeight,
            },
            { x: location.x + width, y: location.y },
            {
              x: location.x + width - pointDepth,
              y: location.y - halfHeight,
            },
            { x: location.x, y: location.y - halfHeight },
          ]
        : [
            { x: location.x, y: location.y + halfHeight },
            { x: location.x + width, y: location.y + halfHeight },
            { x: location.x + width, y: location.y - halfHeight },
            { x: location.x, y: location.y - halfHeight },
          ]
  const elements: AnyCircuitElement[] = [
    {
      type: "schematic_path",
      schematic_path_id: `schematic_port_altium_${index}`,
      schematic_sheet_id: SCHEMATIC_SHEET_ID,
      points: points.map((point) => scalePoint(point, context.scale)),
      stroke_width: 0.1,
      stroke_color: color,
      fill_color: altiumColorToCss(
        record.getCaseInsensitive("AREACOLOR"),
        "#ffffff",
      ),
      is_filled: true,
      is_dashed: false,
    } satisfies SchematicPath,
  ]
  const name = record.getDecoded("NAME")
  if (name && options.includeText !== false) {
    elements.push(
      createDirectText({
        id: `schematic_port_text_altium_${index}`,
        text: name,
        location: { x: location.x + width / 2, y: location.y },
        fontSize: getFontSize(record, context),
        color: altiumColorToCss(record.getCaseInsensitive("TEXTCOLOR"), color),
        scale: context.scale,
        ccwRotationDegrees: 0,
        anchor: "center",
      }),
    )
  }
  return elements
}
