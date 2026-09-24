import { type AltiumPcbDocument, getPcbLayerStack } from "altiumts"
import type { LayerRef } from "circuit-json"
import { mapAltiumCopperLayer } from "../layers"

export function getCopperLayers(document: AltiumPcbDocument): LayerRef[] {
  if (!document.board) return ["top", "bottom"]
  const layers: LayerRef[] = getPcbLayerStack(document.board).entries.flatMap(
    (entry) => {
      const layer = mapAltiumCopperLayer(entry.name ?? entry.layerId)
      return layer ? [layer] : []
    },
  )
  return layers.length > 0 ? [...new Set(layers)] : ["top", "bottom"]
}
