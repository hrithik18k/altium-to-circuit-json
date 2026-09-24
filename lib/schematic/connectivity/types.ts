import type { AltiumPoint, AltiumRecord, AltiumSchDoc } from "altiumts"
import type { AnyCircuitElement } from "circuit-json"

import type { SchematicPointKey } from "../geometry"
import type { SchematicSegmentKey } from "../identifiers"
import type {
  ConvertedPort,
  SemanticSchematicOptions,
  SourceNetName,
} from "../model"

export interface ConnectivityConversionContext {
  convertedPorts: ConvertedPort[]
  document: AltiumSchDoc
  elements: AnyCircuitElement[]
  handledRecords: Set<AltiumRecord>
  options: SemanticSchematicOptions
  portsByPoint: Map<SchematicPointKey, ConvertedPort[]>
  schematicTraceIdByRecord: Map<AltiumRecord, string>
  sourceNetIdByName: Map<SourceNetName, string>
  sourceNetIdByRecord: Map<AltiumRecord, string>
  sourcePortCountByRecord: Map<AltiumRecord, number>
  sourceTraceIdByRecord: Map<AltiumRecord, string>
}

export interface PrunableSegment {
  endKey: SchematicPointKey
  key: SchematicSegmentKey
  startKey: SchematicPointKey
}

export interface MutableSemanticNet {
  id: SchematicPointKey
  names: Set<string>
  points: Map<SchematicPointKey, AltiumPoint>
  records: Set<AltiumRecord>
}

export interface PositionedElectricalRecord {
  point: AltiumPoint
  record: AltiumRecord
}
