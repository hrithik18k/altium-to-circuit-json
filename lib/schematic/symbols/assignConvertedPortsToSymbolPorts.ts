import type { SchSymbol } from "schematic-symbols"
import {
  getAveragePoint,
  getVectorDifference,
  subtractPoints,
} from "../geometry"
import type { ConvertedPort, SymbolPortAssignment } from "../model"
import { compareConvertedPorts } from "./compareConvertedPorts"
import { normalizeFunctionalPortLabel } from "./normalizeFunctionalPortLabel"

export function assignConvertedPortsToSymbolPorts({
  ports,
  symbol,
  options = {},
}: {
  ports: ConvertedPort[]
  symbol: SchSymbol
  options?: {
    allowFunctionalPortReuse?: boolean
    geometryInterchangeableLabels?: Set<string>
  }
}): SymbolPortAssignment[] {
  const unusedSymbolPorts = new Set(symbol.ports)
  const orderedPorts = [...ports].sort(compareConvertedPorts)
  const assignments: SymbolPortAssignment[] = []
  const convertedCenter = getAveragePoint(ports.map(({ point }) => point))

  for (const [portIndex, convertedPort] of orderedPorts.entries()) {
    const rawHints = [
      convertedPort.schematicPort.pin_number?.toString(),
      convertedPort.sourcePort.name,
      ...(convertedPort.sourcePort.port_hints ?? []),
    ].filter((hint): hint is string => Boolean(hint))
    const functionalHints = new Set(
      rawHints.flatMap((hint) => {
        const normalized = normalizeFunctionalPortLabel(hint)
        return normalized ? [normalized] : []
      }),
    )
    const functionalPortCandidates = options.allowFunctionalPortReuse
      ? symbol.ports
      : [...unusedSymbolPorts]
    const functionalSymbolPort = functionalPortCandidates.find((symbolPort) =>
      symbolPort.labels.some((label) => {
        const normalized = normalizeFunctionalPortLabel(label)
        return normalized ? functionalHints.has(normalized) : false
      }),
    )
    const exactHints = new Set(rawHints.map((hint) => hint.toLowerCase()))
    const exactSymbolPort = [...unusedSymbolPorts].find((symbolPort) =>
      symbolPort.labels.some((label) => exactHints.has(label.toLowerCase())),
    )
    const interchangeableLabels = options.geometryInterchangeableLabels
    const isGeometryInterchangeable = rawHints.some((hint) =>
      interchangeableLabels?.has(hint.toLowerCase()),
    )
    const geometrySymbolPort = isGeometryInterchangeable
      ? [...unusedSymbolPorts]
          .filter((symbolPort) =>
            symbolPort.labels.some((label) =>
              interchangeableLabels?.has(label.toLowerCase()),
            ),
          )
          .sort(
            (left, right) =>
              getVectorDifference(
                subtractPoints(convertedPort.point, convertedCenter),
                subtractPoints(left, symbol.center),
              ) -
              getVectorDifference(
                subtractPoints(convertedPort.point, convertedCenter),
                subtractPoints(right, symbol.center),
              ),
          )[0]
      : undefined
    const symbolPort =
      functionalSymbolPort ??
      geometrySymbolPort ??
      exactSymbolPort ??
      symbol.ports[portIndex] ??
      [...unusedSymbolPorts][0]
    if (!symbolPort) continue
    if (!functionalSymbolPort || !options.allowFunctionalPortReuse) {
      unusedSymbolPorts.delete(symbolPort)
    }
    assignments.push({ convertedPort, symbolPort })
  }
  return assignments
}
