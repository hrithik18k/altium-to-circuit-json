import type { SchSymbol } from "schematic-symbols"
import type { ConvertedPort, SymbolPortAssignment } from "../model"

export function assignPolarizedCapacitorPorts({
  ports,
  positivePort,
  symbol,
}: {
  ports: ConvertedPort[]
  positivePort: ConvertedPort
  symbol: SchSymbol
}): SymbolPortAssignment[] {
  return ports.flatMap((convertedPort) => {
    const label = convertedPort === positivePort ? "pos" : "neg"
    const symbolPort = symbol.ports.find((port) => port.labels.includes(label))
    return symbolPort ? [{ convertedPort, symbolPort }] : []
  })
}
