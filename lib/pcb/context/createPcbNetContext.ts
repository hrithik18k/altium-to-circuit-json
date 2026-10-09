import { AltiumPadRecord, type AltiumPcbDocument } from "altiumts"
import type { SourceNet, SourceTrace } from "circuit-json"
import type { PcbComponentContext, PcbNetContext } from "../model"

export function createPcbNetContext({
  componentContext,
  document,
  sourceNetTraceWidthMillimeters,
}: {
  componentContext: PcbComponentContext
  document: AltiumPcbDocument
  sourceNetTraceWidthMillimeters?: number
}): PcbNetContext {
  const getNetForRecord = (
    record: Parameters<typeof document.getNetForRecord>[0],
  ) => {
    const directNet = document.getNetForRecord(record)
    if (directNet) return directNet

    const parentPolygon = document.getPolygonForRecord(record)
    if (!parentPolygon || parentPolygon === record) return undefined
    return document.getNetForRecord(parentPolygon)
  }
  const sourceNetIdByAltiumNet = new Map(
    document.nets.map((net, index) => [net, `source_net_altium_pcb_${index}`]),
  )
  const sourceTraceIdByAltiumNet = new Map(
    document.nets.map((net, index) => [
      net,
      `source_trace_altium_pcb_${index}`,
    ]),
  )
  const elements = document.nets.flatMap((net, index) => {
    const name = net.name?.trim() || `Net ${index + 1}`
    const sourceNetId = sourceNetIdByAltiumNet.get(net)
    const sourceTraceId = sourceTraceIdByAltiumNet.get(net)
    if (!sourceNetId || !sourceTraceId) return []
    const connectedSourcePortIds = [
      ...new Set(
        document
          .getRecordsOnNet(net)
          .filter((record) => record instanceof AltiumPadRecord)
          .flatMap((record) => {
            const sourcePortId = componentContext.getSourcePortId(record)
            return sourcePortId ? [sourcePortId] : []
          }),
      ),
    ]

    return [
      {
        type: "source_net",
        source_net_id: sourceNetId,
        name,
        member_source_group_ids: [],
        trace_width: sourceNetTraceWidthMillimeters,
      } satisfies SourceNet,
      {
        type: "source_trace",
        source_trace_id: sourceTraceId,
        connected_source_port_ids: connectedSourcePortIds,
        connected_source_net_ids: [sourceNetId],
        name,
        display_name: name,
      } satisfies SourceTrace,
    ]
  })

  return {
    elements,
    getSourceNetId: (record) => {
      const net = getNetForRecord(record)
      return net ? sourceNetIdByAltiumNet.get(net) : undefined
    },
    getSourceTraceId: (record) => {
      const net = getNetForRecord(record)
      return net ? sourceTraceIdByAltiumNet.get(net) : undefined
    },
  }
}
