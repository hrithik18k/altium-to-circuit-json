import type { AnyCircuitElement, Point } from "circuit-json"
import { translateSchematicPoint } from "./translateSchematicPoint"

export function translateSchematicElement(
  element: AnyCircuitElement,
  offset: Point,
): AnyCircuitElement {
  switch (element.type) {
    case "schematic_component":
    case "schematic_port":
    case "schematic_rect":
    case "schematic_circle":
    case "schematic_arc":
      return {
        ...element,
        center: translateSchematicPoint(element.center, offset),
      }
    case "schematic_net_label":
      return {
        ...element,
        center: translateSchematicPoint(element.center, offset),
        ...(element.anchor_position
          ? {
              anchor_position: translateSchematicPoint(
                element.anchor_position,
                offset,
              ),
            }
          : {}),
      }
    case "schematic_text":
      return {
        ...element,
        position: translateSchematicPoint(element.position, offset),
      }
    case "schematic_path":
      return {
        ...element,
        points: element.points.map((point) =>
          translateSchematicPoint(point, offset),
        ),
      }
    case "schematic_line": {
      const start = translateSchematicPoint(
        { x: element.x1, y: element.y1 },
        offset,
      )
      const end = translateSchematicPoint(
        { x: element.x2, y: element.y2 },
        offset,
      )
      return {
        ...element,
        x1: start.x,
        x2: end.x,
        y1: start.y,
        y2: end.y,
      }
    }
    case "schematic_trace":
      return {
        ...element,
        edges: element.edges.map((edge) => ({
          ...edge,
          from: translateSchematicPoint(edge.from, offset),
          to: translateSchematicPoint(edge.to, offset),
        })),
        junctions: element.junctions.map((point) =>
          translateSchematicPoint(point, offset),
        ),
      }
    default:
      return element
  }
}
