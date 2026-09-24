import type { AltiumPoint } from "altiumts"
import { pointKey, type SchematicPointKey } from "../geometry"
import type { PointDisjointSet } from "./PointDisjointSet"

export function addGraphPoint({
  disjointSet,
  pointsByKey,
  point,
}: {
  disjointSet: PointDisjointSet
  pointsByKey: Map<SchematicPointKey, AltiumPoint>
  point: AltiumPoint
}): void {
  const key = pointKey(point)
  disjointSet.add(key)
  pointsByKey.set(key, point)
}
