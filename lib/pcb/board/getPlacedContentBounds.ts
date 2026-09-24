import {
  type AltiumBounds,
  AltiumPadRecord,
  type AltiumPcbDocument,
  type AltiumPoint,
  AltiumTrackRecord,
  AltiumViaRecord,
  getAltiumBounds,
} from "altiumts"
import { isCopperLayer } from "./isCopperLayer"

export function getPlacedContentBounds(
  document: AltiumPcbDocument,
): AltiumBounds | undefined {
  const points: AltiumPoint[] = []
  for (const record of document.records) {
    if (
      record instanceof AltiumPadRecord ||
      record instanceof AltiumViaRecord
    ) {
      if (record.position) points.push(record.position)
      continue
    }
    if (
      record instanceof AltiumTrackRecord &&
      isCopperLayer(record.layer) &&
      record.start &&
      record.end
    ) {
      points.push(record.start, record.end)
    }
  }
  return getAltiumBounds(points)
}
