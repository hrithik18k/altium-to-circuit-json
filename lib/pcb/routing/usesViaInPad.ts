import {
  AltiumPadRecord,
  type AltiumPcbDocument,
  AltiumViaRecord,
} from "altiumts"
import type { PcbCopperLayerMap } from "../layers"
import { doesViaSpanPadLayer } from "./doesViaSpanPadLayer"
import { isPointInsidePad } from "./isPointInsidePad"

export function usesViaInPad({
  document,
  layerMap,
}: {
  document: AltiumPcbDocument
  layerMap: PcbCopperLayerMap
}): boolean {
  for (const record of document.records) {
    if (!(record instanceof AltiumViaRecord)) continue
    const viaPosition = record.position
    if (!viaPosition) continue
    const net = document.getNetForRecord(record)
    if (!net) continue
    const viaTouchesSameNetPad = document
      .getRecordsOnNet(net)
      .some(
        (netRecord) =>
          netRecord instanceof AltiumPadRecord &&
          netRecord.behavior === "smd" &&
          doesViaSpanPadLayer({ layerMap, pad: netRecord, via: record }) &&
          isPointInsidePad(viaPosition, netRecord),
      )
    if (viaTouchesSameNetPad) return true
  }
  return false
}
