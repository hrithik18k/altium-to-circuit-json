import {
  type AltiumPoint,
  type AltiumRecord,
  AltiumSchPortRecord,
  getSchematicRecordPoints,
} from "altiumts"
import { getRecordDirection, isPointOnSegment } from "../connectivity"
import { type CardinalDirection, pointsEqual } from "../geometry"

export function getInlineNetLabelDirection({
  record,
  location,
  connectedWires,
}: {
  record: AltiumRecord
  location: AltiumPoint
  connectedWires: AltiumRecord[]
}): CardinalDirection {
  if (!(record instanceof AltiumSchPortRecord)) {
    return getRecordDirection(record)
  }

  for (const wire of connectedWires) {
    const points = getSchematicRecordPoints(wire)
    for (let pointIndex = 1; pointIndex < points.length; pointIndex++) {
      const start = points[pointIndex - 1]
      const end = points[pointIndex]
      if (
        !start ||
        !end ||
        !isPointOnSegment({ point: location, start, end })
      ) {
        continue
      }
      const other = pointsEqual(location, start)
        ? end
        : pointsEqual(location, end)
          ? start
          : undefined
      if (!other) continue
      // Place the inline text away from the wire interior, matching the side
      // on which Altium drew the port body instead of covering the circuit.
      const dx = location.x - other.x
      const dy = location.y - other.y
      if (Math.abs(dx) >= Math.abs(dy)) return dx < 0 ? "left" : "right"
      return dy < 0 ? "down" : "up"
    }
  }

  return getRecordDirection(record)
}
