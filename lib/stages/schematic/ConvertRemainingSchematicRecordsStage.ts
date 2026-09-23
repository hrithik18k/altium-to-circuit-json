import { convertRemainingSchematicRecords } from "../../schematic/document"
import { SchematicConverterStage } from "./SchematicConverterStage"

export class ConvertRemainingSchematicRecordsStage extends SchematicConverterStage {
  _step(): void {
    convertRemainingSchematicRecords(this.schematicContext)
    this.finished = true
  }
}
