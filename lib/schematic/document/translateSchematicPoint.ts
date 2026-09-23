import type { Point } from "circuit-json"
import { applyToPoint, translate } from "transformation-matrix"

export function translateSchematicPoint(point: Point, offset: Point): Point {
  const sourceToSheetTransform = translate(offset.x, offset.y)
  return applyToPoint(sourceToSheetTransform, point)
}
