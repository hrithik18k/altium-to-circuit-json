import type { ConvertedPort } from "../model"
import { normalizeFunctionalPortLabel } from "./normalizeFunctionalPortLabel"

export function hasCompleteMosfetFunctionalGroups(
  ports: ConvertedPort[],
): boolean {
  const groups = ports.map((port) =>
    normalizeFunctionalPortLabel(port.sourcePort.name),
  )
  return (
    groups.every((group) => group !== undefined) && new Set(groups).size === 3
  )
}
