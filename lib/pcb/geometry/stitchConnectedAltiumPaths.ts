import type { AltiumPoint } from "altiumts"
import { appendConnectedPath } from "./appendConnectedPath"

export function stitchConnectedAltiumPaths({
  paths,
  maxEndpointGapMils,
}: {
  paths: AltiumPoint[][]
  maxEndpointGapMils: number
}): AltiumPoint[][] {
  const remaining = paths.map((path) => [...path])
  const stitchedPaths: AltiumPoint[][] = []

  while (remaining.length > 0) {
    const path = remaining.shift()
    if (!path) break
    while (appendConnectedPath({ path, remaining, maxEndpointGapMils })) {
      // Continue until neither end can be extended.
    }
    stitchedPaths.push(path)
  }

  return stitchedPaths
}
