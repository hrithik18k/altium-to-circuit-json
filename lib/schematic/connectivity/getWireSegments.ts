import { type AltiumRecord, getSchematicRecordPoints } from "altiumts"
import type { SchematicSegment } from "../model"

export function getWireSegments(wires: AltiumRecord[]): SchematicSegment[] {
  return wires.flatMap((wire) => {
    const points = getSchematicRecordPoints(wire)
    const segments: SchematicSegment[] = []
    for (let pointIndex = 1; pointIndex < points.length; pointIndex++) {
      const start = points[pointIndex - 1]
      const end = points[pointIndex]
      if (start && end) segments.push({ end, start })
    }
    return segments
  })
}
