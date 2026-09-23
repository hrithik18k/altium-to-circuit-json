import { applyToPoint, scale } from "transformation-matrix"

export function scaleLength(
  length: number,
  altiumUnitsToMillimetersScale: number,
): number {
  const altiumToCircuitJsonTransform = scale(altiumUnitsToMillimetersScale)
  return applyToPoint(altiumToCircuitJsonTransform, { x: length, y: 0 }).x
}
