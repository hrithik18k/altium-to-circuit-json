import type { AltiumPcbDocument } from "altiumts"
import type { AnyCircuitElement } from "circuit-json"
import { AltiumToCircuitJsonConverter } from "../converter"
import type { ConvertAltiumPcbDocOptions } from "../pcb/model"

export function convertAltiumPcbDocToCircuitJson(
  document: AltiumPcbDocument,
  options: ConvertAltiumPcbDocOptions = {},
): AnyCircuitElement[] {
  const converter = new AltiumToCircuitJsonConverter(document, { pcb: options })
  converter.runUntilFinished()
  return converter.getOutput()
}
