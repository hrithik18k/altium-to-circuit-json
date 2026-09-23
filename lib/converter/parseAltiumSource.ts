import {
  AltiumBinaryPcbDoc,
  AltiumPcbDoc,
  parseAltiumFile,
  parseAltiumPcbDoc,
  parseAltiumSchDoc,
} from "altiumts"
import { isSupportedAltiumDocument } from "./isSupportedAltiumDocument"
import { toUint8Array } from "./toUint8Array"
import type { AltiumSource, SupportedAltiumDocument } from "./types"

export function parseAltiumSource(
  source: AltiumSource,
  sourceType: "auto" | "pcb" | "schematic",
): SupportedAltiumDocument {
  if (sourceType === "pcb") {
    if (typeof source === "string") return parseAltiumPcbDoc(source)
    const { document } = parseAltiumFile(toUint8Array(source))
    if (
      document instanceof AltiumPcbDoc ||
      document instanceof AltiumBinaryPcbDoc
    ) {
      return document
    }
    throw new TypeError(`Expected an Altium PCB document, got ${document.type}`)
  }
  if (sourceType === "schematic") {
    return parseAltiumSchDoc(
      source instanceof ArrayBuffer ? new Uint8Array(source) : source,
    )
  }
  const { document } = parseAltiumFile(toUint8Array(source))
  if (isSupportedAltiumDocument(document)) return document
  throw new TypeError(`Unsupported Altium document type: ${document.type}`)
}
