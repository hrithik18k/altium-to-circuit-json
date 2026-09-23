import { AltiumBinaryPcbDoc, AltiumPcbDoc, AltiumSchDoc } from "altiumts"
import type { SupportedAltiumDocument } from "./types"

export function isSupportedAltiumDocument(
  source: unknown,
): source is SupportedAltiumDocument {
  return (
    source instanceof AltiumSchDoc ||
    source instanceof AltiumPcbDoc ||
    source instanceof AltiumBinaryPcbDoc
  )
}
