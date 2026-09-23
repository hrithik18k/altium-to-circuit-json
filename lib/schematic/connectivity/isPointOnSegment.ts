import type { AltiumPoint } from "altiumts"

export function isPointOnSegment({
  point,
  start,
  end,
}: {
  point: AltiumPoint
  start: AltiumPoint
  end: AltiumPoint
}): boolean {
  const dx = end.x - start.x
  const dy = end.y - start.y
  const cross = (point.x - start.x) * dy - (point.y - start.y) * dx
  const tolerance = 0.000001 * Math.max(Math.abs(dx), Math.abs(dy), 1)
  if (Math.abs(cross) > tolerance) return false
  const dot = (point.x - start.x) * dx + (point.y - start.y) * dy
  if (dot < -tolerance) return false
  const lengthSquared = dx * dx + dy * dy
  return dot <= lengthSquared + tolerance
}
