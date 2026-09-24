import type { AltiumRecord } from "altiumts"
import { getRecordLayer, isKeepoutLayer } from "../layers"

export function isAltiumKeepout(record: AltiumRecord): boolean {
  return (
    record.getBoolean("KEEPOUT") === true ||
    isKeepoutLayer(getRecordLayer(record))
  )
}
