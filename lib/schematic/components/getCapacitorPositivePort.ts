import type { AltiumRecord } from "altiumts"
import type { ConvertedPort } from "../model"
import { isPolarizedCapacitor } from "../symbols/isPolarizedCapacitor"
import { getCapacitorAxis } from "./getCapacitorAxis"
import { getCapacitorPolarityMarks } from "./getCapacitorPolarityMarks"
import { getCurvedCapacitorPositivePort } from "./getCurvedCapacitorPositivePort"

export function getCapacitorPositivePort({
  ports,
  records,
  libraryReference,
}: {
  ports: ConvertedPort[]
  records: AltiumRecord[]
  libraryReference: string
}): ConvertedPort | null | undefined {
  if (ports.length !== 2) return undefined
  const candidates = new Set<ConvertedPort>()
  for (const [index, port] of ports.entries()) {
    const name = port.sourcePort.name.trim().toLowerCase()
    if (["+", "pos", "positive", "anode"].includes(name)) candidates.add(port)
    if (["-", "neg", "negative", "cathode"].includes(name))
      candidates.add(ports[1 - index]!)
  }
  const axis = getCapacitorAxis(ports)
  if (axis) {
    for (const { point, graphic } of getCapacitorPolarityMarks(records)) {
      const along =
        ((point.x - axis.start.x) * axis.dx +
          (point.y - axis.start.y) * axis.dy) /
        axis.squaredLength
      const across =
        ((point.x - axis.start.x) * axis.dy -
          (point.y - axis.start.y) * axis.dx) /
        axis.squaredLength
      if (
        along >= -1.5 &&
        along <= 2.5 &&
        Math.abs(across) <= 3 &&
        (!graphic || Math.abs(across) > 0.05) &&
        Math.abs(along - 0.5) > 0.05
      ) {
        candidates.add(ports[along < 0.5 ? 0 : 1]!)
      }
    }
  }
  // Curved plates also occur on ceramic capacitors (e.g. TI CAP_Dup2).
  // Use their geometry to orient known polarity, never to invent polarity.
  if (!candidates.size && !isPolarizedCapacitor(libraryReference))
    return undefined
  const curvedPlate = getCurvedCapacitorPositivePort({ ports, records })
  if (curvedPlate === null) return null
  if (curvedPlate) candidates.add(curvedPlate)
  return candidates.size > 1 ? null : [...candidates][0]
}
