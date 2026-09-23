import { addSchematicSheet } from "../../schematic/document"
import { SchematicConverterStage } from "./SchematicConverterStage"

export class AddSchematicSheetStage extends SchematicConverterStage {
  _step(): void {
    addSchematicSheet(this.schematicContext)
    this.finished = true
  }
}
