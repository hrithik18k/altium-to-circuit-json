import type { AltiumPoint, AltiumRecord } from "altiumts"
import type {
  AnyCircuitElement,
  SchematicPort,
  SchematicTrace,
  SourcePort,
} from "circuit-json"
import type { SchSymbol } from "schematic-symbols"

export interface SemanticSchematicOptions {
  includeHidden?: boolean
  includeText?: boolean
  scale: number
  schematicSheetId: string
}

export interface SemanticSchematicConversion {
  elements: AnyCircuitElement[]
  handledRecords: Set<AltiumRecord>
}

export interface ConvertedPort {
  isSchematicVisible: boolean
  point: AltiumPoint
  record: AltiumRecord
  schematicPort: SchematicPort
  sourcePort: SourcePort
}

export interface SymbolPortAssignment {
  convertedPort: ConvertedPort
  symbolPort: SchSymbol["ports"][number]
}

export interface SymbolSelection {
  assignments: SymbolPortAssignment[]
  name: string
  symbol: SchSymbol
}

export interface SemanticNet {
  id: string
  names: string[]
  points: AltiumPoint[]
  records: AltiumRecord[]
}

export interface SemanticNetGraph {
  getConnectedWiresForRecord(record: AltiumRecord): AltiumRecord[]
  nets: SemanticNet[]
}

export interface SchematicSegment {
  end: AltiumPoint
  start: AltiumPoint
}

export type SourceNetName = string & { readonly __sourceNetName: unique symbol }

export type SourceComponentDesignator = string & {
  readonly __sourceComponentDesignator: unique symbol
}

export type SourcePortId = string & { readonly __sourcePortId: unique symbol }

export interface ConnectivityConversion {
  sourceNetIdByRecord: Map<AltiumRecord, string>
  sourceNetIdByName: Map<SourceNetName, string>
  sourcePortCountByRecord: Map<AltiumRecord, number>
  sourceTraceIdByRecord: Map<AltiumRecord, string>
  schematicTraceIdByRecord: Map<AltiumRecord, string>
}

export type SchematicTraceEdges = SchematicTrace["edges"]
