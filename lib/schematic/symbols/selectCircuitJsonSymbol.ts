import type { ConvertedPort, SymbolSelection } from "../model"
import { assignConvertedPortsToSymbolPorts } from "./assignConvertedPortsToSymbolPorts"
import { classifyComponent } from "./classifyComponent"
import { CARDINAL_DIRECTIONS, SYMBOL_CATALOG, SYMBOL_NAMES } from "./constants"
import { getMosfetVariant } from "./getMosfetVariant"
import { getSymbolDirectionScore } from "./getSymbolDirectionScore"
import { hasCompleteMosfetFunctionalGroups } from "./hasCompleteMosfetFunctionalGroups"
import { isPolarizedCapacitor } from "./isPolarizedCapacitor"
import { normalizeFunctionalPortLabel } from "./normalizeFunctionalPortLabel"

export function selectCircuitJsonSymbol({
  description,
  designator,
  libraryReference,
  ports,
}: {
  description?: string
  designator: string
  libraryReference: string
  ports: ConvertedPort[]
}): SymbolSelection | undefined {
  const classification = classifyComponent({
    description,
    designator,
    libraryReference,
  })
  let baseName: string | undefined
  let candidateNames: string[] = []
  const bipolarType = /\b(npn|pnp)\b/i
    .exec(`${libraryReference.replaceAll("_", " ")} ${description ?? ""}`)?.[1]
    ?.toLowerCase()
  if (
    (classification === "testpoint" ||
      /test\s*point/i.test(description ?? "")) &&
    ports.length === 1
  ) {
    baseName = "testpoint"
  } else if (
    ports.length === 2 &&
    /\bspst\b/i.test(`${libraryReference} ${description ?? ""}`)
  ) {
    baseName = /normally[- ]closed/i.test(description ?? "")
      ? "spst_normally_closed_switch"
      : "spst_switch"
  } else if (
    ports.length === 3 &&
    ports.some(
      (port) => normalizeFunctionalPortLabel(port.sourcePort.name) === "wiper",
    ) &&
    /potentiometer|\btrimmer\b/i.test(
      `${libraryReference} ${description ?? ""}`,
    )
  ) {
    baseName = "potentiometer3"
  } else if (
    bipolarType &&
    ports.length === 3 &&
    ["base", "collector", "emitter"].every((label) =>
      ports.some(
        (port) => normalizeFunctionalPortLabel(port.sourcePort.name) === label,
      ),
    )
  ) {
    baseName = `${bipolarType}_bipolar_transistor`
  } else if (classification === "crystal" && ports.length === 2) {
    baseName = "crystal"
  } else if (classification === "crystal" && ports.length === 4) {
    baseName = "crystal_4pin"
  } else if (
    classification === "mosfet" &&
    ports.length >= 3 &&
    hasCompleteMosfetFunctionalGroups(ports)
  ) {
    const { channel_type, mosfet_mode } = getMosfetVariant(
      `${libraryReference}_${description ?? ""}`,
    )
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
    const isSchottky = [libraryReference, description].some((value) =>
      value?.toLowerCase().includes("schottky"),
    )
    baseName = isSchottky ? "schottky_diode" : "diode"
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
        matchDiodeTerminals:
          classification === "diode" ||
          classification === "led" ||
          baseName === "capacitor_polarized",
        symbolPortLabelAliases:
          classification === "led"
            ? { "1": "pos", "2": "neg" }
            : baseName === "potentiometer3"
              ? { "1": "ccw", "2": "wiper", "3": "cw" }
              : undefined,
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
