import type { AltiumRecord } from "altiumts"

export function isOwnedRecordVisible(
  record: AltiumRecord,
  currentPartId: number,
): boolean {
  const ownerPartId = record.getNumber("OWNERPARTID")
  const ownerPartDisplayMode = record.getNumber("OWNERPARTDISPLAYMODE")
  return (
    (ownerPartId === undefined ||
      ownerPartId <= 0 ||
      ownerPartId === currentPartId) &&
    (ownerPartDisplayMode === undefined || ownerPartDisplayMode === 0)
  )
}
