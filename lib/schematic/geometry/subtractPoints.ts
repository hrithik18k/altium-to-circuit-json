import type { AltiumPoint } from "altiumts"

export function subtractPoints(
  left: AltiumPoint,
  right: AltiumPoint,
): AltiumPoint {
  return { x: left.x - right.x, y: left.y - right.y }
}
