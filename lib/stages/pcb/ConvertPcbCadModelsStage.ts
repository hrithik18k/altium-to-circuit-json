import { createPcbCadModels } from "../../pcb/cadModels"
import { PcbConverterStage } from "./PcbConverterStage"

export class ConvertPcbCadModelsStage extends PcbConverterStage {
  _step(): void {
    if (
      this.pcbContext.options.includeCadModels !== false &&
      this.pcbContext.options.includeComponents !== false
    ) {
      this.pcbContext.elements.push(...createPcbCadModels(this.pcbContext))
    }
    this.finished = true
  }
}
