import { convertPcbRecords } from "../../pcb/records"
import { PcbConverterStage } from "./PcbConverterStage"

export class ConvertPcbRecordsStage extends PcbConverterStage {
  _step(): void {
    convertPcbRecords(this.pcbContext)
    this.finished = true
  }
}
