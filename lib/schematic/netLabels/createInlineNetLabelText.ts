import {
  type AltiumPoint,
  type AltiumRecord,
  type AltiumSchDoc,
  AltiumSchPortRecord,
} from "altiumts"
import type { SchematicText } from "circuit-json"
import { scalePoint } from "../geometry"
import type { SemanticSchematicOptions } from "../model"
import {
  DEFAULT_INLINE_NET_LABEL_FONT_SIZE,
  INLINE_NET_LABEL_CHARACTER_WIDTH,
  INLINE_NET_LABEL_COLOR,
  INLINE_NET_LABEL_HORIZONTAL_PADDING,
} from "./constants"
import { getInlineNetLabelDirection } from "./getInlineNetLabelDirection"
import { getInlineNetLabelFontSize } from "./getInlineNetLabelFontSize"

export function createInlineNetLabelText({
  connectedWires,
  document,
  location,
  name,
  options,
  record,
  recordIndex,
  sourceTraceId,
}: {
  connectedWires: AltiumRecord[]
  document: AltiumSchDoc
  location: AltiumPoint
  name: string
  options: SemanticSchematicOptions
  record: AltiumRecord
  recordIndex: number
  sourceTraceId: string
}): SchematicText {
  const direction = getInlineNetLabelDirection({
    record,
    location,
    connectedWires,
  })
  const scaledLocation = scalePoint(location, options.scale)
  const fontSize = getInlineNetLabelFontSize({
    record,
    document,
    altiumUnitsToMillimetersScale: options.scale,
  })
  const fontSizeRatio = fontSize / DEFAULT_INLINE_NET_LABEL_FONT_SIZE
  const textWidth =
    (name.length * INLINE_NET_LABEL_CHARACTER_WIDTH +
      INLINE_NET_LABEL_HORIZONTAL_PADDING) *
    fontSizeRatio
  const isVertical = direction === "up" || direction === "down"
  const directionSign = direction === "left" || direction === "down" ? -1 : 1
  const isTerminalPort = record instanceof AltiumSchPortRecord
  const anchor: SchematicText["anchor"] = isTerminalPort
    ? directionSign > 0
      ? "left"
      : "right"
    : "center"
  const position = isTerminalPort
    ? isVertical
      ? {
          x: scaledLocation.x - fontSize / 2,
          y: scaledLocation.y,
        }
      : {
          x: scaledLocation.x,
          y: scaledLocation.y + fontSize / 2,
        }
    : isVertical
      ? {
          x: scaledLocation.x - fontSize / 2,
          y: scaledLocation.y + (directionSign * textWidth) / 2,
        }
      : {
          x: scaledLocation.x + (directionSign * textWidth) / 2,
          y: scaledLocation.y + fontSize / 2,
        }

  return {
    type: "schematic_text",
    anchor,
    color: INLINE_NET_LABEL_COLOR,
    font_size: fontSize,
    position,
    rotation: isVertical ? -90 : 0,
    schematic_sheet_id: options.schematicSheetId,
    schematic_text_id: `schematic_inline_net_label_altium_${recordIndex}`,
    source_trace_id: sourceTraceId,
    text: name,
  }
}
