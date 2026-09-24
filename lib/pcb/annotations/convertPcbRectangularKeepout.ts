import type { AltiumFillRecord, AltiumPcbDocument } from "altiumts"
import type { PCBKeepoutRect } from "circuit-json"
import { milsToMillimeters } from "../geometry"
import { getKeepoutLayers } from "./getKeepoutLayers"

export function convertPcbRectangularKeepout({
  document,
  record,
  recordIndex,
}: {
  document: AltiumPcbDocument
  record: AltiumFillRecord
  recordIndex: number
}): PCBKeepoutRect | undefined {
  const bounds = record.bounds
  if (!bounds) return undefined
  const widthMils = bounds.maxX - bounds.minX
  const heightMils = bounds.maxY - bounds.minY
  if (widthMils <= 0 || heightMils <= 0) return undefined

  // Circuit JSON keepout rectangles are axis-aligned, so conservatively use
  // the rotated fill's envelope rather than allowing copper into the keepout.
  const angle = (record.rotation * Math.PI) / 180
  const width =
    Math.abs(widthMils * Math.cos(angle)) +
    Math.abs(heightMils * Math.sin(angle))
  const height =
    Math.abs(widthMils * Math.sin(angle)) +
    Math.abs(heightMils * Math.cos(angle))

  return {
    type: "pcb_keepout",
    pcb_keepout_id: `pcb_keepout_${recordIndex}`,
    shape: "rect",
    center: {
      x: milsToMillimeters((bounds.minX + bounds.maxX) / 2),
      y: milsToMillimeters((bounds.minY + bounds.maxY) / 2),
    },
    width: milsToMillimeters(width),
    height: milsToMillimeters(height),
    layers: getKeepoutLayers(record.layer, document),
    description: "Altium rectangular keepout",
  }
}
