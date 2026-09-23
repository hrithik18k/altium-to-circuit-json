import type { AltiumPoint } from "altiumts"
import type { Bounds } from "./types"

export function getBoundsCenter(bounds: Bounds): AltiumPoint {
  return {
    x: (bounds.minX + bounds.maxX) / 2,
    y: (bounds.minY + bounds.maxY) / 2,
  }
}
