import { applyToPoint, type Matrix } from "transformation-matrix"

export function getPowerPortPoint({
  across = 0,
  along,
  direction,
  location,
  perpendicular,
}: {
  across?: number
  along: number
  direction: { x: number; y: number }
  location: { x: number; y: number }
  perpendicular: { x: number; y: number }
}): { x: number; y: number } {
  const powerPortToSheetTransform: Matrix = {
    a: direction.x,
    b: direction.y,
    c: perpendicular.x,
    d: perpendicular.y,
    e: location.x,
    f: location.y,
  }
  return applyToPoint(powerPortToSheetTransform, { x: along, y: across })
}
