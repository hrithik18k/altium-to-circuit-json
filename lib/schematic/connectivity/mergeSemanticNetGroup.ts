import type { MutableSemanticNet } from "./types"

export function mergeSemanticNetGroup(
  target: MutableSemanticNet,
  source: MutableSemanticNet,
): void {
  for (const name of source.names) target.names.add(name)
  for (const [key, point] of source.points) target.points.set(key, point)
  for (const record of source.records) target.records.add(record)
}
