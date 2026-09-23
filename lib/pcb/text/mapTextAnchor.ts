import type { NinePointAnchor } from "circuit-json"
import { ALTIUM_TEXT_ANCHORS } from "./constants"

export function mapTextAnchor(
  justification: string | undefined,
): NinePointAnchor {
  const numericAnchor = ALTIUM_TEXT_ANCHORS[Number(justification) - 1]
  if (numericAnchor) return numericAnchor

  const normalizedJustification = justification
    ?.replace(/[\s_-]+/gu, "")
    .toUpperCase()
  if (normalizedJustification?.includes("CENTER")) return "bottom_center"
  if (normalizedJustification?.includes("RIGHT")) return "bottom_right"
  if (normalizedJustification?.includes("LEFT")) return "bottom_left"
  return "center"
}
