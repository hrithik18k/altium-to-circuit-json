import { normalizeAltiumAngle } from "altiumts"

export function normalizeRotationDegrees(angle: number): number {
  const normalized = normalizeAltiumAngle(angle)
  const nearestInteger = Math.round(normalized)
  return Math.abs(normalized - nearestInteger) < 1e-10
    ? nearestInteger % 360
    : normalized
}
