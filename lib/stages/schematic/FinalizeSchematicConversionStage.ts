import { finalizeSchematicConversion } from "../../schematic/document"
import { SchematicConverterStage } from "./SchematicConverterStage"

export class FinalizeSchematicConversionStage extends SchematicConverterStage {
  _step(): void {
    finalizeSchematicConversion(this.schematicContext)
    this.context.elements = this.schematicContext.elements
    this.finished = true
  }
}
