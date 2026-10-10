import { AltiumSchPinRecord } from "altiumts"
import type { AnyCircuitElement } from "circuit-json"
import { VECTOR_BY_DIRECTION } from "../connectivity"
import { scaleLength } from "../geometry"
import type { ConvertedPort } from "../model"
import { renderPin } from "../rendering/renderPin"
import { altiumColorToCss, getFontSize } from "../text"
import { createPinClockSymbol } from "./createPinClockSymbol"
import { normalizeOwnedComponentElementColor } from "./normalizeOwnedComponentElementColor"
import { parseAltiumPinLabel } from "./parseAltiumPinLabel"
import type { ComponentConversionContext } from "./types"

export function convertPrimitiveGatePin(
  port: ConvertedPort,
  context: ComponentConversionContext,
): AnyCircuitElement[] {
  const pin = port.record
  if (!(pin instanceof AltiumSchPinRecord) || !port.isSchematicVisible)
    return []
  const index = context.document.records.indexOf(pin)
  const scale = context.options.scale
  const color = altiumColorToCss(pin.getCaseInsensitive("COLOR"), "#000000")
  const renderingContext = {
    document: context.document,
    records: context.document.records,
    scale,
    sheetRecord: context.document.records.find(
      (record) => record.recordKind === "31",
    ),
  }
  const elements = renderPin({
    record: pin,
    index,
    context: renderingContext,
    options: context.options,
    color,
  })
  const nameLabel = elements.find(
    (element) =>
      element.type === "schematic_text" &&
      element.schematic_text_id === `schematic_pin_name_altium_${index}`,
  )
  if (nameLabel?.type === "schematic_text") {
    const parsedLabel = parseAltiumPinLabel(nameLabel.text)
    nameLabel.text = parsedLabel.displayText
    if (parsedLabel.textParts) nameLabel.text_parts = parsedLabel.textParts
    nameLabel.font_size =
      port.schematicPort.display_pin_label_font_size ?? nameLabel.font_size
  }
  const line = elements.find((element) => element.type === "schematic_line")
  if (line) {
    line.stroke_width = scaleLength(1, scale)
    const direction =
      VECTOR_BY_DIRECTION[port.schematicPort.facing_direction ?? "right"]
    const designator = elements.find(
      (element) =>
        element.type === "schematic_text" &&
        element.schematic_text_id ===
          `schematic_pin_designator_altium_${index}`,
    )
    if (designator?.type === "schematic_text") {
      // Pin numbers sit outside the body and inversion bubble, above the stem.
      const margin = scaleLength(9, scale)
      designator.position = {
        x: line.x1 + direction.x * margin,
        y: line.y1 + direction.y * margin,
      }
      designator.anchor =
        direction.x > 0 || direction.y > 0 ? "bottom_left" : "bottom_right"
      designator.font_size = scaleLength(
        getFontSize(pin, renderingContext),
        scale,
      )
    }
    if (pin.getNumber("SYMBOL_OUTEREDGE") === 1) {
      // Altium places a 2.5-unit bubble immediately outside the body edge.
      const radius = scaleLength(2.5, scale)
      elements.push({
        type: "schematic_circle",
        schematic_circle_id: `schematic_pin_inversion_altium_${index}`,
        schematic_sheet_id: context.options.schematicSheetId,
        center: {
          x: line.x1 + direction.x * radius,
          y: line.y1 + direction.y * radius,
        },
        radius,
        color,
        stroke_width: scaleLength(1, scale),
        is_filled: true,
        fill_color: "#ffffff",
        is_dashed: false,
      })
      line.x1 += direction.x * radius * 2
      line.y1 += direction.y * radius * 2
    }
  }
  const clock = createPinClockSymbol({
    pin,
    recordIndex: index,
    scale,
    schematicPort: port.schematicPort,
  })
  if (clock) elements.push(clock)
  // Primitive text preserves the original pin visibility. Do not also let
  // the renderer synthesize labels already supplied by owned text records.
  delete port.schematicPort.display_pin_label
  delete port.schematicPort.display_pin_label_text_parts
  return elements
    .map((element) =>
      element.type === "schematic_line" ||
      element.type === "schematic_circle" ||
      element.type === "schematic_path" ||
      element.type === "schematic_text"
        ? {
            ...element,
            schematic_component_id: port.schematicPort.schematic_component_id,
          }
        : element,
    )
    .map(normalizeOwnedComponentElementColor)
}
