import type { AltiumFillRecord } from "altiumts"
import type { PcbSilkscreenRect } from "circuit-json"
import { milsToMillimeters } from "../geometry"
import { getPcbComponentIdForRecord } from "../identifiers"
import { mapOverlayLayer } from "../layers"

export function convertPcbSilkscreenFill({
  record,
  recordIndex,
}: {
  record: AltiumFillRecord
  recordIndex: number
}): PcbSilkscreenRect | undefined {
  if (!record.bounds) return undefined
  const width = milsToMillimeters(record.bounds.maxX - record.bounds.minX)
  const height = milsToMillimeters(record.bounds.maxY - record.bounds.minY)
  return {
    type: "pcb_silkscreen_rect",
    pcb_silkscreen_rect_id: `pcb_silkscreen_rect_altium_${recordIndex}`,
    pcb_component_id: getPcbComponentIdForRecord(record),
    center: {
      x: milsToMillimeters((record.bounds.minX + record.bounds.maxX) / 2),
      y: milsToMillimeters((record.bounds.minY + record.bounds.maxY) / 2),
    },
    width,
    height,
    stroke_width: Math.min(width, height),
    is_filled: true,
    has_stroke: false,
    ccw_rotation: record.rotation,
    layer: mapOverlayLayer(record.layer),
  }
}
