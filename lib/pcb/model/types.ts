import type { AltiumPcbDocument, AltiumRecord } from "altiumts"
import type { AnyCircuitElement, SourceNet, SourceTrace } from "circuit-json"

export interface ConvertAltiumPcbDocOptions {
  includeBoardOutline?: boolean
  includeComponents?: boolean
  includeCopperAreas?: boolean
  includeCourtyards?: boolean
  includeDimensions?: boolean
  includeKeepouts?: boolean
  includePads?: boolean
  includeSilkscreen?: boolean
  includeTraces?: boolean
  includeVias?: boolean
}

export interface PcbNetContext {
  elements: Array<SourceNet | SourceTrace>
  getSourceNetId: (record: AltiumRecord) => string | undefined
  getSourceTraceId: (record: AltiumRecord) => string | undefined
}

export interface PcbConversionContext {
  document: AltiumPcbDocument
  elements: AnyCircuitElement[]
  netContext: PcbNetContext
  options: ConvertAltiumPcbDocOptions
}
