import type { AltiumPoint } from "altiumts"
import type { Bounds } from "./types"

export function getBoundsForPoints(points: AltiumPoint[]): Bounds {
  if (points.length === 0) return { maxX: 1, maxY: 1, minX: -1, minY: -1 }
  return {
    maxX: Math.max(...points.map((point) => point.x)),
    maxY: Math.max(...points.map((point) => point.y)),
    minX: Math.min(...points.map((point) => point.x)),
    minY: Math.min(...points.map((point) => point.y)),
  }
}
