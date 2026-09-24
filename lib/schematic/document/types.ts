import type { AltiumRecord, AltiumSchDoc } from "altiumts"
import type { AnyCircuitElement } from "circuit-json"
import type { ConvertAltiumSchDocOptions } from "../../api"

export interface SchematicConversionContext extends SchematicContext {
  elements: AnyCircuitElement[]
  handledRecords: Set<AltiumRecord>
  options: ConvertAltiumSchDocOptions
  sheetDimensions: SheetDimensions
}

export interface SheetDimensions {
  height: number
  width: number
}

export interface SchematicContext {
  document: AltiumSchDoc
  records: AltiumRecord[]
  scale: number
  sheetRecord?: AltiumRecord
}
