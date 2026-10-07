import {
  type AltiumRecord,
  AltiumSchArcRecord,
  AltiumSchEllipticalArcRecord,
  AltiumSchLabelRecord,
  AltiumSchLineRecord,
  AltiumSchPolylineRecord,
} from "altiumts"
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
  const hasCurvedPlate =
    records.some(
      (record) =>
        record instanceof AltiumSchArcRecord ||
        record instanceof AltiumSchEllipticalArcRecord,
    ) &&
    records.some(
      (record) =>
        record instanceof AltiumSchLineRecord ||
        record instanceof AltiumSchPolylineRecord,
    )
  if (
    !symbolSelection?.name.startsWith("capacitor_") ||
    symbolSelection.name.startsWith("capacitor_polarized_") ||
    (!hasCurvedPlate &&
      !records.some(
        (record) =>
          record instanceof AltiumSchLabelRecord &&
          !record.getBoolean("ISHIDDEN") &&
          record.text?.trim() === "+",
      ))
  ) {
    return undefined
  }

  // Curved plates identify polarized bodies even when the plus is drawn with
  // primitives. Keep the complete source body and its original terminals.
  return convertOwnedCustomComponentBody({ identity, records }, context)
}
