import type { AltiumRecord } from "altiumts"
import type { SchematicContext } from "./types"

export function shouldRenderSchematicRecord(
  record: AltiumRecord,
  context: SchematicContext,
): boolean {
  let ownerPartId = record.getNumber("OWNERPARTID")
  let ownerPartDisplayMode = record.getNumber("OWNERPARTDISPLAYMODE")
  let current: AltiumRecord | undefined = record
  const visited = new Set<AltiumRecord>()

  while (current && !visited.has(current)) {
    visited.add(current)
    const parent = context.document.getParent(current)
    if (!parent) return true

    if (ownerPartId === undefined || ownerPartId <= 0) {
      ownerPartId = current.getNumber("OWNERPARTID")
    }
    if (ownerPartDisplayMode === undefined) {
      ownerPartDisplayMode = current.getNumber("OWNERPARTDISPLAYMODE")
    }

    if (parent.recordKind === "1") {
      const currentPartId = parent.getNumber("CURRENTPARTID") ?? 1
      return (
        (ownerPartId === undefined ||
          ownerPartId <= 0 ||
          ownerPartId === currentPartId) &&
        (ownerPartDisplayMode === undefined || ownerPartDisplayMode === 0)
      )
    }
    current = parent
  }
  return true
}
