import type { AltiumPoint } from "altiumts"
import type { SchSymbol } from "schematic-symbols"
import { applyToPoint, translate } from "transformation-matrix"
import { directionToSide } from "../connectivity"
import {
  getDirectionForVector,
  getPointDistance,
  subtractPoints,
} from "../geometry"
import type { SymbolPortAssignment, SymbolSelection } from "../model"

export function applyNativeSymbolPortGeometry({
  center,
  selection,
}: {
  center: AltiumPoint
  selection: SymbolSelection
}): void {
  const assignmentsBySymbolPort = new Map<
    SchSymbol["ports"][number],
    SymbolPortAssignment[]
  >()
  for (const assignment of selection.assignments) {
    const assignments = assignmentsBySymbolPort.get(assignment.symbolPort)
    if (assignments) assignments.push(assignment)
    else assignmentsBySymbolPort.set(assignment.symbolPort, [assignment])
  }

  for (const [symbolPort, assignments] of assignmentsBySymbolPort) {
    const offset = subtractPoints(symbolPort, selection.symbol.center)
    const direction = getDirectionForVector(offset)
    const symbolToSchematicTransform = translate(center.x, center.y)
    const symbolPortCenter = applyToPoint(symbolToSchematicTransform, offset)
    const representative = assignments.sort(
      (left, right) =>
        getPointDistance(
          left.convertedPort.schematicPort.center,
          symbolPortCenter,
        ) -
        getPointDistance(
          right.convertedPort.schematicPort.center,
          symbolPortCenter,
        ),
    )[0]
    for (const { convertedPort } of assignments) {
      convertedPort.isSchematicVisible =
        convertedPort === representative?.convertedPort
      convertedPort.schematicPort.center = symbolPortCenter
      convertedPort.schematicPort.distance_from_component_edge = Math.hypot(
        offset.x,
        offset.y,
      )
      convertedPort.schematicPort.facing_direction = direction
      convertedPort.schematicPort.side_of_component = directionToSide(direction)
    }
  }
}
