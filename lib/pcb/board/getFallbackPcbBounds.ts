import {
  AltiumPadRecord,
  type AltiumPoint,
  type AltiumRecord,
  AltiumTrackRecord,
  AltiumViaRecord,
  getAltiumBounds,
} from "altiumts"

export function getFallbackPcbBounds(records: AltiumRecord[]): {
  maxX: number
  maxY: number
  minX: number
  minY: number
} {
  const points: AltiumPoint[] = []
  for (const record of records) {
    if (
      record instanceof AltiumPadRecord ||
      record instanceof AltiumViaRecord
    ) {
      if (record.position) points.push(record.position)
    } else if (record instanceof AltiumTrackRecord) {
      if (record.start) points.push(record.start)
      if (record.end) points.push(record.end)
    }
  }
  return getAltiumBounds(points) ?? { minX: 0, minY: 0, maxX: 1000, maxY: 800 }
}
