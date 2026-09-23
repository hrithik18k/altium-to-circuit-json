import { convertPcbComponents } from "../../pcb/components"
import { PcbConverterStage } from "./PcbConverterStage"

export class ConvertPcbComponentsStage extends PcbConverterStage {
  _step(): void {
    convertPcbComponents(this.pcbContext)
    this.finished = true
  }
}
