import type { AltiumPoint } from "altiumts"
import type { SchematicComponent, SchematicText } from "circuit-json"

export function createComponentText({
  anchor,
  component,
  id,
  position,
  text,
}: {
  anchor: SchematicText["anchor"]
  component: SchematicComponent
  id: string
  position: AltiumPoint
  text: string
}): SchematicText {
  return {
    type: "schematic_text",
    anchor,
    color: "#006464",
    font_size: 0.18,
    position,
    rotation: 0,
    schematic_component_id: component.schematic_component_id,
    schematic_sheet_id: component.schematic_sheet_id,
    schematic_text_id: id,
    text,
  }
}
