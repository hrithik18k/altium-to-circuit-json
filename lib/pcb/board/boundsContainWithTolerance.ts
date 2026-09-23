import type { AltiumBounds } from "altiumts"

export function boundsContainWithTolerance({
  container,
  contained,
  tolerance,
}: {
  container: AltiumBounds
  contained: AltiumBounds
  tolerance: number
}): boolean {
  return (
    contained.minX >= container.minX - tolerance &&
    contained.maxX <= container.maxX + tolerance &&
    contained.minY >= container.minY - tolerance &&
    contained.maxY <= container.maxY + tolerance
  )
}
