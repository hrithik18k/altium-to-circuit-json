import type { AltiumPoint } from "altiumts"

export function getAveragePoint(points: AltiumPoint[]): AltiumPoint {
  if (points.length === 0) return { x: 0, y: 0 }
  return {
    x: points.reduce((sum, point) => sum + point.x, 0) / points.length,
    y: points.reduce((sum, point) => sum + point.y, 0) / points.length,
  }
}
