import type { AltiumPoint } from "altiumts"
import type { CardinalDirection } from "./types"

export function getDirectionForVector(vector: AltiumPoint): CardinalDirection {
  if (Math.abs(vector.x) >= Math.abs(vector.y)) {
    return vector.x >= 0 ? "right" : "left"
  }
  return vector.y >= 0 ? "up" : "down"
}
