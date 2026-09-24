import type { AltiumPoint } from "altiumts"
import { milsToMillimeters } from "./milsToMillimeters"

export function toMillimeterPoint(point: AltiumPoint): {
  x: number
  y: number
} {
  return {
    x: milsToMillimeters(point.x),
    y: milsToMillimeters(point.y),
  }
}
