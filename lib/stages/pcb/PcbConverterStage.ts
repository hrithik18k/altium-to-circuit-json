import type { AltiumPcbDocument } from "altiumts"
import type { AnyCircuitElement } from "circuit-json"
import { ConverterStage } from "../../converter/ConverterStage"
import type { PcbConversionContext } from "../../pcb/model"

export abstract class PcbConverterStage extends ConverterStage<
  AltiumPcbDocument,
  AnyCircuitElement[]
> {
  protected get pcbContext(): PcbConversionContext {
    const context = this.context.pcb
    if (!context) throw new Error("PCB conversion context is not initialized")
    return context
  }

  getOutput(): AnyCircuitElement[] {
    if (!this.finished)
      throw new Error(`${this.constructor.name} is unfinished`)
    return this.context.elements
  }
}
