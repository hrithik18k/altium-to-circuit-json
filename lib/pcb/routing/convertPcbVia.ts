import type { AltiumViaRecord } from "altiumts"
import type { PcbVia } from "circuit-json"
import { milsToMillimeters, toMillimeterPoint } from "../geometry"
import { mapAltiumCopperLayer } from "../layers"
import type { PcbNetContext } from "../model"

export function convertPcbVia({
  record,
  recordIndex,
  netContext,
}: {
  record: AltiumViaRecord
  recordIndex: number
  netContext: PcbNetContext
}): PcbVia | undefined {
  if (!record.position) return undefined
  const startLayer = mapAltiumCopperLayer(record.startLayer) ?? "top"
  const endLayer = mapAltiumCopperLayer(record.endLayer) ?? "bottom"
  const layers = startLayer === endLayer ? [startLayer] : [startLayer, endLayer]
  const outerDiameter = milsToMillimeters(record.diameterMils ?? 20)
  const sourceNetId = netContext.getSourceNetId(record)
  const sourceTraceId = netContext.getSourceTraceId(record)
  return {
    type: "pcb_via",
    pcb_via_id: `pcb_via_altium_${recordIndex}`,
    ...(sourceNetId ? { source_net_id: sourceNetId } : {}),
    ...(sourceTraceId ? { source_trace_id: sourceTraceId } : {}),
    ...toMillimeterPoint(record.position),
    outer_diameter: outerDiameter,
    hole_diameter: milsToMillimeters(
      record.holeSizeMils ?? (record.diameterMils ?? 20) * 0.45,
    ),
    layers,
    is_tented: record.tentedTop === true && record.tentedBottom === true,
  }
}
