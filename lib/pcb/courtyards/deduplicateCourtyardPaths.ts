import { formatAltiumPoint } from "./formatAltiumPoint"
import type { CourtyardPath } from "./types"

export function deduplicateCourtyardPaths(
  paths: CourtyardPath[],
): CourtyardPath[] {
  const signatures = new Set<string>()
  return paths.filter((path) => {
    const forwardPoints = path.points.map(formatAltiumPoint).join("|")
    const reversePoints = path.points
      .toReversed()
      .map(formatAltiumPoint)
      .join("|")
    const pointsSignature =
      forwardPoints < reversePoints ? forwardPoints : reversePoints
    const signature = [
      path.componentId,
      path.layer,
      path.strokeWidthMils.toFixed(4),
      pointsSignature,
    ].join("|")
    if (signatures.has(signature)) return false
    signatures.add(signature)
    return true
  })
}
