import { type AltiumPcbDocument, getPcbLayerStack } from "altiumts"
import { mapAltiumCopperLayer } from "../layers"

export function getBoardLayerCount(document: AltiumPcbDocument): number {
  if (!document.board) return 2

  const entries = getPcbLayerStack(document.board).entries
  const modernCopperLayerCount = entries.filter(
    (entry) => entry.source === "v8" && entry.copperThickness !== undefined,
  ).length
  if (modernCopperLayerCount > 0) {
    return Math.max(modernCopperLayerCount, 2)
  }

  return Math.max(
    entries.filter((entry) =>
      Boolean(mapAltiumCopperLayer(entry.name ?? entry.layerId)),
    ).length,
    2,
  )
}
