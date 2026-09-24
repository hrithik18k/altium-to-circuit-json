import type { AltiumPadRecord } from "altiumts"
import type { LayerRef } from "circuit-json"
import { mapAltiumCopperLayer } from "../layers"

export function getPadCopperLayers(record: AltiumPadRecord): LayerRef[] {
  const holeDiameter = record.holeSizeMils ?? 0
  if (record.behavior === "through-hole" || holeDiameter > 0) {
    return record.plated === false ? [] : ["top", "bottom"]
  }
  const layer = mapAltiumCopperLayer(record.layer)
  return layer ? [layer] : []
}
