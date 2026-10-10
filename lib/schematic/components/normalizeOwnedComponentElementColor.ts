import type { AnyCircuitElement } from "circuit-json"

export function normalizeOwnedComponentElementColor(
  element: AnyCircuitElement,
): AnyCircuitElement {
  // Source geometry belongs to the component, but its Altium palette does not.
  // Match the native schematic outline; retain neutral and background fills.
  const outline = "#840000"
  const fill = "fill_color" in element ? element.fill_color : undefined
  const normalizedFill =
    !fill ||
    ["transparent", "none", "#ffffff", "#fff"].includes(fill.toLowerCase())
      ? fill
      : /^#ffff[89a-f][0-9a-f]$/i.test(fill)
        ? "#ffffc2"
        : outline
  switch (element.type) {
    case "schematic_path":
      return { ...element, stroke_color: outline, fill_color: normalizedFill }
    case "schematic_rect":
    case "schematic_circle":
      return { ...element, color: outline, fill_color: normalizedFill }
    case "schematic_arc":
    case "schematic_line":
      return { ...element, color: outline }
    case "schematic_text":
      return {
        ...element,
        color: element.schematic_text_id.startsWith("schematic_pin_designator_")
          ? "#a90000"
          : element.schematic_text_id.startsWith("schematic_pin_name_")
            ? "#006464"
            : "#0f0f0f",
      }
    default:
      return element
  }
}
