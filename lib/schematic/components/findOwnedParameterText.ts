import { type AltiumRecord, AltiumSchParameterRecord } from "altiumts"

export function findOwnedParameterText(
  records: AltiumRecord[],
  name: string,
): string | undefined {
  return records.find(
    (record): record is AltiumSchParameterRecord =>
      record instanceof AltiumSchParameterRecord &&
      record.name?.toLowerCase() === name.toLowerCase(),
  )?.text
}
