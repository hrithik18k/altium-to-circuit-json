import type { AltiumPcbDocument } from "altiumts"
import type { ConvertAltiumPcbDocOptions, PcbConversionContext } from "../model"
import { createPcbNetContext } from "./createPcbNetContext"
import { createPcbPadContext } from "./createPcbPadContext"

export function createPcbConversionContext({
  document,
  options,
}: {
  document: AltiumPcbDocument
  options: ConvertAltiumPcbDocOptions
}): PcbConversionContext {
  const padContext = createPcbPadContext({ document, options })
  return {
    document,
    elements: [],
    netContext: createPcbNetContext(document, padContext.sourcePortIdsByNet),
    padContext,
    options,
  }
}
