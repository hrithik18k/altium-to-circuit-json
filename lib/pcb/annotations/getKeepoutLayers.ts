import type { AltiumPcbDocument } from "altiumts"
import type { LayerRef } from "circuit-json"
import { mapAltiumCopperLayer } from "../layers"
import { getCopperLayers } from "./getCopperLayers"

export function getKeepoutLayers(
  layerName: string | undefined,
  document: AltiumPcbDocument,
): LayerRef[] {
  const layer = mapAltiumCopperLayer(layerName)
  return layer ? [layer] : getCopperLayers(document)
}
