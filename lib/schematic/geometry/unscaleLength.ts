import { applyToPoint, inverse, scale } from "transformation-matrix"

export function unscaleLength(
  lengthMillimeters: number,
  altiumUnitsToMillimetersScale: number,
): number {
  const circuitJsonToAltiumTransform = inverse(
    scale(altiumUnitsToMillimetersScale),
  )
  return applyToPoint(circuitJsonToAltiumTransform, {
    x: lengthMillimeters,
    y: 0,
  }).x
}
