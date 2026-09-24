import type { AltiumSchPinRecord } from "altiumts"

export function isPinHidden(pin: AltiumSchPinRecord): boolean {
  const pinConglomerate = pin.pinConglomerate
  return (
    pin.hidden === true ||
    (pinConglomerate !== undefined && (pinConglomerate & 0x04) !== 0)
  )
}
