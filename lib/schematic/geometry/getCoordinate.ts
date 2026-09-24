import type { AltiumRecord } from "altiumts"

export function getCoordinate(
  record: AltiumRecord,
  key: string,
): number | undefined {
  const raw = record.getCaseInsensitive(key)
  if (raw === undefined) return undefined
  const integer = Number(raw)
  if (!Number.isFinite(integer)) return undefined
  const fractionRaw = record.getCaseInsensitive(`${key}_FRAC`)
  if (fractionRaw === undefined) return integer
  const fraction = Number(`0.${fractionRaw.replace(/^[+-]/u, "")}`)
  if (!Number.isFinite(fraction)) return integer
  return integer < 0 ? integer - fraction : integer + fraction
}
