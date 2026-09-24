import { convertSchematicSemantics } from "../../schematic/document"
import { SchematicConverterStage } from "./SchematicConverterStage"

export class ConvertSchematicSemanticsStage extends SchematicConverterStage {
  _step(): void {
    convertSchematicSemantics(this.schematicContext)
    this.finished = true
  }
}
