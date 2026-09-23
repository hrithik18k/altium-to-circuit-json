import {
  AltiumArcRecord,
  type AltiumPoint,
  type AltiumRecord,
  AltiumRegionRecord,
  AltiumTrackRecord,
  approximateAltiumArc,
  getPcbRegionGeometry,
} from "altiumts"

export function getCourtyardRecordPoints(record: AltiumRecord): AltiumPoint[] {
  if (record instanceof AltiumTrackRecord) {
    return record.start && record.end ? [record.start, record.end] : []
  }
  if (record instanceof AltiumArcRecord) {
    return record.center && record.radiusMils
      ? approximateAltiumArc({
          center: record.center,
          radius: record.radiusMils,
          startAngleDegrees: record.startAngle,
          endAngleDegrees: record.endAngle,
        })
      : []
  }
  if (record instanceof AltiumRegionRecord) {
    return getPcbRegionGeometry(record).outline.points
  }
  return []
}
