import type { AltiumPoint } from "altiumts"
import { pointKey, type SchematicPointKey } from "../geometry"
import type { SchematicSegmentKey } from "../identifiers"

export function addIncidentSegment({
  point,
  key,
  segmentKeysByPoint,
}: {
  point: AltiumPoint
  key: SchematicSegmentKey
  segmentKeysByPoint: Map<SchematicPointKey, Set<SchematicSegmentKey>>
}): void {
  const schematicPointKey = pointKey(point)
  const pointSegments = segmentKeysByPoint.get(schematicPointKey)
  if (pointSegments) pointSegments.add(key)
  else segmentKeysByPoint.set(schematicPointKey, new Set([key]))
}
