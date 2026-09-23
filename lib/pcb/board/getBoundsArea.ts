import type { AltiumBounds } from "altiumts"

export function getBoundsArea(bounds: AltiumBounds): number {
  return (bounds.maxX - bounds.minX) * (bounds.maxY - bounds.minY)
}
