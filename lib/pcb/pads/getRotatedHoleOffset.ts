import type { getAltiumPcbPadGeometry } from "altiumts"
import { applyToPoint, rotateDEG } from "transformation-matrix"

export function getRotatedHoleOffset(
  geometry: ReturnType<typeof getAltiumPcbPadGeometry>,
): { x: number; y: number } {
  const padToPcbTransform = rotateDEG(geometry.ccwRotationDegrees)
  return applyToPoint(padToPcbTransform, {
    x: geometry.holeOffsetXMils,
    y: geometry.holeOffsetYMils,
  })
}
