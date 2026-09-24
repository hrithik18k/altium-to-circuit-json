import {
  applyToPoint,
  compose,
  rotateDEG,
  scale,
  translate,
} from "transformation-matrix"

/** Approximate an Altium ellipse with a closed Circuit JSON path. */
export function approximateEllipse({
  center,
  radiusX,
  radiusY,
}: {
  center: { x: number; y: number }
  radiusX: number
  radiusY: number
}): Array<{ x: number; y: number }> {
  return Array.from({ length: 49 }, (_, index) => {
    const unitCircleToSchematicTransform = compose(
      translate(center.x, center.y),
      scale(radiusX, radiusY),
      rotateDEG((index / 48) * 360),
    )
    return applyToPoint(unitCircleToSchematicTransform, { x: 1, y: 0 })
  })
}
