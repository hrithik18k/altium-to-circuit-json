import {
  type AltiumArcRecord,
  type AltiumPoint,
  approximateAltiumArc,
} from "altiumts"

export function getArcPoints(record: AltiumArcRecord): AltiumPoint[] {
  const center = record.center
  const radius = record.radiusMils
  if (!center || !radius) return []
  return approximateAltiumArc({
    center,
    radius,
    startAngleDegrees: record.startAngle,
    endAngleDegrees: record.endAngle,
  })
}
