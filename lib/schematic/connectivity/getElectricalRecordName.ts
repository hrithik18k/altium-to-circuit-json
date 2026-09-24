import {
  type AltiumRecord,
  AltiumSchLabelRecord,
  AltiumSchNetLabelRecord,
  AltiumSchPortRecord,
  AltiumSchPowerPortRecord,
} from "altiumts"

export function getElectricalRecordName(
  record: AltiumRecord,
): string | undefined {
  if (record instanceof AltiumSchPortRecord) return record.name
  if (record instanceof AltiumSchLabelRecord) return record.text
  if (record instanceof AltiumSchNetLabelRecord) return record.text
  if (record instanceof AltiumSchPowerPortRecord) return record.text
  return undefined
}
