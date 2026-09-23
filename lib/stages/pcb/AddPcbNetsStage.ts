import { addPcbNets } from "../../pcb/context"
import { PcbConverterStage } from "./PcbConverterStage"

export class AddPcbNetsStage extends PcbConverterStage {
  _step(): void {
    addPcbNets(this.pcbContext)
    this.finished = true
  }
}
