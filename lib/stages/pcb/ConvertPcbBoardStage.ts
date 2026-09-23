import { convertPcbBoard } from "../../pcb/board"
import { PcbConverterStage } from "./PcbConverterStage"

export class ConvertPcbBoardStage extends PcbConverterStage {
  _step(): void {
    convertPcbBoard(this.pcbContext)
    this.finished = true
  }
}
