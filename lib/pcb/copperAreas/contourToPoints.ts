import type { AltiumPcbContour } from "altiumts"
import type { Point } from "circuit-json"
import { milsToMillimeters } from "../geometry"

export function contourToPoints(contour: AltiumPcbContour): Point[] {
  const points = contour.points.map((point) => ({
    x: milsToMillimeters(point.x),
    y: milsToMillimeters(point.y),
  }))
  return contour.isExplicitlyClosed ? points.slice(0, -1) : points
}
