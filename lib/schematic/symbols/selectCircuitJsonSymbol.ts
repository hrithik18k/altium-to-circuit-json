import type { ConvertedPort, SymbolSelection } from "../model"
import { assignConvertedPortsToSymbolPorts } from "./assignConvertedPortsToSymbolPorts"
import { classifyComponent } from "./classifyComponent"
import { CARDINAL_DIRECTIONS, SYMBOL_CATALOG, SYMBOL_NAMES } from "./constants"
import { getMosfetVariant } from "./getMosfetVariant"
import { getSymbolDirectionScore } from "./getSymbolDirectionScore"
import { hasCompleteMosfetFunctionalGroups } from "./hasCompleteMosfetFunctionalGroups"
import { isPolarizedCapacitor } from "./isPolarizedCapacitor"

export function selectCircuitJsonSymbol({
  designator,
  libraryReference,
  ports,
}: {
  designator: string
  libraryReference: string
  ports: ConvertedPort[]
}): SymbolSelection | undefined {
  const classification = classifyComponent({ designator, libraryReference })
  let baseName: string | undefined
  let candidateNames: string[] = []
  if (classification === "testpoint" && ports.length === 1) {
    baseName = "testpoint"
  } else if (classification === "crystal" && ports.length === 2) {
    baseName = "crystal"
  } else if (classification === "crystal" && ports.length === 4) {
    baseName = "crystal_4pin"
  } else if (
    classification === "mosfet" &&
    ports.length >= 3 &&
    hasCompleteMosfetFunctionalGroups(ports)
  ) {
    const { channel_type, mosfet_mode } = getMosfetVariant(libraryReference)
    const channel = channel_type === "p" ? "p" : "n"
    const mode = mosfet_mode === "depletion" ? "d" : "e"
    const prefix = `${channel}_channel_${mode}_mosfet_transistor_gate_`
    candidateNames = SYMBOL_NAMES.filter((name) => name.startsWith(prefix))
  } else if (ports.length !== 2) {
    return undefined
  } else if (classification === "resistor") {
    baseName = "boxresistor"
  } else if (classification === "capacitor") {
    baseName = isPolarizedCapacitor(libraryReference)
      ? "capacitor_polarized"
      : "capacitor"
  } else if (classification === "ferrite_bead") {
    baseName = "ferrite_bead"
  } else if (classification === "inductor") {
    baseName = "inductor"
  } else if (classification === "led") {
    baseName = "led"
  }
  if (classification === "diode") {
    const lower = libraryReference.toLowerCase()
    baseName = lower.includes("schottky") ? "schottky_diode" : "diode"
  }
  if (baseName) {
    candidateNames = CARDINAL_DIRECTIONS.map(
      (direction) => `${baseName}_${direction}`,
    )
  }
  if (candidateNames.length === 0) return undefined

  const selections = candidateNames.flatMap((name) => {
    const symbol = SYMBOL_CATALOG[name]
    const supportsEquivalentMosfetPads =
      classification === "mosfet" && symbol?.ports.length === 3
    if (
      !symbol ||
      (!supportsEquivalentMosfetPads && symbol.ports.length !== ports.length)
    ) {
      return []
    }
    const assignments = assignConvertedPortsToSymbolPorts({
      ports,
      symbol,
      options: {
        allowFunctionalPortReuse: classification === "mosfet",
        geometryInterchangeableLabels:
          classification === "crystal" && ports.length === 4
            ? new Set(["2", "4"])
            : undefined,
      },
    })
    return assignments.length === ports.length
      ? [{ assignments, name, symbol } satisfies SymbolSelection]
      : []
  })
  return selections.sort(
    (left, right) =>
      getSymbolDirectionScore(left) - getSymbolDirectionScore(right),
  )[0]
}
