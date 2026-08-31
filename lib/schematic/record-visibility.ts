import type { AltiumRecord } from "altiumts"

export function matchesComponentPartAndDisplayMode({
  component,
  ownerPartDisplayMode,
  ownerPartId,
}: {
  component: AltiumRecord
  ownerPartDisplayMode: number | undefined
  ownerPartId: number | undefined
}): boolean {
  const currentPartId = component.getNumber("CURRENTPARTID") ?? 1
  const currentDisplayMode = component.getNumber("DISPLAYMODE") ?? 0

  return (
    (ownerPartId === undefined ||
      ownerPartId <= 0 ||
      ownerPartId === currentPartId) &&
    (ownerPartDisplayMode ?? 0) === currentDisplayMode
  )
}
