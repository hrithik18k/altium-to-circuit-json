import type { ConvertedPort, SymbolSelection } from "../model"
import type { ComponentClassification } from "./types"
import { SYMBOL_CATALOG } from "./constants"
import { assignPolarizedCapacitorPorts } from "./assignPolarizedCapacitorPorts"
import { assignConvertedPortsToSymbolPorts } from "./assignConvertedPortsToSymbolPorts"

export function getNativeSymbolCandidate({
  name,
  classification,
  ports,
  positiveCapacitorPort,
  baseName,
}: {
  name: string
  classification: ComponentClassification
  ports: ConvertedPort[]
  positiveCapacitorPort?: ConvertedPort | null
  baseName?: string
}): SymbolSelection[] {
  const symbol = SYMBOL_CATALOG[name]
  const supportsEquivalentMosfetPads =
    classification === "mosfet" && symbol?.ports.length === 3
  if (
    !symbol ||
    (!supportsEquivalentMosfetPads && symbol.ports.length !== ports.length)
  ) {
    return []
  }
  const assignments =
    classification === "capacitor" && positiveCapacitorPort
      ? assignPolarizedCapacitorPorts({
          ports,
          positivePort: positiveCapacitorPort,
          symbol,
        })
      : assignConvertedPortsToSymbolPorts({
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
}
