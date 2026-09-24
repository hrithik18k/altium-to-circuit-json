import type { AltiumSchDoc } from "altiumts"
import type { AnyCircuitElement } from "circuit-json"
import { ConverterStage } from "../../converter/ConverterStage"
import type { SchematicConversionContext } from "../../schematic/document"

export abstract class SchematicConverterStage extends ConverterStage<
  AltiumSchDoc,
  AnyCircuitElement[]
> {
  protected get schematicContext(): SchematicConversionContext {
    const context = this.context.schematic
    if (!context) {
      throw new Error("Schematic conversion context is not initialized")
    }
    return context
  }

  getOutput(): AnyCircuitElement[] {
    if (!this.finished)
      throw new Error(`${this.constructor.name} is unfinished`)
    return this.context.elements
  }
}
