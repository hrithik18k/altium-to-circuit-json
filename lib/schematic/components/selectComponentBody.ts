import type { AltiumRecord, AltiumSchPinRecord } from "altiumts"
import type { ConvertedPort } from "../model"
import { selectCircuitJsonSymbol } from "../symbols"
import { convertCompatibilityComponentBody } from "../compatibility/convertCompatibilityComponentBody"
import { fitNativeSymbolToSourceLayout } from "../compatibility/fitNativeSymbolToSourceLayout"
import { getCapacitorPositivePortId } from "../symbols/getCapacitorPositivePortId"
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
  }: {
    identity: ComponentIdentity
    pins: AltiumSchPinRecord[]
    records: AltiumRecord[]
    componentPorts: ConvertedPort[]
    visibleSymbolLabels: Set<string>
  },
  context: ComponentConversionContext,
) {
  let symbolSelection = selectCircuitJsonSymbol({
    ...identity,
    ports: componentPorts,
  })
  if (symbolSelection?.name.startsWith("capacitor_")) {
    const positiveId = getCapacitorPositivePortId(
      { ports: componentPorts, records },
      context,
    )
    if (positiveId) {
      symbolSelection = selectCircuitJsonSymbol({
        ...identity,
        libraryReference: "capacitor_polarized",
        ports: componentPorts.map((port) => ({
          ...port,
          sourcePort: {
            ...port.sourcePort,
            name: port.sourcePort.source_port_id === positiveId ? "pos" : "neg",
            port_hints: [
              port.sourcePort.source_port_id === positiveId ? "pos" : "neg",
            ],
          },
        })),
      })
    }
  }
  if (
    symbolSelection &&
    (symbolSelection.name.startsWith("capacitor_polarized_") ||
      (symbolSelection.name.startsWith("boxresistor_") &&
        records.some(
          (record) =>
            ["34", "41"].includes(record.recordKind ?? "") &&
            !record.getBoolean("ISHIDDEN") &&
            (record.getNumber("ORIENTATION") ?? 0) % 2 !== 0,
        )))
  ) {
    const nativeBody = fitNativeSymbolToSourceLayout(
      { identity, records, selection: symbolSelection },
      context,
    )
    if (nativeBody)
      return {
        symbolSelection: undefined,
        ownedComponentBody: nativeBody,
        rendersOwnPins: true,
      }
  }
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
