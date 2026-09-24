import type { AltiumSchPowerPortRecord } from "altiumts"
import type { CardinalDirection } from "../geometry"

export function getPowerPortSymbolName(
  record: AltiumSchPowerPortRecord,
  direction: CardinalDirection,
): string {
  const style = Math.round(record.getNumber("STYLE") ?? 2)
  if (style === 4 || style === 5) return `ground_${direction}`
  if (style === 6) return `tilted_ground_${direction}`
  return `vcc_${direction}`
}
