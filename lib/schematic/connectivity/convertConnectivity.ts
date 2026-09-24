import type { AltiumRecord, AltiumSchDoc } from "altiumts"
import type { AnyCircuitElement } from "circuit-json"
import type {
  ConnectivityConversion,
  ConvertedPort,
  SemanticNetGraph,
  SemanticSchematicOptions,
  SourceNetName,
} from "../model"
import { convertSemanticNet } from "./convertSemanticNet"
import { groupByPoint } from "./groupByPoint"

export function convertConnectivity({
  convertedPorts,
  document,
  elements,
  handledRecords,
  options,
  semanticNetGraph,
}: {
  convertedPorts: ConvertedPort[]
  document: AltiumSchDoc
  elements: AnyCircuitElement[]
  handledRecords: Set<AltiumRecord>
  options: SemanticSchematicOptions
  semanticNetGraph: SemanticNetGraph
}): ConnectivityConversion {
  const sourceNetIdByName = new Map<SourceNetName, string>()
  const sourceNetIdByRecord = new Map<AltiumRecord, string>()
  const sourcePortCountByRecord = new Map<AltiumRecord, number>()
  const sourceTraceIdByRecord = new Map<AltiumRecord, string>()
  const schematicTraceIdByRecord = new Map<AltiumRecord, string>()
  const portsByPoint = groupByPoint(convertedPorts)
  const context = {
    convertedPorts,
    document,
    elements,
    handledRecords,
    options,
    portsByPoint,
    schematicTraceIdByRecord,
    sourceNetIdByName,
    sourceNetIdByRecord,
    sourcePortCountByRecord,
    sourceTraceIdByRecord,
  }

  for (const [netIndex, net] of semanticNetGraph.nets.entries()) {
    convertSemanticNet({ net, netIndex }, context)
  }

  return {
    schematicTraceIdByRecord,
    sourceNetIdByName,
    sourceNetIdByRecord,
    sourcePortCountByRecord,
    sourceTraceIdByRecord,
  }
}
