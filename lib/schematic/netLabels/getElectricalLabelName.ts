import { AltiumSchPortRecord } from "altiumts"
import type { ElectricalLabelRecord } from "./types"

export function getElectricalLabelName(
  record: ElectricalLabelRecord,
): string | undefined {
  return record instanceof AltiumSchPortRecord ? record.name : record.text
}
