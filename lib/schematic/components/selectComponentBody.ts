import type { AltiumRecord, AltiumSchPinRecord } from "altiumts"
import type { ConvertedPort } from "../model"
import { selectCircuitJsonSymbol } from "../symbols"
import { getCapacitorPositivePort } from "./getCapacitorPositivePort"
import { getNativeResistorScale } from "./getNativeResistorScale"
import type { Bounds } from "../geometry"
import { convertOwnedComponentBody } from "./convertOwnedComponentBody"
import { convertOwnedSingleInputGateBody } from "./convertOwnedSingleInputGateBody"
import type { ComponentConversionContext, ComponentIdentity } from "./types"

export function selectComponentBody(
  {
    identity,
    pins,
    records,
    componentPorts,
    visibleSymbolLabels,
    bodyBounds,
  }: {
    identity: ComponentIdentity
    pins: AltiumSchPinRecord[]
    records: AltiumRecord[]
    componentPorts: ConvertedPort[]
    bodyBounds: Bounds
    visibleSymbolLabels: Set<string>
  },
  context: ComponentConversionContext,
) {
  const symbolSelection = selectCircuitJsonSymbol({
    ...identity,
    ports: componentPorts,
    positiveCapacitorPort: getCapacitorPositivePort({
      ports: componentPorts,
      records,
      libraryReference: identity.libraryReference,
    }),
  })
  if (symbolSelection)
    symbolSelection.geometryScale = getNativeResistorScale({
      bodyBounds,
      scale: context.options.scale,
      selection: symbolSelection,
      records,
    })
  const singleInputGateBody = symbolSelection
    ? undefined
    : convertOwnedSingleInputGateBody(
        { identity, records, componentPorts },
        context,
      )
  const ownedComponentBody =
    singleInputGateBody ??
    (symbolSelection
      ? undefined
      : convertOwnedComponentBody(
          { identity, pins, records, visibleSymbolLabels },
          context,
        ))
  return {
    symbolSelection,
    ownedComponentBody,
    singleInputGateBody,
  }
}
