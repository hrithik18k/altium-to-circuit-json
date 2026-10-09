import { type AltiumPadRecord, getAltiumPcbPadGeometry } from "altiumts"
import {
  applyToPoint,
  compose,
  rotateDEG,
  translate,
} from "transformation-matrix"
import { isPointInsidePill } from "./isPointInsidePill"

/**
 * Tests an Altium-space point against one surface pad. Coordinates are mils,
 * +X is right, +Y is up, and pcbToPadTransform maps board points to pad-local
 * points before the shape test.
 */
export function isPointInsidePad(
  point: { x: number; y: number },
  pad: AltiumPadRecord,
): boolean {
  const geometry = getAltiumPcbPadGeometry({
    record: pad,
    useRequestedLayerGeometry: true,
  })
  const pcbToPadTransform = compose(
    rotateDEG(-geometry.ccwRotationDegrees),
    translate(-geometry.xMils, -geometry.yMils),
  )
  const padPoint = applyToPoint(pcbToPadTransform, point)
  const halfWidth = geometry.widthMils / 2
  const halfHeight = geometry.heightMils / 2
  const shape = geometry.shape.toUpperCase()

  if (["CIRCLE", "OVAL", "ROUND"].includes(shape)) {
    return isPointInsidePill({ halfHeight, halfWidth, point: padPoint })
  }
  if (!["RECT", "RECTANGLE", "ROUNDEDRECTANGLE", "ROUNDRECT"].includes(shape)) {
    return false
  }

  const cornerRadius = Math.min(
    geometry.cornerRadiusMils,
    halfWidth,
    halfHeight,
  )
  const cornerX = Math.max(Math.abs(padPoint.x) - halfWidth + cornerRadius, 0)
  const cornerY = Math.max(Math.abs(padPoint.y) - halfHeight + cornerRadius, 0)
  return Math.hypot(cornerX, cornerY) <= cornerRadius
}
