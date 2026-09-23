import { type AltiumRecord, AltiumSchWireRecord } from "altiumts"
import type { SchematicPointKey } from "../geometry"
import type { MutableSemanticNet } from "./types"

export function createConnectedWiresByRecord(
  groupedByRoot: Map<SchematicPointKey, MutableSemanticNet>,
): Map<AltiumRecord, AltiumRecord[]> {
  const connectedWiresByRecord = new Map<AltiumRecord, AltiumRecord[]>()
  for (const group of groupedByRoot.values()) {
    const wires = [...group.records].filter(
      (record): record is AltiumSchWireRecord =>
        record instanceof AltiumSchWireRecord,
    )
    for (const record of group.records) {
      connectedWiresByRecord.set(record, wires)
    }
  }
  return connectedWiresByRecord
}
