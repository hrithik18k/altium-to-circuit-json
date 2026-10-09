import { type BaseTscircuitUnit, parseAndConvertSiUnit } from "format-si-unit"

export function parseFiniteComponentRating({
  componentUnit,
  displayText,
}: {
  componentUnit: BaseTscircuitUnit
  displayText: string
}): number | undefined {
  // Altium passive values can use the SI prefix as the decimal point (2u2 = 2.2u).
  const embeddedDecimal = displayText.match(
    /^(\d+)([fpnumkKMGTµμRr])(\d+)(Ω|Hz|H|F)?$/u,
  )
  const [, whole, marker, fraction, explicitUnit] = embeddedDecimal ?? []
  const normalizedText =
    marker !== undefined &&
    (explicitUnit === undefined || explicitUnit === componentUnit) &&
    (marker.toUpperCase() !== "R" || componentUnit === "Ω")
      ? `${whole}.${fraction}${marker.toUpperCase() === "R" ? "" : marker}${explicitUnit ?? ""}`
      : displayText
  const parsedComponentRating = parseAndConvertSiUnit(
    normalizedText,
    componentUnit,
  ).value
  if (
    typeof parsedComponentRating !== "number" ||
    !Number.isFinite(parsedComponentRating)
  ) {
    return undefined
  }
  return parsedComponentRating
}
