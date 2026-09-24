import { AltiumSchJunctionRecord, AltiumSchWireRecord } from "altiumts"
import type { SourceTrace } from "circuit-json"
import { getLocation, pointKey, pointsEqual, scalePoint } from "../geometry"
import type { SemanticNet } from "../model"
import { addSemanticNetPortLeadTraces } from "./addSemanticNetPortLeadTraces"
import { addSemanticNetWireTraces } from "./addSemanticNetWireTraces"
import { getOrCreateSourceNet } from "./getOrCreateSourceNet"
import type { ConnectivityConversionContext } from "./types"
import { uniqueConvertedPorts } from "./uniqueConvertedPorts"

export function convertSemanticNet(
  { net, netIndex }: { net: SemanticNet; netIndex: number },
  context: ConnectivityConversionContext,
): void {
  const {
    convertedPorts,
    document,
    elements,
    handledRecords,
    options,
    portsByPoint,
    sourceNetIdByName,
    sourceNetIdByRecord,
    sourcePortCountByRecord,
    sourceTraceIdByRecord,
  } = context
  const wires = net.records.filter(
    (record): record is AltiumSchWireRecord =>
      record instanceof AltiumSchWireRecord,
  )
  const connectedConvertedPorts = uniqueConvertedPorts(
    net.points.flatMap((point) => portsByPoint.get(pointKey(point)) ?? []),
  )
  const connectedPorts = connectedConvertedPorts.map(
    ({ sourcePort }) => sourcePort.source_port_id,
  )
  const hasRenderableConnectivity =
    wires.length > 0 ||
    (net.names.length > 0 && connectedPorts.length > 0) ||
    connectedPorts.length > 1
  if (!hasRenderableConnectivity) return

  const sourceNetIds = net.names.map((name) =>
    getOrCreateSourceNet({ elements, name, sourceNetIdByName }),
  )
  const firstSourceNetId = sourceNetIds[0]
  if (firstSourceNetId) {
    for (const record of net.records) {
      sourceNetIdByRecord.set(record, firstSourceNetId)
    }
  }
  const sourceTraceId = `source_trace_altium_${netIndex}`
  for (const record of net.records) {
    sourcePortCountByRecord.set(record, connectedPorts.length)
    sourceTraceIdByRecord.set(record, sourceTraceId)
  }
  elements.push({
    type: "source_trace",
    connected_source_net_ids: sourceNetIds,
    connected_source_port_ids: connectedPorts,
    display_name: net.names[0],
    name: net.names[0],
    source_trace_id: sourceTraceId,
  } satisfies SourceTrace)

  const netJunctions = document.records
    .filter(
      (record) =>
        record instanceof AltiumSchJunctionRecord &&
        net.points.some((point) => pointsEqual(point, getLocation(record))),
    )
    .flatMap((record) => {
      handledRecords.add(record)
      const location = getLocation(record)
      return location ? [scalePoint(location, options.scale)] : []
    })
  for (const wire of wires) handledRecords.add(wire)
  addSemanticNetWireTraces(
    { connectedConvertedPorts, net, netJunctions, sourceTraceId, wires },
    context,
  )
  addSemanticNetPortLeadTraces(
    { connectedConvertedPorts, sourceTraceId },
    context,
  )

  const connectedPortIds = new Set(connectedPorts)
  for (const convertedPort of convertedPorts) {
    if (
      convertedPort.isSchematicVisible &&
      connectedPortIds.has(convertedPort.sourcePort.source_port_id)
    ) {
      convertedPort.schematicPort.is_connected = true
    }
  }
}
