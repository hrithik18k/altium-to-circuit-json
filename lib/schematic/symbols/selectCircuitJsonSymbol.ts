import { getNativeSymbolCandidate } from "./getNativeSymbolCandidate"
import type { ConvertedPort, SymbolSelection } from "../model"
import { classifyComponent } from "./classifyComponent"
import { CARDINAL_DIRECTIONS, SYMBOL_NAMES } from "./constants"
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
  positiveCapacitorPort,
}: {
  description?: string
  designator: string
  libraryReference: string
  ports: ConvertedPort[]
  positiveCapacitorPort?: ConvertedPort | null
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
    if (positiveCapacitorPort === null) return undefined
    baseName =
      positiveCapacitorPort || isPolarizedCapacitor(libraryReference)
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
    return getNativeSymbolCandidate({
      name,
      classification,
      ports,
      positiveCapacitorPort,
      baseName,
    })
  })
  return selections.sort(
    (left, right) =>
      getSymbolDirectionScore(left) - getSymbolDirectionScore(right),
  )[0]
}
