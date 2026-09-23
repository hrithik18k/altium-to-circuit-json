import type { AltiumRecord } from "altiumts"
import type {
  AnyCircuitElement,
  SchematicRect,
  SchematicText,
} from "circuit-json"
import type { ConvertAltiumSchDocOptions } from "../../api"
import { SCHEMATIC_SHEET_ID, type SchematicContext } from "../document"
import {
  getCoordinateOrFallback,
  getLocation,
  getRectangle,
  scaleLength,
  scalePoint,
} from "../geometry"
import { altiumColorToCss } from "./altiumColorToCss"
import { createDirectText } from "./createDirectText"
import { createText } from "./createText"
import { decodeMultilineText } from "./decodeMultilineText"
import { getFontFamily } from "./getFontFamily"
import { getFontSize } from "./getFontSize"
import { wrapSchematicText } from "./wrapSchematicText"

export function renderTextRecord({
  record,
  index,
  context,
  options,
  color,
  strokeWidth,
}: {
  record: AltiumRecord
  index: number
  context: SchematicContext
  options: ConvertAltiumSchDocOptions
  color: string
  strokeWidth: number
}): AnyCircuitElement[] | undefined {
  const kind = record.recordKind
  const scale = context.scale
  if (kind === "4" || kind === "25" || kind === "34" || kind === "41") {
    if (options.includeText === false) return []
    if (record.getBoolean("ISHIDDEN") && !options.includeHidden) return []
    const text =
      record.getDecoded("TEXT") ??
      record.getDecoded("NAME") ??
      record.getDecoded("DESIGNATOR")
    const location = getLocation(record)
    if (!text || !location) return []
    return [createText({ record, index, text, location, color, context })]
  }

  if (kind === "28") {
    const rectangle = getRectangle(record)
    const text = decodeMultilineText(record.getDecoded("TEXT") ?? "")
    if (!rectangle || !text || options.includeText === false) return []
    const fontSize = getFontSize(record, context)
    const fontFamily = getFontFamily(record, context)
    const margin = Math.max(
      getCoordinateOrFallback({ record, key: "TEXTMARGIN", fallback: 0 }),
      0,
    )
    const frameWidth = rectangle.maxX - rectangle.minX
    const frameHeight = rectangle.maxY - rectangle.minY
    const availableWidth = Math.max(frameWidth - margin * 2, fontSize)
    const availableHeight = Math.max(frameHeight - margin * 2, fontSize)
    const wrappedLines =
      record.getBoolean("WORDWRAP") === false
        ? text.split("\n")
        : wrapSchematicText({
            text,
            maximumWidth: availableWidth,
            fontSize,
            fontFamily,
          })
    const lineHeight = fontSize
    const visibleLines =
      record.getBoolean("CLIPTORECT") === false
        ? wrappedLines
        : wrappedLines.slice(
            0,
            Math.max(Math.ceil(availableHeight / lineHeight), 1),
          )
    const alignment = Number(record.getCaseInsensitive("ALIGNMENT") ?? 1)
    const horizontalAnchor =
      alignment === 2 ? "center" : alignment === 3 ? "right" : "left"
    const textX =
      horizontalAnchor === "center"
        ? (rectangle.minX + rectangle.maxX) / 2
        : horizontalAnchor === "right"
          ? rectangle.maxX - margin
          : rectangle.minX + margin
    const textColor = altiumColorToCss(
      record.getCaseInsensitive("TEXTCOLOR") ??
        record.getCaseInsensitive("COLOR"),
      "#1f2937",
    )
    const elements: AnyCircuitElement[] = visibleLines.map((line, lineIndex) =>
      createDirectText({
        id: `schematic_text_frame_line_altium_${index}_${lineIndex}`,
        text: line,
        location: {
          x: textX,
          y: rectangle.maxY - margin - lineIndex * lineHeight,
        },
        fontSize,
        color: textColor,
        scale,
        ccwRotationDegrees: 0,
        anchor: `top_${horizontalAnchor}` as SchematicText["anchor"],
      }),
    )

    const isSolid = record.getBoolean("ISSOLID") === true
    const showBorder = record.getBoolean("SHOWBORDER") === true
    if (isSolid || showBorder) {
      elements.unshift({
        type: "schematic_rect",
        schematic_rect_id: `schematic_text_frame_altium_${index}`,
        schematic_sheet_id: SCHEMATIC_SHEET_ID,
        center: scalePoint(
          {
            x: (rectangle.minX + rectangle.maxX) / 2,
            y: (rectangle.minY + rectangle.maxY) / 2,
          },
          scale,
        ),
        width: scaleLength(frameWidth, scale),
        height: scaleLength(frameHeight, scale),
        rotation: 0,
        stroke_width: showBorder ? strokeWidth : 0,
        color: showBorder ? color : "transparent",
        is_filled: isSolid,
        fill_color: altiumColorToCss(
          record.getCaseInsensitive("AREACOLOR"),
          "#ffffff",
        ),
        is_dashed: false,
      } satisfies SchematicRect)
    }

    return elements
  }

  return undefined
}
