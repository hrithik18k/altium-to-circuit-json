import type { AltiumPcbDocument } from "altiumts"
import type { ConvertAltiumPcbDocOptions, PcbConversionContext } from "../model"
import { createPcbNetContext } from "./createPcbNetContext"

export function createPcbConversionContext({
  document,
  options,
}: {
  document: AltiumPcbDocument
  options: ConvertAltiumPcbDocOptions
}): PcbConversionContext {
  return {
    document,
    elements: [],
    netContext: createPcbNetContext(document),
    options,
  }
}
