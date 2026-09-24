import type { AltiumPoint } from "altiumts"

export function formatAltiumPoint(point: AltiumPoint): string {
  return `${point.x.toFixed(4)},${point.y.toFixed(4)}`
}
