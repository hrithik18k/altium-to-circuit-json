import type { AltiumRecord, AltiumSchDoc } from "altiumts"
import type { AnyCircuitElement } from "circuit-json"
import type {
  ConvertedPort,
  SemanticSchematicOptions,
  SourceComponentDesignator,
} from "../model"

export interface ComponentConversionContext {
  convertedPorts: ConvertedPort[]
  document: AltiumSchDoc
  elements: AnyCircuitElement[]
  handledRecords: Set<AltiumRecord>
  options: SemanticSchematicOptions
  sourceComponentIdByDesignator: Map<SourceComponentDesignator, string>
}

export interface ComponentIdentity {
  designator: string
  displayText: string
  libraryReference: string
  manufacturerPartNumber: string | undefined
  schematicComponentId: string
  shouldCreateSourceComponent: boolean
  sourceComponentId: string
}
