import type { AltiumPoint } from "altiumts"
import { milsToMillimeters } from "./milsToMillimeters"

export function withNumberedPoints(
  start: AltiumPoint,
  end: AltiumPoint,
): { x1: number; x2: number; y1: number; y2: number } {
  return {
    x1: milsToMillimeters(start.x),
    y1: milsToMillimeters(start.y),
    x2: milsToMillimeters(end.x),
    y2: milsToMillimeters(end.y),
  }
}
