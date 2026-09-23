import type { AltiumPadRecord, AltiumPcbDocument, AltiumRecord } from "altiumts"
import type {
  AnyCircuitElement,
  PcbPort,
  SourceNet,
  SourcePort,
  SourceSimpleChip,
  SourceTrace,
} from "circuit-json"

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

export interface PcbPadContext {
  elements: Array<SourceSimpleChip | SourcePort | PcbPort>
  sourcePortIdsByNet: Map<AltiumRecord, string[]>
  getPadRefs: (record: AltiumPadRecord) => {
    pcb_component_id?: string
    pcb_port_id?: string
  }
}

export interface PcbConversionContext {
  document: AltiumPcbDocument
  elements: AnyCircuitElement[]
  netContext: PcbNetContext
  padContext: PcbPadContext
  options: ConvertAltiumPcbDocOptions
}
