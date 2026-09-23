import { type AltiumArcRecord, approximateAltiumArc } from "altiumts"
import type { PcbSilkscreenPath } from "circuit-json"
import { milsToMillimeters, toMillimeterPoint } from "../geometry"
import { getPcbComponentIdForRecord } from "../identifiers"
import { mapOverlayLayer } from "../layers"

export function convertPcbSilkscreenArc({
  record,
  recordIndex,
}: {
  record: AltiumArcRecord
  recordIndex: number
}): PcbSilkscreenPath | undefined {
  if (!record.center || !record.radiusMils) return undefined
  const points = approximateAltiumArc({
    center: record.center,
    radius: record.radiusMils,
    startAngleDegrees: record.startAngle,
    endAngleDegrees: record.endAngle,
  })
  return {
    type: "pcb_silkscreen_path",
    pcb_silkscreen_path_id: `pcb_silkscreen_path_altium_${recordIndex}`,
    pcb_component_id: getPcbComponentIdForRecord(record),
    route: points.map(toMillimeterPoint),
    stroke_width: milsToMillimeters(record.widthMils ?? 4),
    layer: mapOverlayLayer(record.layer),
  }
}
