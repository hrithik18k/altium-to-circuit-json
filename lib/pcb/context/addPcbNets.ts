import type { PcbConversionContext } from "../model"

export function addPcbNets(context: PcbConversionContext): void {
  context.elements.push(
    ...context.padContext.elements,
    ...context.netContext.elements,
  )
}
