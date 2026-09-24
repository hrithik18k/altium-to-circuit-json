import { type AltiumRecord, parseAltiumMeasurementToMils } from "altiumts"

export function getMeasurement(
  record: AltiumRecord,
  key: string,
): number | undefined {
  return parseAltiumMeasurementToMils(record.getCaseInsensitive(key))
}
