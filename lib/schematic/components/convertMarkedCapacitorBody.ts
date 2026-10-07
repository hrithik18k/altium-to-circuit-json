import { type AltiumRecord, AltiumSchLabelRecord } from "altiumts"
import type { AnyCircuitElement } from "circuit-json"
import type { SymbolSelection } from "../model"
import { convertOwnedCustomComponentBody } from "./convertOwnedCustomComponentBody"
import type { ComponentConversionContext, ComponentIdentity } from "./types"

export function convertMarkedCapacitorBody(
  {
    identity,
    records,
    symbolSelection,
  }: {
    identity: ComponentIdentity
    records: AltiumRecord[]
    symbolSelection: SymbolSelection | undefined
  },
  context: ComponentConversionContext,
): AnyCircuitElement[] | undefined {
  if (
    !symbolSelection?.name.startsWith("capacitor_") ||
    symbolSelection.name.startsWith("capacitor_polarized_") ||
    !records.some(
      (record) =>
        record instanceof AltiumSchLabelRecord &&
        !record.getBoolean("ISHIDDEN") &&
        record.text?.trim() === "+",
    )
  ) {
    return undefined
  }

  // A manufacturer's library name may not encode capacitor polarity. Keep
  // the marked source body and its original terminal positions.
  return convertOwnedCustomComponentBody({ identity, records }, context)
}
