import { getLocation } from "../geometry"
import type { ConvertedPort } from "../model"

export function getCapacitorAxis(ports: ConvertedPort[]) {
  if (ports.length !== 2) return undefined
  const start = getLocation(ports[0]!.record)
  const end = getLocation(ports[1]!.record)
  if (!start || !end) return undefined
  const dx = end.x - start.x
  const dy = end.y - start.y
  const squaredLength = dx * dx + dy * dy
  if (squaredLength < 1e-8) return undefined
  return { start, dx, dy, squaredLength }
}
