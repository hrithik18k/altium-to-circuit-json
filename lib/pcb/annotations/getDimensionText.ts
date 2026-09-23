import {
  type AltiumDimensionRecord,
  parseAltiumMeasurementToMils,
} from "altiumts"
import { MILS_TO_MILLIMETERS } from "../model"

export function getDimensionText(
  record: AltiumDimensionRecord,
  measuredDistanceMils: number,
): string {
  const explicitText = record.getDecoded("TEXTFORMAT")?.trim()
  const isMeasurementShapedFormat =
    explicitText !== undefined &&
    parseAltiumMeasurementToMils(explicitText) !== undefined
  if (explicitText && explicitText !== "<>" && !isMeasurementShapedFormat) {
    return explicitText
  }

  const precision = Math.min(Math.max(record.precision ?? 2, 0), 6)
  const normalizedUnit = record.unit?.toUpperCase() ?? "MILS"
  let amount = measuredDistanceMils
  let unitLabel = "mil"
  if (normalizedUnit.includes("MILLIMETER")) {
    amount *= MILS_TO_MILLIMETERS
    unitLabel = "mm"
  } else if (normalizedUnit.includes("CENTIMETER")) {
    amount *= MILS_TO_MILLIMETERS / 10
    unitLabel = "cm"
  } else if (normalizedUnit.includes("INCH")) {
    amount /= 1000
    unitLabel = "in"
  }
  const suffix = record.suffix?.trim() ? record.suffix : ` ${unitLabel}`
  return `${record.prefix ?? ""}${amount.toFixed(precision)}${suffix}`
}
