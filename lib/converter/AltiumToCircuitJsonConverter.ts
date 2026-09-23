import { AltiumSchDoc } from "altiumts"
import type { AnyCircuitElement } from "circuit-json"
import { createPcbConversionContext } from "../pcb/context"
import { createSchematicConversionContext } from "../schematic/document"
import {
  AddPcbNetsStage,
  ConvertPcbBoardStage,
  ConvertPcbComponentsStage,
  ConvertPcbCopperAreasStage,
  ConvertPcbRecordsStage,
} from "../stages/pcb"
import {
  AddSchematicSheetStage,
  ConvertRemainingSchematicRecordsStage,
  ConvertSchematicSemanticsStage,
  FinalizeSchematicConversionStage,
} from "../stages/schematic"
import type { ConverterStage } from "./ConverterStage"
import { isSupportedAltiumDocument } from "./isSupportedAltiumDocument"
import { parseAltiumSource } from "./parseAltiumSource"
import type {
  AltiumSource,
  AltiumToCircuitJsonConverterContext,
  ConvertAltiumToCircuitJsonOptions,
  SupportedAltiumDocument,
} from "./types"

export class AltiumToCircuitJsonConverter {
  readonly context: AltiumToCircuitJsonConverterContext
  readonly pipeline: ConverterStage<SupportedAltiumDocument, unknown>[]
  currentStageIndex = 0
  finished = false

  constructor(
    source: AltiumSource | SupportedAltiumDocument,
    options: ConvertAltiumToCircuitJsonOptions = {},
  ) {
    const document = isSupportedAltiumDocument(source)
      ? source
      : parseAltiumSource(source, options.sourceType ?? "auto")
    this.context = { document, elements: [], options }

    if (document instanceof AltiumSchDoc) {
      const schematicContext = createSchematicConversionContext({
        document,
        options: options.schematic ?? {},
      })
      this.context.schematic = schematicContext
      this.context.elements = schematicContext.elements
      this.pipeline = [
        new AddSchematicSheetStage(document, this.context),
        new ConvertSchematicSemanticsStage(document, this.context),
        new ConvertRemainingSchematicRecordsStage(document, this.context),
        new FinalizeSchematicConversionStage(document, this.context),
      ]
      return
    }

    const pcbContext = createPcbConversionContext({
      document,
      options: options.pcb ?? {},
    })
    this.context.pcb = pcbContext
    this.context.elements = pcbContext.elements
    this.pipeline = [
      new AddPcbNetsStage(document, this.context),
      new ConvertPcbBoardStage(document, this.context),
      new ConvertPcbComponentsStage(document, this.context),
      new ConvertPcbCopperAreasStage(document, this.context),
      new ConvertPcbRecordsStage(document, this.context),
    ]
  }

  get currentStage():
    | ConverterStage<SupportedAltiumDocument, unknown>
    | undefined {
    return this.pipeline[this.currentStageIndex]
  }

  step(): void {
    const stage = this.currentStage
    if (!stage) {
      this.finished = true
      return
    }
    stage.step()
    if (stage.finished) {
      this.currentStageIndex++
      this.finished = this.currentStageIndex >= this.pipeline.length
    }
  }

  runUntilFinished(): void {
    while (!this.finished) this.step()
  }

  getOutput(): AnyCircuitElement[] {
    if (!this.finished) {
      throw new Error("Converter must finish before its output is read")
    }
    return this.context.elements
  }
}
