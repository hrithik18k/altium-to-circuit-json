import type { AltiumPoint } from "altiumts"
import { pointKey, type SchematicPointKey } from "../geometry"
import type { PointDisjointSet } from "./PointDisjointSet"
import type { MutableSemanticNet } from "./types"

export function getOrCreateSemanticNetGroup({
  disjointSet,
  groupedByRoot,
  point,
}: {
  disjointSet: PointDisjointSet
  groupedByRoot: Map<SchematicPointKey, MutableSemanticNet>
  point: AltiumPoint
}): MutableSemanticNet {
  const root = disjointSet.find(pointKey(point))
  const existing = groupedByRoot.get(root)
  if (existing) return existing
  const created: MutableSemanticNet = {
    id: root,
    names: new Set(),
    points: new Map(),
    records: new Set(),
  }
  groupedByRoot.set(root, created)
  return created
}
