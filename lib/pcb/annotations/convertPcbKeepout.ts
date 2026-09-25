import {
  AltiumArcRecord,
  AltiumFillRecord,
  type AltiumPcbDocument,
  type AltiumRecord,
} from "altiumts"
import type { PCBKeepoutCircle, PCBKeepoutRect } from "circuit-json"
import { convertPcbCircularKeepout } from "./convertPcbCircularKeepout"
import { convertPcbRectangularKeepout } from "./convertPcbRectangularKeepout"

export function convertPcbKeepout({
  document,
  record,
  recordIndex,
}: {
  document: AltiumPcbDocument
  record: AltiumRecord
  recordIndex: number
}): PCBKeepoutCircle | PCBKeepoutRect | undefined {
  if (record instanceof AltiumArcRecord) {
    return convertPcbCircularKeepout({ document, record, recordIndex })
  }
  if (record instanceof AltiumFillRecord) {
    return convertPcbRectangularKeepout({ document, record, recordIndex })
  }
  return undefined
}
