import { stitchConnectedAltiumPaths } from "../geometry"
import type { CourtyardPath } from "./types"

export function stitchCourtyardPathGroup(
  group: CourtyardPath[],
): CourtyardPath[] {
  const first = group[0]
  if (!first) return []
  return stitchConnectedAltiumPaths({
    paths: group.map((path) => path.points),
    maxEndpointGapMils: 0.01,
  }).map((points) => ({ ...first, points }))
}
