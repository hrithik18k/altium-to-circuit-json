import {
  AltiumArcRecord,
  type AltiumPcbDocument,
  type AltiumRecord,
  AltiumTrackRecord,
} from "altiumts"
import { getRecordLayer, isCourtyardLayer } from "../layers"

export function isExplodedPcbDimensionGraphic(
  document: AltiumPcbDocument,
  record: AltiumRecord,
): record is AltiumTrackRecord | AltiumArcRecord {
  if (
    !(record instanceof AltiumTrackRecord) &&
    !(record instanceof AltiumArcRecord)
  ) {
    return false
  }
  if (!isCourtyardLayer(getRecordLayer(record))) return false

  // EasyEDA exports dimensions as anonymous components made entirely from
  // vector strokes on Mechanical 15 instead of native Altium Dimension
  // records. Real component courtyards on this layer belong to top/bottom
  // components, while these exploded dimension graphics have no PCB side.
  return document.getComponentForRecord(record)?.side === "unknown"
}
