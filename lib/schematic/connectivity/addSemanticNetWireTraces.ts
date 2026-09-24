import { type AltiumSchWireRecord, getSchematicRecordPoints } from "altiumts"
import type { SchematicTrace } from "circuit-json"
import { pointKey, scalePoint } from "../geometry"
import { segmentKey } from "../identifiers"
import type { ConvertedPort, SemanticNet } from "../model"
import { getEquivalentPortPrunedSegmentKeys } from "./getEquivalentPortPrunedSegmentKeys"
import { getPortIdAtElectricalPoint } from "./getPortIdAtElectricalPoint"
import { splitSegmentAtPoints } from "./splitSegmentAtPoints"
import type { ConnectivityConversionContext } from "./types"

export function addSemanticNetWireTraces(
  {
    connectedConvertedPorts,
    net,
    netJunctions,
    sourceTraceId,
    wires,
  }: {
    connectedConvertedPorts: ConvertedPort[]
    net: SemanticNet
    netJunctions: SchematicTrace["junctions"]
    sourceTraceId: string
    wires: AltiumSchWireRecord[]
  },
  context: ConnectivityConversionContext,
): void {
  const {
    document,
    elements,
    options,
    portsByPoint,
    schematicTraceIdByRecord,
  } = context
  const prunedSegmentKeys = getEquivalentPortPrunedSegmentKeys({
    convertedPorts: connectedConvertedPorts,
    net,
    wires,
  })
  let renderedWireIndex = 0
  for (const wire of wires) {
    const wireRecordIndex = document.records.indexOf(wire)
    const schematicTraceId = `schematic_trace_altium_${wireRecordIndex}`
    const points = getSchematicRecordPoints(wire)
    const edges: SchematicTrace["edges"] = []
    for (let pointIndex = 1; pointIndex < points.length; pointIndex++) {
      const from = points[pointIndex - 1]
      const to = points[pointIndex]
      if (!from || !to) continue
      const segmentPoints = splitSegmentAtPoints({
        start: from,
        end: to,
        candidates: net.points,
      })
      for (
        let segmentPointIndex = 1;
        segmentPointIndex < segmentPoints.length;
        segmentPointIndex++
      ) {
        const segmentFrom = segmentPoints[segmentPointIndex - 1]
        const segmentTo = segmentPoints[segmentPointIndex]
        if (!segmentFrom || !segmentTo) continue
        if (prunedSegmentKeys.has(segmentKey(segmentFrom, segmentTo))) continue
        const fromPort = portsByPoint
          .get(pointKey(segmentFrom))
          ?.find((port) => port.isSchematicVisible)
        const toPort = portsByPoint
          .get(pointKey(segmentTo))
          ?.find((port) => port.isSchematicVisible)
        const fromPortId = getPortIdAtElectricalPoint({
          port: fromPort,
          electricalPoint: segmentFrom,
          altiumUnitsToMillimetersScale: options.scale,
        })
        const toPortId = getPortIdAtElectricalPoint({
          port: toPort,
          electricalPoint: segmentTo,
          altiumUnitsToMillimetersScale: options.scale,
        })
        edges.push({
          from: scalePoint(segmentFrom, options.scale),
          to: scalePoint(segmentTo, options.scale),
          ...(fromPortId ? { from_schematic_port_id: fromPortId } : {}),
          ...(toPortId ? { to_schematic_port_id: toPortId } : {}),
        })
      }
    }
    if (edges.length === 0) continue
    schematicTraceIdByRecord.set(wire, schematicTraceId)
    elements.push({
      type: "schematic_trace",
      edges,
      junctions: renderedWireIndex === 0 ? netJunctions : [],
      schematic_sheet_id: options.schematicSheetId,
      schematic_trace_id: schematicTraceId,
      source_trace_id: sourceTraceId,
    } satisfies SchematicTrace)
    renderedWireIndex++
  }
}
