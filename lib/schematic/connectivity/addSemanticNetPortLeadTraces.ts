import type { SchematicTrace } from "circuit-json"
import { pointsEqual, scalePoint } from "../geometry"
import type { ConvertedPort } from "../model"
import { createPortLeadEdges } from "./createPortLeadEdges"
import type { ConnectivityConversionContext } from "./types"

export function addSemanticNetPortLeadTraces(
  {
    connectedConvertedPorts,
    sourceTraceId,
  }: {
    connectedConvertedPorts: ConvertedPort[]
    sourceTraceId: string
  },
  context: ConnectivityConversionContext,
): void {
  const { document, elements, options } = context
  for (const convertedPort of connectedConvertedPorts) {
    if (!convertedPort.isSchematicVisible) continue
    const electricalTerminal = scalePoint(convertedPort.point, options.scale)
    if (pointsEqual(convertedPort.schematicPort.center, electricalTerminal)) {
      continue
    }
    const portRecordIndex = document.records.indexOf(convertedPort.record)
    elements.push({
      type: "schematic_trace",
      edges: createPortLeadEdges(convertedPort, electricalTerminal),
      junctions: [],
      schematic_sheet_id: options.schematicSheetId,
      schematic_trace_id: `schematic_trace_altium_port_lead_${portRecordIndex}`,
      source_trace_id: sourceTraceId,
    } satisfies SchematicTrace)
  }
}
