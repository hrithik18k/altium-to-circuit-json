export function isPointInsidePill({
  halfHeight,
  halfWidth,
  point,
}: {
  halfHeight: number
  halfWidth: number
  point: { x: number; y: number }
}): boolean {
  const radius = Math.min(halfWidth, halfHeight)
  let nearestCenter = { x: 0, y: 0 }

  if (halfWidth > halfHeight) {
    const straightHalfLength = halfWidth - radius
    nearestCenter = {
      x: Math.max(-straightHalfLength, Math.min(point.x, straightHalfLength)),
      y: 0,
    }
  } else if (halfHeight > halfWidth) {
    const straightHalfLength = halfHeight - radius
    nearestCenter = {
      x: 0,
      y: Math.max(-straightHalfLength, Math.min(point.y, straightHalfLength)),
    }
  }

  return (
    Math.hypot(point.x - nearestCenter.x, point.y - nearestCenter.y) <= radius
  )
}
