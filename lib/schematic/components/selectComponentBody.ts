import type { AltiumRecord, AltiumSchPinRecord } from "altiumts"
import type { ConvertedPort } from "../model"
import { selectCircuitJsonSymbol } from "../symbols"
import { convertCompatibilityComponentBody } from "../compatibility/convertCompatibilityComponentBody"
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
  let symbolSelection = selectCircuitJsonSymbol({
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
  const compatibilityBody = symbolSelection
    ? undefined
    : convertCompatibilityComponentBody(
        { identity, ports: componentPorts, records },
        context,
      )
  const singleInputGateBody =
    symbolSelection || compatibilityBody
      ? undefined
      : convertOwnedSingleInputGateBody(
          { identity, records, componentPorts },
          context,
        )
  const ownedComponentBody =
    compatibilityBody ??
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
    rendersOwnPins: Boolean(compatibilityBody ?? singleInputGateBody),
  }
}
