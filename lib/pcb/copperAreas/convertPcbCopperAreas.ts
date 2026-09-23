import type { PcbConversionContext } from "../model"
import { convertAltiumCopperAreas } from "./convertAltiumCopperAreas"

export function convertPcbCopperAreas(context: PcbConversionContext): void {
  if (context.options.includeCopperAreas === false) return
  context.elements.push(
    ...convertAltiumCopperAreas(context.document, {
      getSourceNetId: context.netContext.getSourceNetId,
    }),
  )
}
