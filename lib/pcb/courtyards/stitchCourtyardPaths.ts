import type { PcbComponentId } from "../identifiers"
import { deduplicateCourtyardPaths } from "./deduplicateCourtyardPaths"
import { stitchCourtyardPathGroup } from "./stitchCourtyardPathGroup"
import type { CourtyardPath } from "./types"

export function stitchCourtyardPaths(paths: CourtyardPath[]): CourtyardPath[] {
  const groups = new Map<PcbComponentId, CourtyardPath[]>()
  for (const path of deduplicateCourtyardPaths(paths)) {
    const group = groups.get(path.componentId) ?? []
    group.push(path)
    groups.set(path.componentId, group)
  }
  return [...groups.values()].flatMap((componentPaths) => {
    const layerGroups = new Map<"top" | "bottom", CourtyardPath[]>()
    for (const path of componentPaths) {
      const layerPaths = layerGroups.get(path.layer) ?? []
      layerPaths.push(path)
      layerGroups.set(path.layer, layerPaths)
    }
    return [...layerGroups.values()].flatMap((layerPaths) => {
      const widthGroups = new Map<number, CourtyardPath[]>()
      for (const path of layerPaths) {
        const strokeWidth = Number(path.strokeWidthMils.toFixed(4))
        const widthPaths = widthGroups.get(strokeWidth) ?? []
        widthPaths.push(path)
        widthGroups.set(strokeWidth, widthPaths)
      }
      return [...widthGroups.values()].flatMap(stitchCourtyardPathGroup)
    })
  })
}
