import {
  type AltiumArcRecord,
  type AltiumPoint,
  AltiumTrackRecord,
  approximateAltiumArc,
} from "altiumts"
import type { PcbFabricationNotePath } from "circuit-json"
import { milsToMillimeters, toMillimeterPoint } from "../geometry"
import { getPcbComponentIdForRecord } from "../identifiers"
import { getRecordLayer, mapCourtyardLayer } from "../layers"
import { FABRICATION_NOTE_COLOR } from "../model"

export function convertPcbFabricationNotePath({
  record,
  recordIndex,
}: {
  record: AltiumTrackRecord | AltiumArcRecord
  recordIndex: number
}): PcbFabricationNotePath | undefined {
  let route: AltiumPoint[]
  if (record instanceof AltiumTrackRecord) {
    if (!record.start || !record.end) return undefined
    route = [record.start, record.end]
  } else {
    if (!record.center || !record.radiusMils) return undefined
    route = approximateAltiumArc({
      center: record.center,
      radius: record.radiusMils,
      startAngleDegrees: record.startAngle,
      endAngleDegrees: record.endAngle,
    })
  }

  return {
    type: "pcb_fabrication_note_path",
    pcb_fabrication_note_path_id: `pcb_fabrication_note_path_altium_${recordIndex}`,
    pcb_component_id: getPcbComponentIdForRecord(record),
    layer: mapCourtyardLayer(getRecordLayer(record)),
    route: route.map(toMillimeterPoint),
    stroke_width: milsToMillimeters(record.widthMils ?? 4),
    color: FABRICATION_NOTE_COLOR,
  }
}
