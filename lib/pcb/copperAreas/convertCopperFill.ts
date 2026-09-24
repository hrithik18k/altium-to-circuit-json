import type { AltiumFillRecord } from "altiumts"
import type { PcbCopperPour } from "circuit-json"
import { milsToMillimeters } from "../geometry"
import { mapAltiumCopperLayer } from "../layers"

export function convertCopperFill({
  record,
  recordIndex,
  sourceNetId,
}: {
  record: AltiumFillRecord
  recordIndex: number
  sourceNetId: string | undefined
}): PcbCopperPour[] {
  const layer = mapAltiumCopperLayer(record.layer)
  if (!layer || !record.bounds) return []

  const width = milsToMillimeters(record.bounds.maxX - record.bounds.minX)
  const height = milsToMillimeters(record.bounds.maxY - record.bounds.minY)
  if (width <= 0 || height <= 0) return []

  return [
    {
      type: "pcb_copper_pour",
      pcb_copper_pour_id: `pcb_copper_pour_altium_fill_${recordIndex}`,
      ...(sourceNetId ? { source_net_id: sourceNetId } : {}),
      covered_with_solder_mask: true,
      layer,
      shape: "rect",
      center: {
        x: milsToMillimeters((record.bounds.minX + record.bounds.maxX) / 2),
        y: milsToMillimeters((record.bounds.minY + record.bounds.maxY) / 2),
      },
      width,
      height,
      rotation: record.rotation,
    },
  ]
}
