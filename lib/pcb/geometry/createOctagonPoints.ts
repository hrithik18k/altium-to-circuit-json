import {
  applyToPoints,
  compose,
  rotateDEG,
  translate,
} from "transformation-matrix"

export function createOctagonPoints({
  x,
  y,
  width,
  height,
  ccwRotationDegrees,
}: {
  x: number
  y: number
  width: number
  height: number
  ccwRotationDegrees: number
}): Array<{ x: number; y: number }> {
  const halfWidth = width / 2
  const halfHeight = height / 2
  const chamfer = Math.min(width, height) / 4
  const points = [
    { x: -halfWidth + chamfer, y: -halfHeight },
    { x: halfWidth - chamfer, y: -halfHeight },
    { x: halfWidth, y: -halfHeight + chamfer },
    { x: halfWidth, y: halfHeight - chamfer },
    { x: halfWidth - chamfer, y: halfHeight },
    { x: -halfWidth + chamfer, y: halfHeight },
    { x: -halfWidth, y: halfHeight - chamfer },
    { x: -halfWidth, y: -halfHeight + chamfer },
  ]
  const localToPcbTransform = compose(
    translate(x, y),
    rotateDEG(ccwRotationDegrees),
  )
  return applyToPoints(localToPcbTransform, points)
}
