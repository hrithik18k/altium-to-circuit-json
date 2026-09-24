import type { AltiumRecord } from "altiumts"
import { getCoordinate } from "./getCoordinate"

export function getCoordinateOrFallback({
  record,
  key,
  fallback,
}: {
  record: AltiumRecord
  key: string
  fallback: number
}): number {
  const rawInteger = record.getCaseInsensitive(key)
  if (rawInteger !== undefined) return getCoordinate(record, key) ?? fallback

  const rawFraction = record.getCaseInsensitive(`${key}_FRAC`)
  if (rawFraction === undefined) return fallback
  const fraction = Number(`0.${rawFraction.replace(/^[+-]/u, "")}`)
  if (!Number.isFinite(fraction)) return fallback
  return fallback < 0 ? fallback - fraction : fallback + fraction
}
