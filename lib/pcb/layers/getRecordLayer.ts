import type { AltiumRecord } from "altiumts"

export function getRecordLayer(record: AltiumRecord): string | undefined {
  return record.getDecoded("LAYER")
}
