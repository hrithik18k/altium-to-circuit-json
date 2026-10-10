import type { ComponentIdentity } from "../components/types"
import type { ConvertedPort } from "../model"

export function getCompatibilitySymbolKind({
  identity,
  ports,
}: {
  identity: ComponentIdentity
  ports: ConvertedPort[]
}): string | undefined {
  const text = `${identity.libraryReference} ${identity.description ?? ""}`
    .replaceAll("_", " ")
    .toLowerCase()
  // Functional terminals prevent metadata such as "NOR flash" from selecting
  // a logic gate. Unrecognized devices retain the existing styled fallback.
  if (
    !/\bgates?\b/.test(text) ||
    !ports.some((port) => /^(?:\d+)?A$/i.test(port.sourcePort.name)) ||
    !ports.some((port) => /^(?:\d+)?Y$/i.test(port.sourcePort.name))
  )
    return undefined
  if (/\band\b/.test(text)) return "and"
  if (/\bxor\b|exclusive[- ]or/.test(text)) return "xor"
  if (/\bor\b/.test(text)) return "or"
  return undefined
}
