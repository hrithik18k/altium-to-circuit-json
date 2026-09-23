import type { AnyCircuitElement } from "circuit-json"
import { renderSchematicArcRecord } from "./renderSchematicArcRecord"
import { renderSchematicEllipseRecord } from "./renderSchematicEllipseRecord"
import { renderSchematicLineRecord } from "./renderSchematicLineRecord"
import { renderSchematicPolylineRecord } from "./renderSchematicPolylineRecord"
import { renderSchematicRectangleRecord } from "./renderSchematicRectangleRecord"
import type { PrimitiveRenderOptions } from "./types"

export function renderPrimitiveRecord(
  options: PrimitiveRenderOptions,
): AnyCircuitElement[] | undefined {
  const polylineElements = renderSchematicPolylineRecord(options)
  if (polylineElements) return polylineElements
  const lineElements = renderSchematicLineRecord(options)
  if (lineElements) return lineElements
  const rectangleElements = renderSchematicRectangleRecord(options)
  if (rectangleElements) return rectangleElements
  const ellipseElements = renderSchematicEllipseRecord(options)
  if (ellipseElements) return ellipseElements
  return renderSchematicArcRecord(options)
}
