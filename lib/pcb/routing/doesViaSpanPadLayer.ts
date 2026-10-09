import type { AltiumPadRecord, AltiumViaRecord } from "altiumts"
import type { PcbCopperLayerMap } from "../layers"

export function doesViaSpanPadLayer({
  layerMap,
  pad,
  via,
}: {
  layerMap: PcbCopperLayerMap
  pad: AltiumPadRecord
  via: AltiumViaRecord
}): boolean {
  const padLayer = layerMap.getLayer(pad.layer)
  const startLayer = layerMap.getLayer(via.startLayer ?? "TOP")
  const endLayer = layerMap.getLayer(via.endLayer ?? "BOTTOM")
  if (!padLayer || !startLayer || !endLayer) return false

  const padLayerIndex = layerMap.layers.indexOf(padLayer)
  const startLayerIndex = layerMap.layers.indexOf(startLayer)
  const endLayerIndex = layerMap.layers.indexOf(endLayer)
  return (
    padLayerIndex >= Math.min(startLayerIndex, endLayerIndex) &&
    padLayerIndex <= Math.max(startLayerIndex, endLayerIndex)
  )
}
