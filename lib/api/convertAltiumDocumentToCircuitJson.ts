import { AltiumBinaryPcbDoc, AltiumPcbDoc, AltiumSchDoc } from "altiumts"
import type { AnyCircuitElement } from "circuit-json"
import type { ConvertAltiumToCircuitJsonOptions } from "../converter"
import { AltiumToCircuitJsonConverter } from "../converter"

export function convertAltiumDocumentToCircuitJson(
  document: unknown,
  options: ConvertAltiumToCircuitJsonOptions = {},
): AnyCircuitElement[] {
  if (
    document instanceof AltiumSchDoc ||
    document instanceof AltiumPcbDoc ||
    document instanceof AltiumBinaryPcbDoc
  ) {
    const converter = new AltiumToCircuitJsonConverter(document, options)
    converter.runUntilFinished()
    return converter.getOutput()
  }
  const type =
    typeof document === "object" && document !== null && "type" in document
      ? String(document.type)
      : typeof document
  throw new TypeError(`Unsupported Altium document type: ${type}`)
}
