import type { AnyCircuitElement } from "circuit-json"
import type {
  AltiumSource,
  ConvertAltiumToCircuitJsonOptions,
} from "../converter"
import { AltiumToCircuitJsonConverter } from "../converter"

export function convertAltiumToCircuitJson(
  source: AltiumSource,
  options: ConvertAltiumToCircuitJsonOptions = {},
): AnyCircuitElement[] {
  const converter = new AltiumToCircuitJsonConverter(source, options)
  converter.runUntilFinished()
  return converter.getOutput()
}
