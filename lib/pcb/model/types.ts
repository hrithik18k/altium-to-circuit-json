import type {
  AltiumEmbeddedModel,
  AltiumPadRecord,
  AltiumPcbDocument,
  AltiumPrjPcb,
  AltiumRecord,
} from "altiumts"
import type {
  AnyCircuitElement,
  SourceNet,
  SourcePort,
  SourceSimpleChip,
  SourceTrace,
} from "circuit-json"
import type { PcbCopperLayerMap } from "../layers"

export interface EmbeddedModelUrlContext {
  embeddedModel: AltiumEmbeddedModel
}

export interface ConvertAltiumPcbDocOptions {
  idPrefix?: string
  includeBoardOutline?: boolean
  includeCadModels?: boolean
  includeComponents?: boolean
  includeCopperAreas?: boolean
  includeCourtyards?: boolean
  includeDimensions?: boolean
  includeKeepouts?: boolean
  includePads?: boolean
  includeSilkscreen?: boolean
  includeTraces?: boolean
  includeVias?: boolean
  resolveEmbeddedModelUrl?: (
    context: EmbeddedModelUrlContext,
  ) => string | undefined
  project?: AltiumPrjPcb
}

export interface PcbNetContext {
  elements: Array<SourceNet | SourceTrace>
  getSourceNetId: (record: AltiumRecord) => string | undefined
  getSourceTraceId: (record: AltiumRecord) => string | undefined
}

export interface PcbComponentContext {
  sourceComponents: SourceSimpleChip[]
  sourcePorts: SourcePort[]
  getPcbComponentId: (record: AltiumRecord) => string | undefined
  getSourcePortId: (record: AltiumPadRecord) => string | undefined
}

export interface PcbConversionContext {
  componentContext: PcbComponentContext
  document: AltiumPcbDocument
  elements: AnyCircuitElement[]
  layerMap: PcbCopperLayerMap
  netContext: PcbNetContext
  options: ConvertAltiumPcbDocOptions
}
