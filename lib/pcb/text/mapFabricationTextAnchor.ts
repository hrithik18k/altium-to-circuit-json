import type { PcbFabricationNoteText } from "circuit-json"
import { mapTextAnchor } from "./mapTextAnchor"

export function mapFabricationTextAnchor(
  justification: string | undefined,
): PcbFabricationNoteText["anchor_alignment"] {
  const anchor = mapTextAnchor(justification)
  return anchor === "top_left" ||
    anchor === "top_right" ||
    anchor === "bottom_left" ||
    anchor === "bottom_right"
    ? anchor
    : "center"
}
