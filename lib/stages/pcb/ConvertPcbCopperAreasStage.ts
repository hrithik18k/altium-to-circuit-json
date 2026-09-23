import { convertPcbCopperAreas } from "../../pcb/copperAreas"
import { PcbConverterStage } from "./PcbConverterStage"

export class ConvertPcbCopperAreasStage extends PcbConverterStage {
  _step(): void {
    convertPcbCopperAreas(this.pcbContext)
    this.finished = true
  }
}
