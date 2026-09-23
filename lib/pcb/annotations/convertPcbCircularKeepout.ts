import type { AltiumArcRecord, AltiumPcbDocument } from "altiumts"
import type { PCBKeepoutCircle } from "circuit-json"
import { milsToMillimeters, toMillimeterPoint } from "../geometry"
import { getCopperLayers } from "./getCopperLayers"

export function convertPcbCircularKeepout({
  document,
  record,
  recordIndex,
}: {
  document: AltiumPcbDocument
  record: AltiumArcRecord
  recordIndex: number
}): PCBKeepoutCircle | undefined {
  const center = record.center
  const radiusMils = record.radiusMils
  const rawSweepDegrees = record.endAngle - record.startAngle
  const isFullCircle = rawSweepDegrees === 0 || Math.abs(rawSweepDegrees) >= 360
  if (!center || !radiusMils || !isFullCircle) return undefined

  return {
    type: "pcb_keepout",
    pcb_keepout_id: `pcb_keepout_altium_arc_${recordIndex}`,
    shape: "circle",
    center: toMillimeterPoint(center),
    radius: milsToMillimeters(radiusMils + (record.widthMils ?? 0) / 2),
    layers: getCopperLayers(document),
    description: "Altium circular keepout",
  }
}
