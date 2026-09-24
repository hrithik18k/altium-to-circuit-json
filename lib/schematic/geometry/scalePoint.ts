import type { AltiumPoint } from "altiumts"
import { applyToPoint, scale } from "transformation-matrix"

export function scalePoint(
  point: AltiumPoint,
  altiumUnitsToMillimetersScale: number,
): AltiumPoint {
  const altiumToCircuitJsonTransform = scale(altiumUnitsToMillimetersScale)
  return applyToPoint(altiumToCircuitJsonTransform, point)
}
