import type { AnyCircuitElement, SchematicComponent } from "circuit-json"
import { createComponentText } from "./createComponentText"

export function addComponentFallbackText({
  componentIndex,
  designator,
  displayText,
  elements,
  schematicComponent,
}: {
  componentIndex: number
  designator: string
  displayText: string
  elements: AnyCircuitElement[]
  schematicComponent: SchematicComponent
}): void {
  const { center, size } = schematicComponent
  elements.push(
    createComponentText({
      anchor: "bottom_left",
      component: schematicComponent,
      id: `schematic_component_designator_altium_${componentIndex}`,
      position: {
        x: center.x - size.width / 2,
        y: center.y + size.height / 2 + 0.13,
      },
      text: designator,
    }),
  )
  if (!displayText) return
  elements.push(
    createComponentText({
      anchor: "top_left",
      component: schematicComponent,
      id: `schematic_component_value_altium_${componentIndex}`,
      position: {
        x: center.x - size.width / 2,
        y: center.y - size.height / 2 - 0.13,
      },
      text: displayText,
    }),
  )
}
