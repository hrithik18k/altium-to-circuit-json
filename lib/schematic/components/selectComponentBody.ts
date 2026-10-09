import type { AltiumRecord, AltiumSchPinRecord } from "altiumts"
import type { ConvertedPort } from "../model"
import { selectCircuitJsonSymbol } from "../symbols"
import { convertMarkedCapacitorBody } from "./convertMarkedCapacitorBody"
import { convertOwnedComponentBody } from "./convertOwnedComponentBody"
import { convertOwnedCustomComponentBody } from "./convertOwnedCustomComponentBody"
import { convertOwnedSingleInputGateBody } from "./convertOwnedSingleInputGateBody"
import { convertRotatedResistorBody } from "./convertRotatedResistorBody"
import { hasCompleteLedBody } from "./hasCompleteLedBody"
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
  // Native LEDs have a fixed emission-arrow layout. Keep complete source
  // geometry so mirrored arrows and cathode placement survive together.
  const candidateLedBody = symbolSelection?.name.startsWith("led_")
    ? convertOwnedCustomComponentBody({ identity, records }, context)
    : undefined
  const ledBody =
    candidateLedBody && hasCompleteLedBody(candidateLedBody)
      ? candidateLedBody
      : undefined
  if (ledBody) symbolSelection = undefined
  const polarizedCapacitorBody = convertMarkedCapacitorBody(
    { identity, records, symbolSelection },
    context,
  )
  if (polarizedCapacitorBody) symbolSelection = undefined
  const rotatedResistorBody = convertRotatedResistorBody(
    { identity, pins, records, symbolSelection },
    context,
  )
  if (rotatedResistorBody) symbolSelection = undefined
  const singleInputGateBody = symbolSelection
    ? undefined
    : convertOwnedSingleInputGateBody(
        { identity, records, componentPorts },
        context,
      )
  const ownedComponentBody =
    ledBody ??
    polarizedCapacitorBody ??
    rotatedResistorBody ??
    singleInputGateBody ??
    (symbolSelection
      ? undefined
      : convertOwnedComponentBody(
          { identity, pins, records, visibleSymbolLabels },
          context,
        ))
  return { symbolSelection, ownedComponentBody, singleInputGateBody }
}
