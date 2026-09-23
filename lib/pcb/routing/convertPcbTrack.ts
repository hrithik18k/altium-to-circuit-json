import type { AltiumTrackRecord } from "altiumts"
import type { PcbTrace } from "circuit-json"
import { milsToMillimeters, toMillimeterPoint } from "../geometry"
import { mapAltiumCopperLayer } from "../layers"
import type { PcbNetContext } from "../model"

export function convertPcbTrack({
  record,
  recordIndex,
  netContext,
}: {
  record: AltiumTrackRecord
  recordIndex: number
  netContext: PcbNetContext
}): PcbTrace | undefined {
  const start = record.start
  const end = record.end
  const layer = mapAltiumCopperLayer(record.layer)
  if (!start || !end || !layer) return undefined
  const width = milsToMillimeters(record.widthMils ?? 4)
  const sourceTraceId = netContext.getSourceTraceId(record)
  return {
    type: "pcb_trace",
    pcb_trace_id: `pcb_trace_altium_${recordIndex}`,
    ...(sourceTraceId ? { source_trace_id: sourceTraceId } : {}),
    should_round_corners: true,
    route: [
      { route_type: "wire", ...toMillimeterPoint(start), width, layer },
      { route_type: "wire", ...toMillimeterPoint(end), width, layer },
    ],
  }
}
