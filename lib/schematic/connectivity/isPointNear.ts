import type { AltiumPoint } from "altiumts"

export function isPointNear(point: AltiumPoint, other: AltiumPoint): boolean {
  const tolerance = 1.1
  return (point.x - other.x) ** 2 + (point.y - other.y) ** 2 <= tolerance ** 2
}
