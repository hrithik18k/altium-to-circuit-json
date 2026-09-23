import type { AltiumDimensionRecord } from "altiumts"
import type { PcbFabricationNoteDimension } from "circuit-json"
import { milsToMillimeters, toMillimeterPoint } from "../geometry"
import { getRecordLayer, mapMechanicalLayer } from "../layers"
import { BOARD_GRAPHICS_COMPONENT_ID, FABRICATION_NOTE_COLOR } from "../model"
import { getDimensionText } from "./getDimensionText"
import { getMeasurement } from "./getMeasurement"

export function convertPcbDimension({
  record,
  recordIndex,
}: {
  record: AltiumDimensionRecord
  recordIndex: number
}): PcbFabricationNoteDimension | undefined {
  const start = record.start
  const end = record.end
  if (!start || !end) return undefined

  const deltaX = end.x - start.x
  const deltaY = end.y - start.y
  const lengthMils = Math.hypot(deltaX, deltaY)
  if (lengthMils === 0) return undefined

  const perpendicular = {
    x: -deltaY / lengthMils,
    y: deltaX / lengthMils,
  }
  const lineAnchor = record.dimensionLineAnchor ?? start
  const signedOffsetMils =
    (lineAnchor.x - start.x) * perpendicular.x +
    (lineAnchor.y - start.y) * perpendicular.y
  const offsetSign = signedOffsetMils < 0 ? -1 : 1

  return {
    type: "pcb_fabrication_note_dimension",
    pcb_fabrication_note_dimension_id: `pcb_fabrication_note_dimension_altium_${recordIndex}`,
    pcb_component_id: BOARD_GRAPHICS_COMPONENT_ID,
    layer: mapMechanicalLayer(getRecordLayer(record)),
    from: toMillimeterPoint(start),
    to: toMillimeterPoint(end),
    text: getDimensionText(record, lengthMils),
    offset_distance: milsToMillimeters(Math.abs(signedOffsetMils)),
    offset_direction: {
      x: perpendicular.x * offsetSign,
      y: perpendicular.y * offsetSign,
    },
    font: "tscircuit2024",
    font_size: milsToMillimeters(record.textHeightMils ?? 50),
    arrow_size: milsToMillimeters(getMeasurement(record, "ARROWSIZE") ?? 40),
    color: FABRICATION_NOTE_COLOR,
  }
}
