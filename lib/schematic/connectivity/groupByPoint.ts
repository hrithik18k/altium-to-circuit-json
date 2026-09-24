import { pointKey, type SchematicPointKey } from "../geometry"
import type { ConvertedPort } from "../model"

export function groupByPoint(
  ports: ConvertedPort[],
): Map<SchematicPointKey, ConvertedPort[]> {
  const grouped = new Map<SchematicPointKey, ConvertedPort[]>()
  for (const port of ports) {
    const key = pointKey(port.point)
    const existing = grouped.get(key)
    if (existing) existing.push(port)
    else grouped.set(key, [port])
  }
  return grouped
}
