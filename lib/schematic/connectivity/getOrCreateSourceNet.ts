import type { AnyCircuitElement, SourceNet } from "circuit-json"
import { isGroundNet, isPowerNet, sanitizeId } from "../identifiers"
import type { SourceNetName } from "../model"

export function getOrCreateSourceNet({
  elements,
  name,
  sourceNetIdByName,
}: {
  elements: AnyCircuitElement[]
  name: string
  sourceNetIdByName: Map<SourceNetName, string>
}): string {
  const normalizedName = name.trim().toUpperCase() as SourceNetName
  const existing = sourceNetIdByName.get(normalizedName)
  if (existing) return existing

  const sourceNetIdBase = `source_net_altium_${sanitizeId(name)}`
  const existingIds = new Set(
    elements.flatMap((element) =>
      element.type === "source_net" ? [element.source_net_id] : [],
    ),
  )
  let sourceNetId = sourceNetIdBase
  let suffix = 2
  while (existingIds.has(sourceNetId)) {
    sourceNetId = `${sourceNetIdBase}_${suffix}`
    suffix++
  }
  const sourceNet: SourceNet = {
    type: "source_net",
    is_ground: isGroundNet(name),
    is_power: isPowerNet(name),
    member_source_group_ids: [],
    name,
    source_net_id: sourceNetId,
  }
  elements.push(sourceNet)
  sourceNetIdByName.set(normalizedName, sourceNetId)
  return sourceNetId
}
