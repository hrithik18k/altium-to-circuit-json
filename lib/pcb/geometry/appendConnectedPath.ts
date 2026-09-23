import type { AltiumPoint } from "altiumts"
import { pointsApproximatelyEqual } from "./pointsApproximatelyEqual"

export function appendConnectedPath({
  path,
  remaining,
  maxEndpointGapMils,
}: {
  path: AltiumPoint[]
  remaining: AltiumPoint[][]
  maxEndpointGapMils: number
}): boolean {
  const pathStart = path[0]
  const pathEnd = path.at(-1)
  if (!pathStart || !pathEnd) return false

  for (const [index, candidate] of remaining.entries()) {
    const candidateStart = candidate[0]
    const candidateEnd = candidate.at(-1)
    if (!candidateStart || !candidateEnd) continue

    if (
      pointsApproximatelyEqual({
        left: pathEnd,
        right: candidateStart,
        maxEndpointGapMils,
      })
    ) {
      path.push(...candidate.slice(1))
    } else if (
      pointsApproximatelyEqual({
        left: pathEnd,
        right: candidateEnd,
        maxEndpointGapMils,
      })
    ) {
      path.push(...candidate.toReversed().slice(1))
    } else if (
      pointsApproximatelyEqual({
        left: pathStart,
        right: candidateEnd,
        maxEndpointGapMils,
      })
    ) {
      path.unshift(...candidate.slice(0, -1))
    } else if (
      pointsApproximatelyEqual({
        left: pathStart,
        right: candidateStart,
        maxEndpointGapMils,
      })
    ) {
      path.unshift(...candidate.toReversed().slice(0, -1))
    } else {
      continue
    }

    remaining.splice(index, 1)
    return true
  }

  return false
}
